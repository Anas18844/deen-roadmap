import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { fmtDate } from '@/lib/admin';
import ActionButton from '@/components/ActionButton';
import { decidePlacement } from '../actions';

export default async function PlacementsPage() {
  const supabase = await createClient();
  const { data: reqs } = await supabase
    .from('placement_requests')
    .select('id, requested_level, status, created_at, decided_at, profiles!placement_requests_user_id_fkey(id, full_name, email, governorate, age, previous_courses)')
    .order('created_at', { ascending: false })
    .limit(200);

  const pending = (reqs ?? []).filter((r) => r.status === 'pending');
  const decided = (reqs ?? []).filter((r) => r.status !== 'pending');
  type P = { id: string; full_name: string; email: string; governorate: string; age: number; previous_courses: string | null };

  return (
    <div className="stack">
      <h2 className="section-title">طلبات معلّقة ({pending.length})</h2>
      {pending.length === 0 && <p className="muted">لا توجد طلبات معلّقة.</p>}
      {pending.map((r) => {
        const p = r.profiles as unknown as P;
        return (
          <div key={r.id} className="card">
            <h3 className="card__title"><Link href={`/admin/students/${p.id}`}>{p.full_name}</Link></h3>
            <p>يطلب الانتقال إلى <strong>المستوى {r.requested_level}</strong> · {p.governorate} · {p.age} سنة · {fmtDate(r.created_at)}</p>
            <p className="muted">الدراسة السابقة: {p.previous_courses ?? 'لم يذكر'}</p>
            <div className="row-actions" style={{ marginTop: '0.6rem' }}>
              <ActionButton action={decidePlacement.bind(null, r.id, true)} className="btn btn--sm">موافقة</ActionButton>
              <ActionButton action={decidePlacement.bind(null, r.id, false)} className="btn btn--danger btn--sm" confirm="تأكيد الرفض؟">رفض</ActionButton>
            </div>
          </div>
        );
      })}

      <h2 className="section-title">قرارات سابقة</h2>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>الطالب</th><th>المستوى المطلوب</th><th>القرار</th><th>التاريخ</th></tr></thead>
          <tbody>
            {decided.map((r) => {
              const p = r.profiles as unknown as P;
              return (
                <tr key={r.id}>
                  <td><Link href={`/admin/students/${p.id}`}>{p.full_name}</Link></td>
                  <td>{r.requested_level}</td>
                  <td>{r.status === 'approved' ? <span className="badge">موافقة</span> : <span className="badge badge--red">رفض</span>}</td>
                  <td>{fmtDate(r.decided_at)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
