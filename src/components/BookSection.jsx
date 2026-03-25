import { useFadeIn } from '../hooks/useFadeIn';
import './BookSection.css';

export default function BookSection({ title, description, downloadUrl, downloadLabel = 'تحميل الكتاب' }) {
  const ref = useFadeIn();

  return (
    <div className="book-section fade-in" ref={ref}>
      <div className="book-section__icon">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          <line x1="9" y1="7" x2="15" y2="7" />
          <line x1="9" y1="11" x2="13" y2="11" />
        </svg>
      </div>
      <h3 className="book-section__title">{title}</h3>
      {description && <p className="book-section__desc">{description}</p>}
      <a
        href={downloadUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="book-section__btn"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        {downloadLabel}
      </a>
    </div>
  );
}
