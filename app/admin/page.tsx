import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { fmtDate } from '@/lib/admin';
import ActionButton from '@/components/ActionButton';
import { ActivityChart, Delta, HBars, Heatmap, Road, type RoadStation } from '@/components/admin/charts';
import { refreshStats } from './actions';

interface Analytics {
  kpis: Record<string, number>;
  daily: { day: string; active: number; items: number }[];
  road: RoadStation[];
  stuck: { level: number; title: string; section_title: string; students: number }[];
  at_risk: { id: string; full_name: string; level: number; idle: number; last_item: string | null; next_item: string | null }[];
  heatmap: { dow: number; hour: number; n: number }[];
  governorates: { name: string; n: number }[];
  ages: { band: string; n: number }[];
  entry: { new: number; returning: number };
  leaders: Record<'points' | 'streak' | 'notes', { id: string; full_name: string; v: number }[]>;
  feed: { kind: 'level' | 'note' | 'placement' | 'joined'; id: string; full_name: string; detail: string; at: string }[];
}

const FEED: Record<Analytics['feed'][number]['kind'], { icon: string; text: (d: string) => string }> = {
  level: { icon: '🛡', text: (d) => `أتمّ ${d}` },
  note: { icon: '✍', text: (d) => `كتب مدونة «${d}»` },
  placement: { icon: '↥', text: (d) => `طلب الانتقال إلى ${d}` },
  joined: { icon: '＋', text: (d) => `انضم${d ? ` من ${d}` : ''}` },
};

const ago = (iso: string) => {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 60) return `منذ ${Math.max(1, m)} د`;
  if (m < 1440) return `منذ ${Math.round(m / 60)} س`;
  return `منذ ${Math.round(m / 1440)} يوم`;
};

