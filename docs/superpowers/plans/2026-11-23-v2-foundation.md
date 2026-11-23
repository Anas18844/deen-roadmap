# خريطة الطريق v2 — الخطة 1: الأساس (Next.js + قاعدة البيانات)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** نطلع بثلاث حاجات:
- تطبيق Next.js شغال، بنفس هوية الموقع القديم.
- قاعدة بيانات Supabase كاملة: الجداول، والدوال، والصلاحيات، والإحصائيات، ومعاها اختبارات.
- سكريبت بيحوّل المحتوى القديم لـ seed.

وكل ده يكون جاهز قبل ما مشروع Supabase الحقيقي يتعمل.

**Architecture:**
- كل القواعد (القفل، والنقاط، والمدونة، وطلبات المستوى) بتتنفذ **جوه Postgres**، كدوال `security definer` + RLS.
- Next.js طبقة عرض فوق الداتابيز.
- الشغل كله بيتجرّب على **Supabase محلي** (Docker) بـ pgTAP، وبعدين الـ migrations نفسها بتتطبق على المشروع الحقيقي.

**Tech Stack:** Next.js 15 (App Router، TypeScript)، و`@supabase/ssr`، و`@supabase/supabase-js`، وSupabase CLI، وpgTAP، وVitest.

**Spec:** `docs/superpowers/specs/2026-11-23-deen-roadmap-v2-design.md`

**الخطط الجاية (كل واحدة هتتكتب لما اللي قبلها تخلص):**
- **الخطة 2:** تسجيل الدخول، والفورم، وصفحات الطالب (المستويات، و"خلّصته"، وخانات المدونة، والرئيسية، و`/me`).
- **الخطة 3:** داشبورد الأستاذ محمد (نظرة عامة، والطلبة، وطلبات المستوى، والمدونات، وإدارة المحتوى، والـ snapshots).
- **الخطة 4:** الـ Gamification، والنشر:
  - الدروع والاحتفال، والشهادات، واستيراد الـ playlist.
  - Brevo SMTP.
  - النشر على Vercel، وربط المشروع الحقيقي.

## Global Constraints

- **ممنوع** أي أمر يلمس مشروع Supabase `rhrwuqjkqflceuddfsso`، أو أدوات `mcp__supabase__*`، لأنهم بتوع موقع تاني. كل شغل الداتابيز في الخطة دي على الـ stack المحلي (`npx supabase start`).
- Docker Desktop لازم يكون شغال قبل Task 2. لو مش شغال، **وقّف واسأل أنس**.
- الموقع عربي RTL: `<html lang="ar" dir="rtl">`.
- الخطوط: Amiri وNoto Naskh Arabic.
- الألوان: من `:root` في `legacy/src/index.css`، ومن غير تغيير.
- ممنوع Tailwind. الـ CSS القديم بيتنقل كـ CSS عادي.
- **الأسرار:**
  - `.env.local` بس، وده متجاهل في git (`*.local`).
  - `SUPABASE_SECRET_KEY` و`YOUTUBE_API_KEY` ممنوع يظهروا في أي كود client.
- **كل دوال SQL** اللي بتكتب لازم تكون `security definer set search_path = ''`، وكل الأسماء فيها مؤهلة بالكامل (`public.items`، `auth.uid()`).
- **رسائل الأخطاء من الدوال:** كلمة إنجليزي ثابتة في `message`، والواجهة بتترجمها:
  - `not_authenticated`
  - `already_onboarded`
  - `invalid_input`
  - `not_admin`
  - `not_pending`
  - `item_locked`
  - `level_closed`
  - `not_top_section`
  - `section_incomplete`
  - `too_short`
- **التوقيت:** اليوم بتوقيت `Africa/Cairo` في كل حسابات النشاط والـ Streak.
- **الحد الأدنى للمدونة:** 300 حرف، بعد `btrim`، بالحساب بـ `char_length`.
- **النقاط:**
  - فيديو: `greatest(1, ceil(duration_seconds / 600.0))`، ولو المدة `null` تبقى 1.
  - كتاب: `greatest(1, ceil(pages / 20.0))`، ولو الصفحات `null` تبقى 5.
- **الـ Commits** على فرع `v2-nextjs-supabase`، وكل commit بينتهي بسطر الـ Co-Authored-By.

