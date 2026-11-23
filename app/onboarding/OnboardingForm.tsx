'use client';

import { useActionState, useState } from 'react';
import { completeOnboarding } from '@/app/actions';

const GOVERNORATES = [
  'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'الشرقية', 'المنوفية', 'الغربية', 'كفر الشيخ', 'دمياط',
  'بورسعيد', 'الإسماعيلية', 'السويس', 'شمال سيناء', 'جنوب سيناء', 'الفيوم', 'بني سويف', 'المنيا', 'أسيوط',
  'سوهاج', 'قنا', 'الأقصر', 'أسوان', 'البحيرة', 'مرسى مطروح', 'الوادي الجديد', 'البحر الأحمر', 'خارج مصر',
];

export default function OnboardingForm({
  defaultName,
  email,
  levels,
}: {
  defaultName: string;
  email: string;
  levels: { number: number; title: string }[];
}) {
  const [state, action, pending] = useActionState(completeOnboarding, undefined);
  const [entry, setEntry] = useState<'new' | 'returning'>('new');

  return (
    <form className="uform" action={action}>
      <div className="uform-field">
        <label htmlFor="full_name">الاسم <span className="uform-req">*</span></label>
        <input id="full_name" name="full_name" defaultValue={defaultName} required placeholder="اسمك الكريم" />
      </div>
      {email && (
        <div className="uform-field">
          <label htmlFor="email">البريد الإلكتروني</label>
          <input id="email" value={email} readOnly className="uform-readonly" dir="ltr" />
        </div>
      )}
      <div className="uform-field">
        <label htmlFor="governorate">المحافظة <span className="uform-req">*</span></label>
        <select id="governorate" name="governorate" required defaultValue="">
          <option value="" disabled>اختر محافظتك</option>
          {GOVERNORATES.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>
      <div className="uform-field">
        <label htmlFor="age">العمر <span className="uform-req">*</span></label>
        <input id="age" name="age" type="number" min={7} max={100} required placeholder="مثال: 25" />
      </div>
      <div className="uform-field">
        <label htmlFor="previous_courses">الدورات أو الكتب التي درستها سابقًا</label>
        <textarea id="previous_courses" name="previous_courses" rows={3} placeholder="اختياري" />
      </div>

      <div className="uform-field">
        <label>هل أنت ملتحق جديد أم كنت معنا من قبل؟ <span className="uform-req">*</span></label>
        <div className="choice">
          <label>
            <input type="radio" name="entry_type" value="new" checked={entry === 'new'} onChange={() => setEntry('new')} />
            طالب جديد
          </label>
          <label>
            <input type="radio" name="entry_type" value="returning" checked={entry === 'returning'} onChange={() => setEntry('returning')} />
            كنت معكم من قبل
          </label>
        </div>
      </div>

      {entry === 'returning' && levels.length > 0 && (
        <div className="uform-field">
          <label htmlFor="requested_level">آخر مستوى وصلت إليه <span className="uform-req">*</span></label>
          <select id="requested_level" name="requested_level" required defaultValue="">
            <option value="" disabled>اختر المستوى</option>
            {levels.map((l) => <option key={l.number} value={l.number}>{l.title}</option>)}
          </select>
          <p className="alert alert--info" style={{ marginTop: '0.5rem' }}>
            سيُرسل طلبك إلى الأستاذ محمد لمراجعته. إلى أن تتم الموافقة تبدأ من المستوى الأول.
          </p>
        </div>
      )}

      {state?.error && <p className="uform-error">{state.error}</p>}
      <button className="uform-submit" type="submit" disabled={pending}>
        {pending ? 'جارٍ الحفظ…' : 'حفظ وابدأ الرحلة'}
      </button>
    </form>
  );
}
