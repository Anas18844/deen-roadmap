import { useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import SectionBlock from '../components/SectionBlock';
import BookSection from '../components/BookSection';
import VoiceNote from '../components/VoiceNote';
import { ibadahBooks } from '../data/level2';
import './LearningPage.css';

export default function IbadahPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="learning-page">
      <PageHeader
        title="تمهيد العبادة"
        subtitle="أربعة كتب تؤسسك في فهم حقيقة العبودية لله — من عتبات العبودية إلى أنيس المتعبد. اقرأها بالترتيب وتأمّل ما فيها."
        backTo="/level-2"
        backLabel="المستوى الثاني"
      />

      <div className="container">
        <VoiceNote
          label="استمع قبل البداية في تمهيد العبادة"
          url="https://drive.google.com/file/d/1DoIDAbav0Hhk0RlIKYsmN-1cLEaLDbNo/view?usp=drivesdk"
        />
      </div>

      <SectionBlock
        id="ibadah-books"
        title="كتب تمهيد العبادة"
        intro="أربعة كتب تُقرأ بالترتيب — كل كتاب يُعمّق ما قبله ويُمهّد لما بعده في فهم حقيقة العبودية."
      >
        <div className="books-grid">
          {ibadahBooks.map((book, i) => (
            <BookSection
              key={i}
              title={`${i + 1}. ${book.shortTitle}`}
              downloadUrl={book.url}
              downloadLabel="اقرأ الكتاب"
            />
          ))}
        </div>
      </SectionBlock>
    </div>
  );
}
