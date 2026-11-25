'use client';

import Link from 'next/link';
import { useState } from 'react';
import { TEMPLATES, fillTemplate, waMessageLink } from '@/lib/messages';

export interface Recipient { id: string; name: string; phone: string | null; days: number; lesson: string | null; level: number }

export default function BulkMessages({ recipients }: { recipients: Recipient[] }) {
  const [text, setText] = useState<string>(TEMPLATES[0].text);
  const [sent, setSent] = useState<Set<string>>(new Set());
  const [minDays, setMinDays] = useState(7);
  const list = recipients.filter((r) => r.days >= minDays);

  if (recipients.length === 0) return <p className="empty">لا يوجد طلبة متوقفون الآن — الحمد لله.</p>;

  return (
    <>
      <section className="panel">
        <h2 className="panel__title">نص الرسالة</h2>
        <p className="panel__hint">استخدم {'{الاسم}'} و{'{الدرس}'} و{'{الأيام}'} و{'{المستوى}'} لتُستبدل لكل طالب.</p>
        <div className="wa-composer__templates">
          {TEMPLATES.map((t) => (
            <button key={t.key} type="button" className={`chip ${text === t.text ? 'chip--on' : ''}`} onClick={() => setText(t.text)}>{t.label}</button>
          ))}
        </div>
        <textarea className="wa-bulk__text" value={text} onChange={(e) => setText(e.target.value)} rows={4} />
        <div className="toolbar" style={{ marginTop: '0.8rem' }}>
          <label>
            المتوقفون منذ
            <select value={minDays} onChange={(e) => setMinDays(Number(e.target.value))}>
              <option value={7}>7 أيام فأكثر</option>
              <option value={14}>14 يومًا فأكثر</option>
              <option value={30}>30 يومًا فأكثر</option>
            </select>
          </label>
          <span className="muted">{list.length} طالب · أُرسل لـ {list.filter((r) => sent.has(r.id)).length}</span>
        </div>
      </section>

      <ul className="wa-list">
        {list.map((r) => {
          const msg = fillTemplate(text, { name: r.name, lesson: r.lesson, days: r.days, level: r.level });
          const done = sent.has(r.id);
          return (
            <li key={r.id} className={`wa-list__row ${done ? 'wa-list__row--sent' : ''}`}>
              <div>
                <Link href={`/admin/students/${r.id}`} className="wa-list__name">{r.name}</Link>
                <span className="idle" style={{ marginInlineStart: 8 }}>{r.days} يوم</span>
                <p className="wa-list__preview">{msg}</p>
              </div>
              {r.phone ? (
                <a
                  className={`btn btn--sm ${done ? 'btn--ghost' : 'wa-btn'}`}
                  href={waMessageLink(r.phone, msg)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setSent((s) => new Set(s).add(r.id))}
                >
                  {done ? 'أُرسلت ✓' : 'إرسال'}
                </a>
              ) : (
                <span className="badge badge--gold">بلا رقم</span>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
}
