import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { fmtDate } from '@/lib/admin';
import ActionButton from '@/components/ActionButton';
import CopyLink from '@/components/admin/CopyLink';
import CreateInviteForm from './CreateInviteForm';
import { decidePrivate, toggleInvite } from '../actions';

export default async function InvitesPage() {
  const supabase = await createClient();
  const [{ data: levels }, { data: invites }, { data: requests }] = await Promise.all([
    supabase.from('levels').select('id, number, title').eq('is_private', true).order('number'),
    supabase.from('invite_links').select('id, token, note, active, created_at, levels(title)').order('created_at', { ascending: false }),
    supabase
      .from('private_access')
      .select('user_id, level_id, status, created_at, decided_at, levels(title), profiles!private_access_user_id_fkey(full_name, governorate, whatsapp, previous_courses)')
      .order('created_at', { ascending: false }),
  ]);
  const pending = (requests ?? []).filter((r) => r.status === 'pending');
  const decided = (requests ?? []).filter((r) => r.status !== 'pending');
  type P = { full_name: string; governorate: string; whatsapp: string | null; previous_courses: string | null };

  return (
    <div className="adm-stack">
      <header className="adm__head">
        <div>
          <h1 className="adm__title">الدعوات الخاصة</h1>
          <p className="adm__sub">
            المستويات الخاصة ({(levels ?? []).map((l) => l.title).join('، ') || '—'}) لا تظهر لأحد في الموقع. أرسل رابط الدعوة لمن تريد،
            وكل من يدخل منه يصلك طلبه هنا لتقبله أو ترفضه.
          </p>
        </div>
      </header>

      <section className="panel">
        <h2 className="panel__title">رابط دعوة جديد</h2>
        <CreateInviteForm levels={(levels ?? []).map((l) => ({ number: l.number, title: l.title }))} />
      </section>

      <section className="panel">
        <h2 className="panel__title">طلبات تنتظرك ({pending.length})</h2>
        {pending.length === 0 && <p className="empty">لا توجد طلبات جديدة.</p>}
        <ul className="people">
          {pending.map((r) => {
            const p = r.profiles as unknown as P;
            const lv = r.levels as unknown as { title: string };
            return (
              <li key={`${r.user_id}-${r.level_id}`}>
                <Link href={`/admin/students/${r.user_id}`}>{p.full_name}</Link>
                <span className="row-actions">
                  <ActionButton action={decidePrivate.bind(null, r.user_id, r.level_id, true)} className="btn btn--sm">قبول</ActionButton>
                  <ActionButton action={decidePrivate.bind(null, r.user_id, r.level_id, false)} className="btn btn--danger btn--sm" confirm="تأكيد الرفض؟">رفض</ActionButton>
                </span>
                <span className="people__meta">
                  يطلب {lv.title} · {p.governorate} · <span dir="ltr">{p.whatsapp ?? ''}</span> · {fmtDate(r.created_at)}
                  {p.previous_courses ? ` · درس سابقًا: ${p.previous_courses}` : ''}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="panel">
        <h2 className="panel__title">روابط الدعوة</h2>
        {(invites ?? []).length === 0 ? <p className="empty">لم تُنشئ روابط بعد.</p> : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>المستوى</th><th>ملاحظة</th><th>الرابط</th><th>الحالة</th><th>أُنشئ</th><th /></tr></thead>
              <tbody>
                {(invites ?? []).map((i) => (
                  <tr key={i.id}>
                    <td>{(i.levels as unknown as { title: string }).title}</td>
                    <td>{i.note ?? '—'}</td>
                    <td><CopyLink path={`/invite/${i.token}`} /></td>
                    <td>{i.active ? <span className="badge">فعّال</span> : <span className="badge badge--red">موقوف</span>}</td>
                    <td>{fmtDate(i.created_at)}</td>
                    <td>
                      <ActionButton action={toggleInvite.bind(null, i.id, !i.active)} className="btn btn--ghost btn--sm">
                        {i.active ? 'إيقاف' : 'تفعيل'}
                      </ActionButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {decided.length > 0 && (
        <section className="panel">
          <h2 className="panel__title">قرارات سابقة</h2>
          <ul className="people">
            {decided.map((r) => (
              <li key={`${r.user_id}-${r.level_id}`}>
                <Link href={`/admin/students/${r.user_id}`}>{(r.profiles as unknown as P).full_name}</Link>
                <span className={r.status === 'approved' ? 'badge' : 'badge badge--red'}>{r.status === 'approved' ? 'مقبول' : 'مرفوض'}</span>
                <span className="people__meta">{(r.levels as unknown as { title: string }).title} · {fmtDate(r.decided_at)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
