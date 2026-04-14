import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { useFadeIn } from '../hooks/useFadeIn';
import './Level3.css';

export default function Level3() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const ref = useFadeIn();

  return (
    <div className="level3">
      <PageHeader
        title="المستوى الثالث"
        subtitle="المستوى الثالث يضم مسارَين: تمهيد التزكية لبناء الأساس التربوي الداخلي، وتمهيد الدعوة والإصلاح لتأسيس الوعي الدعوي ومنهج المصلح."
        backTo="/"
        backLabel="الرئيسية"
      />

      <section className="level3__tracks">
        <div className="container fade-in" ref={ref}>
          <div className="level3__grid">

            {/* ── تمهيد التزكية ── */}
            <Link to="/level-3/tazkiyah" className="track-card track-card--tazkiyah">
              <div className="track-card__icon track-card__icon--gold">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22c4-4 8-7.5 8-12a8 8 0 1 0-16 0c0 4.5 4 8 8 12z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <h3 className="track-card__title">تمهيد التزكية</h3>
              <p className="track-card__desc">
                خمسة مراجع تؤسس البنية التربوية الداخلية — من مقدمات التزكية وتزكية العقل والجسد والقلب،
                إلى دستور الملتزم وأسس الوعي التربوي والوصية الصغرى والخلاصة في التربية.
              </p>
              <span className="track-card__btn track-card__btn--gold">
                ابدأ
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </span>
            </Link>

            {/* ── تمهيد الدعوة والإصلاح ── */}
            <Link to="/level-3/dawah" className="track-card track-card--dawah">
              <div className="track-card__icon track-card__icon--purple">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3 className="track-card__title">تمهيد الدعوة والإصلاح</h3>
              <p className="track-card__desc">
                بناء الوعي الدعوي ومنهج المصلح — ثلاثة كتب في أصول الدعوة،
                وسلسلة مركزيات الإصلاح، وبوصلة المصلح التي تضبط مسار العمل الإصلاحي.
              </p>
              <span className="track-card__btn track-card__btn--purple">
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
