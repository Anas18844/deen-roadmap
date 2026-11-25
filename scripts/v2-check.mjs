// Live check: 70% unlock, private level 4 + invites, leaderboard, exams. Temporary accounts/exam are removed.
// Usage: node --env-file=.env.local scripts/v2-check.mjs
import { createClient } from '@supabase/supabase-js';

const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL;
const admin = createClient(URL_, process.env.SUPABASE_SECRET_KEY, { auth: { persistSession: false } });
let failures = 0;
const check = (ok, label) => { console.log(`${ok ? 'ok  ' : 'FAIL'} ${label}`); if (!ok) failures++; };
const users = [];
let examId = null;

async function user(name, { role } = {}) {
  const email = `qa-v2-${users.length}-${Date.now()}@example.com`;
  const { data } = await admin.auth.admin.createUser({ email, email_confirm: true, user_metadata: { qa: true, full_name: name } });
  users.push(data.user.id);
  if (role === 'admin') await admin.from('profiles').update({ role: 'admin', onboarded_at: new Date().toISOString(), entry_type: 'new' }).eq('id', data.user.id);
  const { data: l } = await admin.auth.admin.generateLink({ type: 'magiclink', email });
  const c = createClient(URL_, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, { auth: { persistSession: false } });
  await c.auth.verifyOtp({ type: 'magiclink', token_hash: l.properties.hashed_token });
  if (role !== 'admin') {
    const r = await c.rpc('complete_onboarding', { p_full_name: name, p_governorate: 'القاهرة', p_age: 20, p_previous_courses: '', p_entry_type: 'new', p_whatsapp: '01012345678' });
    if (r.error) throw r.error;
  }
  return { id: data.user.id, c };
}

try {
  const anon = createClient(URL_, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
  const pub = (await anon.rpc('public_levels')).data.map((l) => l.number);
  check(!pub.includes(4), `visitors don't see level 4 (${pub.join(',')})`);

  // ── 70% unlock ────────────────────────────────────────────────────────────
  const s = await user('أحمد اختبار');
  const { data: lv } = await s.c.from('levels').select('number');
  check(!lv.some((l) => l.number === 4), 'students do not see level 4 at all');
  const { data: dash0 } = await s.c.rpc('my_dashboard');
  check(!dash0.levels.some((l) => l.number === 4), 'level 4 absent from the dashboard');
  const { data: l1 } = await admin.from('levels').select('id').eq('number', 1).single();
  const { data: l1items } = await admin.rpc('level_items_ordered', { p_level_id: l1.id });
  const need = Math.ceil(l1items.length * 0.7);
  let unlockedAt = null;
  for (const [k, it] of l1items.entries()) {
    const r = await s.c.rpc('complete_item', { p_item_id: it.item_id });
    if (r.error) throw r.error;
    if (r.data.next_unlocked) { unlockedAt = k + 1; break; }
  }
  check(unlockedAt === need, `level 2 opens at 70% (${unlockedAt} of ${l1items.length}, expected ${need})`);
  check((await s.c.rpc('my_current_level')).data === 2, 'current level is 2');
  const { data: d1 } = await s.c.rpc('my_dashboard');
  check(d1.levels.find((l) => l.number === 1).status === 'open', 'level 1 stays open (not completed) at 70%');
  check(d1.levels.find((l) => l.number === 2).status === 'open', 'level 2 is open');

  // ── Private level 4 via invite ────────────────────────────────────────────
  const a = await user('مشرف اختبار', { role: 'admin' });
  const { data: token, error: ie } = await a.c.rpc('admin_create_invite', { p_level_number: 4, p_note: 'اختبار' });
  check(!ie && !!token, 'admin creates an invite link');
  const inv = await user('مدعو اختبار');
  const { data: red } = await inv.c.rpc('redeem_invite', { p_token: token });
  check(red?.status === 'pending', 'invited student request is pending');
  check(((await inv.c.from('tracks').select('id, levels!inner(number)').eq('levels.number', 4)).data ?? []).length === 0, 'pending: level 4 still invisible');
  const bad = await inv.c.rpc('redeem_invite', { p_token: 'nope' });
  check(bad.error?.message === 'invalid_invite', 'wrong invite token is rejected');
  const { data: l4 } = await admin.from('levels').select('id').eq('number', 4).single();
  const dec = await a.c.rpc('decide_private_access', { p_user: inv.id, p_level_id: l4.id, p_approve: true });
  check(!dec.error, 'admin approves the invited student');
  const { data: t4 } = await inv.c.from('tracks').select('id, level_id').eq('level_id', l4.id);
  check(t4.length > 0, `approved: level 4 tracks visible (${t4.length})`);
  const { data: d4 } = await inv.c.rpc('my_dashboard');
  check(d4.levels.some((l) => l.number === 4 && l.status === 'open'), 'approved: level 4 open on the dashboard');
  const { data: i4 } = await admin.rpc('level_items_ordered', { p_level_id: l4.id });
  check(!(await inv.c.rpc('complete_item', { p_item_id: i4[0].item_id })).error, 'approved student can mark a level-4 lesson');
  check(!!(await s.c.rpc('complete_item', { p_item_id: i4[0].item_id })).error, 'other students cannot touch level 4');

  // ── Leaderboard ───────────────────────────────────────────────────────────
  const { data: lb } = await s.c.rpc('leaderboard', { p_limit: 20 });
  check(lb?.[0]?.first_name === 'أحمد', `leaderboard shows first names (${lb?.[0]?.first_name}: ${lb?.[0]?.points})`);
  check(lb.every((r) => !r.first_name.includes(' ')), 'only the first name is exposed');

  // ── Exams ─────────────────────────────────────────────────────────────────
  const { data: sec } = await admin.from('sections').select('id, title').eq('title', 'حقيبة مفاتيح الطلب').single();
  const { data: ex } = await a.c.from('exams').insert({ section_id: sec.id, title: 'امتحان اختبار' }).select('id').single();
  examId = ex.id;
  await a.c.from('exam_questions').insert([
    { exam_id: ex.id, body: 'س1', options: ['أ', 'ب', 'ج'], correct: 1, sort: 0 },
    { exam_id: ex.id, body: 'س2', options: ['أ', 'ب'], correct: 0, sort: 1 },
  ]);
  const peek = await s.c.from('exam_questions').select('correct').eq('exam_id', ex.id);
  check((peek.data ?? []).length === 0, 'students cannot read the answer key');
  const { data: exam } = await s.c.rpc('get_exam', { p_exam_id: ex.id });
  check(exam?.questions?.length === 2 && !('correct' in exam.questions[0]), 'student gets the questions without answers');
  const { data: res } = await s.c.rpc('submit_exam', { p_exam_id: ex.id, p_answers: [1, 1] });
  check(res?.score === 1 && res?.total === 2, `graded on the server (${res?.score}/${res?.total})`);
  const notYet = await inv.c.rpc('get_exam', { p_exam_id: ex.id });
  check(notYet.error?.message === 'section_incomplete', 'exam opens only after the series is finished');
} catch (e) {
  failures++;
  console.error('ERROR', e.message ?? e);
} finally {
  if (examId) await admin.from('exams').delete().eq('id', examId);
  for (const id of users) await admin.auth.admin.deleteUser(id);
  await admin.from('invite_links').delete().eq('note', 'اختبار');
  await admin.rpc('refresh_admin_stats').then(() => {}, () => {});
  console.log(`cleanup: ${users.length} accounts, test exam and invite removed`);
}
console.log(failures ? `${failures} failed` : 'all checks passed');
process.exit(failures ? 1 : 0);
