import { createClient } from '@/lib/supabase/server';
import { fmtDate } from '@/lib/admin';

interface SnapLevel { number: number; students: number; avg_pct: number; completed: number }
interface Snap { id: string; taken_at: string; data: { levels: SnapLevel[]; students: { points: number }[] } }

export default async function SnapshotsPage({ searchParams }: { searchParams: Promise<{ a?: string; b?: string }> }) {
  const { a, b } = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.from('progress_snapshots').select('id, taken_at, data').order('taken_at', { ascending: false }).limit(52);
  const snaps = (data ?? []) as Snap[];

  if (snaps.length === 0) {
    return <div className="adm-stack"><header className="adm__head"><div><h1 className="adm__title">السجل الأسبوعي</h1></div></header><p className="muted">لا يوجد سجل بعد. يُؤخذ سجل تلقائيًا كل جمعة، ويظهر هنا للمقارنة بين الأسابيع.</p></div>;
  }

  const newer = snaps.find((s) => s.id === a) ?? snaps[0];
  const older = snaps.find((s) => s.id === b) ?? snaps[1] ?? snaps[0];
  const total = (s: Snap) => s.data.students.length;
  const points = (s: Snap) => s.data.students.reduce((n, x) => n + x.points, 0);
  const diff = (x: number, y: number) => (x - y > 0 ? `+${x - y}` : `${x - y}`);

  return (
    <div className="stack">
      <header className="adm__head"><div><h1 className="adm__title">السجل الأسبوعي</h1><p className="adm__sub">صورة من الأرقام تُحفظ كل جمعة؛ قارن أي أسبوعين.</p></div></header>
      
      <form className="toolbar">
        <label>المقارنة بين
          <select name="a" defaultValue={newer.id}>{snaps.map((s) => <option key={s.id} value={s.id}>{fmtDate(s.taken_at)}</option>)}</select>
        </label>
        <label>و
          <select name="b" defaultValue={older.id}>{snaps.map((s) => <option key={s.id} value={s.id}>{fmtDate(s.taken_at)}</option>)}</select>
        </label>
        <button className="btn btn--sm">قارن</button>
      </form>

      <div className="stats">
        <div className="stat"><span className="stat__value">{total(newer)}</span><span className="stat__label">طالب ({diff(total(newer), total(older))})</span></div>
        <div className="stat"><span className="stat__value">{points(newer)}</span><span className="stat__label">مجموع النقاط ({diff(points(newer), points(older))})</span></div>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>المستوى</th><th>الطلبة فيه</th><th>التغير</th><th>متوسط الإنجاز</th><th>أتمّوه</th><th>التغير</th></tr></thead>
          <tbody>
            {newer.data.levels.map((l) => {
              const o = older.data.levels.find((x) => x.number === l.number) ?? { students: 0, completed: 0, avg_pct: 0 };
              return (
                <tr key={l.number}>
                  <td>{l.number}</td><td>{l.students}</td><td>{diff(l.students, o.students)}</td>
                  <td>{l.avg_pct}%</td><td>{l.completed}</td><td>{diff(l.completed, o.completed)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
