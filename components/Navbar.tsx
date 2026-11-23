import Link from 'next/link';
import { getProfile } from '@/lib/data';
import { signOut } from '@/app/actions';

export default async function Navbar() {
  const profile = await getProfile();
  if (!profile) return null;

  return (
    <nav className="navbar navbar--scrolled">
      <div className="navbar__inner container">
        <Link href="/" className="navbar__logo">
          <span className="navbar__logo-icon">خ</span>
          <span className="navbar__logo-text">خريطة الطريق</span>
        </Link>
        {(profile.onboarded_at || profile.role === 'admin') && (
          <ul className="navbar__links">
            {profile.onboarded_at && <li><Link href="/">الرئيسية</Link></li>}
            {profile.onboarded_at && <li><Link href="/me">رحلتي</Link></li>}
            {profile.role === 'admin' && <li><Link href="/admin">لوحة المتابعة</Link></li>}
          </ul>
        )}
        <form action={signOut}>
          <button className="nav-signout" type="submit">خروج</button>
        </form>
      </div>
    </nav>
  );
}