## Review Focus

1. **طالب يجيب عناصر مستوى مقفول** عن طريق `supabase.from('items').select()` مباشرة، أو بالـ section/track id. **المتوقع:** 0 صفوف. (اختبار في Task 5: `student_cannot_read_locked_level_items`)
2. **عنصر بيتعلّم مرتين، أو طلبين بيوصلوا في نفس الوقت:**
   - النقاط ما تتحسبش مرتين.
   - المستوى ما يتسجلش مكتمل مرتين.

   (اختبار في Task 4: `complete_item_is_idempotent`)
3. **الأستاذ محمد بيضيف عنصر جديد لمستوى عند طالب مكتمل:** المستوى يفضل مكتمل، و`my_current_level` ما يرجعش لورا. (اختبار في Task 4: `new_item_does_not_reopen_completed_level`)
4. **مدونة 300 مسافة، أو 299 حرف + مسافات:** لازم تترفض بـ `too_short`. (اختبار في Task 4: `note_whitespace_padding_rejected`)
5. **قسم رئيسي ملوش عناصر مباشرة،** وعناصره كلها في أقسام فرعية (زي "مداخل العلوم"): لازم الخانة تتفتح لما كل الفرعية تخلص، ومش تتقفل للأبد. (اختبار في Task 4: `note_opens_when_all_subsections_done`)

---

## File Structure

```
legacy/                      ← تطبيق Vite القديم بعد git mv (مرجع للنقل، بيتشال في الخطة 2)
app/layout.tsx               ← RTL + الخطوط + globals
app/page.tsx                 ← صفحة مؤقتة "قريبًا"
app/globals.css              ← منقول من legacy/src/index.css
lib/supabase/client.ts       ← createBrowserClient
lib/supabase/server.ts       ← createServerClient (cookies)
lib/supabase/errors.ts       ← ترجمة رسائل الأخطاء للعربي
supabase/config.toml         ← من supabase init
supabase/migrations/20261123000100_content.sql
supabase/migrations/20261123000200_progress.sql
supabase/migrations/20261123000300_rules.sql
supabase/migrations/20261123000400_rls.sql
supabase/migrations/20261123000500_stats.sql
supabase/tests/00_helpers.sql      ← دوال مساعدة للاختبارات (إنشاء مستخدم، authenticate as)
supabase/tests/content.test.sql
supabase/tests/rules.test.sql
supabase/tests/rls.test.sql
supabase/tests/stats.test.sql
scripts/content-map.mjs      ← هيكل المستويات/المسارات/الأقسام، بيشاور على exports في legacy/src/data
scripts/build-seed.mjs       ← بيولّد supabase/seed.sql
scripts/build-seed.test.mjs
```

---

### Task 1: هيكل Next.js، ونقل الهوية

**Files:**
- Move: `src/` و`index.html` و`vite.config.js` و`eslint.config.js` و`vercel.json` ← `legacy/` (بـ `git mv`)
- Delete: `dist/`، واعتمادات `firebase` و`vite` و`@vercel/analytics` من `package.json`
- Create:
  - `package.json` (سكريبتات `dev`، و`build`، و`start`، و`lint`، و`test` = `vitest run`، و`db:test` = `supabase test db`)
  - `tsconfig.json`، و`next.config.ts`، و`next-env.d.ts`
  - `app/layout.tsx`، و`app/page.tsx`، و`app/globals.css`
  - `lib/supabase/client.ts`، و`lib/supabase/server.ts`، و`lib/supabase/errors.ts`
- Test: `lib/supabase/errors.test.ts`

