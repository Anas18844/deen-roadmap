'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { toArabicError } from '@/lib/supabase/errors';
import { youtubeId, youtubePlaylistId } from '@/lib/youtube';
import { fetchPlaylistVideoIds, fetchVideos } from '@/lib/youtube-api';
import { BOOKS_BUCKET, createAdminClient } from '@/lib/supabase/admin';

type Result = { ok: true; message?: string } | { ok: false; error: string };

// Every write is also enforced by RLS (admin-only policies); this check gives a clean error.
async function adminClient() {
  const supabase = await createClient();
  const { data: isAdmin } = await supabase.rpc('is_admin');
  if (!isAdmin) throw new Error('not_admin');
  return supabase;
}

async function run(fn: () => Promise<string | void>): Promise<Result> {
  try {
    const message = (await fn()) ?? undefined;
    revalidatePath('/admin', 'layout');
    revalidatePath('/', 'layout');
    return { ok: true, message };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg.startsWith('YouTube') || msg.includes('YOUTUBE') ? `يوتيوب: ${msg}` : toArabicError({ message: msg }) };
  }
}

const must = <T,>(r: { data: T; error: unknown }) => {
  if (r.error) throw r.error;
  return r.data;
};

// ── Placements & stats ────────────────────────────────────────────────────────

export async function decidePlacement(requestId: string, approve: boolean): Promise<Result> {
  return run(async () => {
    const s = await adminClient();
    must(await s.rpc('decide_placement', { p_request_id: requestId, p_approve: approve }));
    return approve ? 'تمت الموافقة' : 'تم الرفض';
  });
}

export async function refreshStats(): Promise<Result> {
  return run(async () => {
    const s = await adminClient();
    must(await s.rpc('admin_refresh_stats'));
    return 'تم تحديث الأرقام';
  });
}

// ── Content ───────────────────────────────────────────────────────────────────

const TABLES = ['levels', 'tracks', 'sections', 'items'] as const;
type Table = (typeof TABLES)[number];
const assertTable = (t: string): Table => {
  if (!(TABLES as readonly string[]).includes(t)) throw new Error('invalid_input');
  return t as Table;
};

const str = (f: FormData, k: string) => {
  const v = f.get(k);
  return v === null ? undefined : String(v).trim() || null;
};
const num = (f: FormData, k: string) => {
  const v = str(f, k);
  return v === undefined ? undefined : v === null ? null : Number(v);
};

export async function saveLevel(form: FormData): Promise<Result> {
  return run(async () => {
    const s = await adminClient();
    const id = str(form, 'id');
    const row = { number: num(form, 'number'), title: str(form, 'title'), subtitle: str(form, 'subtitle'), intro_audio_url: str(form, 'intro_audio_url') };
    must(id ? await s.from('levels').update(row).eq('id', id) : await s.from('levels').insert(row));
  });
}

export async function saveTrack(form: FormData): Promise<Result> {
  return run(async () => {
    const s = await adminClient();
    const id = str(form, 'id');
    const row = {
      title: str(form, 'title'),
      description: str(form, 'description'),
      accent: str(form, 'accent') ?? 'green',
      intro_audio_url: str(form, 'intro_audio_url'),
    };
    if (id) must(await s.from('tracks').update(row).eq('id', id));
    else {
      const level_id = str(form, 'level_id');
      const { count } = await s.from('tracks').select('id', { count: 'exact', head: true }).eq('level_id', level_id!);
      must(await s.from('tracks').insert({ ...row, level_id, sort: count ?? 0 }));
    }
  });
}

export async function saveSection(form: FormData): Promise<Result> {
  return run(async () => {
    const s = await adminClient();
    const id = str(form, 'id');
    const row = { title: str(form, 'title'), description: str(form, 'description'), intro_audio_url: str(form, 'intro_audio_url') };
    if (id) must(await s.from('sections').update(row).eq('id', id));
    else {
      const track_id = str(form, 'track_id');
      const parent_id = str(form, 'parent_id') ?? null;
      const { count } = await s.from('sections').select('id', { count: 'exact', head: true }).eq('track_id', track_id!);
      must(await s.from('sections').insert({ ...row, track_id, parent_id, sort: count ?? 0 }));
    }
  });
}

