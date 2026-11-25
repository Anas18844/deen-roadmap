'use client';

import { useRef, useState, useTransition } from 'react';
import { saveAnnouncement } from '../actions';

export default function AnnouncementForm() {
  const ref = useRef<HTMLFormElement>(null);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  return (
    <form
      ref={ref}
      className="form"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        start(async () => {
          const r = await saveAnnouncement(fd);
          setMsg(r.ok ? { ok: true, text: r.message ?? 'تم' } : { ok: false, text: r.error });
          if (r.ok) ref.current?.reset();
        });
      }}
    >
      <div className="field"><label>العنوان</label><input name="title" required placeholder="مثال: لقاء الجمعة الساعة 8 مساءً" /></div>
      <div className="field"><label>التفاصيل (اختياري)</label><textarea name="body" rows={3} /></div>
      <div className="row-actions">
        <button className="btn btn--sm" disabled={pending}>{pending ? '…' : 'نشر الإعلان'}</button>
        {msg && <span className={msg.ok ? 'badge' : 'badge badge--red'}>{msg.text}</span>}
      </div>
    </form>
  );
}
