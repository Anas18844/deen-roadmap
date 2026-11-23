// Structure of the legacy site (legacy/src/pages/*.jsx) mapped onto levels → tracks → sections → items.
// Items are imported straight from legacy/src/data; section intros are read from the legacy JSX.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { mafateehLessons, maharatLessons, madakhelSubjects, maarejBook } from '../legacy/src/data/level1.js';
import {
  stage1_marifatAllah, stage1_marifatNafs, stage1_marifatTariq,
  stage2_akhlaq, stage2_marifatNafs, stage2_marifatTariq,
} from '../legacy/src/data/tazkiyah.js';
import { ibadahBooks, seerahLessons, nihayaLessons, akhiraLessons, waqafatLessons } from '../legacy/src/data/level2.js';
import {
  dawahBook1, dawahBook2, dawahBook3, tazkiyahIntroBooks,
  tazkiyahBook2, tazkiyahBook3, tazkiyahBook4, tazkiyahBook5,
} from '../legacy/src/data/level3.js';
import {
  generalLessons, generalBook1, generalBook2, generalBook3, generalBook4, generalBook5Parts,
  playlist1, playlist2, playlist3, playlist4, playlist5, playlist6, playlist7, playlist8,
} from '../legacy/src/data/level4.js';

const pagesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'legacy', 'src', 'pages');

/** { SectionBlock title → intro } for one legacy page. */
function intros(page) {
  const src = readFileSync(path.join(pagesDir, `${page}.jsx`), 'utf8');
  const out = {};
  // Each opening tag spans several lines and closes with a lone ">" line.
  for (const [, attrs] of src.matchAll(/<SectionBlock\b([\s\S]*?)\n\s*>/g)) {
    const title = attrs.match(/title="([^"]+)"/)?.[1];
    const intro = attrs.match(/intro="([^"]+)"/)?.[1];
    if (title && intro) out[title] = intro;
  }
  return out;
}

const book = (b) => ({ shortTitle: b.shortTitle ?? b.title, description: b.description, url: b.url ?? b.downloadUrl, kind: 'book' });

/** A tazkiyah category: direct lessons, or sub-series flattened as "category — sub-series" children. */
const category = (key, cat) =>
  cat.lessons
    ? [{ key, title: cat.title, items: cat.lessons }]
    : cat.subSeries.map((sub, i) => ({ key: `${key}-${i + 1}`, title: `${cat.title} — ${sub.title}`, items: sub.lessons }));

const L1L = intros('LearningPage');
const L1T = intros('TazkiyahPage');
const L2T = intros('Tazkiyah3Page');
const L2I = intros('IbadahPage');
const L3T = intros('TazkiyahLevel3Page');
const L3D = intros('DawahPage');
const L4L = intros('Level4LessonsPage');
const L4P = intros('Level4PlaylistsPage');
const L4B = intros('Level4BooksPage');

const audio = (id) => `https://drive.google.com/file/d/${id}/view?usp=drivesdk`;

