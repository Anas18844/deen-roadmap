import { useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import SectionBlock from '../components/SectionBlock';
import BookSection from '../components/BookSection';
import SeriesBlock from '../components/SeriesBlock';
import {
  dawahBook1,
  dawahBook2,
  dawahBook3,
  markaziyyatLessons,
  dawahBook4,
} from '../data/level3';
import VoiceNote from '../components/VoiceNote';
import './LearningPage.css';

const icon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export default function DawahPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="learning-page">
      <PageHeader
        title="تمهيد الدعوة والإصلاح"
        subtitle="تأسيس الوعي الدعوي ومنهج المصلح — ثلاثة كتب في أصول الدعوة، وسلسلة مركزيات الإصلاح الثلاثة عشر، وبوصلة المصلح لضبط مسار العمل الإصلاحي."
        backTo="/level-3"
        backLabel="المستوى الثالث"
      />

      <div className="container">
        <VoiceNote
          label="استمع قبل البداية في تمهيد الدعوة والإصلاح"
          url="https://drive.google.com/file/d/1TIbJyZyRpu4hgICWAHpRpSQ6_jGRICyC/view?usp=drivesdk"
        />
      </div>

      {/* ── الخانة الأولى: تأسيس الوعي الدعوي ── */}
      <SectionBlock
        id="wai-dawawi"
        title="تأسيس الوعي الدعوي"
        intro="كتاب يُؤسّس الفهم الصحيح لمعنى الدعوة وأهدافها ومنطلقاتها — لا بد من قراءته قبل الشروع في أي عمل دعوي."
      >
        <BookSection
          title={dawahBook1.shortTitle}
          downloadUrl={dawahBook1.url}
          downloadLabel="اقرأ الكتاب"
        />
      </SectionBlock>

      {/* ── الخانة الثانية: علم الدعوة إلى الله ── */}
      <SectionBlock
        id="ilm-dawah"
        title="علم الدعوة إلى الله تعالى"
        intro="كتاب يُعرّف بعلم الدعوة كفنّ وعلم له أصوله ومسائله — منهج متكامل في فهم الدعوة من منظور علمي."
      >
        <BookSection
          title={dawahBook2.shortTitle}
          downloadUrl={dawahBook2.url}
          downloadLabel="اقرأ الكتاب"
        />
      </SectionBlock>

      {/* ── الخانة الثالثة: معالم في أصول الدعوة ── */}
      <SectionBlock
        id="maalim-dawah"
        title="معالم في أصول الدعوة"
        intro="كتاب يضع المعالم الكبرى في أصول الدعوة ومرجعياتها — مرجع جامع لمن يريد ضبط منهجه الدعوي."
      >
        <BookSection
          title={dawahBook3.shortTitle}
          downloadUrl={dawahBook3.url}
          downloadLabel="اقرأ الكتاب"
        />
      </SectionBlock>

      {/* ── الخانة الرابعة: مركزيات الإصلاح (13 درسًا) ── */}
      <SectionBlock
        id="markaziyyat"
        title="مركزيات الإصلاح"
        intro="ثلاثة عشر درسًا تُحدد المحاور الجوهرية لأي عمل إصلاحي حقيقي — من مرجعية الوحي إلى الوعي بالسنن الإلهية."
      >
        <SeriesBlock
          icon={icon}
          title="سلسلة مركزيات الإصلاح"
          count={`${markaziyyatLessons.length} دروس`}
          intro="سلسلة متكاملة تُرسّخ المحاور الأساسية للمصلح — مركزية التزكية والعلم والوعي والعمل والأخلاق والشمولية والسنن."
          lessons={markaziyyatLessons}
        />
      </SectionBlock>

      {/* ── الخانة الخامسة: بوصلة المصلح ── */}
      <SectionBlock
        id="bawsala"
        title="بوصلة المصلح"
        intro="كتاب يضبط مسار المصلح ويُحدد الاتجاه الصحيح في العمل الإصلاحي — ختام تمهيد الدعوة والإصلاح."
      >
        <BookSection
          title={dawahBook4.shortTitle}
          downloadUrl={dawahBook4.url}
          downloadLabel="اقرأ الكتاب"
        />
      </SectionBlock>
    </div>
  );
}
