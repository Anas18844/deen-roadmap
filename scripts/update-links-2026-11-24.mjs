// One-off: updated Drive links from Anas (2026-11-24). Every update must hit exactly one row.
// Usage: node --env-file=.env.local scripts/update-links-2026-11-24.mjs [--dry]
import { createClient } from '@supabase/supabase-js';

const dry = process.argv.includes('--dry');
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, { auth: { persistSession: false } });
const d = (id) => `https://drive.google.com/file/d/${id}/view?usp=drive_link`;

const { data: levels, error } = await db
  .from('levels')
  .select('id, number, tracks(id, title, sections(id, title, parent_id, items(id, title, kind)))');
if (error) throw error;

let changed = 0;
const problems = [];
const level = (n) => levels.find((l) => l.number === n);
const track = (n, t) => level(n)?.tracks.find((x) => x.title === t);
const section = (n, t, s) => track(n, t)?.sections.find((x) => x.title === s && !x.parent_id);
const book = (n, t, s, b) => section(n, t, s)?.items.find((x) => x.title === b && x.kind === 'book');

async function set(table, row, values, label) {
  if (!row) return problems.push(`not found: ${label}`);
  if (dry) return console.log(`would update ${label}`);
  const { error: e, count } = await db.from(table).update(values, { count: 'exact' }).eq('id', row.id);
  if (e || count !== 1) return problems.push(`${label}: ${e?.message ?? `${count} rows`}`);
  changed++;
  console.log(`ok  ${label}`);
}

// Site-wide voices
for (const [key, id] of [['map', '1hpf-Gu7qvpykED8BLmancFUh840n1y-Z'], ['howto', '1tlSaOmygg2seXNGkkQxNRaF0YBGskuDd']]) {
  if (dry) { console.log(`would update site voice ${key}`); continue; }
  const { error: e, count } = await db.from('site_audio').update({ url: d(id) }, { count: 'exact' }).eq('key', key);
  if (e || count !== 1) problems.push(`site voice ${key}`); else { changed++; console.log(`ok  site voice ${key}`); }
}

// Level 1
const L1T = 'سلاسل التزكية', L1L = 'تمهيد طلب العلم';
await set('sections', section(1, L1T, 'المرحلة الأولى — تأسيس وإصلاح'), { intro_audio_url: d('1i1Hsi-I-7xS_WYKhv0VppUl4hD-n5226') }, 'L1 تزكية: صوتية المرحلة الأولى');
await set('sections', section(1, L1T, 'المرحلة الثانية — بناء وترقّي'), { intro_audio_url: d('10j8dhn6TsCxEp783KFbIccy3yR8XgKr6') }, 'L1 تزكية: صوتية المرحلة الثانية');
await set('sections', section(1, L1L, 'حقيبة مفاتيح الطلب'), { intro_audio_url: d('1NyK6WkjbDYhUZja3t-lwSE2sch0UW1we') }, 'L1 صوتية مفاتيح الطلب');
await set('sections', section(1, L1L, 'سلسلة مهارات التعلم'), { intro_audio_url: d('1wEP6xBdhtA1PRmEOpvkS_1QjVtwyWjY9') }, 'L1 صوتية مهارات التعلم');
await set('sections', section(1, L1L, 'مداخل العلوم الشرعية'), { intro_audio_url: d('19dLI5m7f43hFlB6-Q4v8j1u1q3Slb8Nt') }, 'L1 صوتية مداخل العلوم');
await set('sections', section(1, L1L, 'كتاب معارج العلوم'), { intro_audio_url: d('13PFXmel4sfwBRq-grNDd_QcPAuRmoPZf') }, 'L1 صوتية معارج العلوم');
await set('items', book(1, L1L, 'كتاب معارج العلوم', 'كتاب معارج العلوم'), { url: d('1TL86TAPfi4R0BGEaQrhrbZHZoJdbN8iV') }, 'L1 كتاب معارج العلوم');

