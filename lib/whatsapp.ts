// Same rule as public.normalize_whatsapp() in supabase/migrations/20261124000800_whatsapp.sql.
const AR = '٠١٢٣٤٥٦٧٨٩';

export function normalizeWhatsapp(raw: string): string | null {
  const v = raw.replace(/[٠-٩]/g, (d) => String(AR.indexOf(d))).replace(/[^0-9+]/g, '');
  if (/^01[0125]\d{8}$/.test(v)) return `+2${v}`;
  if (/^00[1-9]\d{7,14}$/.test(v)) return `+${v.slice(2)}`;
  if (/^\+[1-9]\d{7,14}$/.test(v)) return v;
  if (/^201[0125]\d{8}$/.test(v)) return `+${v}`;
  return null;
}

export const waLink = (phone: string) => `https://wa.me/${phone.replace(/^\+/, '')}`;
