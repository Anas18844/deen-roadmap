const MESSAGES: Record<string, string> = {
  not_authenticated: 'سجّل الدخول أولًا.',
  already_onboarded: 'بياناتك مسجّلة بالفعل.',
  invalid_input: 'تأكد من إكمال كل الخانات المطلوبة.',
  invalid_whatsapp: 'رقم الواتساب غير صحيح — اكتب رقم الموبايل كاملًا (مثال: 01012345678).',
  not_admin: 'هذه الصفحة للمشرفين فقط.',
  not_pending: 'يوجد طلب قيد المراجعة بالفعل، أو تمت مراجعة هذا الطلب.',
  item_locked: 'هذا الدرس في مستوى لم يُفتح بعد.',
  level_closed: 'هذا المستوى مكتمل، ولا يمكن التراجع عن دروسه.',
  not_top_section: 'المدونة تُكتب للأقسام الرئيسية فقط.',
  section_incomplete: 'أكمل كل دروس هذا القسم أولًا.',
  too_short: 'اكتب 300 حرف على الأقل.',
  invalid_invite: 'رابط الدعوة غير صالح أو انتهى.',
  email_taken: 'هذا البريد مسجّل بالفعل لطالب آخر.',
  invalid_question: 'السؤال يحتاج نصًّا، واختيارين إلى ستة (كل اختيار في سطر)، ورقم الإجابة الصحيحة.',
};

const FALLBACK = 'حدث خطأ غير متوقع، حاول مرة أخرى.';

export function toArabicError(err: unknown): string {
  if (err && typeof err === 'object' && 'message' in err) {
    const message = (err as { message: unknown }).message;
    if (typeof message === 'string' && message in MESSAGES) return MESSAGES[message];
  }
  return FALLBACK;
}
