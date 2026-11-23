begin;
select plan(20);
delete from public.levels; -- start from empty content (seed rolls back with the transaction)

-- Fixture: L1 (2 videos + 1 unpublished), L2 (1 video). Student s at level 1, another student o, admin a.
select tests.make_level(1, 2);
select tests.make_level(2, 1);
insert into public.items (section_id, kind, title, url, is_published)
select id, 'video', 'مخفي', 'https://youtu.be/hidden', false from public.sections where title = 'قسم 1';
insert into public.progress_snapshots (data) values ('{}');

select set_config('t.s', tests.create_user('s@x.com')::text, true);
select set_config('t.o', tests.create_user('o@x.com')::text, true);
select set_config('t.a', tests.create_user('a@x.com')::text, true);
update public.profiles set role = 'admin' where email = 'a@x.com';
select set_config('t.i11', (select id::text from public.items where url = 'https://youtu.be/x1_1'), true);
select set_config('t.sec1', (select id::text from public.sections where title = 'قسم 1'), true);

-- ── Student ─────────────────────────────────────────────────────────────
select tests.as_user(current_setting('t.s')::uuid);

select is((select count(*)::int from public.items where url like 'https://youtu.be/x2_%'), 0,
  'student_cannot_read_locked_level_items');
select is((select count(*)::int from public.tracks t join public.levels l on l.id = t.level_id where l.number = 2), 0,
  'locked level tracks hidden');
select is((select count(*)::int from public.sections where title = 'قسم 2'), 0, 'locked level sections hidden');
select is((select count(*)::int from public.items where url like 'https://youtu.be/x1_%'), 2, 'open level items visible');
select is((select count(*)::int from public.items where url = 'https://youtu.be/hidden'), 0, 'unpublished_item_hidden');
select is((select count(*)::int from public.levels where number = 2), 1, 'student_sees_locked_level_title');

select throws_ok(
  $$ insert into public.item_completions (user_id, item_id, points_awarded)
     values (auth.uid(), current_setting('t.i11')::uuid, 100) $$,
  '42501', null, 'student_cannot_insert_completion_directly');
select throws_ok($$ update public.profiles set role = 'admin' where id = auth.uid() $$,
  '42501', null, 'student_cannot_promote_self');
select throws_ok($$ insert into public.levels (number, title) values (9, 'x') $$,
  '42501', null, 'student cannot create content');

select lives_ok($$ update public.profiles set full_name = 'اسم جديد' where id = auth.uid() $$,
  'student can edit own name');
select is((select full_name from public.profiles where id = auth.uid()), 'اسم جديد', 'own profile readable and updated');
select is((select count(*)::int from public.profiles where id = current_setting('t.o')::uuid), 0,
  'student_cannot_read_other_profile');
select is((select count(*)::int from public.progress_snapshots), 0, 'student cannot read snapshots');

select lives_ok($$ select public.complete_item(current_setting('t.i11')::uuid) $$, 'rule functions still work under RLS');
select is((select count(*)::int from public.item_completions), 1, 'student reads own completions');

-- ── Anonymous ───────────────────────────────────────────────────────────
select tests.as_anon();
select throws_ok($$ select * from public.levels $$, '42501', null, 'anon_sees_nothing (levels)');
select throws_ok($$ select * from public.items $$, '42501', null, 'anon_sees_nothing (items)');
select throws_ok($$ select * from public.profiles $$, '42501', null, 'anon_sees_nothing (profiles)');

-- ── Admin ───────────────────────────────────────────────────────────────
select tests.as_user(current_setting('t.a')::uuid);
select is((select count(*)::int from public.items), 4, 'admin_reads_everything (incl. unpublished and locked)');
select lives_ok(
  $$ insert into public.items (section_id, kind, title, url)
     values (current_setting('t.sec1')::uuid, 'book', 'كتاب', 'https://drive.google.com/x') $$,
  'admin_can_insert_item');

select * from finish();
rollback;
