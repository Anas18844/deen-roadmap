'use client';

import { useEffect, useState } from 'react';

/** Animated "working on it" bar with rotating step labels, shown while an admin action runs. */
export default function Processing({ steps }: { steps: string[] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (steps.length < 2) return;
    const t = setInterval(() => setI((x) => Math.min(x + 1, steps.length - 1)), 900);
    return () => clearInterval(t);
  }, [steps.length]);
  return (
    <div className="processing" role="status" aria-live="polite">
      <div className="processing__bar"><span /></div>
      <span className="processing__label">{steps[i]}</span>
    </div>
  );
}

/** Keep the processing state on screen long enough to be read. */
export async function withMinDuration<T>(p: Promise<T>, ms = 1500): Promise<T> {
  const [r] = await Promise.all([p, new Promise((res) => setTimeout(res, ms))]);
  return r;
}

export const STEPS = {
  video: ['جارٍ قراءة رابط الفيديو…', 'جارٍ جلب بياناته من يوتيوب…', 'جارٍ حساب المدة والنقاط…', 'جارٍ الحفظ…'],
  playlist: ['جارٍ قراءة قائمة التشغيل…', 'جارٍ جلب الفيديوهات من يوتيوب…', 'جارٍ حساب المدد والنقاط…', 'جارٍ إنشاء القسم والدروس…'],
  book: ['جارٍ تجهيز الملف…', 'جارٍ رفع الكتاب…', 'جارٍ معالجة الملف…', 'جارٍ الحفظ…'],
  audio: ['جارٍ تجهيز الصوتية…', 'جارٍ الرفع…', 'جارٍ المعالجة…', 'جارٍ الحفظ…'],
  save: ['جارٍ الحفظ…'],
};
