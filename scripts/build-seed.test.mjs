import { describe, expect, it } from 'vitest';
import { buildSeed, stableId } from './build-seed.mjs';

const map = [
  {
    number: 1,
    title: 'المستوى الأول',
    subtitle: "تمهيد 'العلم'",
    tracks: [
      {
        key: 'learning',
        title: 'تمهيد طلب العلم',
        description: 'وصف',
        accent: 'green',
        introAudioUrl: 'https://audio/track',
        sections: [
          {
            key: 'mafateeh',
            title: 'مفاتيح الطلب',
            introAudioUrl: 'https://audio/sec',
            items: [
              { shortTitle: "درس 'أول'", url: 'https://youtu.be/a' },
              { shortTitle: 'كتاب', url: 'https://drive.google.com/file/d/x/view' },
            ],
          },
          {
            key: 'madakhel',
            title: 'مداخل العلوم',
            children: [{ key: 'fiqh', title: 'الفقه', items: [{ shortTitle: 'مكرر', url: 'https://youtu.be/a' }] }],
          },
        ],
      },
    ],
  },
];

describe('stableId', () => {
  it('is deterministic and UUID-shaped', () => {
    expect(stableId('a')).toBe(stableId('a'));
    expect(stableId('a')).not.toBe(stableId('b'));
    expect(stableId('a')).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });
});

describe('buildSeed', () => {
  const { sql, report } = buildSeed(map);

  it('escapes single quotes', () => {
    expect(sql).toContain("'درس ''أول'''");
    expect(sql).toContain("'تمهيد ''العلم'''");
  });

  it('marks Google Drive links as books', () => {
    expect(sql).toMatch(/'book', 'كتاب', null, null, 'https:\/\/drive\.google\.com\/file\/d\/x\/view'/);
  });

  it('links children to their parent section', () => {
    const parent = stableId('L1/learning/madakhel');
    const child = stableId('L1/learning/madakhel/fiqh');
    expect(sql).toContain(`('${child}', '${stableId('L1/learning')}', '${parent}'`);
  });

  it('reports item count and duplicate URLs', () => {
    expect(report.items).toBe(3);
    expect(report.duplicateUrls).toEqual([{ url: 'https://youtu.be/a', titles: ["درس 'أول'", 'مكرر'] }]);
  });
});
