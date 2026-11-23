import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import PageHeader from '@/components/PageHeader';

export default async function JournalPage({ params }: { params: Promise<{ n: string }> }) {
  const n = Number((await params).n);
  const supabase = await createClient();
  const { data: level } = await supabase.from('levels').select('id, title').eq('number', n).single();
  if (!level) notFound();

  const { data: tracks } = await supabase
    .from('tracks')
    .select('id, title, sort, sections(id, title, sort, parent_id)')
    .eq('level_id', level.id)
    .order('sort');
  if (!tracks?.length) notFound();

  const sectionIds = tracks.flatMap((t) => t.sections.filter((s) => !s.parent_id).map((s) => s.id));
  const { data: notes } = await supabase.from('section_notes').select('section_id, body, updated_at').in('section_id', sectionIds);
  const bySection = new Map((notes ?? []).map((x) => [x.section_id, x]));
  const written = sectionIds.filter((id) => bySection.has(id)).length;

  return (
    <main className="page">
      <PageHeader title={`مدونة ${level.title}`} subtitle={`كتبت ${written} من ${sectionIds.length} خانة`} backTo={`/levels/${n}`} backLabel={level.title} />
      <section className="section-block">
        <div className="container stack">
          {tracks.map((t) => (
            <div key={t.id} className="stack">
              <h2 className="section-title">{t.title}</h2>
              {t.sections
                .filter((s) => !s.parent_id)
                .sort((a, b) => a.sort - b.sort)
                .map((s) => {
                  const note = bySection.get(s.id);
                  return (
                    <article key={s.id} className={`note ${note ? 'note--saved' : ''}`}>
                      <div className="note__title">{s.title}</div>
                      {note ? (
                        <p className="note__body">{note.body}</p>
                      ) : (
                        <p className="muted">
                          لم تُكتب بعد — تظهر خانتها بعد إنهاء دروس القسم.{' '}
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
        </div>
      </section>
    </main>
  );
}