/** Add or edit a lesson. For a YouTube link the duration (and title, if left empty) come from YouTube. */
export async function saveItem(form: FormData): Promise<Result> {
  return run(async () => {
    const s = await adminClient();
    const id = str(form, 'id');
    const url = str(form, 'url');
    if (!url) throw new Error('invalid_input');
    const vid = youtubeId(url);
    const kind = vid ? 'video' : 'book';
    let title = str(form, 'title');
    let duration_seconds: number | null = null;
    if (vid) {
      const [meta] = await fetchVideos([vid]);
      if (meta) {
        duration_seconds = meta.seconds;
        title = title ?? meta.title;
      }
    }
    if (!title) throw new Error('invalid_input');
    const manual = num(form, 'points');
    const row = {
      url,
      kind,
      title,
      full_title: str(form, 'full_title'),
      description: str(form, 'description'),
      pages: kind === 'book' ? num(form, 'pages') ?? null : null,
      ...(vid ? { duration_seconds } : {}),
      ...(manual ? { points: manual, points_is_manual: true } : { points_is_manual: false }),
    };
    if (id) must(await s.from('items').update(row).eq('id', id));
    else {
      const section_id = str(form, 'section_id');
      const { count } = await s.from('items').select('id', { count: 'exact', head: true }).eq('section_id', section_id!);
      must(await s.from('items').insert({ ...row, section_id, sort: count ?? 0 }));
    }
    return vid && duration_seconds !== null ? `تمت الإضافة — المدة ${Math.round(duration_seconds / 60)} دقيقة` : 'تم الحفظ';
  });
}

/** Paste a playlist link: creates a section in the track with one lesson per video. */
export async function importPlaylist(form: FormData): Promise<Result> {
  return run(async () => {
    const s = await adminClient();
    const track_id = str(form, 'track_id')!;
    const listId = youtubePlaylistId(str(form, 'url') ?? '');
    if (!listId) throw new Error('invalid_input');
    const { title: listTitle, ids } = await fetchPlaylistVideoIds(listId);
    const videos = await fetchVideos(ids);
    const byId = new Map(videos.map((v) => [v.id, v]));
    const { count } = await s.from('sections').select('id', { count: 'exact', head: true }).eq('track_id', track_id);
    const section = must(
      await s.from('sections').insert({ track_id, title: str(form, 'title') ?? listTitle ?? 'قائمة تشغيل', sort: count ?? 0 }).select('id').single(),
    ) as { id: string };
    const rows = ids
      .filter((v) => byId.has(v))
      .map((v, i) => ({
        section_id: section.id,
        kind: 'video' as const,
        title: byId.get(v)!.title,
        url: `https://youtu.be/${v}`,
        duration_seconds: byId.get(v)!.seconds,
        sort: i,
      }));
    if (rows.length) must(await s.from('items').insert(rows));
    return `تم استيراد ${rows.length} فيديو`;
  });
}

/** Fill in missing durations (e.g. after the initial content import) in batches of 50. */
export async function refreshDurations(): Promise<Result> {
  return run(async () => {
    const s = await adminClient();
    const items = must(await s.from('items').select('id, url').eq('kind', 'video').is('duration_seconds', null)) as { id: string; url: string }[];
    const withIds = items.map((i) => ({ ...i, vid: youtubeId(i.url) })).filter((i) => i.vid);
    const meta = new Map((await fetchVideos([...new Set(withIds.map((i) => i.vid!))])).map((m) => [m.id, m.seconds]));
    let updated = 0;
    for (const i of withIds) {
      const seconds = meta.get(i.vid!);
      if (seconds === undefined) continue;
      must(await s.from('items').update({ duration_seconds: seconds }).eq('id', i.id));
      updated++;
    }
    return `تم تحديث مدة ${updated} فيديو، ولم يُعثر على ${withIds.length - updated}`;
  });
}

export async function togglePublished(table: string, id: string, value: boolean): Promise<Result> {
  return run(async () => {
    const s = await adminClient();
    must(await s.from(assertTable(table)).update({ is_published: value }).eq('id', id));
  });
}

