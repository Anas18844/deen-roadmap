import { describe, expect, it } from 'vitest';
import { normalizeWhatsapp, waLink } from './whatsapp';

describe('normalizeWhatsapp (mirrors public.normalize_whatsapp)', () => {
  it('accepts Egyptian mobiles in any common spelling', () => {
    expect(normalizeWhatsapp('01012345678')).toBe('+201012345678');
    expect(normalizeWhatsapp('010 1234 5678')).toBe('+201012345678');
    expect(normalizeWhatsapp('٠١٠١٢٣٤٥٦٧٨')).toBe('+201012345678');
  });
  it('accepts international numbers', () => {
    expect(normalizeWhatsapp('+966501234567')).toBe('+966501234567');
    expect(normalizeWhatsapp('00966501234567')).toBe('+966501234567');
  });
  it('rejects malformed numbers', () => {
    expect(normalizeWhatsapp('12345')).toBeNull();
    expect(normalizeWhatsapp('0101234567')).toBeNull();
  });
  it('builds a wa.me link', () => {
    expect(waLink('+201012345678')).toBe('https://wa.me/201012345678');
  });
});
