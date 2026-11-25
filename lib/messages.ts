// WhatsApp message templates for Mohamed. Placeholders: {الاسم} (first name), {الدرس} (next lesson), {الأيام} (idle days), {المستوى}.

export interface MessageVars {
  name?: string | null;
  lesson?: string | null;
  days?: number | null;
  level?: number | string | null;
}

export const TEMPLATES = [
  {
    key: 'idle',
    label: 'متابعة متوقف',
    text: 'السلام عليكم ورحمة الله يا {الاسم}، افتقدناك في خريطة الطريق منذ {الأيام} يومًا. درسك التالي: «{الدرس}». ننتظرك، ولو في شيء يعطّلك أخبرني وأساعدك بإذن الله.',
  },
  {
    key: 'encourage',
    label: 'تشجيع',
    text: 'السلام عليكم يا {الاسم}، ما شاء الله على مواظبتك في المستوى {المستوى}. استمر، نسأل الله أن يبارك فيك وينفع بك.',
  },
  {
    key: 'congrats',
    label: 'تهنئة بإتمام مستوى',
    text: 'مبارك يا {الاسم} إتمامك المستوى {المستوى}! نسأل الله أن يجعل ما تعلمته حجة لك، ونراك في المستوى التالي بإذن الله.',
  },
  { key: 'free', label: 'رسالة حرة', text: 'السلام عليكم يا {الاسم}، ' },
] as const;

const firstName = (full?: string | null) => (full ?? '').trim().split(/\s+/)[0] ?? '';

/** Fill placeholders; a sentence whose value is missing is dropped rather than shown with a raw placeholder. */
export function fillTemplate(text: string, v: MessageVars): string {
  const values: Record<string, string> = {
    'الاسم': firstName(v.name),
    'الدرس': v.lesson ?? '',
    'الأيام': v.days != null ? String(v.days) : '',
    'المستوى': v.level != null ? String(v.level) : '',
  };
  return text
    .split(/(?<=[.!؟?،])\s+/)
    .filter((sentence) => !/\{([^}]+)\}/.test(sentence) || [...sentence.matchAll(/\{([^}]+)\}/g)].every((m) => values[m[1]]))
    .map((sentence) => sentence.replace(/\{([^}]+)\}/g, (_, k) => values[k] ?? ''))
    .join(' ')
    .trim();
}

export const waMessageLink = (phone: string, text: string) =>
  `https://wa.me/${phone.replace(/^\+/, '')}?text=${encodeURIComponent(text)}`;
