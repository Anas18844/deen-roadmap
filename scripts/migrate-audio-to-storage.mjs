// Move every voice note (levels, tracks, sections, home page) from Drive into the public `audio` bucket.
// Dead Drive links are cleared and reported. Usage: node --env-file=.env.local scripts/migrate-audio-to-storage.mjs <tmp-dir>
import { createClient } from '@supabase/supabase-js';
import { mkdirSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import path from 'node:path';

const tmp = process.argv[2];
mkdirSync(tmp, { recursive: true });
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, { auth: { persistSession: false } });
const EXT = { 'audio/mp4': 'm4a', 'audio/x-m4a': 'm4a', 'audio/mpeg': 'mp3', 'audio/aac': 'aac', 'audio/ogg': 'ogg', 'audio/wav': 'wav', 'audio/webm': 'webm' };

// Sniff the real type from the file header (Drive often says application/octet-stream).
function sniff(buf) {
  const h = buf.subarray(0, 12);
  if (h.subarray(4, 8).toString() === 'ftyp') return 'audio/mp4';
  if (h.subarray(0, 3).toString() === 'ID3' || (h[0] === 0xff && (h[1] & 0xe0) === 0xe0)) return 'audio/mpeg';
  if (h.subarray(0, 4).toString() === 'OggS') return 'audio/ogg';
  if (h.subarray(0, 4).toString() === 'RIFF') return 'audio/wav';
  if (h[0] === 0x1a && h[1] === 0x45) return 'audio/webm';
  return null;
}

const targets = [];
for (const [table, key, col] of [['levels', 'id', 'intro_audio_url'], ['tracks', 'id', 'intro_audio_url'], ['sections', 'id', 'intro_audio_url'], ['site_audio', 'key', 'url']]) {
  const { data, error } = await db.from(table).select(`${key}, title, ${col}`).not(col, 'is', null);
  if (error) throw error;
  for (const r of data) targets.push({ table, key, id: r[key], col, title: r.title, url: r[col] });
}

const moved = [], dead = [], skipped = [];
for (const t of targets) {
  if (!/drive\.google\.com/.test(t.url)) { skipped.push(`${t.title}: not a Drive link`); continue; }
  const id = t.url.match(/\/d\/([\w-]+)/)?.[1];
  let buf = null;
  for (let attempt = 1; attempt <= 3 && !buf; attempt++) {
    try {
      const res = await fetch(`https://drive.usercontent.google.com/download?id=${id}&export=download&confirm=t`);
      if (res.status === 404) break;
      if (res.ok) buf = Buffer.from(await res.arrayBuffer());
    } catch { /* retry */ }
  }
  const type = buf ? sniff(buf) : null;
  if (!buf || !type) {
    await db.from(t.table).update({ [t.col]: null }).eq(t.key, t.id);
    dead.push(`${t.table} «${t.title}»: ${t.url}`);
    continue;
  }
  const file = path.join(tmp, `${t.table}-${t.id}`);
  writeFileSync(file, buf);
  const storagePath = `${t.table}/${crypto.randomUUID()}.${EXT[type]}`;
  const up = await db.storage.from('audio').upload(storagePath, readFileSync(file), { contentType: type, upsert: true });
  rmSync(file);
  if (up.error) { skipped.push(`${t.title}: upload failed — ${up.error.message}`); continue; }
  const publicUrl = db.storage.from('audio').getPublicUrl(storagePath).data.publicUrl;
  const { error: e } = await db.from(t.table).update({ [t.col]: publicUrl }).eq(t.key, t.id);
  if (e) { skipped.push(`${t.title}: ${e.message}`); continue; }
  moved.push(t.title);
  console.log(`moved ${t.table} «${t.title}» (${(buf.length / 1048576).toFixed(1)} MB, ${type})`);
}
console.log(`\nmoved ${moved.length} · dead links cleared ${dead.length} · skipped ${skipped.length}`);
dead.forEach((d) => console.log('  dead: ' + d));
skipped.forEach((s) => console.log('  skipped: ' + s));
