'use client';

import { useState, useTransition } from 'react';
import { requestPlacement } from '@/app/actions';

export default function PlacementRetry({ levels }: { levels: { number: number; title: string }[] }) {
  const [level, setLevel] = useState<number>(levels[0]?.number ?? 2);
  const [msg, setMsg] = useState('');
  const [pending, start] = useTransition();

  return (
    <div className="inline-form">
      <select value={level} onChange={(e) => setLevel(Number(e.target.value))}>
        {levels.map((l) => <option key={l.number} value={l.number}>{l.title}</option>)}
      </select>
      <button
        className="btn btn--sm"
        disabled={pending}
        onClick={() => start(async () => {
          const r = await requestPlacement(level);
          setMsg(r.ok ? 'تم إرسال الطلب.' : r.error ?? '');
        })}
      >
        إرسال طلب جديد
      </button>
      {msg && <span>{msg}</span>}
    </div>
  );
}
