'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type Mode = 'signin' | 'signup' | 'reset';

const AUTH_ERRORS: Record<string, string> = {
  'Invalid login credentials': 'البريد أو كلمة المرور غير صحيحة.',
  'User already registered': 'هذا البريد مسجّل بالفعل، سجّل الدخول.',
  'Email not confirmed': 'أكّد بريدك أولًا من الرسالة التي وصلتك.',
};

export default function LoginForm() {
  const router = useRouter();
  const supabase = createClient();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'error' | 'ok'; text: string } | null>(null);

  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  async function google() {
    setBusy(true);
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${origin}/auth/callback` } });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.replace('/');
        router.refresh();
      } else if (mode === 'signup') {
        if (password.length < 8) throw new Error('كلمة المرور 8 أحرف على الأقل.');
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${origin}/auth/confirm` },
        });
        if (error) throw error;
        if (data.session) {
          router.replace('/onboarding');
          router.refresh();
        } else {
          setMsg({ kind: 'ok', text: 'أرسلنا لك رسالة تأكيد على بريدك، افتحها لتفعيل الحساب.' });
        }
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${origin}/auth/confirm?next=/auth/reset`,
        });
        if (error) throw error;
        setMsg({ kind: 'ok', text: 'أرسلنا لك رابط تغيير كلمة المرور على بريدك.' });
      }
    } catch (err) {
      const text = err instanceof Error ? (AUTH_ERRORS[err.message] ?? err.message) : 'حدث خطأ، حاول مرة أخرى.';
      setMsg({ kind: 'error', text });
    } finally {
      setBusy(false);
    }
  }

  const switchTo = (m: Mode) => {
    setMode(m);
    setMsg(null);
  };

  return (
    <div className="stack" style={{ textAlign: 'right' }}>
      <button className="login-page__btn" onClick={google} disabled={busy} type="button">
        <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#4285F4" d="M44.5 20H24v8.5h11.8C34.7 33.9 29.9 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.5 20-21 0-1.3-.2-2.7-.5-4z" />
        </svg>
        الدخول بحساب Google
      </button>
      <p className="center muted">أو بالبريد الإلكتروني</p>
      <form className="form" onSubmit={submit}>
        <div className="field">
          <label htmlFor="email">البريد الإلكتروني</label>
          <input id="email" type="email" dir="ltr" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </div>
        {mode !== 'reset' && (
          <div className="field">
            <label htmlFor="password">كلمة المرور</label>
            <input
              id="password"
              type="password"
              dir="ltr"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            />
          </div>
        )}
        {msg && <p className={msg.kind === 'ok' ? 'alert alert--ok' : 'alert'}>{msg.text}</p>}
        <button className="btn" type="submit" disabled={busy}>
          {mode === 'signin' ? 'دخول' : mode === 'signup' ? 'إنشاء حساب' : 'إرسال رابط التغيير'}
        </button>
      </form>
      <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        {mode !== 'signin' && <button className="btn btn--ghost btn--sm" onClick={() => switchTo('signin')}>عندي حساب</button>}
        <Link className="btn btn--gold btn--sm" href="/signup">حساب جديد</Link>
        {mode !== 'reset' && <button className="btn btn--ghost btn--sm" onClick={() => switchTo('reset')}>نسيت كلمة المرور</button>}
      </div>
    </div>
  );
}
