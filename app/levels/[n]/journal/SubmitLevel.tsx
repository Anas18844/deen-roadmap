'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { submitLevel } from '@/app/actions';
import Shield from '@/components/Shield';
import { levelName } from '@/lib/levels';

export default function SubmitLevel({ level }: { level: number }) {
  const [pending, start] = useTransition();
  const [done, setDone] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState('');

  return (
    <div className="submit-level">
      <h2 className="card__title">راجعت مدونتك؟</h2>
      <p>اقرأ ما كتبته في كل سلسلة بتأنٍّ واستحضر ما تعلّمته، ثم سلّم المستوى لتحصل على درعه وشهادته.</p>
      <label className="submit-level__check">
        <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} /> راجعت مدونتي كاملة
      </label>
      <button
        className="btn btn--gold"
        disabled={!confirmed || pending}
        onClick={() =>
          start(async () => {
            const r = await submitLevel(level);
            if (!r.ok) return setError(r.error);
            setDone(true);
          })
        }
      >
        {pending ? '…' : 'سلّم المستوى'}
      </button>
      {error && <p className="alert" style={{ marginTop: '0.6rem' }}>{error}</p>}

      {done && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal celebrate">
            <Shield level={level} state="earned" size={120} />
            <h2 className="celebrate__title">مبارك! أتممت {levelName(level)}</h2>
            <p>حصلت على درع المستوى. نسأل الله أن ينفعك بما تعلمت ويجعله حجة لك.</p>
            <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link className="btn btn--gold" href={`/certificates/${level}`}>شهادتك</Link>
              <Link className="btn" href="/">إلى الرئيسية</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