**Interfaces:**
- Produces:
  - `createClient(): SupabaseClient` من `lib/supabase/client.ts`.
  - `createClient(): Promise<SupabaseClient>` من `lib/supabase/server.ts`. بيقرا `NEXT_PUBLIC_SUPABASE_URL` و`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
  - `toArabicError(err: unknown): string` من `lib/supabase/errors.ts`.

- [ ] **Step 1:** `git mv` الملفات القديمة لـ `legacy/`، وامسح `dist/`، وثبّت:
  - `next@15`، و`react@19`، و`react-dom@19`، و`@supabase/ssr`، و`@supabase/supabase-js`.
  - وdev: `typescript`، و`@types/node`، و`@types/react`، و`vitest`، و`eslint-config-next`، و`supabase`.

  وشيل `firebase` و`vite` و`@vitejs/plugin-react` و`@vercel/analytics` و`react-router-dom`.
- [ ] **Step 2: اكتب الاختبار الفاشل** `lib/supabase/errors.test.ts`:

  ```ts
  expect(toArabicError({ message: 'item_locked' })).toBe('هذا الدرس في مستوى لم يُفتح بعد.');
  expect(toArabicError({ message: 'too_short' })).toBe('اكتب 300 حرف على الأقل.');
  expect(toArabicError({ message: 'section_incomplete' })).toBe('أكمل كل دروس هذا القسم أولًا.');
  expect(toArabicError(new Error('boom'))).toBe('حدث خطأ غير متوقع، حاول مرة أخرى.');
  ```

  وكمّل باقي الأكواد اللي في Global Constraints بترجمة عربي فصحى بسيطة.
- [ ] **Step 3:** `npx vitest run lib/supabase/errors.test.ts` ← المفروض FAIL.
- [ ] **Step 4:** نفّذ `errors.ts`، والـ clients (بالنمط الرسمي لـ `@supabase/ssr` مع Next 15 cookies)، و`layout.tsx`.
  - `layout.tsx` فيه: `lang="ar" dir="rtl"`، والخطوط بـ `next/font/google` (Amiri وNoto_Naskh_Arabic)، وبتتربط بـ `--font-body` و`--font-heading`.
  - `globals.css` = محتوى `legacy/src/index.css` + `legacy/src/App.css`.
  - `page.tsx`: عنوان "خريطة الطريق" + "النسخة الجديدة قيد الإعداد".
- [ ] **Step 5:** `npx vitest run` ← PASS. وبعدين `npm run build` ← المفروض ينجح من غير أخطاء TypeScript.
- [ ] **Step 6:** `npm run dev`، وافتح `http://localhost:3000`. اتأكد إن الصفحة RTL، وبخط Amiri، وبخلفية البيج.
- [ ] **Step 7: Commit** `chore: انتقال لـ Next.js، والتطبيق القديم في legacy/`

---

### Task 2: Supabase محلي + جداول المحتوى + النقاط

**Files:**
- Create:
  - `supabase/config.toml` (بـ `npx supabase init`)
  - `supabase/migrations/20261123000100_content.sql`
  - `supabase/tests/00_helpers.sql`
  - `supabase/tests/content.test.sql`

**Interfaces:**
- Produces (جداول `public`):
  - **`levels`:** `id uuid pk default gen_random_uuid()`، و`number int unique not null check (number >= 1)`، و`title text not null`، و`subtitle text`، و`is_published bool default true`، و`created_at`.
  - **`tracks`:** `id`، و`level_id → levels on delete cascade`، و`title`، و`description`، و`accent text check in ('green','gold','blue') default 'green'`، و`intro_audio_url text`، و`sort int not null default 0`، و`is_published`.
    - **ملحوظة:** `intro_audio_url` على المسار إضافة على الـ spec، لأن صفحات المسار القديمة فيها تنبيه صوتي عام قبل الأقسام.
  - **`sections`:** `id`، و`track_id → tracks cascade`، و`parent_id → sections cascade null`، و`title`، و`description`، و`intro_audio_url`، و`sort`، و`is_published`.
  - **`item_kind`:** enum فيه `('video','book')`.
  - **`items`:** `id`، و`section_id → sections cascade`، و`kind item_kind not null`، و`title not null`، و`full_title`، و`description`، و`url not null`، و`duration_seconds int`، و`pages int`، و`points int not null default 1`، و`points_is_manual bool default false`، و`sort`، و`is_published`، و`created_at`، و`updated_at`.
  - **`compute_points(p_kind item_kind, p_duration_seconds int, p_pages int) returns int`:** `immutable`، والقيم من Global Constraints.
  - **trigger `items_set_points`:** `before insert or update`. لو `not points_is_manual` يبقى `points := compute_points(...)`.
  - **`item_level_number(p_item_id uuid) returns int`:** `stable`، بيمشي من القسم للمسار للمستوى.
  - **`section_level_number(p_section_id uuid) returns int`.**
