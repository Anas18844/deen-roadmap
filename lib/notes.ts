// Same rule as public.note_length() in supabase/migrations/20261123000600_hardening.sql:
// every run of whitespace counts as one space, leading/trailing whitespace counts as nothing.
export const NOTE_MIN = 300;

const WS = /[\s\u00A0\u1680\u2000-\u200F\u2028\u2029\u202F\u205F\u3000\uFEFF]+/g;

export function noteLength(body: string): number {
  return body.replace(WS, ' ').trim().length;
}
