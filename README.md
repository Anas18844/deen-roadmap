# خريطة الطريق — Deen Roadmap (v2)

منصة تعليمية متدرجة: 4 مستويات، ومسارات، ودروس وكتب. كل طالب له مسار شخصي: يعلّم «خلّصته» على كل درس، ويكتب مدونة (300 حرف على الأقل) بعد كل قسم، والمستوى التالي لا يُفتح إلا بعد إتمام السابق 100%. للأستاذ محمد لوحة متابعة وإدارة محتوى.

- التصميم: [`docs/superpowers/specs/2026-11-23-deen-roadmap-v2-design.md`](docs/superpowers/specs/2026-11-23-deen-roadmap-v2-design.md)
- التطبيق القديم (Vite + Firebase) محفوظ في `legacy/` كمرجع فقط.

## التقنيات

- **Next.js 15** (App Router، TypeScript) على Vercel.
- **Supabase:** Postgres، وAuth (Google + بريد/كلمة مرور)، وRLS، وpg_cron.
- **القواعد كلها في الداتابيز:** القفل، والنقاط، والمدونة، وطلبات المستوى. كلها دوال `security definer` وRLS، في [`supabase/migrations/`](supabase/migrations/).
- **الاختبارات:**
  - pgTAP: [`supabase/tests/`](supabase/tests/)
  - Vitest: [`lib/`](lib/) و[`scripts/`](scripts/)
  - smoke tests: [`scripts/smoke*.mjs`](scripts/)

## التشغيل المحلي

يحتاج Docker Desktop.

```bash
npm install
npx supabase start -x realtime,storage-api,imgproxy,studio,edge-runtime,logflare,vector,mailpit,supavisor,postgres-meta
npx supabase db reset          # migrations + seed (505 درس)
npm run dev                    # http://localhost:3000
```

- **`.env.development.local`:** فيه مفاتيح الـ stack المحلي، وبيتقرا وقت `next dev` بس، ومتجاهل في git. تجيب قيمه بـ `npx supabase status -o env`.
- **`.env.local`:** فيه مفاتيح المشروع الحقيقي و`YOUTUBE_API_KEY`.
- **Windows:** شغّل الاختبارات من `D:/…` بحرف كبير، عشان vitest بيتلخبط مع `d:`.

## الاختبارات

```bash
npx supabase test db                                           # 102 اختبار للداتابيز
npx vitest run                                                 # helpers
node --env-file=.env.development.local scripts/smoke.mjs       # رحلة الطالب (السيرفر شغال على 3000)
node --env-file=.env.development.local scripts/smoke-admin.mjs # لوحة الأدمن
```

## تحديث المحتوى القديم

```bash
node scripts/build-seed.mjs   # legacy/src/data → supabase/seed.sql (IDs ثابتة)
```

بعد الإطلاق، المحتوى بيتدار من **لوحة المتابعة ← المحتوى**: تلصق لينك يوتيوب أو لينك playlist، والعنوان والمدة والنقاط بيتحسبوا لوحدهم.

## النشر (أول مرة)

1. **الداتابيز (مشروع Supabase الحقيقي):**

   ```bash
   npx supabase login
   npx supabase link --project-ref <project-ref>
   npx supabase db push --include-seed
   ```

2. **Supabase ← Authentication ← URL Configuration:**
   - Site URL = لينك Vercel.
   - Redirect URLs = `https://<vercel-domain>/**` و`http://localhost:3000/**`.

3. **Vercel:** اعمل مشروع جديد من الريبو، وحط فيه متغيرات البيئة دي:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SECRET_KEY`
   - `YOUTUBE_API_KEY`

4. **الأدمن:** بعد ما أنس والأستاذ محمد يسجلوا دخول أول مرة، شغّل في SQL Editor:

   ```sql
   update public.profiles set role = 'admin' where email in ('<email-1>', '<email-2>');
   ```

5. **مدد الفيديوهات:** من لوحة المتابعة ← المحتوى ← «جلب المدد من يوتيوب»، مرة واحدة. ده بيحسب نقاط الـ 505 درس.

6. **الإيميلات:** اربط SMTP (مثلًا Brevo) من Supabase ← Authentication ← SMTP، عشان رسائل التأكيد ونسيت كلمة المرور توصل بشكل موثوق.

## الرخصة

هذا المشروع لوجه الله تعالى. يُسمح بالنسخ والنشر والتعديل بشرط عدم التحريف والإشارة للمصدر.
