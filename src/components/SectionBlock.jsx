import { useFadeIn } from '../hooks/useFadeIn';
import './SectionBlock.css';

export default function SectionBlock({ id, title, intro, children, variant = 'default' }) {
  const ref = useFadeIn();

  return (
    <section id={id} className={`section-block section-block--${variant}`}>
      <div className="container fade-in" ref={ref}>
        <h2 className="section-title">{title}</h2>
        {intro && <p className="section-block__intro">{intro}</p>}
        {children}
      </div>
    </section>
  );
}
