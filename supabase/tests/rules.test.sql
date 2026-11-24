begin;
select plan(43);
delete from public.levels; -- start from empty content (seed rolls back with the transaction)

-- ── Fixture ─────────────────────────────────────────────────────────────
-- L1: track with top section «قسم 1» (2 videos) + top section «مداخل» with two sub-sections (1 video each)
-- L2: 1 video. L3: 1 video.
select tests.make_level(1, 2);
select tests.make_level(2, 1);
select tests.make_level(3, 1);
select tests.make_level(4, 1);

insert into public.sections (track_id, title, sort)
select t.id, 'مداخل', 2 from public.tracks t join public.levels l on l.id = t.level_id where l.number = 1;
insert into public.sections (track_id, parent_id, title, sort)
select s.track_id, s.id, x.title, x.sort from public.sections s, (values ('فقه', 1), ('عقيدة', 2)) x(title, sort)
where s.title = 'مداخل';
insert into public.items (section_id, kind, title, url, duration_seconds)
select s.id, 'video', 'درس ' || s.title, 'https://youtu.be/sub_' || s.sort, 600
from public.sections s where s.parent_id is not null;

select set_config('t.qism1',  (select id::text from public.sections where title = 'قسم 1'), true);
select set_config('t.madakhel', (select id::text from public.sections where title = 'مداخل'), true);
select set_config('t.sub_a',  (select id::text from public.sections where title = 'فقه'), true);
select set_config('t.i11', (select id::text from public.items where url = 'https://youtu.be/x1_1'), true);
select set_config('t.i12', (select id::text from public.items where url = 'https://youtu.be/x1_2'), true);
select set_config('t.isa', (select id::text from public.items where url = 'https://youtu.be/sub_1'), true);
select set_config('t.isb', (select id::text from public.items where url = 'https://youtu.be/sub_2'), true);
select set_config('t.i21', (select id::text from public.items where url = 'https://youtu.be/x2_1'), true);
select set_config('t.note', repeat('أ', 300), true);

select set_config('t.s1',  tests.create_user('s1@x.com')::text, true);
select set_config('t.s2',  tests.create_user('s2@x.com')::text, true);
select set_config('t.s3',  tests.create_user('s3@x.com')::text, true);
select set_config('t.s4',  tests.create_user('s4@x.com')::text, true);
select set_config('t.s5',  tests.create_user('s5@x.com')::text, true);
select set_config('t.adm', tests.create_user('adm@x.com')::text, true);
update public.profiles set role = 'admin' where email = 'adm@x.com';

-- ── Onboarding ──────────────────────────────────────────────────────────
select tests.as_user(current_setting('t.s1')::uuid);
select lives_ok($$ select public.complete_onboarding('سالم', 'القاهرة', 20, '', 'new') $$, 'onboarding_new_student');
select is(public.my_current_level(), 1, 'new student starts at level 1');
select ok((select onboarded_at is not null from public.profiles where id = auth.uid()), 'onboarded_at is set');
select throws_ok($$ select public.complete_onboarding('سالم', 'القاهرة', 20, '', 'new') $$,
  'P0001', 'already_onboarded', 'onboarding_twice_rejected');

select tests.as_user(current_setting('t.s5')::uuid);
select throws_ok($$ select public.complete_onboarding('   ', 'القاهرة', 20, '', 'new') $$,
  'P0001', 'invalid_input', 'blank name rejected');
select throws_ok($$ select public.complete_onboarding('سعيد', 'القاهرة', 20, '', 'returning', 9) $$,
  'P0001', 'invalid_input', 'requested level beyond last published rejected');

-- ── Placement requests ──────────────────────────────────────────────────
select tests.as_user(current_setting('t.s2')::uuid);
select public.complete_onboarding('سامي', 'الجيزة', 30, 'دورات سابقة', 'returning', 4);
select is((select status from public.placement_requests where user_id = auth.uid()), 'pending',
  'returning_creates_pending_request');
