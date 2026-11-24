import SignupForm from './SignupForm';

export default function SignupPage() {
  return (
    <div className="login-page">
      <div className="login-page__card">
        <div className="login-page__ornament" aria-hidden="true"><span>خ</span></div>
        <h1 className="login-page__title">حساب جديد</h1>
        <p className="login-page__desc">سجّل ببريدك وكلمة مرور تختارها، وبعدها نكمّل بياناتك ونبدأ الرحلة.</p>
        <SignupForm />
      </div>
    </div>
  );
}
