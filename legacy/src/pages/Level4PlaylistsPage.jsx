import { useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import SectionBlock from '../components/SectionBlock';
import SeriesBlock from '../components/SeriesBlock';
import VoiceNote from '../components/VoiceNote';
import {
  playlist1,
  playlist2,
  playlist3,
  playlist4,
  playlist5,
  playlist6,
  playlist7,
  playlist8,
} from '../data/level4';
import './LearningPage.css';

const icon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

export default function Level4PlaylistsPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="learning-page">
      <PageHeader
        title="قوائم التشغيل"
        subtitle="ثماني قوائم تشغيل متكاملة — من الثقافة المتكاملة والدروس المحورية وسلسلة الإشكاليات وفقه التصورات والعقلية الإدارية ودفتر وعي، إلى إحياء منهاج النبوة وشرحه التفصيلي في سبعة وثلاثين درسًا."
        backTo="/level-4"
        backLabel="المستوى الرابع"
      />

      <div className="container">
        <VoiceNote
          label="استمع قبل البداية في خانة السلاسل"
          url="https://drive.google.com/file/d/1kZzjoE6dOlIEY5y4FbjduiFV8M1qykFN/view?usp=drivesdk"
        />
      </div>

      <SectionBlock
        id="playlist-1"
        title="الثقافة المتكاملة وفيديوهات أخرى"
        intro="خمس ندوات تُمهّد لفهم الثقافة الإسلامية المتكاملة، يتبعها مجموعة من الفيديوهات في الانضباط الذاتي والعلاقات والصحة النفسية ومهارات العبادة."
      >
        <SeriesBlock
          icon={icon}
          title="الثقافة المتكاملة وفيديوهات أخرى"
          count={`${playlist1.length} فيديو`}
          intro="ندوات المدخل إلى الثقافة المتكاملة، مع فيديوهات مختارة في بناء الذات وإدارة العلاقات وإتقان العبادات والتفكير السليم."
          lessons={playlist1}
        />
      </SectionBlock>

      <SectionBlock
        id="playlist-2"
        title="دروس محورية"
        intro="سبعة دروس تدور حول محاور تربوية جوهرية — الإنسان في القرآن، وفقه الاختيار، ومعارج الإيمان، وفقه الحياة."
      >
        <SeriesBlock
          icon={icon}
          title="الدروس المحورية"
          count={`${playlist2.length} دروس`}
          intro="دروس تتناول أعمق المحاور التربوية في حياة المسلم — من فهم الإنسان في القرآن إلى فقه الحياة والارتقاء في الإيمان."
          lessons={playlist2}
        />
      </SectionBlock>

      <SectionBlock
        id="playlist-3"
        title="سلسلة إشكاليات"
        intro="ثلاثة عشر درسًا تُعالج الإشكاليات الفكرية والتربوية الكبرى — من البناء المعرفي والتدين المعاصر إلى اليأس والإحباط وظاهرة سقوط الكوادر."
      >
        <SeriesBlock
          icon={icon}
          title="سلسلة إشكاليات"
          count={`${playlist3.length} دروس`}
          intro="سلسلة تُشخّص الإشكاليات الحقيقية التي تواجه المسلم المعاصر وتُقدّم معالجات منهجية مستمدة من الوحي والواقع."
          lessons={playlist3}
        />
      </SectionBlock>

      <SectionBlock
        id="playlist-4"
        title="إحياء منهاج النبوة"
        intro="سبعة دروس تُحيي منهاج النبوة في التلقي والتربية والإصلاح — مسار متكامل يُعيد ربط المسلم بالمنهج النبوي الأصيل."
      >
        <SeriesBlock
          icon={icon}
          title="إحياء منهاج النبوة"
          count={`${playlist4.length} دروس`}
          intro="سلسلة تُعيد بناء المنهج النبوي في ثلاثة محاور: منهاج التلقي، ومنهاج التربية، ومنهاج الإصلاح."
          lessons={playlist4}
        />
      </SectionBlock>

      <SectionBlock
        id="playlist-5"
        title="شرح المنهاج من ميراث النبوة"
        intro="سبعة وثلاثون درسًا تشرح المنهاج من ميراث النبوة تفصيلاً — من مرجعية الوحي إلى السياسة والحكم، مرورًا بالتزكية والعلم والإصلاح والثبات."
      >
        <SeriesBlock
          icon={icon}
          title="شرح المنهاج من ميراث النبوة"
          count={`${playlist5.length} درسًا`}
          intro="شرح تفصيلي متكامل لكتاب المنهاج من ميراث النبوة — يُغطي كل محاور الكتاب من البداية حتى الملاحق، ويُرسّخ منهج الأنبياء في بناء الفرد والأمة."
          lessons={playlist5}
        />
      </SectionBlock>

      <SectionBlock
        id="playlist-6"
        title="العقلية الإدارية"
        intro="درسان يؤسّسان العقلية الإدارية للمسلم العامل — ضبط الجهد وتنظيم العمل وترتيب الأولويات في الميدان الدعوي والإصلاحي."
      >
        <SeriesBlock
          icon={icon}
          title="العقلية الإدارية"
          count="درسان"
          intro="سلسلة تبني التفكير الإداري المنظّم لدى العامل للإسلام — من إدارة الذات إلى إدارة المهام والفريق."
          lessons={playlist6}
        />
      </SectionBlock>

      <SectionBlock
        id="playlist-7"
        title="دفتر وعي"
        intro="ثمانية دروس في بناء الشخصية والتقوى — من فقه النعمة وقواعد ابن تيمية في بناء الشخصية إلى التقوى بوصفها ضمير المسلم."
      >
        <SeriesBlock
          icon={icon}
          title="دفتر وعي"
          count={`${playlist7.length} دروس`}
          intro="دروس تربوية جامعة تُرسّخ الوعي بالنعمة وقواعد بناء الشخصية وأثر التقوى في ضبط سلوك المسلم."
          lessons={playlist7}
        />
      </SectionBlock>

      <SectionBlock
        id="playlist-8"
        title="فقه التصورات"
        intro="ستة دروس تُصحّح التصورات الكبرى وتضبط طريقة نظر المسلم إلى الدين والنفس والواقع."
      >
        <SeriesBlock
          icon={icon}
          title="فقه التصورات"
          count={`${playlist8.length} دروس`}
          intro="سلسلة متكاملة في تصحيح التصورات وبناء النظرة الصحيحة التي تسبق العمل وتضبط مساره."
          lessons={playlist8}
        />
      </SectionBlock>
    </div>
  );
}
