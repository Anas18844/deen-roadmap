import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { INACTIVE_DAYS, fmtDate, getStats } from '@/lib/admin';
import ActionButton from '@/components/ActionButton';
import { refreshStats } from './actions';

export default async function AdminOverview() {
  const supabase = await createClient();
  const { students, levels, refreshedAt } = await getStats();
  const { count: pendingCount } = await supabase
    .from('placement_requests')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending');
  const weekAgo = new Date(Date.now() - 7 * 86400_000).toISOString();
  const { count: notesWeek } = await supabase.from('section_notes').select('user_id', { count: 'exact', head: true }).gte('updated_at', weekAgo);

  const inactive = students.filter((s) => (s.inactive_days ?? 0) >= INACTIVE_DAYS);
  const active7 = students.filter((s) => (s.inactive_days ?? 99) < 7).length;
  const maxCount = Math.max(1, ...levels.map((l) => l.students_count));

  return (
    <div className="stack">
      <div className="toolbar" style={{ justifyContent: 'space-between' }}>
        <span className="muted">آخر تحديث للأرقام: {fmtDate(refreshedAt)} — تتحدث تلقائيًا كل ساعة</span>
        <ActionButton action={refreshStats} className="btn btn--ghost btn--sm">تحديث الآن</ActionButton>
      </div>

      <div className="stats">
        <div className="stat"><span className="stat__value">{students.length}</span><span className="stat__label">إجمالي الطلبة</span></div>
        <div className="stat"><span className="stat__value">{active7}</span><span className="stat__label">نشطون آخر 7 أيام</span></div>
        <div className="stat"><span className="stat__value">{notesWeek ?? 0}</span><span className="stat__label">مدونات هذا الأسبوع</span></div>
        <Link href="/admin/placements" className={`stat ${pendingCount ? 'stat--alert' : ''}`} style={{ textDecoration: 'none' }}>
          <span className="stat__value">{pendingCount ?? 0}</span><span className="stat__label">طلبات مستوى معلّقة</span>
        </Link>
        <Link href="/admin/students?inactive=1" className={`stat ${inactive.length ? 'stat--alert' : ''}`} style={{ textDecoration: 'none' }}>
          <span className="stat__value">{inactive.length}</span><span className="stat__label">لم يعملوا منذ {INACTIVE_DAYS} يومًا أو أكثر</span>
        </Link>
      </div>

      {inactive.length > 0 && (
        <div className="alert">
          ⚠️ {inactive.length} طالب لم يسجّلوا أي نشاط منذ {INACTIVE_DAYS} يومًا أو أكثر:{' '}
          {inactive.slice(0, 6).map((s, i) => (
            <span key={s.user_id}>{i > 0 && '، '}<Link href={`/admin/students/${s.user_id}`}>{s.full_name}</Link> ({s.inactive_days} يوم)</span>
          ))}
          {inactive.length > 6 && <> … <Link href="/admin/students?inactive=1">عرض الكل</Link></>}
        </div>
      )}

      <div className="card">
        <h2 className="card__title">الطلبة في كل مستوى</h2>
        <div className="bars">
          {levels.map((l) => (
            <div key={l.level_number} className="bars__row">
              <span>{l.title}</span>
              <div className="bars__track"><div className="bars__fill" style={{ width: `${(100 * l.students_count) / maxCount}%` }} /></div>
              <strong>{l.students_count}</strong>
            </div>
          ))}
        </div>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr><th>المستوى</th><th>عدد الطلبة فيه</th><th>متوسط الإنجاز</th><th>أتمّوه بمجهودهم</th></tr>
          </thead>
          <tbody>
            {levels.map((l) => (
              <tr key={l.level_number}>
                <td>{l.title}</td><td>{l.students_count}</td><td>{l.avg_pct}%</td><td>{l.completed_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
