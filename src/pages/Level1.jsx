import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { useFadeIn } from '../hooks/useFadeIn';
import './Level1.css';

export default function Level1() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const ref = useFadeIn();

  return (
    <div className="level1">
      <PageHeader
        title="المستوى الأول"
        subtitle="المستوى الأول يضم مسارين متوازيين: تمهيد طلب العلم الشرعي لبناء الأساس المعرفي، وسلاسل التزكية لإصلاح القلب وتهذيب النفس. كلاهما ضروري للسير في طريق الدين على بصيرة."
      />

      <section className="level1__tracks">
        <div className="container fade-in" ref={ref}>
          <div className="level1__grid">
            <Link to="/level-1/learning" className="track-card">
              <div className="track-card__icon track-card__icon--green">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
              </div>
              <h3 className="track-card__title">تمهيد طلب العلم</h3>
              <p className="track-card__desc">
                تأسيسك في طريق العلم الشرعي: من فهم حقيقة العلم وفضله، إلى بناء
                شخصيتك كطالب علم، مرورًا بمداخل العلوم الشرعية المختلفة.
              </p>
              <span className="track-card__btn">
                ابدأ
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </span>
            </Link>

            <Link to="/level-1/tazkiyah" className="track-card">
              <div className="track-card__icon track-card__icon--gold">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22c4-4 8-7.5 8-12a8 8 0 1 0-16 0c0 4.5 4 8 8 12z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <h3 className="track-card__title">سلاسل التزكية</h3>
              <p className="track-card__desc">
                رحلة إصلاح القلب وتهذيب النفس — من التوبة ومحاسبة النفس
                إلى الترقي في مقامات العبودية والتقرب إلى الله.
              </p>
              <span className="track-card__btn track-card__btn--gold">
                ابدأ
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
