import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import PageHeader from '@/components/PageHeader';
import TrackView, { type ViewSection } from './TrackView';

export default async function TrackPage({ params }: { params: Promise<{ n: string; trackId: string }> }) {
  const { n, trackId } = await params;
  const level = Number(n);
  const supabase = await createClient();

  // RLS returns nothing for a locked level, so a locked track is a 404.
  const { data: track } = await supabase
    .from('tracks')
    .select('id, title, description, intro_audio_url, level_id, levels(number, title)')
    .eq('id', trackId)
    .single();
  if (!track) notFound();

  const { data: sections } = await supabase
    .from('sections')
    .select('id, parent_id, title, description, intro_audio_url, sort, items(id, kind, title, full_title, description, url, storage_path, duration_seconds, pages, points, sort, is_published)')
    .eq('track_id', trackId)
    .order('sort');

  const all = sections ?? [];
  const itemIds = all.flatMap((s) => s.items.map((i) => i.id));
  const [{ data: done }, { data: notes }, { data: closed }] = await Promise.all([
    itemIds.length ? supabase.from('item_completions').select('item_id').in('item_id', itemIds) : Promise.resolve({ data: [] }),
    supabase.from('section_notes').select('section_id, body').in('section_id', all.map((s) => s.id)),
    supabase.from('level_completions').select('via').eq('level_id', track.level_id),
  ]);

  const { data: exams } = await supabase.from('exams').select('id, section_id, title').in('section_id', all.map((x) => x.id));
  const { data: attempts } = (exams ?? []).length
    ? await supabase.from('exam_attempts').select('exam_id, score, total').in('exam_id', (exams ?? []).map((e) => e.id))
    : { data: [] as { exam_id: string; score: number; total: number }[] };
  const examsBySection = Object.fromEntries((exams ?? []).map((e) => {
    const mine = (attempts ?? []).filter((a) => a.exam_id === e.id).sort((a, b) => b.score - a.score)[0];
    return [e.section_id, { id: e.id, title: e.title, best: mine ? `${mine.score}/${mine.total}` : null }];
  }));

  const byOrder = <T extends { sort: number }>(a: T, b: T) => a.sort - b.sort;
  const view: ViewSection[] = all
    .filter((s) => !s.parent_id)
    .sort(byOrder)
    .map((s) => ({
      id: s.id,
      title: s.title,
      description: s.description,
      introAudioUrl: s.intro_audio_url,
      items: s.items.filter((i) => i.is_published).sort(byOrder),
      children: all
        .filter((c) => c.parent_id === s.id)
        .sort(byOrder)
        .map((c) => ({ id: c.id, title: c.title, items: c.items.filter((i) => i.is_published).sort(byOrder) })),
    }));

  const levelInfo = track.levels as unknown as { number: number; title: string };

  return (
    <main className="page">
      <PageHeader title={track.title} subtitle={track.description} backTo={`/levels/${level}`} backLabel={levelInfo?.title ?? 'المستوى'} />
      <TrackView
        level={level}
        sections={view}
        introAudioUrl={track.intro_audio_url}
        doneIds={(done ?? []).map((d) => d.item_id)}
        notes={Object.fromEntries((notes ?? []).map((x) => [x.section_id, x.body]))}
        levelClosed={(closed ?? []).some((c) => c.via === 'earned')}
        placed={(closed ?? []).some((c) => c.via === 'placement')}
        exams={examsBySection}
      />
    </main>
  );
}
