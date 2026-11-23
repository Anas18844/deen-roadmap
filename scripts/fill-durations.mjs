// Fills duration_seconds (and so points) for every video, and reports links YouTube can't find.
// Usage: node --env-file=.env.local scripts/fill-durations.mjs [--dry]
import { createClient } from '@supabase/supabase-js';

const dry = process.argv.includes('--dry');
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);
const KEY = process.env.YOUTUBE_API_KEY;

const idOf = (url) => url.match(/(?:youtube\.com\/(?:live\/|watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1] ?? null;
const secs = (iso) => {
  const m = iso.match(/^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/) ?? [];
  const [, d = 0, h = 0, mi = 0, s = 0] = m.map((v) => Number(v ?? 0));
  return d * 86400 + h * 3600 + mi * 60 + s;
};

const { data: items, error } = await db
  .from('items')
  .select('id, title, url, duration_seconds, sections(title, tracks(title, levels(number)))')
  .eq('kind', 'video');
if (error) throw error;

const withId = items.map((i) => ({ ...i, vid: idOf(i.url) }));
const noId = withId.filter((i) => !i.vid);
const ids = [...new Set(withId.filter((i) => i.vid).map((i) => i.vid))];

const meta = new Map();
for (let i = 0; i < ids.length; i += 50) {
  const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=contentDetails,status&id=${ids.slice(i, i + 50).join(',')}&key=${KEY}`);
  if (!res.ok) throw new Error(`YouTube API ${res.status}: ${await res.text()}`);
  for (const v of (await res.json()).items ?? []) meta.set(v.id, { seconds: secs(v.contentDetails.duration), privacy: v.status.privacyStatus });
}

const where = (i) => `م${i.sections.tracks.levels.number} · ${i.sections.tracks.title} · ${i.sections.title}`;
const missing = withId.filter((i) => i.vid && !meta.has(i.vid));
const priv = withId.filter((i) => meta.get(i.vid)?.privacy === 'private');
const live = withId.filter((i) => meta.get(i.vid)?.seconds === 0);
let updated = 0;
let totalSecs = 0;
for (const i of withId) {
  const m = meta.get(i.vid);
  if (!m || m.seconds === 0) continue;
  totalSecs += m.seconds;
  if (!dry && i.duration_seconds !== m.seconds) {
    const { error: e } = await db.from('items').update({ duration_seconds: m.seconds }).eq('id', i.id);
    if (e) throw e;
    updated++;
  }
}

console.log(`videos: ${items.length} · unique ids: ${ids.length} · found on YouTube: ${meta.size}`);
console.log(`updated durations: ${updated}${dry ? ' (dry run)' : ''} · total watch time: ${Math.round(totalSecs / 3600)} hours`);
for (const [label, list] of [['NOT FOUND (deleted or wrong link)', missing], ['PRIVATE', priv], ['zero duration (upcoming/live?)', live], ['not a YouTube link', noId]]) {
  if (!list.length) continue;
  console.log(`\n${label}: ${list.length}`);
  for (const i of list) console.log(`  - ${i.title} — ${where(i)} — ${i.url}`);
}
