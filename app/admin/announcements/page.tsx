import { createClient } from '@/lib/supabase/server';
import { fmtDate } from '@/lib/admin';
import ActionButton from '@/components/ActionButton';
import AnnouncementForm from './AnnouncementForm';
import { deleteAnnouncement, setAnnouncementActive } from '../actions';

export default async function AnnouncementsPage() {
  const supabase = await createClient();
  const { data } = await supabase.from('announcements').select('id, title, body, active, created_at').order('created_at', { ascending: false });
  const list = data ?? [];
  return (
    <div className="adm-stack">
      <header className="adm__head">
        <div>
          <h1 className="adm__title">الإعلانات</h1>
          <p className="adm__sub">الإعلانات الفعّالة تظهر لكل الطلبة أعلى صفحتهم الرئيسية، الأحدث أولًا.</p>
        </div>
      </header>

      <section className="panel">
        <h2 className="panel__title">إعلان جديد</h2>
        <AnnouncementForm />
      </section>

      <section className="panel">
        <h2 className="panel__title">كل الإعلانات ({list.length})</h2>
        {list.length === 0 && <p className="empty">لا توجد إعلانات بعد.</p>}
        <ul className="announce-list">
          {list.map((a) => (
            <li key={a.id} className={a.active ? '' : 'announce-list__off'}>
              <div>
                <strong>{a.title}</strong> {a.active ? <span className="badge">ظاهر للطلبة</span> : <span className="badge badge--gold">مخفي</span>}
                {a.body && <p className="announce-list__body">{a.body}</p>}
                <span className="muted" style={{ fontSize: '0.82rem' }}>{fmtDate(a.created_at)}</span>
              </div>
              <span className="row-actions">
                <ActionButton action={setAnnouncementActive.bind(null, a.id, !a.active)} className="btn btn--ghost btn--sm">
                  {a.active ? 'إخفاء' : 'إظهار'}
                </ActionButton>
                <ActionButton action={deleteAnnouncement.bind(null, a.id)} className="btn btn--danger btn--sm" confirm="حذف نهائي؟">حذف</ActionButton>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
