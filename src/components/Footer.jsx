import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__inner">
          <div className="footer__brand">
            <span className="footer__logo">خ</span>
            <span className="footer__name">خريطة الطريق</span>
          </div>
          <Link to="/level-4" className="footer__text footer__text--link">
            نسأل الله أن يجعل هذا العمل خالصًا لوجهه الكريم
          </Link>
        </div>
      </div>
    </footer>
  );
}
