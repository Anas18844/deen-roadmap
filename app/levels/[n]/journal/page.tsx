import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import PageHeader from '@/components/PageHeader';
import SubmitLevel from './SubmitLevel';
import { getDashboard } from '@/lib/data';

export default async function JournalPage({ params }: { params: Promise<{ n: string }> }) {
  const n = Number((await params).n);
  const supabase = await createClient();
  const { data: level } = await supabase.from('levels').select('id, title').eq('number', n).single();
  if (!level) notFound();

  const { data: tracks } = await supabase
    .from('tracks')
    .select('id, title, sort, sections(id, title, sort, parent_id, items(id))')
    .eq('level_id', level.id)
    .order('sort');
  if (!tracks?.length) notFound();

  const seriesOf = (t: (typeof tracks)[number]) => {
    const tops = t.sections.filter((s) => !s.parent_id).sort((a, b) => a.sort - b.sort);
    return tops.flatMap((top) => [top, ...t.sections.filter((c) => c.parent_id === top.id).sort((a, b) => a.sort - b.sort)])
      .filter((s) => s.items.length > 0)
      .map((s) => ({ ...s, label: s.parent_id ? `${t.sections.find((x) => x.id === s.parent_id)?.title} — ${s.title}` : s.title }));
  };
  const sectionIds = tracks.flatMap((t) => seriesOf(t).map((s) => s.id));
  const { data: notes } = await supabase.from('section_notes').select('section_id, body, updated_at').in('section_id', sectionIds);
  const bySection = new Map((notes ?? []).map((x) => [x.section_id, x]));
  const written = sectionIds.filter((id) => bySection.has(id)).length;
  const dash = await getDashboard();
  const ready = dash.ready_level?.number === n;
  const completed = dash.levels.find((l) => l.number === n)?.via === 'earned';

  return (
    <main className="page">
      <PageHeader title={`مدونة ${level.title}`} subtitle={`كتبت ${written} من ${sectionIds.length} خانة`} backTo={`/levels/${n}`} backLabel={level.title} />
      <section className="section-block">
        <div className="container stack">
          {ready && (
            <p className="alert alert--ok">
              🎉 أنهيت كل دروس {level.title} وكتبت مدونته كاملة. راجعها من أولها لآخرها، ثم سلّم المستوى من أسفل الصفحة.
            </p>
          )}
          {completed && <p className="alert alert--ok">سلّمت هذا المستوى ✓ — هذه مدونتك للرجوع إليها.</p>}
          {tracks.map((t) => (
            <div key={t.id} className="stack">
              <h2 className="section-title">{t.title}</h2>
              {seriesOf(t).map((s) => {
                  const note = bySection.get(s.id);
                  return (
                    <article key={s.id} className={`note ${note ? 'note--saved' : ''}`}>
                      <div className="note__title">{s.label}</div>
                      {note ? (
                        <p className="note__body">{note.body}</p>
                      ) : (
                        <p className="muted">
                          لم تُكتب بعد — تظهر خانتها بعد إنهاء دروس السلسلة.{' '}
                          <Link href={`/levels/${n}/${t.id}#section-${s.id}`}>اذهب للقسم</Link>
                        </p>
                      )}
                      {note && (
                        <Link className="btn btn--ghost btn--sm" href={`/levels/${n}/${t.id}#note-${s.id}`} style={{ marginTop: '0.5rem' }}>تعديل</Link>
                      )}
                    </article>
                  );
                })}
            </div>
          ))}
          {ready && <SubmitLevel level={n} />}
        </div>
      </section>
    </main>
  );
}