- Produces (helpers للاختبارات في `00_helpers.sql`، schema `tests`):
  - `tests.create_user(p_email text) returns uuid`: بيعمل insert في `auth.users`.
  - `tests.as_user(p_user uuid)`: بيعمل `set local role authenticated` + `request.jwt.claims` بـ `sub`.
  - `tests.as_anon()`.
  - `tests.as_postgres()`.
  - `tests.make_level(p_number int, p_items int) returns uuid`: بيعمل مستوى فيه مسار واحد، وقسم رئيسي واحد، و`p_items` فيديو.

- [ ] **Step 1:** شغّل Docker Desktop، وبعدين `npx supabase init` و`npx supabase start`. المفروض يطبع API URL محلي.
- [ ] **Step 2: اكتب الاختبار الفاشل** `content.test.sql` (pgTAP، `begin; select plan(n); ... select * from finish(); rollback;`):
  - `compute_points('video', 600, null) = 1`.
  - `compute_points('video', 601, null) = 2`.
  - `compute_points('video', 3600, null) = 6`.
  - `compute_points('video', null, null) = 1`.
  - `compute_points('book', null, 100) = 5`.
  - `compute_points('book', null, 21) = 2`.
  - `compute_points('book', null, null) = 5`.
  - insert فيديو `duration_seconds=1800` ← `points = 3`.
  - update لـ `points=10, points_is_manual=true`، وبعده update للمدة ← `points` يفضل 10.
  - `item_level_number(item) = 1`.
- [ ] **Step 3:** `npx supabase test db` ← المفروض FAIL.
- [ ] **Step 4:** اكتب `20261123000100_content.sql` و`00_helpers.sql`. وبعدين `npx supabase db reset`.
- [ ] **Step 5:** `npx supabase test db` ← PASS.
- [ ] **Step 6: Commit** `feat(db): جداول المحتوى وحساب النقاط`

---

### Task 3: جداول بيانات الطالب

**Files:**
- Create:
  - `supabase/migrations/20261123000200_progress.sql`
  - إضافات على `supabase/tests/content.test.sql`، أو ملف جديد `progress.test.sql`

**Interfaces:**
- Produces:
  - **`profiles`:**
    - `id uuid pk → auth.users on delete cascade`.
    - `role text not null default 'student' check in ('student','admin')`.
    - `email text`، و`full_name text`، و`governorate text`.
    - `age int check (age between 7 and 100)`.
    - `previous_courses text`.
    - `entry_type text check in ('new','returning')`.
    - `onboarded_at timestamptz`، و`last_active_at timestamptz`، و`created_at`.
  - **trigger `on_auth_user_created`** على `auth.users`: بيعمل insert في `profiles(id, email, full_name)`. الاسم من `raw_user_meta_data->>'full_name'`، ولو مش موجود من `->>'name'`.
  - **`placement_requests`:**
    - `id`، و`user_id → profiles cascade`.
    - `requested_level int not null check (requested_level >= 2)`.
    - `status text not null default 'pending' check in ('pending','approved','rejected')`.
    - `decided_by uuid → profiles`، و`decided_at`، و`created_at`.
    - unique index جزئي على `(user_id) where status = 'pending'`.
  - **`item_completions`:** `(user_id → profiles cascade, item_id → items cascade)` PK، و`points_awarded int not null`، و`completed_at default now()`.
  - **`level_completions`:** `(user_id, level_id → levels cascade)` PK، و`via text check in ('earned','placement')`، و`completed_at`.
  - **`section_notes`:** `(user_id, section_id → sections cascade)` PK، و`body text not null`، و`created_at`، و`updated_at`.
  - **`activity_days`:** `(user_id, day date)` PK.
  - **`progress_snapshots`:** `id`، و`taken_at timestamptz default now()`، و`data jsonb not null`.

- [ ] **Step 1: اختبار فاشل:**
  - `tests.create_user('a@x.com')` ← فيه صف في `profiles` بالإيميل ده و`role='student'`.
  - insert طلب `pending` تاني لنفس الطالب ← `throws_ok` (unique violation).
- [ ] **Step 2:** `npx supabase test db` ← FAIL.
- [ ] **Step 3:** اكتب الـ migration، وبعدين `npx supabase db reset`.
- [ ] **Step 4:** `npx supabase test db` ← PASS.
- [ ] **Step 5: Commit** `feat(db): جداول بيانات الطالب والتقدّم`

