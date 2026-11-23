'use client';

import { useState, useTransition } from 'react';

type Result = { ok: true; message?: string } | { ok: false; error: string };

/** Button that runs a server action and shows its result next to it. */
export default function ActionButton({
  action,
  children,
  className = 'btn btn--sm',
  confirm,
}: {
  action: () => Promise<Result>;
  children: React.ReactNode;
  className?: string;
  confirm?: string;
}) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [armed, setArmed] = useState(false);

  function click() {
    if (confirm && !armed) {
      setArmed(true);
      return;
    }
    setArmed(false);
    start(async () => {
      const r = await action();
      setMsg(r.ok ? (r.message ? { ok: true, text: r.message } : null) : { ok: false, text: r.error });
    });
  }

  return (
    <span className="row-actions">
      <button type="button" className={className} disabled={pending} onClick={click}>
        {pending ? '…' : armed ? confirm : children}
      </button>
      {msg && <span className={msg.ok ? 'badge' : 'badge badge--red'}>{msg.text}</span>}
    </span>
  );
}
