import { createClient } from '@/lib/supabase/server';
import ContentTree, { type CLevel } from './ContentTree';

export default async function ContentPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('levels')
    .select(
      'id, number, title, subtitle, is_published, tracks(id, title, description, accent, intro_audio_url, sort, is_published, sections(id, parent_id, title, description, intro_audio_url, sort, is_published, items(id, kind, title, url, duration_seconds, pages, points, points_is_manual, sort, is_published)))',
    )
    .order('number');

  const { count: missing } = await supabase
    .from('items')
    .select('id', { count: 'exact', head: true })
    .eq('kind', 'video')
    .is('duration_seconds', null);

  return <ContentTree levels={(data ?? []) as unknown as CLevel[]} missingDurations={missing ?? 0} />;
}