select is(public.my_current_level(), 1, 'returning student waits at level 1');
select set_config('t.req2', (select id::text from public.placement_requests where user_id = auth.uid()), true);
select throws_ok($$ select public.decide_placement(current_setting('t.req2')::uuid, true) $$,
  'P0001', 'not_admin', 'student cannot decide placements');

select tests.as_user(current_setting('t.adm')::uuid);
select lives_ok($$ select public.decide_placement(current_setting('t.req2')::uuid, true) $$, 'admin approves');
select throws_ok($$ select public.decide_placement(current_setting('t.req2')::uuid, true) $$,
  'P0001', 'not_pending', 'decided request cannot be decided again');

select tests.as_user(current_setting('t.s2')::uuid);
select is(public.my_current_level(), 4, 'approve_placement_opens_level');

select lives_ok($$ select public.complete_item(current_setting('t.i11')::uuid) $$, 'placed student may mark skipped-level items');
select lives_ok($$ select public.uncomplete_item(current_setting('t.i11')::uuid) $$, 'uncomplete_in_placement_level_allowed');

select tests.as_postgres();
update public.levels set is_published = false where number = 4;
select is(public.user_current_level(current_setting('t.s2')::uuid), 3, 'current_level_capped_at_last_published');
update public.levels set is_published = true where number = 4;
select is(public.user_current_level(current_setting('t.s2')::uuid), 4, 'publishing a level opens it automatically');

select tests.as_user(current_setting('t.s3')::uuid);
select public.complete_onboarding('سمير', 'أسوان', 25, '', 'returning', 4);
select set_config('t.req3', (select id::text from public.placement_requests where user_id = auth.uid()), true);
select tests.as_user(current_setting('t.adm')::uuid);
select public.decide_placement(current_setting('t.req3')::uuid, false);
select tests.as_user(current_setting('t.s3')::uuid);
select is(public.my_current_level(), 1, 'reject_placement_keeps_level');
select lives_ok($$ select public.request_placement(4) $$, 'rejected student can request again');
select throws_ok($$ select public.request_placement(4) $$, 'P0001', 'not_pending', 'second_pending_request_rejected');

-- levels 2–3 are placed immediately, without a pending request
select tests.as_user(current_setting('t.s5')::uuid);
select public.complete_onboarding('سعيد', 'القاهرة', 20, '', 'returning', 3);
select is(public.my_current_level(), 3, 'returning to level 3 opens it immediately');
select is((select status from public.placement_requests where user_id = auth.uid()), 'approved', 'level-3 placement is recorded as approved');

-- ── Items ───────────────────────────────────────────────────────────────
select tests.as_user(current_setting('t.s1')::uuid);
select throws_ok($$ select public.complete_item(current_setting('t.i21')::uuid) $$,
  'P0001', 'item_locked', 'complete_item_locked_level');

select public.complete_item(current_setting('t.i11')::uuid);
select public.complete_item(current_setting('t.i11')::uuid);
select tests.as_postgres();
select is((select count(*)::int from public.item_completions where user_id = current_setting('t.s1')::uuid), 1,
  'complete_item_is_idempotent (completions)');
select is((select count(*)::int from public.activity_days where user_id = current_setting('t.s1')::uuid), 1,
  'complete_item_is_idempotent (activity)');

update public.items set points = 7, points_is_manual = true where id = current_setting('t.i11')::uuid;
select is((select points_awarded from public.item_completions
           where user_id = current_setting('t.s1')::uuid and item_id = current_setting('t.i11')::uuid), 1,
  'points_frozen_at_completion');

-- ── Section notes ───────────────────────────────────────────────────────
select tests.as_user(current_setting('t.s1')::uuid);
select throws_ok($$ select public.save_section_note(current_setting('t.qism1')::uuid, current_setting('t.note')) $$,
  'P0001', 'section_incomplete', 'note_before_section_done');

