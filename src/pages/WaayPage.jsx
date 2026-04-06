import { useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import SectionBlock from '../components/SectionBlock';
import SeriesBlock from '../components/SeriesBlock';
import VoiceNote from '../components/VoiceNote';
import { waaiyLessons } from '../data/level2';
import './LearningPage.css';

const icon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

export default function WaayPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="learning-page">
      <PageHeader
        title="تمهيد الوعي"
        subtitle="بناء الوعي الفكري والنقدي لطالب العلم — فهم كيف تشكّلت الأفكار الغربية وكيف هيمنت، وكيف يتعامل المسلم مع القضايا الفكرية المعاصرة بمنهجية صحيحة."
        backTo="/level-2"
        backLabel="المستوى الثاني"
      />

      <div className="container">
        <VoiceNote
          label="استمع قبل البداية في تمهيد الوعي"
          url="https://drive.google.com/file/d/1me3SW2daXRi0_q0_BmFJMoHIOu19Wl94/view?usp=drivesdk"
        />
      </div>

      <SectionBlock
        id="waay"
        title="سلسلة تمهيد الوعي"
        intro="10 دروس تؤسسك في البناء الفكري لطالب العلم — فهم الواقع الفكري المعاصر، والتفكير النقدي، ومنهج البحث في القضايا الفكرية."
      >
        <SeriesBlock
          icon={icon}
          title="تمهيد الوعي والفكر"
          count={`${waaiyLessons.length} دروس`}
          intro="سلسلة متكاملة في بناء الوعي الفكري من منظور إسلامي، تتناول محركات الأفكار وسمات الموجة الفكرية المعاصرة وكيفية التعامل معها."
          lessons={waaiyLessons}
        />
      </SectionBlock>
    </div>
  );
}
