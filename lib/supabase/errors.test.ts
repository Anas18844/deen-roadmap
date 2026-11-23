import { describe, expect, it } from 'vitest';
import { toArabicError } from './errors';

describe('toArabicError', () => {
  it('translates known database error codes', () => {
    expect(toArabicError({ message: 'item_locked' })).toBe('هذا الدرس في مستوى لم يُفتح بعد.');
    expect(toArabicError({ message: 'too_short' })).toBe('اكتب 300 حرف على الأقل.');
    expect(toArabicError({ message: 'section_incomplete' })).toBe('أكمل كل دروس هذا القسم أولًا.');
  });

  it('falls back to a generic message for unknown errors', () => {
    expect(toArabicError(new Error('boom'))).toBe('حدث خطأ غير متوقع، حاول مرة أخرى.');
    expect(toArabicError(null)).toBe('حدث خطأ غير متوقع، حاول مرة أخرى.');
  });
});
