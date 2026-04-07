import { useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import SectionBlock from '../components/SectionBlock';
import SeriesBlock from '../components/SeriesBlock';
import VoiceNote from '../components/VoiceNote';
import {
  seerahLessons,
  nihayaLessons,
  akhiraLessons,
} from '../data/level2';
import './TazkiyahPage.css';

/* ── icons ── */
const icons = {
  seerah: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22c4-4 8-7.5 8-12a8 8 0 1 0-16 0c0 4.5 4 8 8 12z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  nihaya: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  akhira: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
};

export default function Tazkiyah3Page() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="tazkiyah-page">
      <PageHeader
        title="التزكية — المرحلة الثالثة"
        subtitle="مرحلة التعمق والترقي — تُكمل فيها السلاسل واحدة تلو الأخرى، يوم درسًا حتى تنتهي، ثم تنتقل للتي تليها. وتشمل السيرة النبوية وأحداث نهاية العالم والدار الآخرة."
        backTo="/level-2"
        backLabel="المستوى الثاني"
      />

      {/* تنبيه عام */}
      <div className="container">
        <VoiceNote
          label="استمع قبل البداية في المرحلة الثالثة للتزكية"
          url="https://drive.google.com/file/d/1ZLjWF75jJCvmnBaNOQ4RwrCQCOg6k7T5/view?usp=drivesdk"
        />
      </div>

      {/* ── السيرة النبوية ── */}
      <SectionBlock
        id="seerah"
        title="السيرة النبوية"
        intro="51 درسًا تأخذك في رحلة كاملة مع حياة النبي ﷺ من البداية الإبراهيمية حتى الوفاة، مع أعمق الدروس والفوائد التربوية."
      >
        <SeriesBlock
          icon={icons.seerah}
          title="السيرة النبوية"
          count={`${seerahLessons.length} درسًا`}
          intro="سلسلة متكاملة في السيرة النبوية على كتاب الرحيق المختوم، بأسلوب مشوق يجمع بين التفصيل التاريخي والفائدة التربوية."
          lessons={seerahLessons}
        />
      </SectionBlock>

      {/* ── أحداث نهاية العالم ── */}
      <SectionBlock
        id="nihaya"
        title="أحداث نهاية العالم"
        intro="28 درسًا في رحلة مفصّلة مع علامات الساعة والأحداث العظيمة في آخر الزمان."
        variant="alt"
      >
        <SeriesBlock
          icon={icons.nihaya}
          title="أحداث نهاية العالم"
          count={`${nihayaLessons.length} درسًا`}
          intro="شرح مفصل لأشراط الساعة وأحداثها بالأدلة القطعية من القرآن والسنة."
          lessons={nihayaLessons}
        />
      </SectionBlock>

      {/* ── الدار الآخرة ── */}
      <SectionBlock
        id="akhira"
        title="الدار الآخرة"
        intro="12 درسًا في رحلة مؤثرة من لحظة الموت حتى الجنة أو النار — تُحيي القلب وتُجدد الصلة بالآخرة."
      >
        <SeriesBlock
          icon={icons.akhira}
          title="الدار الآخرة"
          count={`${akhiraLessons.length} درسًا`}
          intro="دروس مؤثرة عن الموت والقبر ويوم القيامة والجنة والنار — تجعل الآخرة حاضرة في قلبك."
          lessons={akhiraLessons}
        />
      </SectionBlock>

    </div>
  );
}
