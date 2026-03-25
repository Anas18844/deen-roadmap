import { useFadeIn } from '../hooks/useFadeIn';
import './AudioSection.css';

const audios = [
  {
    title: 'شرح خريطة الدين',
    url: 'https://drive.google.com/file/d/1ustTOrBteAWXn_CGz0cyCfktfY1Wtmzo/view?usp=drivesdk',
  },
  {
    title: 'كيف اتعامل مع الموقع',
    url: 'https://drive.google.com/file/d/1rjJlAb4d7HNpiD_ccKA1sBYUieJAd7kf/view?usp=drivesdk',
  },
];

const notes = [
  'استمع للتسجيلات بتركيز قبل البدء في أي مستوى',
  'افهم الخريطة الكاملة أولًا ثم ابدأ بالتدرج',
  'لا تستعجل الانتقال بين المستويات',
  'الثبات على المنهج أهم من السرعة',
];

export default function AudioSection() {
  const ref = useFadeIn();

  return (
    <section id="roadmap" className="audio-section">
      <div className="container fade-in" ref={ref}>
        <h2 className="section-title">شرح خريطة الدين وفهم بداية الطريق</h2>

        <div className="audio-section__grid">
          {/* Audio Cards */}
          <div className="audio-section__audios">
            {audios.map((audio, i) => (
              <a
                key={i}
                href={audio.url}
                target="_blank"
                rel="noopener noreferrer"
                className="audio-card"
              >
                <div className="audio-card__icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </div>
                <div className="audio-card__info">
                  <span className="audio-card__label">تسجيل صوتي {i + 1}</span>
                  <span className="audio-card__title">{audio.title}</span>
                </div>
                <div className="audio-card__arrow">←</div>
              </a>
            ))}
          </div>

          {/* Notes */}
          <div className="audio-section__notes">
            <h3 className="audio-section__notes-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              تنبيهات مهمة
            </h3>
            <ul className="notes-list">
              {notes.map((note, i) => (
                <li key={i} className="notes-list__item">
                  <span className="notes-list__dot" aria-hidden="true" />
                  {note}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
