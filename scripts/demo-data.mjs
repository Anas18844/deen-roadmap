// Temporary demo students on the live project, to review the admin dashboard with realistic shapes.
// node --env-file=.env.local scripts/demo-data.mjs create   |   node --env-file=.env.local scripts/demo-data.mjs delete
// Every account is tagged user_metadata.qa = true and removed by `delete`.
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';

const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL;
const admin = createClient(URL_, process.env.SUPABASE_SECRET_KEY, { auth: { persistSession: false } });
const mode = process.argv[2];

async function qaUsers() {
  const { data } = await admin.auth.admin.listUsers({ perPage: 1000 });
  return data.users.filter((u) => u.user_metadata?.qa);
}

if (mode === 'delete') {
  const users = await qaUsers();
  for (const u of users) await admin.auth.admin.deleteUser(u.id);
  await admin.rpc('refresh_admin_stats').then(() => {}, () => {});
  console.log(`deleted ${users.length} demo accounts`);
  process.exit(0);
}

const people = [
  ['عبد الرحمن سالم', 'القاهرة', 22, 60, 2], ['يوسف محمود', 'الجيزة', 19, 35, 0], ['عمر خالد', 'الإسكندرية', 27, 120, 1],
  ['أحمد فتحي', 'المنيا', 17, 15, 20], ['مصطفى علي', 'أسيوط', 31, 90, 0], ['إبراهيم حسن', 'الشرقية', 24, 8, 16],
  ['محمد عادل', 'القاهرة', 21, 45, 9], ['خالد سمير', 'سوهاج', 38, 25, 3], ['حمزة طارق', 'الدقهلية', 20, 200, 0],
  ['أنس جمال', 'الغربية', 16, 5, 30],
];
const day = 86400000;

for (const [i, [name, gov, age, nItems, idleDays]] of people.entries()) {
  const email = `qa-demo-${i}@example.com`;
  const { data: created } = await admin.auth.admin.createUser({ email, email_confirm: true, user_metadata: { full_name: name, qa: true } });
  const id = created.user.id;
  const { data: link } = await admin.auth.admin.generateLink({ type: 'magiclink', email });
  const jar = new Map();
  const c = createServerClient(URL_, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    cookies: { getAll: () => [...jar].map(([n, v]) => ({ name: n, value: v })), setAll: (l) => l.forEach(({ name: n, value: v }) => (v ? jar.set(n, v) : jar.delete(n))) },
  });
  await c.auth.verifyOtp({ type: 'magiclink', token_hash: link.properties.hashed_token });
  const returning = i % 4 === 3;
  await c.rpc('complete_onboarding', { p_full_name: name, p_governorate: gov, p_age: age, p_previous_courses: returning ? 'درست المستوى الأول' : '', p_entry_type: returning ? 'returning' : 'new', p_whatsapp: '01012345678', p_requested_level: returning ? 2 : null });

  // complete the first nItems lessons in study order
  const { data: dash } = await c.rpc('my_dashboard');
  let done = 0;
  while (done < nItems) {
    const { data: d } = await c.rpc('my_dashboard');
    if (!d.next) {
      if (d.pending_note) { await c.rpc('save_section_note', { p_section_id: d.pending_note.section_id, p_body: 'استفدت من هذا القسم أن العلم الشرعي طريق طويل يحتاج إلى صبر وإخلاص ومنهج متدرج، وأن على طالب العلم أن يلازم أهل العلم ويعمل بما تعلّم، وأن يحذر من العجلة والتشتت، وأن يجعل نيته لله وحده. '.repeat(2) }); continue; }
      break;
    }
    await c.rpc('complete_item', { p_item_id: d.next.item_id });
    done++;
  }

  // spread the work over past weeks and stop `idleDays` ago, at varied hours
  const span = Math.max(3, Math.min(40, Math.round(nItems / 4)));
  const { data: comps } = await admin.from('item_completions').select('item_id').eq('user_id', id);
  for (const [k, row] of comps.entries()) {
    const back = idleDays + Math.round(((comps.length - 1 - k) / Math.max(1, comps.length - 1)) * span);
    const hour = [6, 13, 20, 21, 22, 9, 16][(k + i) % 7];
    const at = new Date(Date.now() - back * day);
    at.setUTCHours(hour - 2, (k * 7) % 60);
    await admin.from('item_completions').update({ completed_at: at.toISOString() }).eq('user_id', id).eq('item_id', row.item_id);
  }
  await admin.from('activity_days').delete().eq('user_id', id);
  const days = new Set(comps.map((_, k) => idleDays + Math.round(((comps.length - 1 - k) / Math.max(1, comps.length - 1)) * span)));
  for (const b of days) {
    const d = new Date(Date.now() + 2 * 3600000 - b * day).toISOString().slice(0, 10);
    await admin.from('activity_days').insert({ user_id: id, day: d });
  }
  await admin.from('profiles').update({
    last_active_at: new Date(Date.now() - idleDays * day).toISOString(),
    onboarded_at: new Date(Date.now() - (idleDays + span + (i % 3) * 3) * day).toISOString(),
  }).eq('id', id);
  console.log(`${name}: ${comps.length} lessons, idle ${idleDays}d`);
}
await admin.rpc('refresh_admin_stats').then(() => {}, () => {});
console.log('done');
