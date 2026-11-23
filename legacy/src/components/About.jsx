import { useFadeIn } from '../hooks/useFadeIn';
import './About.css';

export default function About() {
  const ref = useFadeIn();

  return (
    <section id="about" className="about">
      <div className="container fade-in" ref={ref}>
        <h2 className="section-title">احنا بنعمل ايه؟</h2>

        <div className="about__content">
          <p className="about__paragraph">
            من اشكاليات الواقع اللتي أصبحت منتشرة في هذا الزمان لمن أراد أن يكون
            له شأن في الدين على مستوى إصلاح نفسه وإصلاح غيره أنه يتشتت من كثرة
            المصادر التي يستطيع ان يتعلم منها سواء كانت هذه مصادر مكتوبة أو
            مسموعة والمشكلة الكبرى انه لا يعرف خريطة الدين التي أمرنا الله بالسير
            فيها بل في اغلب الاحيان يكون مهتم بجانب في الدين على حساب جانب آخر
          </p>

          <p className="about__paragraph">
            وكلما بدأ في برنامج تركه ودخل في برنامج آخر ظنًا منه أن هذا البرنامج
            أفضل له ولا يعلم أن اختيار البرنامج العلمي أو التزكوي أو غيره الذي
            سيناسبه مبني على أصول وقواعد وضوابط تجعله يقف راسخا
          </p>

          <div className="about__highlight">
            <div className="about__highlight-bar" aria-hidden="true" />
            <p>
              لذلك برنامج خريطة الدين هو برنامج متوازن ومتكامل بإذن الله لأخذك
              لكي تُمَهَّد في كل جوانب الدين لكي يكون لك القدرة على السير في طريق
              الدين على بينة من أمر ربك ومعرفة نواقصك وتكميلها عن طريق الاستهداء
              بالوحي واتباع النبي والتعلم من أهل العلم
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
