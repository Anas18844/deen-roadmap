import Link from 'next/link';
import { getDashboard, getProfile } from '@/lib/data';
import PageHeader from '@/components/PageHeader';
import ProgressBar from '@/components/ProgressBar';
import Shield from '@/components/Shield';

export default async function MePage() {
  const [d, profile] = await Promise.all([getDashboard(), getProfile()]);
  const open = d.levels.filter((l) => l.status !== 'locked');
  const totalDone = open.reduce((s, l) => s + (l.done ?? 0), 0);
  const maxWeek = Math.max(1, ...d.weekly_points.map((w) => w.points));

  return (
    <main className="page">
      <PageHeader title="رحلتي" subtitle={profile?.full_name ?? undefined} />
      <section className="section-block">
        <div className="container stack">
          <div className="stats">
            <div className="stat"><span className="stat__value">{d.total_points}</span><span className="stat__label">مجموع النقاط</span></div>
            <div className="stat"><span className="stat__value">{totalDone}</span><span className="stat__label">درس وكتاب أنهيته</span></div>
            <div className="stat"><span className="stat__value">{d.streak} 🔥</span><span className="stat__label">أيام متتالية الآن</span></div>
            <div className="stat"><span className="stat__value">{d.current_level}</span><span className="stat__label">المستوى الحالي</span></div>
          </div>

          <div className="card">
            <h2 className="card__title">الدروع</h2>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'end' }}>
              {d.levels.map((l) => (
                <div key={l.number} className="center" style={{ display: 'grid', justifyItems: 'center', gap: '0.3rem' }}>
                  <Shield level={l.number} size={60}
                    state={l.status === 'locked' ? 'locked' : l.via === 'earned' ? 'earned' : l.via === 'placement' ? 'placement' : 'open'} />
                  <span className="muted" style={{ fontSize: '0.85rem' }}>{l.title}</span>
                  {l.via === 'earned' && <Link href={`/certificates/${l.number}`} style={{ fontSize: '0.85rem' }}>الشهادة</Link>}
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h2 className="card__title">تقدّمك في كل مستوى</h2>
            <div className="bars">
              {d.levels.map((l) => (
                <div key={l.number} className="bars__row">
                  <span>{l.title}</span>
                  {l.status === 'locked' ? <span className="muted">🔒 مقفول</span> : <ProgressBar pct={l.pct ?? 0} />}
                  <span>{l.status === 'locked' ? '' : `${l.pct ?? 0}%`}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h2 className="card__title">نقاطك في الأسابيع الأخيرة</h2>
            {d.weekly_points.length === 0 ? (
              <p className="muted">لم تسجّل نقاطًا بعد — ابدأ بأول درس.</p>
            ) : (
              <div className="bars">
                {d.weekly_points.map((w) => (
                  <div key={w.week} className="bars__row">
                    <span className="muted">أسبوع {new Date(w.week).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })}</span>
                    <div className="bars__track"><div className="bars__fill" style={{ width: `${(100 * w.points) / maxWeek}%` }} /></div>
                    <span>{w.points}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <p className="center">
            {open.map((l) => (
              <Link key={l.number} className="btn btn--ghost btn--sm" href={`/levels/${l.number}/journal`} style={{ margin: '0.25rem' }}>
                مدونة {l.title}
              </Link>
            ))}
          </p>
        </div>
      </section>
    </main>
  );
}
