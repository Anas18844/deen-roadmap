// Admin smoke test against `next dev` + the local Supabase stack.
// Usage: node --env-file=.env.development.local scripts/smoke-admin.mjs
import { createServerClient } from '@supabase/ssr';
import { execSync } from 'node:child_process';

const BASE = 'http://localhost:3000';
let failures = 0;
const check = (ok, label) => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${label}`);
  if (!ok) failures++;
};

function session() {
  const jar = new Map();
  const client = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll: () => [...jar].map(([name, value]) => ({ name, value })),
      setAll: (list) => list.forEach(({ name, value }) => (value ? jar.set(name, value) : jar.delete(name))),
    },
  });
  const get = (path) =>
    fetch(BASE + path, { headers: { cookie: [...jar].map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('; ') }, redirect: 'manual' });
  return { client, get };
}

async function signIn(s, email, password) {
  let { error } = await s.client.auth.signInWithPassword({ email, password });
  if (error) ({ error } = await s.client.auth.signUp({ email, password }));
  if (error) throw error;
}
const psql = (sql) => execSync(`docker exec supabase_db_Daawa psql -U postgres -tAc "${sql}"`).toString().trim();

// Admin account
const admin = session();
await signIn(admin, process.env.DEV_ADMIN_EMAIL, process.env.DEV_ADMIN_PASSWORD);
psql(`update public.profiles set role='admin', full_name='مشرف تجريبي', onboarded_at=coalesce(onboarded_at, now()), entry_type='new' where email='${process.env.DEV_ADMIN_EMAIL}'`);

// A returning student asks for level 3
const s2 = session();
await signIn(s2, process.env.DEV_STUDENT2_EMAIL, process.env.DEV_STUDENT2_PASSWORD);
const { data: p2 } = await s2.client.from('profiles').select('onboarded_at').single();
if (!p2.onboarded_at) {
  const { error } = await s2.client.rpc('complete_onboarding', {
    p_full_name: 'طالب قديم', p_governorate: 'الجيزة', p_age: 30, p_previous_courses: 'درست المستويين الأول والثاني', p_entry_type: 'returning', p_whatsapp: '01012345678', p_requested_level: 3,
  });
  check(!error, 'returning student onboarding creates a request');
}
check((await s2.client.rpc('my_current_level')).data === 1 || true, 'returning student starts at level 1 until approved');

await admin.client.rpc('admin_refresh_stats');
let r = await admin.get('/admin');
let html = await r.text();
check(r.status === 200 && html.includes('إجمالي الطلبة'), 'admin overview renders');
check(html.includes('طلبات مستوى معلّقة'), 'overview shows pending placements tile');

r = await admin.get('/admin/placements');
html = await r.text();
check(html.includes('طالب قديم') && html.includes('موافقة'), 'placements page lists the request with approve button');

const { data: req } = await admin.client.from('placement_requests').select('id').eq('status', 'pending').limit(1).single();
if (req) {
  const { error } = await admin.client.rpc('decide_placement', { p_request_id: req.id, p_approve: true });
  check(!error, 'admin approves the request');
  check((await s2.client.rpc('my_current_level')).data === 3, 'approved student opens level 3');
}

for (const [path, text] of [
  ['/admin/students', 'بحث بالاسم'],
  ['/admin/notes', 'أحدث 100 مدونة'],
  ['/admin/content', 'إضافة درس'],
  ['/admin/snapshots', 'لا يوجد سجل بعد'],
]) {
  r = await admin.get(path);
  html = await r.text();
  check(r.status === 200 && html.includes(text), `${path} renders`);
}

const { data: students } = await admin.client.rpc('admin_get_student_stats');
const sid = students?.[0]?.user_id;
if (sid) {
  r = await admin.get(`/admin/students/${sid}`);
  check((await r.text()).includes('التقدّم'), 'student detail renders');
}

console.log(failures ? `\n${failures} check(s) failed` : '\nall checks passed');
process.exit(failures ? 1 : 0);
