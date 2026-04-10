import { useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import SectionBlock from '../components/SectionBlock';
import SeriesBlock from '../components/SeriesBlock';
import SubjectGroup from '../components/SubjectGroup';
import BookSection from '../components/BookSection';
import VoiceNote from '../components/VoiceNote';
import {
  mafateehLessons,
  maharatLessons,
  madakhelSubjects,
  maarejBook,
} from '../data/level1';
import './LearningPage.css';

export default function LearningPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="learning-page">
      <PageHeader
        title="تمهيد طلب العلم"
        subtitle="تأسيسك في طريق العلم الشرعي: من فهم حقيقة العلم وفضله، إلى بناء شخصيتك كطالب علم، مرورًا بمداخل العلوم الشرعية المختلفة."
        backTo="/level-1"
        backLabel="المستوى الأول"
      />

      {/* ===== تنبيهات تمهيد طلب العلم ===== */}
      <div className="container">
        <VoiceNote
          label="استمع قبل البداية في تمهيد طلب العلم"
          url="https://drive.google.com/file/d/1V06X2mXh_6CO7_FU61coAZdUYSP07Dqb/view?usp=drivesdk"
        />
      </div>

      {/* ===== مفاتيح الطلب ===== */}
      <SectionBlock
        id="mafateeh"
        title="حقيبة مفاتيح الطلب"
        intro="سلسلة تأسيسية تضع بين يديك مفاتيح طلب العلم الشرعي — من فهم حقيقة العلم وفضله، إلى بناء شخصية طالب العلم والتعرف على العوائق وطرق تجاوزها."
      >
        <VoiceNote
          label="استمع قبل البداية في مفاتيح الطلب"
          url="https://drive.google.com/file/d/1DtdA2MQ1OBOD62AusWeo1ndu03IDiX1X/view?usp=drivesdk"
        />
        <SeriesBlock
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
          }
          title="حقيبة مفاتيح الطلب"
          count={`${mafateehLessons.length} محاضرة`}
          intro="سلسلة محاضرات تمهيدية ضمن برنامج التأسيس العلمي، تُعنى ببناء التصورات الصحيحة عن العلم الشرعي وأهميته وكيفية طلبه."
          lessons={mafateehLessons}
        />
      </SectionBlock>

      {/* ===== مهارات التعلم ===== */}
      <SectionBlock
        id="maharat"
        title="سلسلة مهارات التعلم"
        intro="سلسلة تُعنى بتطوير مهارات التعلم الفعّال — من أساليب الحفظ والمراجعة إلى تنظيم الوقت وإدارة المعرفة."
      >
        <VoiceNote
          label="استمع قبل البداية في مهارات التعلم"
          url="https://drive.google.com/file/d/1736UWRkrHKdDeV9lAUKgtGqzEtzPadm1/view?usp=drivesdk"
        />
        <SeriesBlock
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          }
          title="مهارات التعلم"
          count={`${maharatLessons.length} درسًا`}
          lessons={maharatLessons}
        />
      </SectionBlock>

      {/* ===== مداخل العلوم ===== */}
      <SectionBlock
        id="madakhel"
        title="مداخل العلوم الشرعية"
        intro="مقدمات تعريفية بالعلوم الشرعية المختلفة — تعطيك تصورًا عامًا عن كل علم قبل الشروع في دراسته تفصيلًا."
      >
        <VoiceNote
          label="استمع قبل البداية في مداخل العلوم"
          url="https://drive.google.com/file/d/1KwNpqitwIqhXdR7rKmHyucHPs6cHdDwM/view?usp=drivesdk"
        />
        <div className="series-stack">
          {madakhelSubjects.map((subject, i) => (
            <SubjectGroup
              key={i}
              title={subject.title}
              count={`${subject.count} دروس`}
              lessons={subject.lessons}
            />
          ))}
        </div>
      </SectionBlock>

      {/* ===== كتاب معارج العلوم ===== */}
      <SectionBlock
        id="maarej"
        title="كتاب معارج العلوم"
        intro="كتاب مرافق يضع بين يديك خريطة واضحة لفهم العلوم الشرعية ومراتبها."
      >
        <VoiceNote
          label="استمع قبل البداية في معارج العلوم"
          url="https://drive.google.com/file/d/15QG0PzauLheqNm11nZ3vOySRY4lvwIHO/view?usp=drivesdk"
        />
        <BookSection
          title={maarejBook.title}
          description={maarejBook.description}
          downloadUrl={maarejBook.downloadUrl}
        />
      </SectionBlock>
    </div>
  );
}
