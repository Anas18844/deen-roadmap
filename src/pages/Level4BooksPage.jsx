import { useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import SectionBlock from '../components/SectionBlock';
import BookSection from '../components/BookSection';
import {
  generalBook1,
  generalBook2,
  generalBook3,
  generalBook4,
  generalBook5Parts,
} from '../data/level4';
import './LearningPage.css';

export default function Level4BooksPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="learning-page">
      <PageHeader
        title="الكتب"
        subtitle="خمسة كتب مرجعية تُكمل التأسيس العام — من مدخل فهم الإسلام وشخصية المسلم إلى مفاهيم أهل السنة والأسئلة الأربعة الجوهرية."
        backTo="/level-4"
        backLabel="المستوى الرابع"
      />

      {/* الكتاب الأول */}
      <SectionBlock
        id="book-1"
        title="مدخل لفهم الإسلام"
        intro="كتاب يُرسّخ المدخل الصحيح لفهم الإسلام دينًا وحضارةً — أساس لا غنى عنه قبل الدخول في التفاصيل."
      >
        <BookSection
          title={generalBook1.shortTitle}
          downloadUrl={generalBook1.url}
          downloadLabel="اقرأ الكتاب"
        />
      </SectionBlock>

      {/* الكتاب الثاني */}
      <SectionBlock
        id="book-2"
        title="المختصر في خلق المسلم"
        intro="مختصر جامع يُبيّن ملامح شخصية المسلم في أخلاقه وسلوكه وتعامله مع ربه ونفسه والناس."
      >
        <BookSection
          title={generalBook2.shortTitle}
          downloadUrl={generalBook2.url}
          downloadLabel="اقرأ الكتاب"
        />
      </SectionBlock>

      {/* الكتاب الثالث */}
      <SectionBlock
        id="book-3"
        title="شخصية المسلم"
        intro="كتاب يرسم صورة متكاملة لشخصية المسلم — في علاقته بالله والناس والمجتمع، مع التأصيل الشرعي لكل جانب."
      >
        <BookSection
          title={generalBook3.shortTitle}
          downloadUrl={generalBook3.url}
          downloadLabel="اقرأ الكتاب"
        />
      </SectionBlock>

      {/* الكتاب الرابع */}
      <SectionBlock
        id="book-4"
        title="خلاصة مفاهيم أهل السنة والجماعة"
        intro="خلاصة منهجية للمفاهيم العقدية والمنهجية لأهل السنة — مرجع يضبط التصور ويُصحح المفاهيم الملتبسة."
      >
        <BookSection
          title={generalBook4.shortTitle}
          downloadUrl={generalBook4.url}
          downloadLabel="اقرأ الكتاب"
        />
      </SectionBlock>

      {/* الكتاب الخامس — جزآن */}
      <SectionBlock
        id="book-5"
        title="الأسئلة الأربعة"
        intro="كتاب بجزأين يُجيب على الأسئلة الأربعة الجوهرية التي يواجهها كل مسلم في رحلته — اقرأ الجزأين بالترتيب."
      >
        <div className="books-grid">
          {generalBook5Parts.map((part, i) => (
            <BookSection
              key={i}
              title={part.shortTitle}
              downloadUrl={part.url}
              downloadLabel="اقرأ الكتاب"
            />
          ))}
        </div>
      </SectionBlock>
    </div>
  );
}
