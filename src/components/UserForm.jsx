import { useState } from 'react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import './UserForm.css';

const GOVERNORATES = [
  'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'الشرقية',
  'المنوفية', 'الغربية', 'كفر الشيخ', 'دمياط', 'بورسعيد',
  'الإسماعيلية', 'السويس', 'شمال سيناء', 'جنوب سيناء', 'الفيوم',
  'بني سويف', 'المنيا', 'أسيوط', 'سوهاج', 'قنا',
  'الأقصر', 'أسوان', 'البحيرة', 'مرسى مطروح', 'الوادي الجديد', 'البحر الأحمر',
];

export default function UserForm() {
  const { user, setNeedsProfile } = useAuth();
  const [form, setForm] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
    governorate: '',
    age: '',
    previousCourses: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.governorate || !form.age) {
      setError('يرجى تعبئة جميع الحقول المطلوبة.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await setDoc(doc(db, 'users', user.uid), {
        name: form.name.trim(),
        email: form.email,
        governorate: form.governorate,
        age: Number(form.age),
        previousCourses: form.previousCourses.trim(),
        createdAt: serverTimestamp(),
      });
      setNeedsProfile(false);
    } catch (err) {
      setError('حدث خطأ أثناء الحفظ، حاول مرة أخرى.');
      setSaving(false);
    }
  };

  return (
    <div className="uform-overlay">
      <div className="uform-card">
        <div className="uform-header">
          <h2 className="uform-title">أهلاً وسهلاً</h2>
          <p className="uform-subtitle">أكمل بياناتك لتبدأ رحلتك في طلب العلم</p>
        </div>

        <form className="uform" onSubmit={handleSubmit} noValidate>
          <div className="uform-field">
            <label htmlFor="name">الاسم <span className="uform-req">*</span></label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="اسمك الكريم"
              required
            />
          </div>

          <div className="uform-field">
            <label htmlFor="email">البريد الإلكتروني</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              readOnly
              className="uform-readonly"
            />
          </div>

          <div className="uform-field">
            <label htmlFor="governorate">المحافظة <span className="uform-req">*</span></label>
            <select
              id="governorate"
              name="governorate"
              value={form.governorate}
              onChange={handleChange}
              required
            >
              <option value="" disabled>اختر محافظتك</option>
              {GOVERNORATES.map((gov) => (
                <option key={gov} value={gov}>{gov}</option>
              ))}
            </select>
          </div>

          <div className="uform-field">
            <label htmlFor="age">العمر <span className="uform-req">*</span></label>
            <input
              id="age"
              name="age"
              type="number"
              min="10"
              max="100"
              value={form.age}
              onChange={handleChange}
              placeholder="مثال: 25"
              required
            />
          </div>

          <div className="uform-field">
            <label htmlFor="previousCourses">الدورات أو الكتب التي درستها سابقًا</label>
            <textarea
              id="previousCourses"
              name="previousCourses"
              value={form.previousCourses}
              onChange={handleChange}
              placeholder="اذكر ما درسته من كتب أو دورات في الفقه والعقيدة وغيرها... (اختياري)"
              rows={4}
            />
          </div>

          {error && <p className="uform-error">{error}</p>}

          <button className="uform-submit" type="submit" disabled={saving}>
            {saving ? 'جارٍ الحفظ...' : 'حفظ وابدأ الرحلة'}
          </button>
        </form>
      </div>
    </div>
  );
}
