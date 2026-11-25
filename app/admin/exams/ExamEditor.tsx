'use client';

import { useState, useTransition } from 'react';
import ActionButton from '@/components/ActionButton';
import { deleteExamRow, saveExam, saveQuestion } from '../actions';

export interface EQuestion { id: string; body: string; options: string[]; correct: number; sort: number }
export interface EExam { id: string; title: string; exam_questions: EQuestion[] }

type Result = { ok: true; message?: string } | { ok: false; error: string };

function Form({ action, children, submit }: { action: (f: FormData) => Promise<Result>; children: React.ReactNode; submit: string }) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  return (
    <form
      className="form"
      onSubmit={(e) => {
        e.preventDefault();
        const el = e.currentTarget;
        const fd = new FormData(el);
        start(async () => {
          const r = await action(fd);
          setMsg(r.ok ? { ok: true, text: r.message ?? 'تم الحفظ' } : { ok: false, text: r.error });
          if (r.ok && !fd.get('id')) el.reset();
        });
      }}
    >
      {children}
      <div className="row-actions">
        <button className="btn btn--sm" disabled={pending}>{pending ? '…' : submit}</button>
        {msg && <span className={msg.ok ? 'badge' : 'badge badge--red'}>{msg.text}</span>}
      </div>
    </form>
  );
}

function QuestionFields({ q }: { q?: EQuestion }) {
  return (
    <>
      {q && <input type="hidden" name="id" value={q.id} />}
      <div className="field"><label>السؤال</label><textarea name="body" rows={2} defaultValue={q?.body} required /></div>
      <div className="field">
        <label>الاختيارات — كل اختيار في سطر (من 2 إلى 6)</label>
        <textarea name="options" rows={4} defaultValue={q?.options.join('\n')} required />
      </div>
      <div className="field" style={{ maxWidth: 220 }}>
        <label>رقم الإجابة الصحيحة</label>
        <input name="correct" type="number" min={1} max={6} defaultValue={q ? q.correct + 1 : 1} required />
      </div>
    </>
  );
}

export default function ExamEditor({ sectionId, exam }: { sectionId: string; exam?: EExam }) {
  if (!exam) {
    return (
      <Form action={saveExam} submit="إنشاء امتحان لهذه السلسلة">
        <input type="hidden" name="section_id" value={sectionId} />
        <div className="field"><label>عنوان الامتحان</label><input name="title" required defaultValue="امتحان السلسلة" /></div>
      </Form>
    );
  }
  const qs = [...exam.exam_questions].sort((a, b) => a.sort - b.sort);
  return (
    <div className="stack">
      <Form action={saveExam} submit="حفظ العنوان">
        <input type="hidden" name="id" value={exam.id} />
        <div className="field"><label>عنوان الامتحان</label><input name="title" required defaultValue={exam.title} /></div>
      </Form>

      {qs.map((q, i) => (
        <details key={q.id} className="card">
          <summary><strong>{i + 1}.</strong> {q.body} <span className="muted">— الصحيحة: {q.options[q.correct]}</span></summary>
          <Form action={saveQuestion} submit="حفظ السؤال"><QuestionFields q={q} /></Form>
          <ActionButton action={deleteExamRow.bind(null, 'exam_questions', q.id)} className="btn btn--danger btn--sm" confirm="حذف السؤال؟">حذف السؤال</ActionButton>
        </details>
      ))}

      <div className="card card--beige">
        <h3 className="card__title">سؤال جديد</h3>
        <Form action={saveQuestion} submit="إضافة السؤال">
          <input type="hidden" name="exam_id" value={exam.id} />
          <QuestionFields />
        </Form>
      </div>

      <ActionButton action={deleteExamRow.bind(null, 'exams', exam.id)} className="btn btn--danger btn--sm" confirm="حذف الامتحان كله ونتائجه؟">حذف الامتحان</ActionButton>
    </div>
  );
}
