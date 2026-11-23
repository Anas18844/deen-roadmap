import { describe, expect, it } from 'vitest';
import { NOTE_MIN, noteLength } from './notes';

describe('noteLength (mirrors public.note_length in SQL)', () => {
  it('counts plain text', () => {
    expect(noteLength('أب ت')).toBe(4);
  });
  it('collapses whitespace runs and trims, including NBSP and RTL marks', () => {
    expect(noteLength('  أ \n\n\t ب\u00A0\u200F ')).toBe(3);
    expect(noteLength('\n'.repeat(300))).toBe(0);
  });
  it('uses a 300 character minimum', () => {
    expect(NOTE_MIN).toBe(300);
  });
});
