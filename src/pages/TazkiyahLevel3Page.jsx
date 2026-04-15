import { useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import SectionBlock from '../components/SectionBlock';
import BookSection from '../components/BookSection';
import {
  tazkiyahIntroBooks,
  tazkiyahBook2,
  tazkiyahBook3,
  tazkiyahBook4,
  tazkiyahBook5,
} from '../data/level3';
import VoiceNote from '../components/VoiceNote';
import './LearningPage.css';

export default function TazkiyahLevel3Page() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="learning-page">
      <PageHeader
        title="تمهيد التزكية"
        subtitle="خمسة مراجع تبني البنية التربوية الداخلية — من مقدمات التزكية وتزكية العقل والجسد والقلب، إلى الوصايا والخلاصات التي تضبط المسار التربوي."
        backTo="/level-3"
        backLabel="المستوى الثالث"
      />

      <div className="container">
        <VoiceNote
          label="استمع قبل البداية في تمهيد التزكية"
          url="https://drive.google.com/file/d/1p401qD_gmcTOJT6OmTTrPzolXQPDLRyt/view?usp=drivesdk"
        />
      </div>

      {/* ── الخانة الأولى: مقدمات في التزكية (4 كتب) ── */}
      <SectionBlock
        id="tazkiyah-intro"
        title="مقدمات في التزكية"
        intro="أربعة كتب تُؤسّس فهمك لمعنى التزكية وأبعادها — تزكية العقل والجسد والقلب. اقرأها بالترتيب."
      >
        <div className="books-grid">
          {tazkiyahIntroBooks.map((book, i) => (
            <BookSection
              key={i}
              title={`${i + 1}. ${book.shortTitle}`}
              downloadUrl={book.url}
              downloadLabel="اقرأ الكتاب"
            />
          ))}
        </div>
      </SectionBlock>

      {/* ── الخانة الثانية: دستور الملتزم الجديد ── */}
      <SectionBlock
        id="dustur"
        title="دستور الملتزم الجديد"
        intro="كتاب يضع الأُطر العملية لحياة الملتزم الجديد — المنهج اليومي والأولويات والسلوكيات التي تنظم الالتزام."
      >
        <BookSection
          title={tazkiyahBook2.shortTitle}
          downloadUrl={tazkiyahBook2.url}
          downloadLabel="اقرأ الكتاب"
        />
      </SectionBlock>

      {/* ── الخانة الثالثة: تأسيس الوعي التربوي ── */}
      <SectionBlock
        id="wai-tarbawi"
        title="تأسيس الوعي التربوي"
        intro="كتاب يُبني الأساس النظري للعملية التربوية — فهم المنطلقات والمرجعيات التي تُحكم أي مسار تربوي صحيح."
      >
        <BookSection
          title={tazkiyahBook3.shortTitle}
          downloadUrl={tazkiyahBook3.url}
          downloadLabel="اقرأ الكتاب"
        />
      </SectionBlock>

      {/* ── الخانة الرابعة: تفريغ شرح الوصية الصغرى ── */}
      <SectionBlock
        id="wasiya"
        title="تفريغ شرح الوصية الصغرى"
        intro="شرح الوصية الصغرى لابن تيمية — وصايا جامعة في التربية والسلوك والعلاقة بالله والناس."
      >
        <BookSection
          title={tazkiyahBook4.shortTitle}
          downloadUrl={tazkiyahBook4.url}
          downloadLabel="اقرأ الكتاب"
        />
      </SectionBlock>

      {/* ── الخانة الخامسة: الخلاصة في التربية ── */}
      <SectionBlock
        id="khulasa"
        title="الخلاصة في التربية"
        intro="كتاب يجمع خلاصة المنهج التربوي — مرجع جامع للمراجعة والتثبيت في نهاية مسار تمهيد التزكية."
      >
        <BookSection
          title={tazkiyahBook5.shortTitle}
          downloadUrl={tazkiyahBook5.url}
          downloadLabel="اقرأ الكتاب"
        />
      </SectionBlock>
    </div>
  );
}
