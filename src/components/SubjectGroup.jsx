import { useState } from 'react';
import LessonCard from './LessonCard';
import './SubjectGroup.css';

export default function SubjectGroup({ title, count, lessons }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`subject-group ${isOpen ? 'subject-group--open' : ''}`}>
      <button className="subject-group__header" onClick={() => setIsOpen(!isOpen)}>
        <div className="subject-group__icon-wrap">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
        </div>
        <div className="subject-group__info">
          <h4 className="subject-group__title">{title}</h4>
          <span className="subject-group__count">{count}</span>
        </div>
        <svg className="subject-group__chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div className="subject-group__body">
          <div className="lessons-list">
            {lessons.map((lesson, i) => (
              <LessonCard key={i} lesson={lesson} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