select public.complete_item(current_setting('t.i12')::uuid);
select throws_ok($$ select public.save_section_note(current_setting('t.qism1')::uuid, repeat(' ', 300) || repeat('أ', 299)) $$,
  'P0001', 'too_short', 'note_whitespace_padding_rejected');
select throws_ok($$ select public.save_section_note(current_setting('t.qism1')::uuid, repeat(chr(10), 300)) $$,
  'P0001', 'too_short', 'note of newlines rejected');
select throws_ok($$ select public.save_section_note(current_setting('t.qism1')::uuid, repeat(chr(160), 150) || repeat(chr(8207), 150)) $$,
  'P0001', 'too_short', 'note of NBSP / RTL marks rejected');
select throws_ok($$ select public.save_section_note(current_setting('t.qism1')::uuid, 'أ' || repeat(chr(10) || chr(9) || ' ', 200) || repeat('ب', 250)) $$,
  'P0001', 'too_short', 'internal whitespace padding does not count');
select throws_ok($$ select public.save_section_note(current_setting('t.sub_a')::uuid, current_setting('t.note')) $$,
  'P0001', 'not_top_section', 'note_on_subsection_rejected');
select throws_ok($$ select public.save_section_note(current_setting('t.madakhel')::uuid, current_setting('t.note')) $$,
  'P0001', 'section_incomplete', 'top section waits for its sub-sections');

select public.complete_item(current_setting('t.isa')::uuid);
select public.complete_item(current_setting('t.isb')::uuid);
select is(public.save_section_note(current_setting('t.madakhel')::uuid, current_setting('t.note')),
  '{"level_completed": false, "level_number": 1}'::jsonb, 'note_opens_when_all_subsections_done');

select is(public.save_section_note(current_setting('t.qism1')::uuid, current_setting('t.note')),
  '{"level_completed": true, "level_number": 1}'::jsonb, 'level_completes_after_items_and_notes');
select is(public.my_current_level(), 2, 'next level opens');
select is(public.save_section_note(current_setting('t.qism1')::uuid, current_setting('t.note') || ' تعديل'),
  '{"level_completed": false, "level_number": 1}'::jsonb, 'level_completion_reported_once');

select throws_ok($$ select public.uncomplete_item(current_setting('t.i11')::uuid) $$,
  'P0001', 'level_closed', 'uncomplete_in_closed_level');

-- new content in an already completed level
select tests.as_postgres();
insert into public.items (section_id, kind, title, url, duration_seconds)
values (current_setting('t.qism1')::uuid, 'video', 'درس جديد', 'https://youtu.be/new', 600);
select tests.as_user(current_setting('t.s1')::uuid);
select is(public.my_current_level(), 2, 'new_item_does_not_reopen_completed_level');
select lives_ok($$ select public.complete_item((select id from public.items where url = 'https://youtu.be/new')) $$,
  'new item in completed level can still be marked');

-- ── Streak ──────────────────────────────────────────────────────────────
select tests.as_postgres();
insert into public.activity_days (user_id, day)
select current_setting('t.s4')::uuid, (now() at time zone 'Africa/Cairo')::date - d from unnest(array[0, 1, 2, 9]) d;
select is(public.current_streak(current_setting('t.s4')::uuid), 3, 'streak_counts_consecutive_days');
delete from public.activity_days where user_id = current_setting('t.s4')::uuid;
insert into public.activity_days (user_id, day)
values (current_setting('t.s4')::uuid, (now() at time zone 'Africa/Cairo')::date - 3);
select is(public.current_streak(current_setting('t.s4')::uuid), 0, 'streak resets after a missed day');

-- ── Concurrency: progress writes are serialised per student ──────────────
select ok(pg_get_functiondef('public.complete_item(uuid)'::regprocedure) like '%pg_advisory_xact_lock%', 'complete_item takes a per-user lock');
select ok(pg_get_functiondef('public.save_section_note(uuid,text)'::regprocedure) like '%pg_advisory_xact_lock%', 'save_section_note takes a per-user lock');

select * from finish();
rollback;