export async function deleteRow(table: string, id: string): Promise<Result> {
  return run(async () => {
    const s = await adminClient();
    const t = assertTable(table);
    let file: string | null = null;
    if (t === 'items') file = ((must(await s.from('items').select('storage_path').eq('id', id).single()) as { storage_path: string | null }).storage_path);
    must(await s.from(t).delete().eq('id', id));
    if (file) await createAdminClient().storage.from(BOOKS_BUCKET).remove([file]);
  });
}

/** Swap `sort` with the neighbour above/below among siblings. */
export async function moveRow(table: string, id: string, dir: -1 | 1): Promise<Result> {
  return run(async () => {
    const s = await adminClient();
    const t = assertTable(table);
    if (t === 'levels') throw new Error('invalid_input');
    const parentCol = t === 'tracks' ? 'level_id' : t === 'items' ? 'section_id' : 'track_id';
    const me = must(await s.from(t).select(`id, sort, ${parentCol}${t === 'sections' ? ', parent_id' : ''}`).eq('id', id).single()) as unknown as Record<string, string | number | null>;
    let q = s.from(t).select('id, sort').eq(parentCol, me[parentCol] as string);
    if (t === 'sections') q = me.parent_id ? q.eq('parent_id', me.parent_id as string) : q.is('parent_id', null);
    const siblings = (must(await q.order('sort')) as { id: string; sort: number }[]).map((x, i) => ({ ...x, sort: i }));
    const idx = siblings.findIndex((x) => x.id === id);
    const j = idx + dir;
    if (j < 0 || j >= siblings.length) return;
    [siblings[idx], siblings[j]] = [siblings[j], siblings[idx]];
    for (const [i, x] of siblings.entries()) must(await s.from(t).update({ sort: i }).eq('id', x.id));
  });
}

// ── Uploaded books (PDF in Supabase Storage) ─────────────────────────────────

/** Step 1: a one-time upload URL; the browser sends the file straight to Storage (not through Vercel). */
export async function createBookUpload(fileName: string): Promise<{ ok: true; path: string; token: string } | { ok: false; error: string }> {
  try {
    await adminClient();
    const safe = fileName.replace(/[^\w.\-]+/g, '_').slice(-80) || 'book.pdf';
    const path = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}-${safe}`;
    const { data, error } = await createAdminClient().storage.from(BOOKS_BUCKET).createSignedUploadUrl(path);
    if (error || !data) throw error ?? new Error('upload');
    return { ok: true, path, token: data.token };
  } catch (e) {
    return { ok: false, error: toArabicError(e) };
  }
}

/** Step 2: save the lesson (new, or replacing the file of an existing one). */
export async function saveUploadedBook(form: FormData): Promise<Result> {
  return run(async () => {
    const s = await adminClient();
    const id = str(form, 'id');
    const path = str(form, 'storage_path');
    const title = str(form, 'title');
    if (!path || (!id && !title)) throw new Error('invalid_input');
    const row = {
      kind: 'book' as const,
      storage_path: path,
      url: `storage:${path}`,
      file_size: num(form, 'file_size') ?? null,
      ...(title ? { title } : {}),
      ...(num(form, 'pages') ? { pages: num(form, 'pages') } : {}),
    };
    if (id) {
      const old = must(await s.from('items').select('storage_path').eq('id', id).single()) as { storage_path: string | null };
      must(await s.from('items').update(row).eq('id', id));
      if (old.storage_path && old.storage_path !== path) await createAdminClient().storage.from(BOOKS_BUCKET).remove([old.storage_path]);
      return 'تم استبدال الملف';
    }
    const section_id = str(form, 'section_id');
    const { count } = await s.from('items').select('id', { count: 'exact', head: true }).eq('section_id', section_id!);
    must(await s.from('items').insert({ ...row, title, section_id, sort: count ?? 0 }));
    return 'تم رفع الكتاب';
  });
}

export async function saveSiteAudio(form: FormData): Promise<Result> {
  return run(async () => {
    const s = await adminClient();
    const key = str(form, 'key');
    if (!key) throw new Error('invalid_input');
    must(await s.from('site_audio').update({ title: str(form, 'title'), url: str(form, 'url') }).eq('key', key));
  });
}
