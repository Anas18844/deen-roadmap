import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { fmtDate } from '@/lib/admin';

export default async function NotesPage() {
  const supabase = await createClient();
  const { data: notes } = await supabase
    .from('section_notes')
    .select('user_id, section_id, body, updated_at, profiles(full_name), sections(title, tracks(title, levels(number)))')
    .order('updated_at', { ascending: false })
    .limit(100);

  return (
    <div className="stack">
      <header className="adm__head"><div><h1 className="adm__title">مدونات الطلبة</h1><p className="adm__sub">ما كتبه الطلبة بعد إنهاء كل قسم، الأحدث أولًا.</p></div></header>
      
      {(notes ?? []).map((n) => {
        const who = n.profiles as unknown as { full_name: string };
        const sec = n.sections as unknown as { title: string; tracks: { title: string; levels: { number: number } } };
        return (
          <article key={`${n.user_id}-${n.section_id}`} className="note note--saved">
            <div className="note__title">
              <Link href={`/admin/students/${n.user_id}`}>{who.full_name}</Link> — المستوى {sec.tracks.levels.number} · {sec.title}
            </div>
            <p className="note__body">{n.body}</p>
            <p className="muted" style={{ fontSize: '0.85rem' }}>{fmtDate(n.updated_at)}</p>
          </article>
        );
      })}
    </div>
  );
}
