import Link from 'next/link';
import { getDashboard, getProfile, levelName } from '@/lib/data';
import ProgressBar from '@/components/ProgressBar';
import Shield from '@/components/Shield';
import PlacementRetry from '@/components/PlacementRetry';

export default async function Home() {
  const [d, profile] = await Promise.all([getDashboard(), getProfile()]);
  const current = d.levels.find((l) => l.number === d.current_level);
  const firstName = (profile?.full_name ?? '').split(' ')[0];

  return (
    <main className="page">
      <div className="container stack" style={{ paddingBlock: '2rem' }}>
        <header>
          <h1 className="section-title" style={{ marginBottom: '0.2rem' }}>السلام عليكم{firstName ? `، ${firstName}` : ''}</h1>
          <p className="muted">أنت الآن في {levelName(d.current_level)}{current?.pct != null ? ` — أنجزت ${current.pct}%` : ''}</p>
        </header>

        {d.placement?.status === 'pending' && (
          <p className="alert alert--info">
            طلبك للانتقال إلى {levelName(d.placement.requested_level)} قيد المراجعة عند الأستاذ محمد. ابدأ من المستوى الأول حتى تتم الموافقة.
          </p>
        )}
        {d.placement?.status === 'rejected' && (
          <div className="alert">
            لم تتم الموافقة على طلب الانتقال إلى {levelName(d.placement.requested_level)}. يمكنك المتابعة من مستواك الحالي أو إرسال طلب جديد.
            <PlacementRetry levels={d.levels.filter((l) => l.number >= 2).map((l) => ({ number: l.number, title: l.title }))} />
          </div>
        )}

        {d.next ? (
          <section className="continue">
            <div>
              <div className="continue__kicker">كمّل من حيث وقفت · {d.next.section_title}</div>
              <div className="continue__title">{d.next.title}</div>
            </div>
            <Link className="btn" href={`/levels/${d.next.level}/${d.next.track_id}#item-${d.next.item_id}`}>تابع ←</Link>
          </section>
        ) : null}

        {d.pending_note && (
          <section className="continue continue--note">
            <div>
              <div className="continue__kicker">أنهيت دروس هذا القسم</div>
              <div className="continue__title">اكتب ما استفدته من: {d.pending_note.title}</div>
            </div>
            <Link className="btn" href={`/levels/${d.pending_note.level}/${d.pending_note.track_id}#note-${d.pending_note.section_id}`}>اكتب الآن ←</Link>
          </section>
        )}

        <section className="stats">
          <div className="stat"><span className="stat__value">{d.current_level}</span><span className="stat__label">المستوى الحالي</span></div>
          <div className="stat"><span className="stat__value">{d.total_points}</span><span className="stat__label">نقاطك</span></div>
          <div className="stat"><span className="stat__value">{d.streak} 🔥</span><span className="stat__label">أيام متتالية</span></div>
          <div className="stat"><span className="stat__value">{d.levels.filter((l) => l.via === 'earned').length}</span><span className="stat__label">دروع حصلت عليها</span></div>
        </section>

        <section>
          <h2 className="section-title">خريطة المستويات</h2>
          <div className="level-map">
            {d.levels.map((l) => {
              const state = l.status === 'locked' ? 'locked' : l.via === 'earned' ? 'earned' : l.via === 'placement' ? 'placement' : 'open';
              const body = (
                <>
                  <Shield level={l.number} state={state} />
                  <span className="level-tile__name">{l.title}</span>
                  {l.status === 'locked' ? (
                    <span className="muted">يُفتح بعد إتمام المستوى السابق</span>
                  ) : (
                    <>
                      <ProgressBar pct={l.pct ?? 0} label={l.title} />
                      <span className="muted">{l.done} من {l.total} · {l.pct ?? 0}%</span>
                    </>
                  )}
                </>
              );
              return l.status === 'locked' ? (
                <div key={l.number} className="level-tile level-tile--locked">{body}</div>
              ) : (
                <Link key={l.number} href={`/levels/${l.number}`} className="level-tile">{body}</Link>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
