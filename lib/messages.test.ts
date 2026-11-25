import { describe, expect, it } from 'vitest';
import { TEMPLATES, fillTemplate, waMessageLink } from './messages';

describe('WhatsApp message templates', () => {
  it('fills the student first name, lesson and idle days', () => {
    const t = 'السلام عليكم يا {الاسم}، افتقدناك منذ {الأيام} يومًا — درسك التالي: {الدرس}';
    expect(fillTemplate(t, { name: 'محمد أحمد علي', days: 9, lesson: 'مهارة الحفظ (١)' })).toBe(
      'السلام عليكم يا محمد، افتقدناك منذ 9 يومًا — درسك التالي: مهارة الحفظ (١)',
    );
  });
  it('drops sentences whose value is missing instead of leaving a placeholder', () => {
    expect(fillTemplate('أهلًا {الاسم}. درسك التالي: {الدرس}.', { name: 'عمر' })).toBe('أهلًا عمر.');
  });
  it('builds an encoded wa.me link', () => {
    expect(waMessageLink('+201012345678', 'السلام عليكم')).toBe(`https://wa.me/201012345678?text=${encodeURIComponent('السلام عليكم')}`);
  });
  it('ships a follow-up template for inactive students', () => {
    expect(TEMPLATES.some((t) => t.key === 'idle')).toBe(true);
  });
});
