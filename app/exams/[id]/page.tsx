import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import PageHeader from '@/components/PageHeader';
import { toArabicError } from '@/lib/supabase/errors';
import ExamForm from './ExamForm';

export default async function ExamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('get_exam', { p_exam_id: id });
  if (error) {
    return (
      <main className="page">
        <PageHeader title="الامتحان" />
        <div className="container" style={{ paddingBlock: '2rem' }}>
          <p className="alert">{toArabicError(error)}</p>
          <p><Link href="/">العودة للرئيسية</Link></p>
        </div>
      </main>
    );
  }
  if (!data) notFound();
  const exam = data as { id: string; title: string; questions: { id: string; body: string; options: string[] }[]; best: { score: number; total: number } | null };
  return (
    <main className="page">
      <PageHeader title={exam.title} subtitle={exam.best ? `أفضل نتيجة لك: ${exam.best.score} من ${exam.best.total}` : `${exam.questions.length} سؤال — اختر إجابة لكل سؤال`} />
      <section className="section-block">
        <div className="container">
          {exam.questions.length === 0 ? <p className="muted">لم تُضف أسئلة لهذا الامتحان بعد.</p> : <ExamForm exam={exam} />}
        </div>
      </section>
    </main>
  );
}
