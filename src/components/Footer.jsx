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
          <p className="footer__text">
            نسأل الله أن يجعل هذا العمل خالصًا لوجهه الكريم
          </p>
        </div>
      </div>
    </footer>
  );
}
