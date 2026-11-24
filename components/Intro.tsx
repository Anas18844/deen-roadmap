import Link from 'next/link';

const NOTES = [
  'استمع للتسجيلات بتركيز قبل البدء في أي مستوى',
  'افهم الخريطة الكاملة أولًا ثم ابدأ بالتدرج',
  'لا تستعجل الانتقال بين المستويات',
  'الثبات على المنهج أهم من السرعة',
];

/** The original landing intro (hero, "what we do", intro voice notes) — shown to everyone. */
export default function Intro({
  voices,
  signedIn,
}: {
  voices: { key: string; title: string; url: string | null }[];
  signedIn: boolean;
}) {
  return (
    <>
      <section id="hero" className={`hero ${signedIn ? 'hero--compact' : ''}`}>
        <div className="hero__bg-pattern" aria-hidden="true" />
        <div className="hero__content container">
          <div className="hero__logo"><span className="hero__logo-icon">خ</span></div>
          <h1 className="hero__title">خريطة الطريق</h1>
          <p className="hero__tagline">دليلك لفهم الدين والسير فيه على بصيرة</p>
          {signedIn ? (
            <a href="#next" className="hero__cta">كمّل رحلتك <span className="hero__cta-arrow">←</span></a>
          ) : (
            <div className="hero__actions">
              <Link href="/signup" className="hero__cta">ابدأ رحلتك <span className="hero__cta-arrow">←</span></Link>
              <Link href="/login" className="hero__cta hero__cta--ghost">عندي حساب</Link>
            </div>
          )}
        </div>
      </section>

      <section id="about" className="about">
        <div className="container">
          <h2 className="section-title">احنا بنعمل ايه؟</h2>
          <div className="about__content">
            <p className="about__paragraph">
              من اشكاليات الواقع اللتي أصبحت منتشرة في هذا الزمان لمن أراد أن يكون له شأن في الدين على مستوى إصلاح نفسه
              وإصلاح غيره أنه يتشتت من كثرة المصادر التي يستطيع ان يتعلم منها سواء كانت هذه مصادر مكتوبة أو مسموعة
              والمشكلة الكبرى انه لا يعرف خريطة الدين التي أمرنا الله بالسير فيها بل في اغلب الاحيان يكون مهتم بجانب في
              الدين على حساب جانب آخر
            </p>
            <p className="about__paragraph">
              وكلما بدأ في برنامج تركه ودخل في برنامج آخر ظنًا منه أن هذا البرنامج أفضل له ولا يعلم أن اختيار البرنامج
              العلمي أو التزكوي أو غيره الذي سيناسبه مبني على أصول وقواعد وضوابط تجعله يقف راسخا
            </p>
            <div className="about__highlight">
              <div className="about__highlight-bar" aria-hidden="true" />
              <p>
                لذلك برنامج خريطة الدين هو برنامج متوازن ومتكامل بإذن الله لأخذك لكي تُمَهَّد في كل جوانب الدين لكي يكون
                لك القدرة على السير في طريق الدين على بينة من أمر ربك ومعرفة نواقصك وتكميلها عن طريق الاستهداء بالوحي
                واتباع النبي والتعلم من أهل العلم
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="roadmap" className="audio-section">
        <div className="container">
          <h2 className="section-title">شرح خريطة الدين وفهم بداية الطريق</h2>
          <div className="audio-section__grid">
            <div className="audio-section__audios">
              {voices.filter((v) => v.url).map((v, i) => (
                <a key={v.key} href={v.url!} target="_blank" rel="noopener noreferrer" className="audio-card">
                  <div className="audio-card__icon" aria-hidden="true">🎙</div>
                  <div className="audio-card__info">
                    <span className="audio-card__label">تسجيل صوتي {i + 1}</span>
                    <span className="audio-card__title">{v.title}</span>
                  </div>
                  <div className="audio-card__arrow" aria-hidden="true">←</div>
                </a>
              ))}
            </div>
            <div className="audio-section__notes">
              <h3 className="audio-section__notes-title">تنبيهات مهمة</h3>
              <ul className="notes-list">
                {NOTES.map((n) => (
                  <li key={n} className="notes-list__item"><span className="notes-list__dot" aria-hidden="true" />{n}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
