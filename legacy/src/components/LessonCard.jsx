import { useState } from 'react';
import './LessonCard.css';

function getYoutubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:live\/|watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

export default function LessonCard({ lesson, index }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const videoId = getYoutubeId(lesson.url);
  const isPlaceholder = !lesson.url;

  function handleToggle() {
    const next = !isOpen;
    setIsOpen(next);
    if (!next) setShowDetails(false);
  }

  return (
    <div className={`lesson-card ${isOpen ? 'lesson-card--open' : ''}`}>
      <button className="lesson-card__header" onClick={handleToggle} aria-expanded={isOpen}>
        <span className="lesson-card__number">{index + 1}</span>
        <div className="lesson-card__icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        </div>
        <span className="lesson-card__title">{lesson.shortTitle}</span>
        <svg className="lesson-card__chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div className="lesson-card__body">
          {lesson.fullTitle && (
            <p className="lesson-card__full-title">{lesson.fullTitle}</p>
          )}

          {/* YouTube iframe embed */}
          {videoId && (
            <div className="lesson-card__video">
              <div className="lesson-card__video-wrapper">
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title={lesson.shortTitle}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <a href={lesson.url} target="_blank" rel="noopener noreferrer" className="lesson-card__yt-link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                مشاهدة على يوتيوب
              </a>
            </div>
          )}

          {/* Placeholder for lessons without video */}
          {isPlaceholder && (
            <div className="lesson-card__video">
              <div className="lesson-card__video-wrapper">
                <div className="lesson-card__video-coming">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  <span>الفيديو قريبًا بإذن الله</span>
                </div>
              </div>
            </div>
          )}

          {/* Description toggle */}
          {lesson.description && (
            <div className="lesson-card__details-section">
              <button
                className={`lesson-card__details-btn ${showDetails ? 'lesson-card__details-btn--active' : ''}`}
                onClick={() => setShowDetails(!showDetails)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                {showDetails ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
                <svg className="lesson-card__details-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {showDetails && (
                <p className="lesson-card__desc">{lesson.description}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
