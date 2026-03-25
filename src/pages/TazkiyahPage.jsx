import { useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import SectionBlock from '../components/SectionBlock';
import SeriesBlock from '../components/SeriesBlock';
import SubjectGroup from '../components/SubjectGroup';
import VoiceNote from '../components/VoiceNote';
import {
  stage1_marifatAllah,
  stage1_marifatNafs,
  stage1_marifatTariq,
  stage2_akhlaq,
  stage2_marifatNafs,
  stage2_marifatTariq,
} from '../data/tazkiyah';
import './TazkiyahPage.css';

/* SVG icons for each category */
const icons = {
  heart: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22c4-4 8-7.5 8-12a8 8 0 1 0-16 0c0 4.5 4 8 8 12z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  soul: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  path: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <line x1="2" y1="12" x2="22" y2="12" />
    </svg>
  ),
  star: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
};

/* Helper: count total lessons in a category (direct or sub-series) */
function totalCount(cat) {
  if (cat.lessons) return cat.count;
  return cat.subSeries.reduce((sum, s) => sum + s.count, 0);
}

/* Helper: renders a category — either direct lessons or nested sub-series */
function CategoryBlock({ category, icon }) {
  if (category.lessons) {
    /* Direct lessons (like معرفة الله) */
    return (
      <SeriesBlock
        icon={icon}
        title={category.title}
        count={`${category.count} دروس`}
        lessons={category.lessons}
      />
    );
  }

  /* Nested sub-series */
  return (
    <SeriesBlock
      icon={icon}
      title={category.title}
      count={`${totalCount(category)} درسًا`}
    >
      <div className="series-stack">
        {category.subSeries.map((sub, i) => (
          <SubjectGroup
            key={i}
            title={sub.title}
            count={`${sub.count} دروس`}
            lessons={sub.lessons}
          />
        ))}
      </div>
    </SeriesBlock>
  );
}

export default function TazkiyahPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="tazkiyah-page">
      <PageHeader
        title="التزكية — المستوى الأول"
        subtitle="التزكية هي روح هذا الطريق، فالعلم بلا تزكية كشجرة بلا ثمر. هنا تبدأ رحلتك في إصلاح القلب وتهذيب النفس والسير إلى الله على بصيرة."
        backTo="/level-1"
        backLabel="المستوى الأول"
      />

      {/* ===== تنبيهات التزكية ===== */}
      <div className="container">
        <VoiceNote
          label="استمع قبل البداية في التزكية (المرحلة الأولى والثانية)"
          url="https://drive.google.com/file/d/1Oq6fm13_aLGexk9cw0k16IoSWECY2hUn/view?usp=drivesdk"
        />
      </div>

      {/* ===== المرحلة الأولى ===== */}
      <SectionBlock
        id="stage-1"
        title="المرحلة الأولى — تأسيس وإصلاح"
        intro="مرحلة تأسيسية في تزكية النفس — تبدأ بمعرفة الله عز وجل، ثم معرفة النفس والقلب وآفاته، ثم معرفة الطريق إلى الله وأساسياته ومعوقاته."
      >
        <VoiceNote
          label="استمع قبل البداية في المرحلة الأولى"
          url="https://drive.google.com/file/d/1P_JK-vFDv6W3Pz3RvYV_Z8qekasjarR7/view?usp=drivesdk"
        />
        <div className="series-stack">
          <CategoryBlock category={stage1_marifatAllah} icon={icons.heart} />
          <CategoryBlock category={stage1_marifatNafs} icon={icons.soul} />
          <CategoryBlock category={stage1_marifatTariq} icon={icons.path} />
        </div>
      </SectionBlock>

      {/* ===== المرحلة الثانية ===== */}
      <SectionBlock
        id="stage-2"
        title="المرحلة الثانية — بناء وترقّي"
        intro="مرحلة البناء والترقي في مقامات العبودية — بعد التأسيس والإصلاح، تبدأ بالتحلي بالأخلاق الفاضلة، وتعميق معرفة النفس والقلب، والسير في طريق التقرب إلى الله."
        variant="alt"
      >
        <VoiceNote
          label="استمع قبل البداية في المرحلة الثانية"
          url="https://drive.google.com/file/d/1Oq6fm13_aLGexk9cw0k16IoSWECY2hUn/view?usp=drivesdk"
        />
        <div className="series-stack">
          <CategoryBlock category={stage2_akhlaq} icon={icons.star} />
          <CategoryBlock category={stage2_marifatNafs} icon={icons.soul} />
          <CategoryBlock category={stage2_marifatTariq} icon={icons.path} />
        </div>
      </SectionBlock>
    </div>
  );
}
