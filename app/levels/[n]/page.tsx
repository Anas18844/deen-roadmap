import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import PageHeader from '@/components/PageHeader';
import ProgressBar from '@/components/ProgressBar';
import { getDashboard } from '@/lib/data';

export default async function LevelPage({ params }: { params: Promise<{ n: string }> }) {
  const n = Number((await params).n);
  if (!Number.isInteger(n)) notFound();
  const supabase = await createClient();

  const { data: level } = await supabase.from('levels').select('id, number, title, subtitle').eq('number', n).single();
  if (!level) notFound();

  const d = await getDashboard();
  const info = d.levels.find((l) => l.number === n);
  if (!info || info.status === 'locked') {
    return (
      <main className="page">
        <PageHeader title={level.title} subtitle={level.subtitle} />
        <div className="container" style={{ paddingBlock: '2rem' }}>
          <p className="alert alert--info">🔒 هذا المستوى مقفول. يُفتح بعد إتمام المستوى السابق بالكامل وكتابة مدونته.</p>
        </div>
      </main>
    );
  }

  const { data: tracks } = await supabase
    .from('tracks')
    .select('id, title, description, accent, sort, sections(id, items(id))')
    .eq('level_id', level.id)
    .order('sort');

  const itemIds = (tracks ?? []).flatMap((t) => t.sections.flatMap((s) => s.items.map((i) => i.id)));
  const { data: done } = itemIds.length
    ? await supabase.from('item_completions').select('item_id').in('item_id', itemIds)
    : { data: [] as { item_id: string }[] };
  const doneSet = new Set((done ?? []).map((r) => r.item_id));

  return (
    <main className="page">
      <PageHeader title={level.title} subtitle={level.subtitle}>
        <div style={{ maxWidth: 420, margin: '1rem auto 0' }}>
          <ProgressBar pct={info.pct ?? 0} />
          <p className="muted" style={{ marginTop: '0.4rem' }}>
            {info.status === 'completed' ? 'أتممت هذا المستوى ✓' : `أنجزت ${info.done} من ${info.total} (${info.pct ?? 0}%)`}
          </p>
        </div>
      </PageHeader>
      <section className="section-block">
        <div className="container">
          <div className="level1__grid">
            {(tracks ?? []).map((t) => {
              const ids = t.sections.flatMap((s) => s.items.map((i) => i.id));
              const doneCount = ids.filter((id) => doneSet.has(id)).length;
              const pct = ids.length ? Math.round((100 * doneCount) / ids.length) : 0;
              return (
                <Link key={t.id} href={`/levels/${n}/${t.id}`} className="track-card">
                  <div className={`track-card__icon track-card__icon--${t.accent === 'gold' ? 'gold' : 'green'}`}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                    </svg>
                  </div>
                  <h3 className="track-card__title">{t.title}</h3>
                  {t.description && <p className="track-card__desc">{t.description}</p>}
                  <div style={{ width: '100%' }}>
                    <ProgressBar pct={pct} />
                    <p className="muted" style={{ fontSize: '0.9rem', marginTop: '0.3rem' }}>{doneCount} من {ids.length}</p>
                  </div>
                  <span className={`track-card__btn ${t.accent === 'gold' ? 'track-card__btn--gold' : ''}`}>
                    {doneCount === 0 ? 'ابدأ' : doneCount === ids.length ? 'راجع' : 'تابع'}
                  </span>
                </Link>
              );
            })}
          </div>
          <p className="center" style={{ marginTop: '2rem' }}>
            <Link className="btn btn--ghost" href={`/levels/${n}/journal`}>مدونة هذا المستوى</Link>
            {info.status === 'completed' && info.via === 'earned' && (
              <Link className="btn btn--gold" href={`/certificates/${n}`} style={{ marginInlineStart: '0.6rem' }}>الشهادة</Link>
            )}
          </p>
        </div>
      </section>
    </main>
  );
}