---

### Task 4: قواعد السيرفر (الدوال)

**Files:**
- Create:
  - `supabase/migrations/20261123000300_rules.sql`
  - `supabase/tests/rules.test.sql`

**Interfaces** (كلها `security definer set search_path = ''`، وكلها بتستخدم `auth.uid()` وبترمي `not_authenticated` لو `null`):

- **`is_admin() returns boolean`**
- **`user_current_level(p_user uuid) returns int`:** `least(coalesce(max number من level_completions للطالب, 0) + 1, max(number) من levels المنشورة)`. ولو مفيش مستويات منشورة ترجع 1.
- **`my_current_level() returns int`** = `user_current_level(auth.uid())`.
- **`current_streak(p_user uuid) returns int`:** عدد الأيام المتتالية في `activity_days`.
  - بتنتهي بالنهارده أو امبارح (بتوقيت القاهرة).
  - لو آخر يوم قبل امبارح، تبقى 0.
- **`complete_onboarding(p_full_name text, p_governorate text, p_age int, p_previous_courses text, p_entry_type text, p_requested_level int default null) returns void`:**
  - بترمي `already_onboarded` لو `onboarded_at` مش null.
  - بترمي `invalid_input` لو الاسم فاضي، أو `entry_type='returning'` و`p_requested_level` مش بين 2 وأعلى مستوى منشور.
  - لو `returning`: بتعمل insert في `placement_requests`.
- **`request_placement(p_level int) returns void`:**
  - لطالب onboarded اترفض طلبه، وعايز يبعت طلب تاني.
  - بنفس فحص `invalid_input` بتاع المستوى.
  - بترمي `not_pending` لو فيه طلب معلّق.
- **`decide_placement(p_request_id uuid, p_approve boolean) returns void`:**
  - `not_admin`، و`not_pending`.
  - لو موافقة: insert `level_completions(via='placement')` لكل مستوى منشور `number < requested_level`، مع `on conflict do nothing`.
- **`complete_item(p_item_id uuid) returns jsonb`:**
  - `item_locked` لو العنصر أو قسمه أو مساره أو مستواه مش منشور، أو `item_level_number > my_current_level()`.
  - insert مع `on conflict do nothing`، و`points_awarded = items.points`.
  - upsert في `activity_days` (اليوم بتوقيت القاهرة)، وupdate لـ `last_active_at`.
  - بترجع `{"level_completed": bool, "level_number": int}` من `try_complete_level`.
- **`uncomplete_item(p_item_id uuid) returns void`:** بترمي `level_closed` لو فيه `level_completions` بـ `via='earned'` لمستوى العنصر.
- **`save_section_note(p_section_id uuid, p_body text) returns jsonb`:**
  - `item_locked` لو مستوى القسم أعلى من الحالي.
  - `not_top_section` لو `parent_id` مش null.
  - `section_incomplete` لو فيه عنصر منشور في القسم أو أي قسم فرعي منشور تحته ما خلصش.
  - `too_short` لو `char_length(btrim(p_body)) < 300`.
  - upsert، وبعدين `try_complete_level`، وبترجع نفس شكل `complete_item`.
- **`try_complete_level(p_user uuid, p_level_id uuid) returns boolean`:**
  - مش متاحة للـ `authenticated` (`revoke execute ... from public, anon, authenticated`).
  - بترجع `true` بس لو سجّلت إكمال **جديد** (`earned`) في المرة دي.
  - الشرط: كل العناصر المنشورة (في أقسام ومسارات منشورة) مكتملة، **و** كل قسم رئيسي منشور له `section_notes`.
  - مستوى من غير ولا عنصر ما يكملش.

