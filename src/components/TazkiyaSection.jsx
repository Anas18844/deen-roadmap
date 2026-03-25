import { useFadeIn } from '../hooks/useFadeIn';
import './TazkiyaSection.css';

const stages = [
  {
    title: 'المرحلة الأولى',
    description: 'مرحلة تأسيسية في تزكية النفس وفهم أمراض القلوب والتعرف على طريق الإصلاح',
    items: ['التوبة والإنابة', 'محاسبة النفس', 'فهم آفات القلوب'],
  },
  {
    title: 'المرحلة الثانية',
    description: 'مرحلة البناء والترقي في مقامات العبودية والتقرب إلى الله بالنوافل والأذكار',
    items: ['التقرب بالنوافل', 'الذكر والمناجاة', 'التحلي بالأخلاق'],
  },
];

export default function TazkiyaSection() {
  const ref = useFadeIn();

  return (
    <section id="tazkiya" className="tazkiya">
      <div className="container fade-in" ref={ref}>
        <h2 className="section-title">سلاسل التزكية</h2>
        <p className="tazkiya__intro">
          التزكية هي روح هذا الطريق، فالعلم بلا تزكية كشجرة بلا ثمر.
          هنا تبدأ رحلتك في إصلاح القلب وتهذيب النفس والسير إلى الله
          على بصيرة من أمرك.
        </p>

        <div className="tazkiya__grid">
          {stages.map((stage, i) => (
            <div key={i} className="tazkiya-card">
              <div className="tazkiya-card__header">
                <span className="tazkiya-card__step">{i + 1}</span>
                <h3 className="tazkiya-card__title">{stage.title}</h3>
              </div>
              <p className="tazkiya-card__desc">{stage.description}</p>
              <ul className="tazkiya-card__list">
                {stage.items.map((item, j) => (
                  <li key={j}>
                    <span className="tazkiya-card__dot" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
              <span className="tazkiya-card__badge">قريبًا بإذن الله</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
