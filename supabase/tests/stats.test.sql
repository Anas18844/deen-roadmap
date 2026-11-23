begin;
select plan(9);

select tests.make_level(1, 4);
select set_config('t.s1', tests.create_user('s1@x.com')::text, true);
select set_config('t.s2', tests.create_user('s2@x.com')::text, true);
select set_config('t.a',  tests.create_user('a@x.com')::text, true);
update public.profiles set role = 'admin' where email = 'a@x.com';

select tests.as_user(current_setting('t.s1')::uuid);
select public.complete_onboarding('طالب أول', 'القاهرة', 20, '', 'new');
select public.complete_item((select id from public.items where url = 'https://youtu.be/x1_1'));
select public.complete_item((select id from public.items where url = 'https://youtu.be/x1_2'));

select tests.as_user(current_setting('t.s2')::uuid);
select public.complete_onboarding('طالب ثان', 'أسوان', 22, '', 'new');

select tests.as_postgres();
update public.profiles set last_active_at = now() - interval '15 days' where email = 's2@x.com';
select public.refresh_admin_stats();

select tests.as_user(current_setting('t.a')::uuid);
select is((select level_pct from public.admin_get_student_stats() where user_id = current_setting('t.s1')::uuid),
  50.0::numeric, 'level_pct = completed / published items in current level');
select is((select total_points from public.admin_get_student_stats() where user_id = current_setting('t.s1')::uuid),
  2, 'total_points sums awarded points');
select ok((select inactive_days from public.admin_get_student_stats() where user_id = current_setting('t.s2')::uuid) >= 15,
  'inactive_days counts days since last activity');
select is((select count(*)::int from public.admin_get_student_stats()), 2, 'admins are not listed as students');
select is((select students_count from public.admin_get_level_stats() where level_number = 1), 2,
  'admin_level_stats counts students per current level');
select ok(public.admin_stats_refreshed_at() is not null, 'refresh time recorded');

select tests.as_user(current_setting('t.s1')::uuid);
select throws_ok($$ select * from public.admin_get_student_stats() $$, 'P0001', 'not_admin', 'students cannot read stats');

select tests.as_postgres();
select set_config('t.snap', public.take_progress_snapshot()::text, true);
select ok((select data -> 'levels' @> '[{"number": 1}]' from public.progress_snapshots
           where id = current_setting('t.snap')::uuid), 'take_progress_snapshot stores level numbers');
select is((select count(*)::int from cron.job where jobname in ('refresh-admin-stats', 'weekly-snapshot')), 2,
  'both cron jobs scheduled');

select * from finish();
rollback;
