import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import LoginButton from './LoginButton';
import './Navbar.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const isHome = pathname === '/';
  const isLogin = pathname === '/login';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (isLogin) return null;

  const getLinks = () => {
    if (isHome) {
      return (
        <>
          <li><a href="#about">من نحن</a></li>
          <li><a href="#roadmap">الخريطة</a></li>
          <li><a href="#levels">المستويات</a></li>
        </>
      );
    }

    if (pathname === '/level-1') {
      return (
        <>
          <li><Link to="/">الرئيسية</Link></li>
          <li><Link to="/level-1/learning">طلب العلم</Link></li>
          <li><Link to="/level-1/tazkiyah">التزكية</Link></li>
        </>
      );
    }

    if (pathname === '/level-2') {
      return (
        <>
          <li><Link to="/">الرئيسية</Link></li>
          <li><Link to="/level-2/tazkiyah-3">التزكية ٣</Link></li>
          <li><Link to="/level-2/waay">الوعي</Link></li>
          <li><Link to="/level-2/ibadah">العبادة</Link></li>
        </>
      );
    }

    if (pathname.startsWith('/level-2')) {
      return (
        <>
          <li><Link to="/">الرئيسية</Link></li>
          <li><Link to="/level-2">المستوى الثاني</Link></li>
        </>
      );
    }

    if (pathname === '/level-3') {
      return (
        <>
          <li><Link to="/">الرئيسية</Link></li>
          <li><Link to="/level-3/tazkiyah">تمهيد التزكية</Link></li>
          <li><Link to="/level-3/dawah">الدعوة</Link></li>
        </>
      );
    }

    if (pathname.startsWith('/level-3')) {
      return (
        <>
          <li><Link to="/">الرئيسية</Link></li>
          <li><Link to="/level-3">المستوى الثالث</Link></li>
        </>
      );
    }

    if (pathname === '/level-4') {
      return (
        <>
          <li><Link to="/">الرئيسية</Link></li>
          <li><Link to="/level-4/lessons">الدروس</Link></li>
          <li><Link to="/level-4/playlists">قوائم التشغيل</Link></li>
          <li><Link to="/level-4/books">الكتب</Link></li>
        </>
      );
    }

    if (pathname.startsWith('/level-4')) {
      return (
        <>
          <li><Link to="/">الرئيسية</Link></li>
          <li><Link to="/level-4">المستوى الرابع</Link></li>
        </>
      );
    }

    return (
      <>
        <li><Link to="/">الرئيسية</Link></li>
        <li><Link to="/level-1">المستوى الأول</Link></li>
      </>
    );
  };

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__inner container">
        <Link to="/" className="navbar__logo">
          <span className="navbar__logo-icon">خ</span>
          <span className="navbar__logo-text">خريطة الطريق</span>
        </Link>
        <ul className="navbar__links">
          {getLinks()}
        </ul>
        <LoginButton />
      </div>
    </nav>
  );
}
