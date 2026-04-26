import { useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import SectionBlock from '../components/SectionBlock';
import SeriesBlock from '../components/SeriesBlock';
import VoiceNote from '../components/VoiceNote';
import {
  seerahLessons,
  anwarLessons,
  nihayaLessons,
  akhiraLessons,
  waqafatLessons,
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
  waqafat: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  anwar: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
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
        subtitle="مرحلة التعمق والترقي — تُكمل فيها السلاسل واحدة تلو الأخرى، يوم درسًا حتى تنتهي، ثم تنتقل للتي تليها. وتشمل السيرة النبوية وأنوار الأنبياء وأحداث نهاية العالم والدار الآخرة."
        backTo="/level-2"
        backLabel="المستوى الثاني"
      />

      {/* تنبيه عام */}
      <div className="container">
        <VoiceNote
          label="استمع قبل البداية في المرحلة الثالثة للتزكية"
          url="https://drive.google.com/file/d/1w_z8VOzcxWnQi9fetX_wBiINYLtnuSMN/view?usp=drivesdk"
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

      {/* ── معايشة أنوار الأنبياء ── */}
      <SectionBlock
        id="anwar"
        title="معايشة أنوار الأنبياء"
        intro="41 درسًا في رحلة مع قصص الأنبياء من القرآن الكريم — زكرياء ويحيى وعيسى وإبراهيم وموسى ويوسف عليهم السلام."
        variant="alt"
      >
        <SeriesBlock
          icon={icons.anwar}
          title="معايشة أنوار الأنبياء"
          count={`${anwarLessons.length} درسًا`}
          intro="سلسلة تأخذك في معايشة قصص الأنبياء كما جاءت في القرآن الكريم، بأسلوب يُحيي القلب ويُعمّق الصلة بالله."
          lessons={anwarLessons}
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

      {/* ── وقفات تربوية جامعة ── */}
      <SectionBlock
        id="waqafat"
        title="وقفات تربوية جامعة"
        intro="خاتمة المرحلة الثالثة — وقفات تربوية جامعة تُلملم خيوط ما سبق، وتضع المتربي على أعتاب الانطلاق العملي بهدف واضح وقرارٍ ثابت."
        variant="alt"
      >
        <SeriesBlock
          icon={icons.waqafat}
          title="وقفات تربوية جامعة"
          count={`${waqafatLessons.length} درسًا`}
          intro="دروس متنوعة تُختم بها مرحلة التزكية — التربية والبناء، أهمية البيئة الإيمانية، تحديد الهدف، صفات حامل الرسالة، ومواجهة عواصف الحياة."
          lessons={waqafatLessons}
        />
      </SectionBlock>

    </div>
  );
}