- [ ] **Step 1: اكتب الاختبارات الفاشلة** في `rules.test.sql`، كل واحد بـ `tests.as_user`:
  - `onboarding_new_student`: بعد `complete_onboarding(... 'new')` يبقى `my_current_level() = 1`، و`onboarded_at` مش null.
  - `onboarding_twice_rejected` ← `throws_ok(..., 'already_onboarded')`.
  - `returning_creates_pending_request`: `requested_level=3` ← صف `pending`، والمستوى الحالي يفضل 1.
  - `approve_placement_opens_level`: الأدمن يوافق ← `my_current_level() = 3` للطالب. والطالب نفسه لو نادى `decide_placement` ← `not_admin`.
  - `reject_placement_keeps_level`: الأدمن يرفض ← المستوى يفضل 1، و`request_placement(3)` تنجح بعدها.
  - `second_pending_request_rejected`: `request_placement` وفيه طلب معلّق ← `not_pending`.
  - `complete_item_locked_level` ← `item_locked` لعنصر في المستوى 2.
  - `complete_item_is_idempotent`: نناديها مرتين ← صف واحد في `item_completions`، وصف واحد في `activity_days`.
  - `points_frozen_at_completion`: نغيّر `items.points` بعد الإكمال ← `points_awarded` ما يتغيرش.
  - `note_before_section_done` ← `section_incomplete`.
  - `note_whitespace_padding_rejected`: `repeat(' ', 300) || repeat('أ', 299)` ← `too_short`.
  - `note_on_subsection_rejected` ← `not_top_section`.
  - `note_opens_when_all_subsections_done`: قسم رئيسي من غير عناصر مباشرة، وتحته قسمين فرعيين ← الخانة تتقبل بعد ما الاتنين يخلصوا.
  - `level_completes_after_items_and_notes`: آخر خانة ← `{"level_completed": true, "level_number": 1}`، و`my_current_level() = 2`.
  - `level_completion_reported_once`: إعادة حفظ نفس الخانة ← `level_completed: false`.
  - `new_item_does_not_reopen_completed_level`: بعد الإكمال نضيف عنصر ← `my_current_level()` يفضل 2، و`complete_item` على العنصر الجديد ينجح.
  - `uncomplete_in_closed_level` ← `level_closed`.
  - `uncomplete_in_placement_level_allowed`.
  - `current_level_capped_at_last_published`: مستويين بس، والطالب خلّص الاتنين ← 2. ولما ننشر مستوى 3 ← 3.
  - `streak_counts_consecutive_days`: نعمل insert في `activity_days` للنهارده وامبارح وأول امبارح، وقبل كده بأسبوع ← 3. ولو آخر يوم من 3 أيام ← 0.
- [ ] **Step 2:** `npx supabase test db` ← FAIL.
- [ ] **Step 3:** اكتب `20261123000300_rules.sql`، و`npx supabase db reset`.
- [ ] **Step 4:** `npx supabase test db` ← كله PASS.
- [ ] **Step 5: Commit** `feat(db): قواعد القفل والنقاط والمدونة وطلبات المستوى`

---

### Task 5: الصلاحيات (RLS)

**Files:**
- Create:
  - `supabase/migrations/20261123000400_rls.sql`
  - `supabase/tests/rls.test.sql`

**Interfaces:**
- **Produces:** `enable row level security` على كل جداول `public`، و`revoke all ... from anon` على كل الجداول، والـ policies اللي في جدول قسم 10 في الـ spec، بالتفاصيل دي:
  - **`levels`:** select للـ `authenticated` لو `is_published or is_admin()`.
  - **`tracks` و`sections` و`items`:**
    - select لو `is_admin()`، أو (منشور **و** مستواه ≤ `my_current_level()` **و** كل الآباء منشورين).
    - insert وupdate وdelete للأدمن بس.
  - **`profiles`:**
    - select لو `id = auth.uid() or is_admin()`.
    - update لصاحبه، و**عمود بعمود**: `grant update (full_name, governorate, age, previous_courses) on profiles to authenticated`، ومفيش update على `role` أو `onboarded_at`.
  - **جداول التقدّم الخمسة:** select لو `user_id = auth.uid() or is_admin()`، و**مفيش** policies لـ insert/update/delete. يعني الكتابة عن طريق الدوال بس.
  - **`progress_snapshots`:** select للأدمن بس.
  - **`grant execute`** للـ `authenticated` على:
    - `complete_onboarding`، و`request_placement`، و`decide_placement`
    - `complete_item`، و`uncomplete_item`، و`save_section_note`
    - `my_current_level`، و`is_admin`، و`current_streak`

