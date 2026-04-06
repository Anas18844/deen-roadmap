import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import VoiceNote from '../components/VoiceNote';
import { useFadeIn } from '../hooks/useFadeIn';
import './Level2.css';

export default function Level2() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const ref = useFadeIn();

  return (
    <div className="level2">
      <PageHeader
        title="المستوى الثاني"
        subtitle="المستوى الثاني يضم ثلاثة مسارات: المرحلة الثالثة للتزكية بسلاسلها المتواصلة، وتمهيد الوعي الفكري لبناء العقل المسلم، وتمهيد العبادة لتعميق صلتك بالله."
        backTo="/"
        backLabel="الرئيسية"
      />

      <div className="container">
        <VoiceNote
          label="استمع قبل البداية في المستوى الثاني"
          url="https://drive.google.com/file/d/1v14mF5QjSCjoAFY-k7YrES3_2gO7YcNc/view?usp=drivesdk"
        />
      </div>

      <section className="level2__tracks">
        <div className="container fade-in" ref={ref}>
          <div className="level2__grid">

            {/* ── التزكية المرحلة الثالثة ── */}
            <Link to="/level-2/tazkiyah-3" className="track-card track-card--tazkiyah">
              <div className="track-card__icon track-card__icon--gold">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22c4-4 8-7.5 8-12a8 8 0 1 0-16 0c0 4.5 4 8 8 12z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <h3 className="track-card__title">التزكية — المرحلة الثالثة</h3>
              <p className="track-card__desc">
                المرحلة الثالثة والأعمق في تزكية النفس — تشمل السيرة النبوية كاملة،
                وأحداث نهاية العالم، والدار الآخرة. تُكمَل السلاسل واحدة تلو الأخرى.
              </p>
              <span className="track-card__btn track-card__btn--gold">
                ابدأ
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </span>
            </Link>

            {/* ── تمهيد الوعي ── */}
            <Link to="/level-2/waay" className="track-card track-card--waay">
              <div className="track-card__icon track-card__icon--blue">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <h3 className="track-card__title">تمهيد الوعي</h3>
              <p className="track-card__desc">
                بناء الوعي الفكري والنقدي لطالب العلم — فهم كيف تشكّل الأفكار الواقع،
                وكيف نتعامل مع التحديات الفكرية المعاصرة من منظور إسلامي.
              </p>
              <span className="track-card__btn track-card__btn--blue">
                ابدأ
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </span>
            </Link>

            {/* ── تمهيد العبادة ── */}
            <Link to="/level-2/ibadah" className="track-card track-card--ibadah">
              <div className="track-card__icon track-card__icon--green">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 3a3 3 0 0 0-3 3l-7 3.5a3 3 0 1 0 0 5L15 18a3 3 0 1 0 .9-2.1L9 12.9V11l6-3A3 3 0 1 0 18 3z" />
                </svg>
              </div>
              <h3 className="track-card__title">تمهيد العبادة</h3>
              <p className="track-card__desc">
                أربعة كتب تؤسسك في مفهوم العبودية الحقيقية وتعمّق صلتك بالله —
                من فهم حقيقة التعبد إلى السير في طريق المتعبدين.
              </p>
              <span className="track-card__btn track-card__btn--green">
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
