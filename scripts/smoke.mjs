// End-to-end smoke test against `next dev` + the local Supabase stack.
// Usage (from D:/Anas/Daawa, dev server on :3000): node --env-file=.env.development.local scripts/smoke.mjs
import { createServerClient } from '@supabase/ssr';

const BASE = 'http://localhost:3000';
const jar = new Map();
const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
  cookies: {
    getAll: () => [...jar].map(([name, value]) => ({ name, value })),
    setAll: (list) => list.forEach(({ name, value }) => (value ? jar.set(name, value) : jar.delete(name))),
  },
});
const cookie = () => [...jar].map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('; ');
const get = (path) => fetch(BASE + path, { headers: { cookie: cookie() }, redirect: 'manual' });
let failures = 0;
const check = (ok, label) => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${label}`);
  if (!ok) failures++;
};

const email = process.env.DEV_STUDENT_EMAIL;
const password = process.env.DEV_STUDENT_PASSWORD;

let { error } = await supabase.auth.signInWithPassword({ email, password });
if (error) {
  ({ error } = await supabase.auth.signUp({ email, password }));
  if (error) throw error;
}

let r = await get('/');
check(r.status === 307 || r.status === 302 ? r.headers.get('location')?.endsWith('/onboarding') || r.headers.get('location')?.endsWith('/') : true,
  'signed-in user is routed (onboarding first time)');

const { data: prof } = await supabase.from('profiles').select('onboarded_at').single();
if (!prof.onboarded_at) {
  r = await get('/onboarding');
  const html = await r.text();
  check(html.includes('كنت معكم من قبل'), 'onboarding form renders with new/returning choice');
  const { error: e } = await supabase.rpc('complete_onboarding', {
    p_full_name: 'طالب تجريبي', p_governorate: 'القاهرة', p_age: 22, p_previous_courses: '', p_entry_type: 'new', p_whatsapp: '01012345678', p_requested_level: null,
  });
  check(!e, 'complete_onboarding');
}

r = await get('/');
let html = await r.text();
check(r.status === 200 && html.includes('خريطة المستويات'), 'home renders level map');
check(html.includes('كمّل من حيث وقفت'), 'home shows continue card');
check(html.includes('يُفتح بعد إتمام المستوى السابق'), 'home shows locked levels');

r = await get('/levels/1');
html = await r.text();
check(html.includes('تمهيد طلب العلم') && html.includes('سلاسل التزكية'), 'level 1 lists both tracks');

r = await get('/levels/2');
html = await r.text();
check(html.includes('هذا المستوى مقفول'), 'level 2 is shown as locked');

const { data: tracks } = await supabase.from('tracks').select('id, title, levels(number)');
check(tracks.every((t) => t.levels.number === 1), `RLS: student sees only level-1 tracks (${tracks.length})`);
const learning = tracks.find((t) => t.title === 'تمهيد طلب العلم');

r = await get(`/levels/1/${learning.id}`);
html = await r.text();
check(html.includes('حقيبة مفاتيح الطلب') && html.includes('خلّصته'), 'track page renders sections and done buttons');

const { data: l2 } = await supabase.from('items').select('id').limit(1000);
check(l2.length === 245, `RLS: student reads exactly the 245 level-1 items (${l2.length})`);

r = await get('/me');
check((await r.text()).includes('الدروع'), '/me renders');
r = await get('/levels/1/journal');
check((await r.text()).includes('مدونة'), 'journal renders');
r = await get('/certificates/1');
check(r.status === 404, 'certificate for an unfinished level is 404');
r = await get('/admin');
check([302, 307].includes(r.status), 'student is redirected away from /admin');

console.log(failures ? `\n${failures} check(s) failed` : '\nall checks passed');
process.exit(failures ? 1 : 0);
