import { useState } from 'react';
import LessonCard from './LessonCard';
import './SeriesBlock.css';

export default function SeriesBlock({ icon, title, count, intro, lessons, children }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`series-block ${isOpen ? 'series-block--open' : ''}`}>
      <button className="series-block__header" onClick={() => setIsOpen(!isOpen)}>
        <div className="series-block__icon">{icon}</div>
        <div className="series-block__info">
          <h3 className="series-block__title">{title}</h3>
          <span className="series-block__meta">{count}</span>
        </div>
        <svg className="series-block__chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div className="series-block__body">
          {intro && (
            <div className="series-block__intro-box">
              <p>{intro}</p>
            </div>
          )}
          {lessons && (
            <div className="lessons-list">
              {lessons.map((lesson, i) => (
                <LessonCard key={i} lesson={lesson} index={i} />
              ))}
            </div>
          )}
          {children}
        </div>
      )}
    </div>
  );
}