export default async function AdminOverview({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  const days = Number((await searchParams).days) === 90 ? 90 : 30;
  const supabase = await createClient();
  const [{ data, error }, { data: refreshedAt }] = await Promise.all([
    supabase.rpc('admin_analytics', { p_days: days }),
    supabase.rpc('admin_stats_refreshed_at'),
  ]);
  if (error || !data) return <p className="alert">تعذّر تحميل الأرقام: {error?.message}</p>;
  const a = data as Analytics;
  const k = a.kpis;

  return (
    <div className="adm-stack">
      <header className="adm__head">
        <div>
          <h1 className="adm__title">أين وصل طلبة الخريطة؟</h1>
          <p className="adm__sub">{k.students} طالبًا مسجّلًا · مستوى الإنجاز محدّث {fmtDate(refreshedAt as string | null)}</p>
        </div>
        <ActionButton action={refreshStats} className="btn btn--ghost btn--sm">تحديث الأرقام الآن</ActionButton>
      </header>

      <section className="panel" aria-labelledby="road-t">
        <h2 id="road-t" className="panel__title">الطريق</h2>
        <p className="panel__hint">كل دائرة مستوى؛ امتلاؤها نسبة الطلبة الواقفين فيه الآن، وتحتها نسبة من عبروا للمستوى التالي.</p>
        <div style={{ ['--stops' as string]: a.road.length }}>
          <Road stations={a.road} total={k.students} />
        </div>
      </section>

      <section className="kpis" aria-label="مؤشرات الأسبوع">
        <div className="kpi"><span className="kpi__v">{k.active_7}</span><span className="kpi__l">نشطون هذا الأسبوع</span><Delta now={k.active_7} prev={k.active_prev7} /></div>
        <div className="kpi"><span className="kpi__v">{k.items_7}</span><span className="kpi__l">درسًا أُنجز</span><Delta now={k.items_7} prev={k.items_prev7} /></div>
        <div className="kpi"><span className="kpi__v">{k.notes_7}</span><span className="kpi__l">مدونة كُتبت</span><Delta now={k.notes_7} prev={k.notes_prev7} /></div>
        <div className="kpi"><span className="kpi__v">{k.new_7}</span><span className="kpi__l">انضموا هذا الأسبوع</span><Delta now={k.new_7} prev={k.new_prev7} /></div>
        <Link href="/admin/students?inactive=1" className={`kpi ${k.idle_14 ? 'kpi--alert' : ''}`}>
          <span className="kpi__v">{k.idle_14}</span><span className="kpi__l">متوقفون 14 يومًا فأكثر</span>
          <span className="delta delta--flat">و{k.idle_7} بين 7 و14 يومًا</span>
        </Link>
        <Link href="/admin/placements" className={`kpi ${k.pending_placements ? 'kpi--alert' : ''}`}>
          <span className="kpi__v">{k.pending_placements}</span><span className="kpi__l">طلبات مستوى تنتظرك</span>
        </Link>
      </section>

      <div className="grid-2">
        <section className="panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <h2 className="panel__title">النشاط اليومي</h2>
              <p className="panel__hint">{k.active_30} طالبًا ذاكروا خلال آخر 30 يومًا.</p>
            </div>
            <nav className="seg" aria-label="المدة">
              <a href="/admin?days=30" aria-current={days === 30}>30 يومًا</a>
              <a href="/admin?days=90" aria-current={days === 90}>90 يومًا</a>
            </nav>
          </div>
          <ActivityChart data={a.daily} />
        </section>

        <section className="panel">
          <h2 className="panel__title">يحتاجون متابعة</h2>
          <p className="panel__hint">لم يسجّلوا نشاطًا منذ 7 أيام أو أكثر.</p>
          {a.at_risk.length === 0 ? (
            <p className="empty">لا أحد متوقف الآن — الحمد لله.</p>
          ) : (
            <ul className="people">
              {a.at_risk.slice(0, 8).map((p) => (
                <li key={p.id}>
                  <Link href={`/admin/students/${p.id}`}>{p.full_name}</Link>
                  <span className={`idle ${p.idle < 14 ? 'idle--soft' : ''}`}>{p.idle} يوم</span>
                  <span className="people__meta">المستوى {p.level}{p.next_item ? ` · واقف عند «${p.next_item}»` : ''}</span>
                </li>
              ))}
            </ul>
          )}
          {a.at_risk.length > 8 && <Link href="/admin/students?inactive=1">عرض الكل ({a.at_risk.length})</Link>}
        </section>
      </div>

      <div className="grid-2">
        <section className="panel">
          <h2 className="panel__title">أين يتوقف الطلبة؟</h2>
          <p className="panel__hint">الدرس التالي لكل طالب متوقف منذ أسبوع — تكرار الدرس نفسه علامة على صعوبته أو طوله.</p>
          {a.stuck.length === 0 ? (
            <p className="empty">لا توجد نقاط توقف متكررة حتى الآن.</p>
          ) : (
            <ul className="stuck">
              {a.stuck.map((s, i) => (
                <li key={i}>
                  <span className="stuck__n">{s.students}</span>
                  <span>
                    <span className="stuck__t">{s.title}</span>
                    <span className="stuck__s">المستوى {s.level} · {s.section_title}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="panel">
          <h2 className="panel__title">متى يذاكرون؟</h2>
          <p className="panel__hint">الدروس المنجزة حسب اليوم والوقت (آخر 90 يومًا، بتوقيت القاهرة).</p>
          <Heatmap cells={a.heatmap} />
        </section>
      </div>

      <section className="panel">
        <h2 className="panel__title">المتميزون</h2>
        <div className="leaders">
          {([['points', 'أعلى النقاط', 'نقطة'], ['streak', 'أطول مواظبة الآن', 'يوم'], ['notes', 'أكثر المدونات', 'مدونة']] as const).map(([key, label, unit]) => (
            <div key={key}>
              <h3>{label}</h3>
              {a.leaders[key].length === 0 ? <p className="empty">—</p> : (
                <ol>
                  {a.leaders[key].map((p) => (
                    <li key={p.id}><Link href={`/admin/students/${p.id}`}>{p.full_name}</Link><b>{p.v}</b> {unit}</li>
                  ))}
                </ol>
              )}
            </div>
          ))}
        </div>
      </section>

      <div className="grid-3">
        <section className="panel">
          <h2 className="panel__title">المحافظات</h2>
          {a.governorates.length ? <HBars rows={a.governorates.slice(0, 8).map((g) => ({ label: g.name, n: g.n }))} /> : <p className="empty">—</p>}
        </section>
        <section className="panel">
          <h2 className="panel__title">الأعمار</h2>
          {a.ages.length ? <HBars rows={a.ages.map((g) => ({ label: g.band, n: g.n }))} /> : <p className="empty">—</p>}
          <p className="panel__hint" style={{ marginTop: '0.8rem' }}>جدد: {a.entry.new} · كانوا معنا من قبل: {a.entry.returning}</p>
        </section>
        <section className="panel">
          <h2 className="panel__title">آخر ما حدث</h2>
          {a.feed.length === 0 ? <p className="empty">لا أحداث بعد.</p> : (
            <ul className="feed">
              {a.feed.slice(0, 10).map((e, i) => (
                <li key={i}>
                  <span className="feed__icon" aria-hidden="true">{FEED[e.kind].icon}</span>
                  <span><Link href={`/admin/students/${e.id}`}>{e.full_name}</Link> {FEED[e.kind].text(e.detail)}</span>
                  <span className="feed__when">{ago(e.at)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