- [ ] **Step 1: اختبارات فاشلة** في `rls.test.sql`:
  - `student_cannot_read_locked_level_items`: طالب في المستوى 1 ← `select count(*) from items` جوه المستوى 2 = 0، ونفس الكلام للـ `tracks` والـ `sections`.
  - `student_sees_locked_level_title`: يشوف صف المستوى 2 في `levels`.
  - `unpublished_item_hidden`.
  - `student_cannot_insert_completion_directly` ← `throws_ok` على insert في `item_completions`.
  - `student_cannot_promote_self` ← update على `role` يفشل.
  - `student_cannot_read_other_profile` ← 0 صفوف.
  - `anon_sees_nothing` ← `levels` و`items` و`profiles` كلهم 0 أو permission denied.
  - `admin_reads_everything`، و`admin_can_insert_item`.
- [ ] **Step 2:** `npx supabase test db` ← FAIL.
- [ ] **Step 3:** اكتب الـ migration، و`db reset`.
- [ ] **Step 4:** `npx supabase test db` ← PASS، ومعاه كل اختبارات Task 4. ده بيتأكد إن الدوال لسه شغالة بعد RLS.
- [ ] **Step 5:** `npx supabase db lint` ← من غير أخطاء security.
- [ ] **Step 6: Commit** `feat(db): RLS على كل الجداول`

---

### Task 6: إحصائيات الأدمن، والـ snapshots، والجدولة

**Files:**
- Create:
  - `supabase/migrations/20261123000500_stats.sql`
  - `supabase/tests/stats.test.sql`

**Interfaces:**
- **`admin_student_stats`** (materialized view، `revoke all from anon, authenticated`). الأعمدة:
  - `user_id`، و`full_name`، و`email`، و`governorate`، و`entry_type`
  - `current_level int`
  - `level_pct numeric(5,1)`: في المستوى الحالي، بالعناصر المنشورة.
  - `total_points int`
  - `last_active_at`
  - `inactive_days int`: من `coalesce(last_active_at, onboarded_at)`.
  - `streak int`
  - `has_pending_placement bool`
  - `completed_levels int`

  وفيها الطلبة الـ onboarded بس، و`role='student'`.
- **`admin_level_stats`** (materialized view): `level_number`، و`title`، و`students_count` (اللي ده مستواهم الحالي)، و`avg_pct`، و`completed_count`.
- **`stats_meta`:** `id int pk check (id = 1)`، و`refreshed_at timestamptz`.
- **`refresh_admin_stats() returns void`:** `refresh materialized view` للاتنين، وتحديث `stats_meta`. مش متاحة للـ `authenticated`.
- **`admin_get_student_stats() returns setof admin_student_stats`**، و**`admin_get_level_stats() returns setof admin_level_stats`**، و**`admin_stats_refreshed_at() returns timestamptz`:** بيرموا `not_admin` لغير الأدمن.
- **`take_progress_snapshot() returns uuid`:** بتعمل insert في `progress_snapshots`، و`data` بالشكل ده:

  ```json
  {"levels":[{"number":1,"students":…,"avg_pct":…,"completed":…}],
   "students":[{"user_id":…,"level":…,"pct":…,"points":…}]}
  ```

  وبتعمل refresh الأول.
- **pg_cron:**
  - `create extension if not exists pg_cron`.
  - `cron.schedule('refresh-admin-stats', '0 * * * *', 'select public.refresh_admin_stats()')`.
  - `cron.schedule('weekly-snapshot', '0 22 * * 4', 'select public.take_progress_snapshot()')`. الخميس 22:00 UTC = الجمعة 00:00 بتوقيت القاهرة في الشتا، وفي الصيف هتبقى 01:00، وده مقبول.

- [ ] **Step 1: اختبارات فاشلة:**
  - طالبين في المستوى 1، واحد خلّص 2/4 ← `level_pct = 50.0`.
  - `admin_level_stats` للمستوى 1: `students_count = 2`.
  - طالب `last_active_at = now() - 15 days` ← `inactive_days >= 15`.
  - الطالب ينادي `admin_get_student_stats()` ← `not_admin`.
  - `take_progress_snapshot()` بيعمل صف، و`data->'levels'` فيه المستوى 1.
  - `cron.job` فيه الجوبين.
