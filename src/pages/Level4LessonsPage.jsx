import { useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import SectionBlock from '../components/SectionBlock';
import SeriesBlock from '../components/SeriesBlock';
import { generalLessons } from '../data/level4';
import './LearningPage.css';

const icon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7" />
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </svg>
);

export default function Level4LessonsPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="learning-page">
      <PageHeader
        title="الدروس"
        subtitle="ثلاثة دروس تأسيسية في فهم الإسلام — مدخل أصولي لفهم النصوص الشرعية والمقدمات التأسيسية التي تُرسي منهج التفكير والفهم الصحيح."
        backTo="/level-4"
        backLabel="المستوى الرابع"
      />

      <SectionBlock
        id="general-lessons"
        title="مقدمات في فهم الإسلام"
        intro="ثلاثة دروس تُؤسّس المنهج الصحيح في فهم الإسلام — ابدأ بها قبل الدخول في قوائم التشغيل والكتب."
      >
        <SeriesBlock
          icon={icon}
          title="الدروس التأسيسية"
          count={`${generalLessons.length} دروس`}
          intro="دروس تُرسّخ المنطلقات الصحيحة في فهم الدين والنصوص الشرعية، وتضع أُسس التفكير المنهجي في القضايا العلمية والإصلاحية."
          lessons={generalLessons}
        />
      </SectionBlock>
    </div>
  );
}
