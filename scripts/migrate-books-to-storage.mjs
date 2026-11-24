// Move book PDFs from public Drive links into the private Supabase Storage bucket.
// Usage: node --env-file=.env.local scripts/migrate-books-to-storage.mjs <tmp-dir> [--dry]
// Skips books already in storage and anything over the 50 MB bucket limit (those stay on Drive).
import { createClient } from '@supabase/supabase-js';
import { mkdirSync, writeFileSync, readFileSync, rmSync, appendFileSync } from 'node:fs';
import path from 'node:path';

const tmp = process.argv[2];
const dry = process.argv.includes('--dry');
if (!tmp) throw new Error('usage: migrate-books-to-storage.mjs <tmp-dir>');
mkdirSync(tmp, { recursive: true });

const LIMIT = 50 * 1024 * 1024;
const KEEP_ON_DRIVE = ['دستور الملتزم الجديد'];
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, { auth: { persistSession: false } });
const logFile = path.join(tmp, 'migration-log.tsv');

const { data: books, error } = await db
  .from('items')
  .select('id, title, url, storage_path, sections(tracks(levels(number)))')
  .eq('kind', 'book');
if (error) throw error;

let moved = 0;
const skipped = [];
for (const b of books) {
  const level = b.sections.tracks.levels.number;
  if (b.storage_path) { skipped.push(`${b.title}: already in storage`); continue; }
  if (KEEP_ON_DRIVE.includes(b.title)) { skipped.push(`${b.title}: kept on Drive → ${b.url}`); continue; }
  const id = b.url.match(/\/d\/([\w-]+)/)?.[1];
  if (!id) { skipped.push(`${b.title}: not a Drive file link`); continue; }

  const dl = `https://drive.usercontent.google.com/download?id=${id}&export=download&confirm=t`;
  const head = await fetch(dl, { headers: { Range: 'bytes=0-0' } });
  const size = Number(head.headers.get('content-range')?.split('/')[1] ?? 0);
  if (!size) { skipped.push(`${b.title}: Drive did not report a size`); continue; }
  if (size > LIMIT) { skipped.push(`${b.title}: ${(size / 1048576).toFixed(0)} MB > 50 MB, stays on Drive → ${b.url}`); continue; }
  if (dry) { console.log(`would move L${level} ${b.title} (${(size / 1048576).toFixed(1)} MB)`); continue; }

  const res = await fetch(dl);
  const buf = Buffer.from(await res.arrayBuffer());
  const file = path.join(tmp, `${b.id}.pdf`);
  writeFileSync(file, buf);
  const data = readFileSync(file);
  if (data.subarray(0, 5).toString() !== '%PDF-') { rmSync(file); skipped.push(`${b.title}: download was not a PDF`); continue; }

  const storagePath = `L${level}/${b.id}.pdf`;
  const up = await db.storage.from('books').upload(storagePath, data, { contentType: 'application/pdf', upsert: true });
  rmSync(file);
  if (up.error) { skipped.push(`${b.title}: upload failed — ${up.error.message}`); continue; }

  const { error: e2, count } = await db
    .from('items')
    .update({ storage_path: storagePath, url: `storage:${storagePath}`, file_size: data.length }, { count: 'exact' })
    .eq('id', b.id);
  if (e2 || count !== 1) { skipped.push(`${b.title}: saved file but could not link it (${e2?.message ?? count})`); continue; }

  appendFileSync(logFile, `${b.id}\t${b.title}\t${b.url}\t${storagePath}\t${data.length}\n`);
  moved++;
  console.log(`moved L${level} ${b.title} (${(data.length / 1048576).toFixed(1)} MB)`);
}

console.log(`\n${dry ? 'dry run' : `moved ${moved}`} · skipped ${skipped.length}`);
skipped.forEach((s) => console.log('  - ' + s));