export const contentMap = [
  {
    number: 1,
    title: 'المستوى الأول',
    subtitle: 'المستوى الأول يضم مسارين متوازيين: تمهيد طلب العلم الشرعي لبناء الأساس المعرفي، وسلاسل التزكية لإصلاح القلب وتهذيب النفس. كلاهما ضروري للسير في طريق الدين على بصيرة.',
    tracks: [
      {
        key: 'learning',
        title: 'تمهيد طلب العلم',
        description: 'تأسيسك في طريق العلم الشرعي: من فهم حقيقة العلم وفضله، إلى بناء شخصيتك كطالب علم، مرورًا بمداخل العلوم الشرعية المختلفة.',
        accent: 'green',
        introAudioUrl: audio('1V06X2mXh_6CO7_FU61coAZdUYSP07Dqb'),
        sections: [
          { key: 'mafateeh', title: 'حقيبة مفاتيح الطلب', description: L1L['حقيبة مفاتيح الطلب'], introAudioUrl: audio('1DtdA2MQ1OBOD62AusWeo1ndu03IDiX1X'), items: mafateehLessons },
          { key: 'maharat', title: 'سلسلة مهارات التعلم', description: L1L['سلسلة مهارات التعلم'], introAudioUrl: audio('1736UWRkrHKdDeV9lAUKgtGqzEtzPadm1'), items: maharatLessons },
          {
            key: 'madakhel', title: 'مداخل العلوم الشرعية', description: L1L['مداخل العلوم الشرعية'], introAudioUrl: audio('1KwNpqitwIqhXdR7rKmHyucHPs6cHdDwM'),
            children: madakhelSubjects.map((s, i) => ({ key: `subject-${i + 1}`, title: s.title, items: s.lessons })),
          },
          { key: 'maarej', title: 'كتاب معارج العلوم', description: L1L['كتاب معارج العلوم'], introAudioUrl: audio('15QG0PzauLheqNm11nZ3vOySRY4lvwIHO'), items: [book(maarejBook)] },
        ],
      },
      {
        key: 'tazkiyah',
        title: 'سلاسل التزكية',
        description: 'رحلة إصلاح القلب وتهذيب النفس — من التوبة ومحاسبة النفس إلى الترقي في مقامات العبودية والتقرب إلى الله.',
        accent: 'gold',
        introAudioUrl: audio('1Oq6fm13_aLGexk9cw0k16IoSWECY2hUn'),
        sections: [
          {
            key: 'stage-1', title: 'المرحلة الأولى — تأسيس وإصلاح', description: L1T['المرحلة الأولى — تأسيس وإصلاح'], introAudioUrl: audio('162ZktJBq6pmR00nmR_mRPHN6_HM4htpz'),
            children: [...category('allah', stage1_marifatAllah), ...category('nafs', stage1_marifatNafs), ...category('tariq', stage1_marifatTariq)],
          },
          {
            key: 'stage-2', title: 'المرحلة الثانية — بناء وترقّي', description: L1T['المرحلة الثانية — بناء وترقّي'], introAudioUrl: audio('1_yKD-Xmf_ZWT-gAYMC8tcofRC-ovNJum'),
            children: [...category('akhlaq', stage2_akhlaq), ...category('nafs', stage2_marifatNafs), ...category('tariq', stage2_marifatTariq)],
          },
        ],
      },
    ],
  },
  {
    number: 2,
    title: 'المستوى الثاني',
    subtitle: 'المستوى الثاني يضم مسارَين: المرحلة الثالثة للتزكية بسلاسلها المتواصلة، وتمهيد العبادة لتعميق صلتك بالله.',
    tracks: [
      {
        key: 'tazkiyah-3',
        title: 'التزكية — المرحلة الثالثة',
        description: 'المرحلة الثالثة والأعمق في تزكية النفس — تشمل السيرة النبوية كاملة، وأحداث نهاية العالم، والدار الآخرة. تُكمَل السلاسل واحدة تلو الأخرى.',
        accent: 'gold',
        introAudioUrl: audio('1w_z8VOzcxWnQi9fetX_wBiINYLtnuSMN'),
        sections: [
          { key: 'seerah', title: 'السيرة النبوية', description: L2T['السيرة النبوية'], items: seerahLessons },
          { key: 'nihaya', title: 'أحداث نهاية العالم', description: L2T['أحداث نهاية العالم'], items: nihayaLessons },
          { key: 'akhira', title: 'الدار الآخرة', description: L2T['الدار الآخرة'], items: akhiraLessons },
          { key: 'waqafat', title: 'وقفات تربوية جامعة', description: L2T['وقفات تربوية جامعة'], items: waqafatLessons },
        ],
      },
      {
        key: 'ibadah',
        title: 'تمهيد العبادة',
        description: 'أربعة كتب تؤسسك في مفهوم العبودية الحقيقية وتعمّق صلتك بالله — من فهم حقيقة التعبد إلى السير في طريق المتعبدين.',
        accent: 'green',
        introAudioUrl: audio('100AwKqL70ECPEeOl6T9frhU9Ef5EiZ_f'),
        sections: [
          { key: 'books', title: 'كتب تمهيد العبادة', description: L2I['كتب تمهيد العبادة'], items: ibadahBooks.map(book) },
        ],
      },
    ],
  },
  {
    number: 3,
    title: 'المستوى الثالث',
    subtitle: 'المستوى الثالث يضم مسارَين: تمهيد التزكية لبناء الأساس التربوي الداخلي، وتمهيد الدعوة والإصلاح لتأسيس الوعي الدعوي ومنهج المصلح.',
    tracks: [
      {
        key: 'tazkiyah',
        title: 'تمهيد التزكية',
        description: 'خمسة مراجع تؤسس البنية التربوية الداخلية — من مقدمات التزكية وتزكية العقل والجسد والقلب، إلى دستور الملتزم وأسس الوعي التربوي والوصية الصغرى والخلاصة في التربية.',
        accent: 'gold',
        introAudioUrl: audio('1p401qD_gmcTOJT6OmTTrPzolXQPDLRyt'),
        sections: [
          { key: 'intro', title: 'مقدمات في التزكية', description: L3T['مقدمات في التزكية'], items: tazkiyahIntroBooks.map(book) },
          { key: 'waey', title: 'تأسيس الوعي التربوي', description: L3T['تأسيس الوعي التربوي'], items: [book(tazkiyahBook2)] },
          { key: 'dustoor', title: 'دستور الملتزم الجديد', description: L3T['دستور الملتزم الجديد'], items: [book(tazkiyahBook3)] },
          { key: 'wasiya', title: 'تفريغ شرح الوصية الصغرى', description: L3T['تفريغ شرح الوصية الصغرى'], items: [book(tazkiyahBook4)] },
          { key: 'khulasa', title: 'الخلاصة في التربية', description: L3T['الخلاصة في التربية'], items: [book(tazkiyahBook5)] },
        ],
      },
      {
        key: 'dawah',
        title: 'تمهيد الدعوة والإصلاح',
        description: 'بناء الوعي الدعوي ومنهج المصلح — ثلاثة كتب في أصول الدعوة تضع المعالم الكبرى للعمل الدعوي والإصلاحي.',
        accent: 'blue',
        introAudioUrl: audio('1TIbJyZyRpu4hgICWAHpRpSQ6_jGRICyC'),
        sections: [
          { key: 'waey', title: 'تأسيس الوعي الدعوي', description: L3D['تأسيس الوعي الدعوي'], items: [book(dawahBook1)] },
          { key: 'ilm', title: 'علم الدعوة إلى الله تعالى', description: L3D['علم الدعوة إلى الله تعالى'], items: [book(dawahBook2)] },
          { key: 'maalim', title: 'معالم في أصول الدعوة', description: L3D['معالم في أصول الدعوة'], items: [book(dawahBook3)] },
        ],
      },
    ],
  },
  {
    number: 4,
    title: 'المستوى الرابع',
    subtitle: 'التمهيد العام — ثلاثة مسارات تُكمل البناء: دروس تأسيسية في فهم الإسلام، وخمسة كتب مرجعية، وثماني قوائم تشغيل تُغطي الثقافة المتكاملة والإشكاليات الفكرية وفقه التصورات ومنهاج النبوة.',
    tracks: [
      {
        key: 'lessons',
        title: 'الدروس',
        description: 'دروس تأسيسية ومحورية في فهم الإسلام والاهتداء بالقرآن — من مقدمات فهم النصوص الشرعية إلى معالم الهداية بالقرآن.',
        accent: 'green',
        introAudioUrl: audio('1ZBpHj4ORHxnHtX4TpOOlEmzrVWUJZ2cS'),
        sections: [
          { key: 'general', title: 'مقدمات في فهم الإسلام', description: L4L['مقدمات في فهم الإسلام'], items: generalLessons },
        ],
      },
      {
        key: 'playlists',
        title: 'قوائم التشغيل',
        description: 'ثماني قوائم تشغيل شاملة — الثقافة المتكاملة، والدروس المحورية، وسلسلة الإشكاليات، وفقه التصورات، والعقلية الإدارية، ودفتر وعي، ومنهاج النبوة.',
        accent: 'blue',
        introAudioUrl: audio('1kZzjoE6dOlIEY5y4FbjduiFV8M1qykFN'),
        sections: [
          ['p1', 'الثقافة المتكاملة وفيديوهات أخرى', playlist1],
          ['p2', 'دروس محورية', playlist2],
          ['p3', 'سلسلة إشكاليات', playlist3],
          ['p4', 'إحياء منهاج النبوة', playlist4],
          ['p5', 'شرح المنهاج من ميراث النبوة', playlist5],
          ['p6', 'العقلية الإدارية', playlist6],
          ['p7', 'دفتر وعي', playlist7],
          ['p8', 'فقه التصورات', playlist8],
        ].map(([key, title, items]) => ({ key, title, description: L4P[title], items })),
      },
      {
        key: 'books',
        title: 'الكتب',
        description: 'خمسة كتب مرجعية تُكمل التأسيس العام — من مدخل فهم الإسلام وشخصية المسلم إلى مفاهيم أهل السنة والأسئلة الأربعة بجزأيها.',
        accent: 'gold',
        introAudioUrl: audio('1rM0IEIir0sS_sQYetYVZgae3P6aVCLQo'),
        sections: [
          { key: 'b1', title: 'مدخل لفهم الإسلام', description: L4B['مدخل لفهم الإسلام'], items: [book(generalBook1)] },
          { key: 'b2', title: 'المختصر في خلق المسلم', description: L4B['المختصر في خلق المسلم'], items: [book(generalBook2)] },
          { key: 'b3', title: 'شخصية المسلم', description: L4B['شخصية المسلم'], items: [book(generalBook3)] },
          { key: 'b4', title: 'خلاصة مفاهيم أهل السنة والجماعة', description: L4B['خلاصة مفاهيم أهل السنة والجماعة'], items: [book(generalBook4)] },
          { key: 'b5', title: 'الأسئلة الأربعة', description: L4B['الأسئلة الأربعة'], items: generalBook5Parts.map(book) },
        ],
      },
    ],
  },
];
