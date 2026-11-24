'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (password.length < 8) return setMsg({ ok: false, text: 'كلمة المرور 8 أحرف على الأقل.' });
    if (password !== confirm) return setMsg({ ok: false, text: 'كلمتا المرور غير متطابقتين.' });
    setBusy(true);
    const { data, error } = await createClient().auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/confirm?next=/onboarding` },
    });
    setBusy(false);
    if (error) {
      const text = /already registered/i.test(error.message)
        ? 'هذا البريد مسجّل بالفعل — سجّل الدخول.'
        : /rate limit/i.test(error.message)
          ? 'محاولات كثيرة، انتظر قليلًا ثم حاول مرة أخرى.'
          : 'تعذّر إنشاء الحساب، تأكد من البريد وحاول مرة أخرى.';
      return setMsg({ ok: false, text });
    }
    if (data.session) {
      router.replace('/onboarding');
      router.refresh();
    } else {
      setMsg({ ok: true, text: 'أرسلنا رسالة تأكيد إلى بريدك؛ افتحها لتفعيل الحساب ثم أكمل بياناتك.' });
    }
  }

  return (
    <div className="stack" style={{ textAlign: 'right' }}>
      <form className="form" onSubmit={submit}>
        <div className="field">
          <label htmlFor="email">البريد الإلكتروني</label>
          <input id="email" type="email" dir="ltr" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </div>
        <div className="field">
          <label htmlFor="password">كلمة المرور (8 أحرف على الأقل)</label>
          <input id="password" type="password" dir="ltr" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
        </div>
        <div className="field">
          <label htmlFor="confirm">تأكيد كلمة المرور</label>
          <input id="confirm" type="password" dir="ltr" required value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
        </div>
        {msg && <p className={msg.ok ? 'alert alert--ok' : 'alert'}>{msg.text}</p>}
        <button className="btn" type="submit" disabled={busy}>{busy ? '…' : 'إنشاء الحساب'}</button>
      </form>
      <p className="center muted">عندك حساب بالفعل؟ <Link href="/login">سجّل الدخول</Link></p>
    </div>
  );
}
