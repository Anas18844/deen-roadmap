import { useFadeIn } from '../hooks/useFadeIn';
import './Hero.css';

export default function Hero() {
  const ref = useFadeIn(0.1);

  return (
    <section id="hero" className="hero">
      <div className="hero__bg-pattern" aria-hidden="true" />
      <div className="hero__content container fade-in" ref={ref}>
        <div className="hero__logo">
          <span className="hero__logo-icon">خ</span>
        </div>
        <h1 className="hero__title">خريطة الطريق</h1>
        <p className="hero__tagline">
          دليلك لفهم الدين والسير فيه على بصيرة
        </p>
        <a href="#about" className="hero__cta">
          ابدأ رحلتك
          <span className="hero__cta-arrow">←</span>
        </a>
      </div>
      <div className="hero__scroll-hint" aria-hidden="true">
        <div className="hero__scroll-line" />
      </div>
    </section>
  );
}
