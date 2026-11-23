import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, provider } from '../firebase';
import { useAuth } from '../context/AuthContext';
import './LoginButton.css';

export default function LoginButton() {
  const { user } = useAuth();

  const handleLogin = () => signInWithPopup(auth, provider);
  const handleLogout = () => signOut(auth);

  if (user) {
    return (
      <div className="login-btn__user">
        <img
          src={user.photoURL}
          alt={user.displayName}
          className="login-btn__avatar"
          referrerPolicy="no-referrer"
        />
        <button className="login-btn__logout" onClick={handleLogout}>
          خروج
        </button>
      </div>
    );
  }

  return (
    <button className="login-btn" onClick={handleLogin}>
      <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
        <path fill="#4285F4" d="M44.5 20H24v8.5h11.8C34.7 33.9 29.9 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.5 20-21 0-1.3-.2-2.7-.5-4z"/>
      </svg>
      الدخول بـ Google
    </button>
  );
}
