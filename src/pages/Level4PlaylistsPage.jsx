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
        subtitle="خمس قوائم تشغيل متكاملة — من الثقافة المتكاملة والدروس المحورية وسلسلة الإشكاليات، إلى إحياء منهاج النبوة وشرحه التفصيلي في سبعة وثلاثين درسًا."
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
        title="المدخل إلى الثقافة المتكاملة"
        intro="خمس ندوات تُمهّد لفهم الثقافة الإسلامية المتكاملة — رؤية شاملة تجمع بين الأبعاد العقدية والفكرية والحضارية."
      >
        <SeriesBlock
          icon={icon}
          title="المدخل إلى الثقافة المتكاملة"
          count={`${playlist1.length} ندوات`}
          intro="سلسلة ندوات تُقدّم مدخلاً متكاملاً للثقافة الإسلامية بأبعادها المختلفة — فكرًا وعقيدةً وحضارةً."
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
    </div>
  );
}
