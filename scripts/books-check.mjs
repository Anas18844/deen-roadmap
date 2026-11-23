// Live check of uploaded books: admin upload → student in the level can open → student below the level can't.
// Creates a temporary lesson + file and removes both. Usage: node --env-file=.env.local scripts/books-check.mjs
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';

const BASE = 'https://deen-roadmap.vercel.app';
const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL;
const admin = createClient(URL_, process.env.SUPABASE_SECRET_KEY, { auth: { persistSession: false } });
let failures = 0;
const check = (ok, label) => { console.log(`${ok ? 'ok  ' : 'FAIL'} ${label}`); if (!ok) failures++; };

async function sessionFor(email) {
  const { data: link } = await admin.auth.admin.generateLink({ type: 'magiclink', email });
  const jar = new Map();
  const c = createServerClient(URL_, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    cookies: { getAll: () => [...jar].map(([n, v]) => ({ name: n, value: v })), setAll: (l) => l.forEach(({ name: n, value: v }) => (v ? jar.set(n, v) : jar.delete(n))) },
  });
  await c.auth.verifyOtp({ type: 'magiclink', token_hash: link.properties.hashed_token });
  return { c, get: (p) => fetch(BASE + p, { headers: { cookie: [...jar].map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('; ') }, redirect: 'manual' }) };
}

const pdf = Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj 3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 200 200]>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF');
const created = { items: [], files: [], users: [] };
try {
  const { data: ups } = await admin.auth.admin.createUser({ email: 'qa-books@example.com', email_confirm: true, user_metadata: { qa: true, full_name: 'اختبار الكتب' } });
  created.users.push(ups.user.id);
  const st = await sessionFor('qa-books@example.com');
  await st.c.rpc('complete_onboarding', { p_full_name: 'اختبار الكتب', p_governorate: 'القاهرة', p_age: 20, p_previous_courses: '', p_entry_type: 'new', p_requested_level: null });

  // as admin (Anas): signed upload URL → upload → lesson rows in level 1 and level 4
  const ad = await sessionFor('spaniol188@gmail.com');
  const path = `qa/${Date.now()}-test.pdf`;
  const { data: up, error: e1 } = await ad.c.storage.from('books').createSignedUploadUrl(path);
  check(!e1, 'admin can create a signed upload URL');
  const { error: e2 } = await ad.c.storage.from('books').uploadToSignedUrl(path, up.token, pdf, { contentType: 'application/pdf' });
  check(!e2, 'file uploads straight to Storage');
  created.files.push(path);

  const sec = async (n) => {
    const { data: lvl } = await admin.from('levels').select('id').eq('number', n).single();
    const { data: trk } = await admin.from('tracks').select('id').eq('level_id', lvl.id).limit(1).single();
    return (await admin.from('sections').select('id').eq('track_id', trk.id).is('parent_id', null).limit(1).single()).data.id;
  };
  for (const n of [1, 4]) {
    const { data: it } = await ad.c.from('items').insert({ section_id: await sec(n), kind: 'book', title: `كتاب اختبار م${n}`, url: `storage:${path}`, storage_path: path, sort: 999 }).select('id').single();
    created.items.push(it.id);
  }

  let r = await st.get(`/books/${created.items[0]}`);
  check([302, 307].includes(r.status) && r.headers.get('location')?.includes('/storage/v1/object/sign/books/'), 'level-1 student gets a signed link');
  const file = await fetch(r.headers.get('location'));
  check(file.ok && (await file.text()).startsWith('%PDF'), 'signed link serves the PDF');
  r = await st.get(`/books/${created.items[1]}`);
  check(r.status === 404, 'level-4 book is refused to a level-1 student');
  const direct = await st.c.storage.from('books').download(path);
  check(!!direct.error, 'student cannot read the bucket directly');
  const usage = await ad.c.rpc('admin_storage_usage');
  check(usage.data?.files >= 1, `storage usage reports ${usage.data?.files} file(s)`);
} catch (e) {
  failures++;
  console.error('ERROR', e.message ?? e);
} finally {
  if (created.items.length) await admin.from('items').delete().in('id', created.items);
  if (created.files.length) await admin.storage.from('books').remove(created.files);
  for (const id of created.users) await admin.auth.admin.deleteUser(id);
  console.log(`cleanup: ${created.items.length} lessons, ${created.files.length} file, ${created.users.length} account removed`);
}
console.log(failures ? `${failures} failed` : 'all checks passed');
process.exit(failures ? 1 : 0);
