'use client';

import { useRef, useState, useTransition } from 'react';
import { addStudent } from '../actions';

const GOVERNORATES = [
  'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'الشرقية', 'المنوفية', 'الغربية', 'كفر الشيخ', 'دمياط',
  'بورسعيد', 'الإسماعيلية', 'السويس', 'شمال سيناء', 'جنوب سيناء', 'الفيوم', 'بني سويف', 'المنيا', 'أسيوط',
  'سوهاج', 'قنا', 'الأقصر', 'أسوان', 'البحيرة', 'مرسى مطروح', 'الوادي الجديد', 'البحر الأحمر', 'خارج مصر',
];

export default function AddStudentForm({ levels }: { levels: { number: number; title: string }[] }) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  if (!open) return <button className="btn btn--sm" onClick={() => setOpen(true)}>إضافة طالب</button>;

  return (
    <section className="panel">
      <h2 className="panel__title">إضافة طالب مباشرة</h2>
      <p className="panel__hint">يُضاف الطالب فورًا من غير ما يسجّل. يدخل بعدها بحساب Google على نفس البريد، أو من «نسيت كلمة المرور» ليختار كلمة مروره.</p>
      <form
        ref={formRef}
        className="form"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          start(async () => {
            const r = await addStudent(fd);
            setMsg(r.ok ? { ok: true, text: r.message ?? 'تمت الإضافة' } : { ok: false, text: r.error });
            if (r.ok) formRef.current?.reset();
          });
        }}
      >
        <div className="grid-3">
          <div className="field"><label>الاسم *</label><input name="full_name" required /></div>
          <div className="field"><label>البريد الإلكتروني *</label><input name="email" type="email" dir="ltr" required /></div>
          <div className="field"><label>رقم الواتساب *</label><input name="whatsapp" type="tel" dir="ltr" required placeholder="01xxxxxxxxx" /></div>
          <div className="field">
            <label>المحافظة *</label>
            <select name="governorate" required defaultValue="">
              <option value="" disabled>اختر</option>
              {GOVERNORATES.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div className="field"><label>العمر *</label><input name="age" type="number" min={7} max={100} required /></div>
          <div className="field">
            <label>يبدأ من</label>
            <select name="level" defaultValue="1">
              {levels.map((l) => <option key={l.number} value={l.number}>{l.title}</option>)}
            </select>
          </div>
        </div>
        <div className="field"><label>الدراسة السابقة (اختياري)</label><input name="previous_courses" /></div>
        <div className="row-actions">
          <button className="btn" disabled={pending}>{pending ? '…' : 'إضافة الطالب'}</button>
          <button type="button" className="btn btn--ghost" onClick={() => setOpen(false)}>إغلاق</button>
          {msg && <span className={msg.ok ? 'badge' : 'badge badge--red'}>{msg.text}</span>}
        </div>
      </form>
    </section>
  );
}
