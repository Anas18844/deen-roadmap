import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { fmtDate } from '@/lib/admin';
import ExamEditor, { type EExam } from './ExamEditor';

interface Sec { id: string; title: string; parent_id: string | null; sort: number }

export default async function ExamsPage({ searchParams }: { searchParams: Promise<{ section?: string }> }) {
  const { section } = await searchParams;
  const supabase = await createClient();
  const [{ data: levels }, { data: exams }] = await Promise.all([
    supabase.from('levels').select('number, title, tracks(id, title, sort, sections(id, title, parent_id, sort))').order('number'),
    supabase.from('exams').select('id, section_id, title, exam_questions(id, body, options, correct, sort), exam_attempts(id, score, total, created_at, user_id, profiles(full_name))'),
  ]);
  const bySection = new Map((exams ?? []).map((e) => [e.section_id, e]));
  const selected = section ? (exams ?? []).find((e) => e.section_id === section) : undefined;
  let selectedTitle = '';
  for (const l of levels ?? []) for (const t of l.tracks) for (const s of t.sections) if (s.id === section) selectedTitle = `${l.title} · ${t.title} · ${s.title}`;

  return (
    <div className="adm-stack">
      <header className="adm__head">
        <div>
          <h1 className="adm__title">الامتحانات</h1>
          <p className="adm__sub">امتحان اختيار من متعدد بعد كل سلسلة. يظهر للطالب بعد إنهاء دروسها، ويُصحَّح تلقائيًا.</p>
        </div>
      </header>

      {section && (
        <section className="panel">
          <h2 className="panel__title">{selectedTitle || 'السلسلة'}</h2>
          <ExamEditor sectionId={section} exam={selected as unknown as EExam | undefined} />
          {selected && (selected.exam_attempts ?? []).length > 0 && (
            <>
              <h3 className="panel__title" style={{ marginTop: '1.4rem' }}>نتائج الطلبة</h3>
              <div className="table-wrap">
                <table className="table">
                  <thead><tr><th>الطالب</th><th>الدرجة</th><th>التاريخ</th></tr></thead>
                  <tbody>
                    {[...selected.exam_attempts].sort((a, b) => b.created_at.localeCompare(a.created_at)).map((a) => (
                      <tr key={a.id}>
                        <td><Link href={`/admin/students/${a.user_id}`}>{(a.profiles as unknown as { full_name: string })?.full_name}</Link></td>
                        <td>{a.score} / {a.total}</td>
                        <td>{fmtDate(a.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
          <p style={{ marginTop: '1rem' }}><Link href="/admin/exams">← كل السلاسل</Link></p>
        </section>
      )}

      {(levels ?? []).map((l) => (
        <section key={l.number} className="panel">
          <h2 className="panel__title">{l.title}</h2>
          {[...l.tracks].sort((a, b) => a.sort - b.sort).map((t) => {
            const secs = t.sections as Sec[];
            const tops = secs.filter((s) => !s.parent_id).sort((a, b) => a.sort - b.sort);
            return (
              <div key={t.id} style={{ marginBottom: '1rem' }}>
                <h3 style={{ fontWeight: 700, margin: '0.4rem 0' }}>{t.title}</h3>
                <ul className="people">
                  {tops.flatMap((s) => [s, ...secs.filter((c) => c.parent_id === s.id).sort((a, b) => a.sort - b.sort)]).map((s) => {
                    const ex = bySection.get(s.id);
                    return (
                      <li key={s.id}>
                        <Link href={`/admin/exams?section=${s.id}`}>{s.parent_id ? '↳ ' : ''}{s.title}</Link>
                        {ex ? <span className="badge">{ex.exam_questions.length} سؤال · {ex.exam_attempts.length} محاولة</span>
                            : <span className="badge badge--gold">بلا امتحان</span>}
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </section>
      ))}
    </div>
  );
}
