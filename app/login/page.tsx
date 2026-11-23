import LoginForm from './LoginForm';

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <div className="login-page">
      <div className="login-page__card">
        <div className="login-page__ornament" aria-hidden="true"><span>خ</span></div>
        <h1 className="login-page__title">خريطة الطريق</h1>
        <p className="login-page__verse">«وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا»</p>
        <p className="login-page__desc">منصة تعليمية لتأسيس طالب العلم الشرعي على منهج متدرج ومنظم.</p>
        {error && <p className="alert">تعذّر تسجيل الدخول، حاول مرة أخرى.</p>}
        <LoginForm />
        <p className="login-page__note">لا نجمع بياناتك إلا لأغراض تعليمية فقط</p>
      </div>
    </div>
  );
}