// Level 2
await set('levels', level(2), { intro_audio_url: d('1X23qFi2DrrNPUWH4xdLCD3eNubh3lgEl') }, 'L2 صوتية المستوى');
await set('tracks', track(2, 'التزكية — المرحلة الثالثة'), { intro_audio_url: d('1jQ04zYTQN2PkGweA9d3nsCbRYahYRmBB') }, 'L2 صوتية التزكية ٣');
await set('tracks', track(2, 'تمهيد العبادة'), { intro_audio_url: d('1LBYHL5SRPr39QhZM--MYKgxv7GOk8os-') }, 'L2 صوتية تمهيد العبادة');
for (const [t, id] of [['عتبات العبودية', '1F2TyEInvmuWtaOXQng3CG6DI2HFhYJRl'], ['العبودية', '1qtggtC6yAK6xFazKzo7LqFY0xZ7Ry37c'], ['حقيقة العبودية', '1t3G2VZ1hMInW4zjG7648H3UqJpn7AbnJ'], ['أنيس المتعبد', '1HM9T_VdsLSC0LdN5gEpv6G_pl5DRoei7']])
  await set('items', book(2, 'تمهيد العبادة', 'كتب تمهيد العبادة', t), { url: d(id) }, `L2 كتاب ${t}`);

// Level 3
const DAWAH = 'تمهيد الدعوة والإصلاح', TZ = 'تمهيد التزكية';
await set('levels', level(3), { intro_audio_url: d('1lCkoXlj-6bHgJUxLwpxM82Fmxw3LHVoq') }, 'L3 صوتية المستوى');
await set('tracks', track(3, DAWAH), { intro_audio_url: d('11R3bgLNkprvMgDY1l31AAMeZOLLPkCBk') }, 'L3 صوتية تمهيد الدعوة');
await set('items', book(3, DAWAH, 'تأسيس الوعي الدعوي', 'تأسيس الوعي الدعوي'), { url: d('1YDlNX3zgVgHvWo4q0RZA9EJs4GAizyZz') }, 'L3 كتاب تأسيس الوعي الدعوي');
await set('items', book(3, DAWAH, 'علم الدعوة إلى الله تعالى', 'علم الدعوة إلى الله تعالى'), { url: d('18bsVSepDctSy5iH2LcwmufkfbK9Ka0MV'), title: 'الدعوة إلى الله: دراسة تأصيلية' }, 'L3 كتاب الدعوة إلى الله دراسة تأصيلية');
await set('sections', section(3, DAWAH, 'علم الدعوة إلى الله تعالى'), { title: 'الدعوة إلى الله: دراسة تأصيلية' }, 'L3 اسم قسم الدعوة إلى الله');
await set('items', book(3, DAWAH, 'معالم في أصول الدعوة', 'معالم في أصول الدعوة'), { url: d('1uSwKn3YSLZ2HWkI3HoXMciPZDcWeTHd7') }, 'L3 كتاب معالم في أصول الدعوة');
await set('tracks', track(3, TZ), { intro_audio_url: d('1Ztj53uhBmrOzPNs9_AiqDafG3rI5s5UP') }, 'L3 صوتية تمهيد التزكية');
for (const [t, id] of [['مقدمات في التزكية', '14izCedCFuQbXhFeGQ5nWumW-nIvfCnwu'], ['تزكية العقل', '1AZbuKXbzAGubQx-vwSeFvaZeCzGJXKJb'], ['تزكية الجسد', '1T614BwDCEfWZ7GXC-E4f4P01wiYuXIYt'], ['تزكية القلب', '1pKZLLBltIjgwI9HdOM7nyz2wPMX-zrZs']])
  await set('items', book(3, TZ, 'مقدمات في التزكية', t), { url: d(id) }, `L3 كتاب ${t}`);
