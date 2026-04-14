import { Link } from 'react-router-dom';
import { useFadeIn } from '../hooks/useFadeIn';
import './LevelsSection.css';

const levels = [
  { name: 'المستوى الأول', number: '١', color: 'var(--green)', to: '/level-1' },
  { name: 'المستوى الثاني', number: '٢', color: 'var(--green-light)', to: '/level-2' },
  { name: 'المستوى الثالث', number: '٣', color: 'var(--blue-muted)', to: '/level-3' },
  { name: 'المستوى الرابع', number: '٤', color: 'var(--gold)', to: null },
];

export default function LevelsSection() {
  const ref = useFadeIn();

  return (
    <section id="levels" className="levels-section">
      <div className="container fade-in" ref={ref}>
        <h2 className="section-title">تمهيد خريطة الدين كاملة</h2>
        <p className="levels-section__desc">
          رحلة متدرجة عبر أربع مستويات لفهم الدين والسير فيه
        </p>

        <div className="levels-grid">
          {levels.map((level, i) =>
            level.to ? (
              <Link
                key={i}
                to={level.to}
                className="level-card"
                style={{ '--card-accent': level.color }}
              >
                <span className="level-card__number">{level.number}</span>
                <span className="level-card__name">{level.name}</span>
              </Link>
            ) : (
              <div
                key={i}
                className="level-card level-card--locked"
                style={{ '--card-accent': level.color }}
              >
                <span className="level-card__number">{level.number}</span>
                <span className="level-card__name">{level.name}</span>
                <span className="level-card__badge">قريبًا</span>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}
