'use client';

import { useState, useTransition } from 'react';
import { createInvite } from '../actions';

export default function CreateInviteForm({ levels }: { levels: { number: number; title: string }[] }) {
  const [pending, start] = useTransition();
  const [link, setLink] = useState('');
  const [error, setError] = useState('');

  if (levels.length === 0) return <p className="empty">لا يوجد مستوى خاص حاليًا.</p>;

  return (
    <form
      className="inline-form"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        start(async () => {
          const r = await createInvite(fd);
          if (!r.ok) return setError(r.error);
          setError('');
          const path = (r.message ?? '').split(': ')[1] ?? '';
          setLink(`${window.location.origin}${path}`);
        });
      }}
    >
      <select name="level" defaultValue={levels[0].number}>
        {levels.map((l) => <option key={l.number} value={l.number}>{l.title}</option>)}
      </select>
      <input name="note" placeholder="لمن هذا الرابط؟ (اختياري)" style={{ minWidth: 220 }} />
      <button className="btn btn--sm" disabled={pending}>{pending ? '…' : 'إنشاء رابط'}</button>
      {error && <span className="badge badge--red">{error}</span>}
      {link && (
        <span className="row-actions">
          <input readOnly value={link} dir="ltr" style={{ minWidth: 320 }} onFocus={(e) => e.target.select()} />
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => navigator.clipboard.writeText(link)}>نسخ</button>
        </span>
      )}
    </form>
  );
}
