'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) return setError('كلمة المرور 8 أحرف على الأقل.');
    setBusy(true);
    const { error } = await createClient().auth.updateUser({ password });
    setBusy(false);
    if (error) return setError('تعذّر تغيير كلمة المرور، اطلب رابطًا جديدًا.');
    router.replace('/');
  }

  return (
    <div className="login-page">
      <div className="login-page__card">
        <h1 className="login-page__title">كلمة مرور جديدة</h1>
        <form className="form" onSubmit={submit} style={{ textAlign: 'right' }}>
          <div className="field">
            <label htmlFor="pw">كلمة المرور الجديدة</label>
            <input id="pw" type="password" dir="ltr" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
          </div>
          {error && <p className="alert">{error}</p>}
          <button className="btn" disabled={busy}>حفظ</button>
        </form>
      </div>
    </div>
  );
}
