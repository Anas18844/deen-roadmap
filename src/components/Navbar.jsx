import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import LoginButton from './LoginButton';
import './Navbar.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const isHome = pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
