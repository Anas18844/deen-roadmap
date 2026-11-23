import { useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import SectionBlock from '../components/SectionBlock';
import BookSection from '../components/BookSection';
import {
  dawahBook1,
  dawahBook2,
  dawahBook3,
} from '../data/level3';
import VoiceNote from '../components/VoiceNote';
import './LearningPage.css';

export default function DawahPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="learning-page">
      <PageHeader
        title="تمهيد الدعوة والإصلاح"
        subtitle="تأسيس الوعي الدعوي ومنهج المصلح — ثلاثة كتب في أصول الدعوة تضع المعالم الكبرى للعمل الدعوي والإصلاحي."
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
    </div>
  );
}