- [ ] **Step 2:** FAIL ← نفّذ ← `db reset` ← `npx supabase test db` PASS.
- [ ] **Step 3: Commit** `feat(db): إحصائيات الأدمن والـ snapshots الأسبوعية`

---

### Task 7: سكريبت نقل المحتوى

**Files:**
- Create:
  - `scripts/content-map.mjs`
  - `scripts/build-seed.mjs`
  - `scripts/build-seed.test.mjs`
  - `supabase/seed.sql` (ده ملف متولّد، بس بيتعمله commit)

**Interfaces:**
- **`content-map.mjs`** بيصدّر `export const contentMap: Level[]`، بالشكل ده:

  ```
  Level   = { number, title, subtitle, tracks: Track[] }
  Track   = { key, title, description, accent, introAudioUrl?, sections: Section[] }
  Section = { key, title, description?, introAudioUrl?, items?: LegacyItem[], children?: Section[] }
  ```

  - `LegacyItem` = `{ shortTitle, fullTitle?, description?, url, kind? }`. والـ `kind` الافتراضي `video`، و`book` لو اللينك من `drive.google.com`.
  - **الهيكل منقول من الصفحات القديمة:**
    - كل صفحة مسار (`LearningPage`، و`TazkiyahPage`، و`Level4PlaylistsPage`...) = `Track`.
    - كل `SectionBlock` = `Section` رئيسي.
    - كل `SubjectGroup`/مرحلة/محور جواه = `children`.
    - الـ `VoiceNote` اللي برّه أي `SectionBlock` = `track.introAudioUrl`، واللي جوه = `section.introAudioUrl`.
  - العناصر بتتعمل `import` مباشرة من `../legacy/src/data/*.js`، من غير نسخ.
  - العناوين والـ subtitles بتتاخد من `PageHeader` و`track-card` في الصفحات القديمة.
- **`build-seed.mjs`** بيصدّر:
  - `stableId(path: string): string`: UUID v5-style من sha1 للمسار، زي `"L1/learning/mafateeh/3"`. نفس المدخل يدّي نفس الـ id دايمًا.
  - `buildSeed(map: Level[]): { sql: string, report: { items: number, duplicateUrls: {url, titles: string[]}[] } }`.
  - ولما يشتغل مباشرة: بيكتب `supabase/seed.sql` وبيطبع التقرير.
- `sort` = ترتيب العنصر في المصفوفة. و`duration_seconds` و`pages` = `null` (بيتملوا في الخطة 3).

- [ ] **Step 1: اختبارات فاشلة** `build-seed.test.mjs` على map صغيرة:
  - `stableId('a') === stableId('a')`، و`stableId('a') !== stableId('b')`، وشكله UUID صحيح.
  - عنوان فيه `'` بيتعمله escape لـ `''`.
  - لينك `drive.google.com` ← `'book'`.
  - لينك مكرر في عنصرين ← بيظهر في `duplicateUrls` بالعنوانين.
  - `children` ← `parent_id` = id القسم الأب.
  - `report.items` = عدد العناصر.
- [ ] **Step 2:** `npx vitest run scripts` ← FAIL.
- [ ] **Step 3:** نفّذ `build-seed.mjs`.
- [ ] **Step 4:** `npx vitest run` ← PASS.
- [ ] **Step 5:** اكتب `content-map.mjs` كامل للمستويات الأربعة، من `legacy/src/pages/*.jsx` و`legacy/src/data/*.js`.
- [ ] **Step 6:** `node scripts/build-seed.mjs`. التقرير لازم يطبع:
  - عدد عناصر قريب من عدد اللينكات في `legacy/src/data`. شغّل `grep -c "url:"` وقارن، والفرق المسموح بيه هو التنبيهات الصوتية بس.
  - تكرار "قواعد الاستقامة" / "أثر الاهتداء بالأنبياء".
- [ ] **Step 7:** `npx supabase db reset` (بيطبّق `seed.sql`)، وبعدين `npx supabase test db` ← PASS. وكمان:

  ```sql
  select l.number, count(i.*) from items i join sections s on ... group by 1
  ```

  المفروض يطلع 4 مستويات كلها فيها عناصر.
- [ ] **Step 8: Commit** `feat(content): نقل المحتوى القديم لـ seed بـ IDs ثابتة`
