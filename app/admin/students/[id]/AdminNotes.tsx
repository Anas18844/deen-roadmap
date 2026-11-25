'use client';

import { useState, useTransition } from 'react';
import { addAdminNote, deleteAdminNote } from '../../actions';

interface Note { id: string; body: string; created_at: string }

/** Mohamed's private notes about a student — never shown to the student. */
export default function AdminNotes({ studentId, notes }: { studentId: string; notes: Note[] }) {
  const [body, setBody] = useState('');
  const [list, setList] = useState(notes);
  const [pending, start] = useTransition();
  const [error, setError] = useState('');
  const fmt = (d: string) => new Date(d).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Africa/Cairo' });

  return (
    <div className="card">
      <h2 className="card__title">ملاحظاتك الخاصة 🔒</h2>
      <p className="muted" style={{ marginBottom: '0.6rem' }}>لا يراها الطالب. مثلًا: «كلمته يوم كذا»، «يحتاج متابعة في التزكية».</p>
      <div className="inline-form">
        <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={2} style={{ flex: 1, minWidth: 240 }} placeholder="اكتب ملاحظة…" />
        <button
          className="btn btn--sm"
          disabled={pending || !body.trim()}
          onClick={() =>
            start(async () => {
              const r = await addAdminNote(studentId, body);
              if (!r.ok) return setError(r.error);
              setList((l) => [{ id: crypto.randomUUID(), body: body.trim(), created_at: new Date().toISOString() }, ...l]);
              setBody('');
              setError('');
            })
          }
        >
          {pending ? '…' : 'حفظ'}
        </button>
      </div>
      {error && <p className="alert">{error}</p>}
      <ul className="admin-notes">
        {list.map((n) => (
          <li key={n.id}>
            <p>{n.body}</p>
            <span className="muted">{fmt(n.created_at)}</span>
            <button
              className="btn btn--ghost btn--sm"
              onClick={() => start(async () => {
                const r = await deleteAdminNote(n.id);
                if (r.ok) setList((l) => l.filter((x) => x.id !== n.id));
              })}
            >
              حذف
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
