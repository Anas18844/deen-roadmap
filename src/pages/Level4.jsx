import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { useFadeIn } from '../hooks/useFadeIn';
import VoiceNote from '../components/VoiceNote';
import './Level4.css';

export default function Level4() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const ref = useFadeIn();

  return (
    <div className="level4">
      <PageHeader
        title="المستوى الرابع"
        subtitle="التمهيد العام — ثلاثة مسارات تُكمل البناء: دروس تأسيسية في فهم الإسلام، وخمسة كتب مرجعية، وخمس قوائم تشغيل تُغطي الثقافة المتكاملة والإشكاليات الفكرية ومنهاج النبوة."
        backTo="/"
        backLabel="الرئيسية"
      />

      <div className="container">
        <VoiceNote
          label="استمع قبل البداية في المستوى الرابع"
          url="https://drive.google.com/file/d/1Emij4H6HRASvTE_EjuO4s95EIoJNw-0a/view?usp=drivesdk"
        />
      </div>

      <section className="level4__tracks">
        <div className="container fade-in" ref={ref}>
          <div className="level4__grid">

            {/* ── الدروس ── */}
            <Link to="/level-4/lessons" className="track-card track-card--lessons">
              <div className="track-card__icon track-card__icon--green">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="23 7 16 12 23 17 23 7" />
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                </svg>
              </div>
              <h3 className="track-card__title">الدروس</h3>
              <p className="track-card__desc">
                ثلاثة دروس تأسيسية في فهم الإسلام ومقدماته —
                مدخل إلى فهم النصوص الشرعية والمقدمات الأصولية التي تُرسّخ المنهج.
              </p>
              <span className="track-card__btn track-card__btn--green">
                ابدأ
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </span>
            </Link>

            {/* ── قوائم التشغيل ── */}
            <Link to="/level-4/playlists" className="track-card track-card--playlists">
              <div className="track-card__icon track-card__icon--blue">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="8" y1="6" x2="21" y2="6" />
                  <line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" />
                  <line x1="3" y1="6" x2="3.01" y2="6" />
                  <line x1="3" y1="12" x2="3.01" y2="12" />
                  <line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
              </div>
              <h3 className="track-card__title">قوائم التشغيل</h3>
              <p className="track-card__desc">
                خمس قوائم تشغيل شاملة — الثقافة المتكاملة، والدروس المحورية،
                وسلسلة الإشكاليات، وإحياء منهاج النبوة، وشرح المنهاج من ميراث النبوة.
              </p>
              <span className="track-card__btn track-card__btn--blue">
                ابدأ
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </span>
            </Link>

            {/* ── الكتب ── */}
            <Link to="/level-4/books" className="track-card track-card--books">
              <div className="track-card__icon track-card__icon--gold">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
              </div>
              <h3 className="track-card__title">الكتب</h3>
              <p className="track-card__desc">
                خمسة كتب مرجعية تُكمل التأسيس العام — من مدخل فهم الإسلام
                وشخصية المسلم إلى مفاهيم أهل السنة والأسئلة الأربعة بجزأيها.
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