await set('items', book(3, TZ, 'تأسيس الوعي التربوي', 'تأسيس الوعي التربوي'), { url: d('1iivtyIU65bi6qQhctFN_nEwOZOwIPBTg') }, 'L3 كتاب تأسيس الوعي التربوي');
await set('items', book(3, TZ, 'دستور الملتزم الجديد', 'دستور الملتزم الجديد'), { url: d('1wXQAkufF0dTiqQ20UTVKdioWb0hr6d6e') }, 'L3 كتاب دستور الملتزم');
await set('items', book(3, TZ, 'تفريغ شرح الوصية الصغرى', 'تفريغ شرح الوصية الصغرى'), { url: d('1SPOffcUzy-S4Q9aTqHzacc7d88mbVvda'), title: 'جنة السالكين' }, 'L3 الكتاب الرابع ← جنة السالكين');
await set('sections', section(3, TZ, 'تفريغ شرح الوصية الصغرى'), { title: 'جنة السالكين' }, 'L3 اسم قسم الكتاب الرابع');
await set('items', book(3, TZ, 'الخلاصة في التربية', 'الخلاصة في التربية'), { url: d('1OR9aoMvdUKRIA7kosvZRFYk2_Mvf6QB4') }, 'L3 كتاب الخلاصة في التربية');

// Level 4
await set('levels', level(4), { intro_audio_url: d('1Bf619Hl1EJRZz2Yks_DUo5YE8YRa9VIE') }, 'L4 صوتية المستوى');
await set('tracks', track(4, 'الدروس'), { intro_audio_url: d('1PX-Qy0EeqEIKxNxn74kLWcwVCKxvxwuU') }, 'L4 صوتية خانة الدروس');
await set('tracks', track(4, 'قوائم التشغيل'), { intro_audio_url: d('1cjWmJeCd0GPv8P3PPFwTSXG2ZzUCcMp9') }, 'L4 صوتية خانة السلاسل');
await set('tracks', track(4, 'الكتب'), { intro_audio_url: d('1bNOFpEPygizbqEL20n7xFOFOuAFcYoha') }, 'L4 صوتية خانة الكتب');
const BK = 'الكتب';
await set('items', book(4, BK, 'مدخل لفهم الإسلام', 'مدخل لفهم الإسلام'), { url: d('1O3_rFsK06Me_j6RGlejIbIEBNXYD01gl') }, 'L4 كتاب مدخل لفهم الإسلام');
await set('items', book(4, BK, 'المختصر في خلق المسلم', 'المختصر في خلق المسلم'), { url: d('1o8pYXBDlmRATKQbw_xA8eKtGultpe20N') }, 'L4 كتاب مختصر أخلاق المسلم');
await set('items', book(4, BK, 'خلاصة مفاهيم أهل السنة والجماعة', 'خلاصة مفاهيم أهل السنة والجماعة'), { url: d('1WzFrOEDrI4NB4EfSp35HKltnJpL5jtwe') }, 'L4 كتاب مفاهيم أهل السنة');
await set('items', book(4, BK, 'شخصية المسلم', 'شخصية المسلم'), { url: d('1ijZSIZua6RNLpb-ALK__o90Q6MvtBmDq') }, 'L4 كتاب شخصية المسلم');
await set('items', book(4, BK, 'الأسئلة الأربعة', 'الأسئلة الأربعة — الجزء الأول'), { url: d('1NuLtDunNEcS0nokN6JIsULkE5mXED6qF') }, 'L4 الأسئلة الأربعة ج1');
await set('items', book(4, BK, 'الأسئلة الأربعة', 'الأسئلة الأربعة — الجزء الثاني'), { url: d('19o3vkbsB8kEOS5Su2wTeXyw9zubK4CqJ') }, 'L4 الأسئلة الأربعة ج2');

console.log(`\n${dry ? 'dry run' : `updated ${changed}`} · problems: ${problems.length}`);
problems.forEach((p) => console.log('  ! ' + p));
process.exit(problems.length ? 1 : 0);
