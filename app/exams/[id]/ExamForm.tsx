'use client';

import { useState, useTransition } from 'react';
import { submitExam } from '@/app/actions';

export default function ExamForm({ exam }: { exam: { id: string; questions: { id: string; body: string; options: string[] }[] } }) {
  const [answers, setAnswers] = useState<(number | null)[]>(exam.questions.map(() => null));
  const [result, setResult] = useState<{ score: number; total: number; correct: number[] } | null>(null);
  const [error, setError] = useState('');
  const [pending, start] = useTransition();
  const done = answers.every((a) => a !== null);

  return (
    <div className="stack">
      {exam.questions.map((q, i) => (
        <fieldset key={q.id} className="card exam-q">
          <legend className="exam-q__title">{i + 1}. {q.body}</legend>
          {q.options.map((o, j) => {
            const chosen = answers[i] === j;
            const state = result ? (result.correct[i] === j ? 'right' : chosen ? 'wrong' : '') : '';
            return (
              <label key={j} className={`exam-opt ${chosen ? 'exam-opt--on' : ''} ${state ? `exam-opt--${state}` : ''}`}>
                <input type="radio" name={q.id} checked={chosen} disabled={!!result}
                  onChange={() => setAnswers((a) => a.map((v, k) => (k === i ? j : v)))} />
                {o}
              </label>
            );
          })}
        </fieldset>
      ))}
      {error && <p className="alert">{error}</p>}
      {result ? (
        <div className="alert alert--ok">
          نتيجتك: <strong>{result.score} من {result.total}</strong>. الإجابات الصحيحة باللون الأخضر.
          <button className="btn btn--ghost btn--sm" style={{ marginInlineStart: '0.6rem' }}
            onClick={() => { setResult(null); setAnswers(exam.questions.map(() => null)); }}>إعادة المحاولة</button>
        </div>
      ) : (
        <button className="btn" disabled={!done || pending}
          onClick={() => start(async () => {
            const r = await submitExam(exam.id, answers as number[]);
            if (!r.ok) return setError(r.error);
            setResult(r.result);
          })}>
          {pending ? 'جارٍ التصحيح…' : done ? 'تسليم الامتحان' : `أجب عن كل الأسئلة (${answers.filter((a) => a !== null).length}/${answers.length})`}
        </button>
      )}
    </div>
  );
}
