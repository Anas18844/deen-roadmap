'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deleteStudent } from '../../actions';

/** Two-step delete: the button asks for the student's name before removing everything. */
export default function DeleteStudent({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [armed, setArmed] = useState(false);
  const [typed, setTyped] = useState('');
  const [error, setError] = useState('');
  const [pending, start] = useTransition();

  if (!armed) return <button className="btn btn--danger btn--sm" onClick={() => setArmed(true)}>حذف الطالب</button>;
  return (
    <div className="alert" style={{ marginTop: '0.6rem' }}>
      سيُحذف الطالب وكل تقدّمه ومدوناته نهائيًا ولا يمكن استرجاعها. اكتب اسمه «{name}» للتأكيد:
      <div className="inline-form">
        <input value={typed} onChange={(e) => setTyped(e.target.value)} />
        <button
          className="btn btn--danger btn--sm"
          disabled={pending || typed.trim() !== name.trim()}
          onClick={() => start(async () => {
            const r = await deleteStudent(id);
            if (!r.ok) return setError(r.error);
            router.replace('/admin/students');
          })}
        >
          {pending ? '…' : 'حذف نهائي'}
        </button>
        <button className="btn btn--ghost btn--sm" onClick={() => setArmed(false)}>إلغاء</button>
        {error && <span className="badge badge--red">{error}</span>}
      </div>
    </div>
  );
}
