import { createClient } from '@/lib/supabase/server';
import PageHeader from '@/components/PageHeader';

export default async function LeadersPage() {
  const supabase = await createClient();
  const { data } = await supabase.rpc('leaderboard', { p_limit: 30 });
  const rows = (data ?? []) as { rank: number; first_name: string; points: number; level: number }[];
  const medal = (r: number) => (r === 1 ? '🥇' : r === 2 ? '🥈' : r === 3 ? '🥉' : r);
  return (
    <main className="page">
      <PageHeader title="الأوائل" subtitle="أعلى الطلبة نقاطًا في الخريطة — بارك الله في الجميع" />
      <section className="section-block">
        <div className="container" style={{ maxWidth: 640 }}>
          {rows.length === 0 ? <p className="muted center">لم يبدأ أحد بعد — كن أول من يظهر هنا.</p> : (
            <ol className="leaders-list">
              {rows.map((r, i) => (
                <li key={i} className={r.rank <= 3 ? 'leaders-list__top' : ''}>
                  <span className="leaders-list__rank">{medal(Number(r.rank))}</span>
                  <span className="leaders-list__name">{r.first_name}</span>
                  <span className="leaders-list__lvl muted">المستوى {r.level}</span>
                  <span className="leaders-list__pts">{r.points} نقطة</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>
    </main>
  );
}
