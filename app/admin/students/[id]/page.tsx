import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { fmtDate } from '@/lib/admin';
import ProgressBar from '@/components/ProgressBar';
import { waLink } from '@/lib/whatsapp';
import DeleteStudent from './DeleteStudent';
import AdminNotes from './AdminNotes';
import WhatsAppComposer from '@/components/admin/WhatsAppComposer';

export default async function StudentDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: p } = await supabase.from('profiles').select('*').eq('id', id).single();
  if (!p) notFound();

  const [{ data: levels }, { data: completions }, { data: levelDone }, { data: notes }, { data: days }, { data: requests }] = await Promise.all([
    supabase.from('levels').select('id, number, title, tracks(sections(items(id, is_published)))').order('number'),
    supabase.from('item_completions').select('item_id, points_awarded, completed_at').eq('user_id', id),
    supabase.from('level_completions').select('level_id, via, completed_at').eq('user_id', id),
    supabase.from('section_notes').select('section_id, body, updated_at, sections(title, tracks(title, levels(number)))').eq('user_id', id).order('updated_at', { ascending: false }),
    supabase.from('activity_days').select('day').eq('user_id', id).order('day', { ascending: false }).limit(60),
    supabase.from('placement_requests').select('requested_level, status, created_at, decided_at').eq('user_id', id).order('created_at', { ascending: false }),
  ]);
  const { data: adminNotes } = await supabase.from('student_admin_notes').select('id, body, created_at').eq('student_id', id).order('created_at', { ascending: false });
  const idleDays = p.last_active_at ? Math.floor((Date.now() - new Date(p.last_active_at).getTime()) / 86400000) : null;

  const done = new Set((completions ?? []).map((c) => c.item_id));
  const points = (completions ?? []).reduce((s, c) => s + c.points_awarded, 0);
  const doneByLevel = new Map((levelDone ?? []).map((l) => [l.level_id, l]));

  return (
    <div className="stack">
      <div className="card">
        <h2 className="card__title">{p.full_name}</h2>
        <p className="muted" dir="ltr" style={{ textAlign: 'right' }}>{p.email}</p>
        {p.whatsapp && (
          <p>
            <a className="btn btn--sm" href={waLink(p.whatsapp)} target="_blank" rel="noopener noreferrer">مراسلة على واتساب</a>{' '}
            <span dir="ltr">{p.whatsapp}</span>
          </p>
        )}
        <p>
          {p.governorate ?? '—'} · {p.age ?? '—'} سنة · {p.entry_type === 'returning' ? 'كان معنا من قبل' : 'طالب جديد'} · سجّل {fmtDate(p.onboarded_at)}
        </p>
        {p.previous_courses && <p className="muted">الدراسة السابقة: {p.previous_courses}</p>}
        <p>النقاط: <strong>{points}</strong> · أيام النشاط (آخر 60): <strong>{days?.length ?? 0}</strong> · آخر نشاط: {fmtDate(p.last_active_at)}</p>
        {p.role !== 'admin' && <DeleteStudent id={p.id} name={p.full_name ?? ''} />}
        {(requests ?? []).map((r, i) => (
          <p key={i} className="muted">طلب المستوى {r.requested_level}: {r.status === 'pending' ? 'معلّق' : r.status === 'approved' ? 'تمت الموافقة' : 'مرفوض'} ({fmtDate(r.created_at)})</p>
        ))}
      </div>

      {p.whatsapp && (
        <div className="card">
          <h2 className="card__title">رسالة واتساب</h2>
          <WhatsAppComposer phone={p.whatsapp} vars={{ name: p.full_name, days: idleDays, level: null }} defaultKey={idleDays != null && idleDays >= 7 ? 'idle' : 'free'} />
        </div>
      )}

      <AdminNotes studentId={p.id} notes={adminNotes ?? []} />

      <div className="card">
        <h2 className="card__title">التقدّم</h2>
        <div className="bars">
          {(levels ?? []).map((l) => {
            const ids = l.tracks.flatMap((t) => t.sections.flatMap((s) => s.items.filter((i) => i.is_published).map((i) => i.id)));
            const n = ids.filter((x) => done.has(x)).length;
            const lc = doneByLevel.get(l.id);
            return (
              <div key={l.id} className="bars__row">
                <span>{l.title} {lc && <span className={`badge ${lc.via === 'earned' ? 'badge--gold' : 'badge--blue'}`}>{lc.via === 'earned' ? 'أتمّه' : 'بالموافقة'}</span>}</span>
                <ProgressBar pct={ids.length ? (100 * n) / ids.length : 0} />
                <span>{n}/{ids.length}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="stack">
        <h2 className="section-title">المدونات ({notes?.length ?? 0})</h2>
        {(notes ?? []).map((n) => {
          const sec = n.sections as unknown as { title: string; tracks: { title: string; levels: { number: number } } };
          return (
            <article key={n.section_id} className="note note--saved">
              <div className="note__title">المستوى {sec.tracks.levels.number} · {sec.tracks.title} · {sec.title}</div>
              <p className="note__body">{n.body}</p>
              <p className="muted" style={{ fontSize: '0.85rem' }}>{fmtDate(n.updated_at)}</p>
            </article>
          );
        })}
      </div>
    </div>
  );
}
