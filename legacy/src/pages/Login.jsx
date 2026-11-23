import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../firebase';
import { useAuth } from '../context/AuthContext';
import './Login.css';

export default function Login() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate('/', { replace: true });
  }, [user, loading, navigate]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
      navigate('/', { replace: true });
    } catch {
      // user closed popup — do nothing
    }
  };

  return (
    <div className="login-page">
      <div className="login-page__card">
        <div className="login-page__ornament" aria-hidden="true">
          <span>خ</span>
        </div>

        <h1 className="login-page__title">خريطة الطريق</h1>

        <p className="login-page__verse">
          «وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا»
        </p>

        <p className="login-page__desc">
          منصة تعليمية لتأسيس طالب العلم الشرعي على منهج متدرج ومنظم.
          <br />
          سجّل دخولك للبدء في رحلتك.
        </p>

        <button className="login-page__btn" onClick={handleLogin}>
          <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#4285F4" d="M44.5 20H24v8.5h11.8C34.7 33.9 29.9 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.5 20-21 0-1.3-.2-2.7-.5-4z" />
          </svg>
          تسجيل الدخول باستخدام Google
        </button>

        <p className="login-page__note">
          لا نجمع بياناتك إلا لأغراض تعليمية فقط
        </p>
      </div>
    </div>
  );
}
