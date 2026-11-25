// Live end-to-end check against the deployed site with throw-away QA accounts, which it deletes at the end.
// Accounts are created via the admin API (no passwords); sessions come from one-time magic-link tokens.
// Usage: node --env-file=.env.local scripts/prod-check.mjs https://deen-roadmap.vercel.app
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { randomBytes } from 'node:crypto';

const BASE = process.argv[2] ?? 'https://deen-roadmap.vercel.app';
const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL;
const admin = createClient(URL_, process.env.SUPABASE_SECRET_KEY, { auth: { persistSession: false } });
const tag = randomBytes(3).toString('hex');
const created = [];
let failures = 0;
const check = (ok, label) => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${label}`);
  if (!ok) failures++;
};

async function qaUser(n, name) {
  const email = `qa-${tag}-${n}@example.com`;
  const { data, error } = await admin.auth.admin.createUser({ email, email_confirm: true, user_metadata: { full_name: name, qa: true } });
  if (error) throw error;
  created.push(data.user.id);
  const { data: link, error: e2 } = await admin.auth.admin.generateLink({ type: 'magiclink', email });
  if (e2) throw e2;
  const jar = new Map();
  const client = createServerClient(URL_, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll: () => [...jar].map(([name, value]) => ({ name, value })),
      setAll: (l) => l.forEach(({ name, value }) => (value ? jar.set(name, value) : jar.delete(name))),
    },
  });
  const { error: e3 } = await client.auth.verifyOtp({ type: 'magiclink', token_hash: link.properties.hashed_token });
  if (e3) throw e3;
  const get = (p) => fetch(BASE + p, { headers: { cookie: [...jar].map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('; ') }, redirect: 'manual' });
  return { id: data.user.id, client, get };
}

try {
  // ── Visitor (not signed in): public intro only ───────────────────────────
  const guest = await fetch(BASE + '/', { redirect: 'manual' });
  const gh = await guest.text();
  check(guest.status === 200 && gh.includes('احنا بنعمل ايه؟') && gh.includes('تمهيد خريطة الدين كاملة'), 'visitor sees the intro and the levels');
  check(!gh.includes('youtu'), 'visitor sees no lesson links');

  // ── New student: full level 1 ────────────────────────────────────────────
  const s = await qaUser(1, 'طالب اختبار');
  let r = await s.get('/');
  check([302, 307].includes(r.status) && r.headers.get('location')?.includes('/onboarding'), 'new user is sent to onboarding');
  r = await s.get('/onboarding');
  check((await r.text()).includes('كنت معكم من قبل'), 'onboarding form renders');
  const bad = await s.client.rpc('complete_onboarding', {
    p_full_name: 'طالب اختبار', p_governorate: 'القاهرة', p_age: 20, p_previous_courses: '', p_entry_type: 'new', p_whatsapp: '12345', p_requested_level: null,
  });
  check(bad.error?.message === 'invalid_whatsapp', 'malformed WhatsApp number is rejected');
  const noGov = await s.client.rpc('complete_onboarding', {
    p_full_name: 'طالب اختبار', p_governorate: '', p_age: 20, p_previous_courses: '', p_entry_type: 'new', p_whatsapp: '01012345678', p_requested_level: null,
  });
  check(noGov.error?.message === 'invalid_input', 'missing governorate is rejected');
  let { error } = await s.client.rpc('complete_onboarding', {
    p_full_name: 'طالب اختبار', p_governorate: 'القاهرة', p_age: 20, p_previous_courses: '', p_entry_type: 'new', p_whatsapp: '01012345678', p_requested_level: null,
  });
  check(!error, 'onboarding saved');
  const { data: me } = await s.client.from('profiles').select('whatsapp').single();
  check(me.whatsapp === '+201012345678', `WhatsApp stored normalised (${me.whatsapp})`);

  r = await s.get('/');
  let html = await r.text();
  check(r.status === 200 && html.includes('عليك الدور') && html.includes('خريطة المستويات') && html.includes('احنا بنعمل ايه؟'), 'home: intro, then level map, then what is next');

  const { data: items } = await s.client.from('items').select('id');
  const { data: l1 } = await admin.from('levels').select('id').eq('number', 1).single();
  const { data: l1Items } = await admin.rpc('level_published_items', { p_level_id: l1.id });
  check(items.length === l1Items.length, `student sees exactly the level-1 lessons (${items.length}/${l1Items.length})`);
  const { data: l2 } = await s.client.from('tracks').select('id, levels!inner(number)').eq('levels.number', 2);
  check(l2.length === 0, 'level-2 tracks hidden');

  const { data: tracks } = await s.client.from('tracks').select('id, title');
  for (const t of tracks) {
    r = await s.get(`/levels/1/${t.id}`);
    check(r.status === 200 && (await r.text()).includes('خلّصته'), `track page renders: ${t.title}`);
  }

  let last;
  for (const it of items) {
    const res = await s.client.rpc('complete_item', { p_item_id: it.id });
    if (res.error) throw res.error;
    last = res.data;
  }
  check(last.level_completed === false, 'all items done but level not closed before notes');
  check((await s.client.rpc('my_current_level')).data === 2, 'level 2 already open after 70%');

  const { data: l1Tracks } = await admin.from('tracks').select('id').eq('level_id', l1.id);
  const { data: l1Secs } = await admin.from('sections').select('id, title, items(id)').in('track_id', l1Tracks.map((t) => t.id));
  const tops = l1Secs.filter((x) => x.items.length > 0); // every series with lessons gets a note
  const note = 'استفدت من هذا القسم فوائد كثيرة في فهم العلم الشرعي وأهمية التدرج فيه، وأن طالب العلم يحتاج إلى الصبر والإخلاص والأدب مع أهل العلم. '.repeat(3);
  let closing;
  for (const sec of tops) {
    const res = await s.client.rpc('save_section_note', { p_section_id: sec.id, p_body: note });
    if (res.error) throw res.error;
    if (res.data.level_completed) closing = res.data;
  }
  check(!closing, 'writing the last note does not complete the level by itself');
  const { data: dReady } = await s.client.rpc('my_dashboard');
  check(dReady.ready_level?.number === 1, 'level 1 is ready to hand in');
  r = await s.get('/levels/1/journal');
  check((await r.text()).includes('سلّم المستوى'), 'journal shows the hand-in button');
  const sub = await s.client.rpc('submit_level', { p_level_number: 1 });
  check(sub.data?.level_completed === true, `level 1 completes after review and hand-in (${tops.length} notes)`);
  check((await s.client.rpc('my_current_level')).data === 2, 'level 2 opens');
  r = await s.get('/certificates/1');
  check(r.status === 200 && (await r.text()).includes('شهادة إتمام'), 'certificate available');
  r = await s.get('/leaders');
  check(r.status === 200 && (await r.text()).includes('الأوائل'), '/leaders renders');
  r = await s.get('/me');
  check((await r.text()).includes('الدروع'), '/me renders');
  r = await s.get('/levels/1/journal');
  check((await r.text()).includes(`كتبت ${tops.length} من ${tops.length}`), 'journal shows all notes');

  // ── Returning student (levels 2–3 open immediately; level 4 is invite-only) ──
  const old = await qaUser(2, 'طالب قديم اختبار');
  ({ error } = await old.client.rpc('complete_onboarding', {
    p_full_name: 'طالب قديم اختبار', p_governorate: 'الجيزة', p_age: 30, p_previous_courses: 'المستوى الأول والثاني', p_entry_type: 'returning', p_whatsapp: '01012345678', p_requested_level: 3,
  }));
  check(!error, 'returning student chooses level 3');
  check((await old.client.rpc('my_current_level')).data === 3, 'level 3 opens immediately');
  const asked4 = await old.client.rpc('request_placement', { p_level: 4 });
  check(!!asked4.error, 'level 4 cannot be requested through the normal form');

  const a = await qaUser(3, 'مشرف اختبار');
  await admin.from('profiles').update({ role: 'admin', onboarded_at: new Date().toISOString(), entry_type: 'new' }).eq('id', a.id);
  await a.client.rpc('admin_refresh_stats');
  for (const [p, text] of [['/admin', 'أين وصل طلبة الخريطة'], ['/admin/students', 'طالب اختبار'], ['/admin/placements', 'طلبات'], ['/admin/notes', 'طالب اختبار'], ['/admin/content', 'إضافة درس'], ['/admin/snapshots', 'السجل'], ['/admin/invites', 'رابط دعوة جديد'], ['/admin/exams', 'الامتحانات'], ['/admin/messages', 'رسائل المتابعة'], ['/admin/announcements', 'إعلان جديد']]) {
    r = await a.get(p);
    html = await r.text();
    check(r.status === 200 && html.includes(text), `admin page ${p}`);
  }
  r = await s.get('/admin');
  check([302, 307].includes(r.status), 'student cannot open /admin');

  // announcements reach students; private notes never do
  const ann = await a.client.from('announcements').insert({ title: 'إعلان اختبار' }).select('id').single();
  r = await s.get('/');
  check((await r.text()).includes('إعلان اختبار'), 'active announcement shows on the student home');
  await admin.from('announcements').delete().eq('id', ann.data.id);
  await a.client.from('student_admin_notes').insert({ student_id: s.id, body: 'ملاحظة سرية' });
  const peek = await s.client.from('student_admin_notes').select('id');
  check((peek.data ?? []).length === 0, 'student cannot read private notes about them');

} catch (e) {
  failures++;
  console.error('ERROR', e.message ?? e);
} finally {
  for (const id of created) await admin.auth.admin.deleteUser(id);
  const { count } = await admin.from('profiles').select('id', { count: 'exact', head: true }).in('id', created);
  console.log(`\ncleanup: deleted ${created.length} QA accounts, ${count} profiles left`);
  await admin.rpc('refresh_admin_stats').then(() => {}, () => {});
}
console.log(failures ? `${failures} check(s) failed` : 'all checks passed');
process.exit(failures ? 1 : 0);
