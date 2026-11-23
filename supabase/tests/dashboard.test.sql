begin;
select plan(14);
delete from public.levels;

select tests.make_level(1, 2);
select tests.make_level(2, 1);
select set_config('t.s', tests.create_user('s@x.com')::text, true);
select set_config('t.sec1', (select id::text from public.sections where title = 'قسم 1'), true);

select tests.as_user(current_setting('t.s')::uuid);
select public.complete_onboarding('سالم', 'القاهرة', 20, '', 'new');
select public.complete_item((select id from public.items where url = 'https://youtu.be/x1_1'));

select set_config('t.d', public.my_dashboard()::text, true);
select is((current_setting('t.d')::jsonb ->> 'current_level')::int, 1, 'dashboard: current level');
select is((current_setting('t.d')::jsonb ->> 'total_points')::int, 1, 'dashboard: points');
select is((current_setting('t.d')::jsonb ->> 'streak')::int, 1, 'dashboard: streak');
select is(current_setting('t.d')::jsonb #>> '{next,title}', 'درس 2', 'dashboard: next item is the first unfinished one');
select is(current_setting('t.d')::jsonb #>> '{levels,0,status}', 'open', 'level 1 open');
select is((current_setting('t.d')::jsonb #>> '{levels,0,pct}')::numeric, 50.0, 'level 1 at 50%');
select is(current_setting('t.d')::jsonb #>> '{levels,1,status}', 'locked', 'level 2 locked');
select is(current_setting('t.d')::jsonb #> '{levels,1,pct}', 'null'::jsonb, 'locked level reveals no progress numbers');

select public.complete_item((select id from public.items where url = 'https://youtu.be/x1_2'));
select set_config('t.d', public.my_dashboard()::text, true);
select is(current_setting('t.d')::jsonb -> 'next', 'null'::jsonb, 'no next item once all are done');
select is(current_setting('t.d')::jsonb #>> '{pending_note,title}', 'قسم 1', 'pending note points to the finished section');

select public.save_section_note(current_setting('t.sec1')::uuid, repeat('أ', 300));
select set_config('t.d', public.my_dashboard()::text, true);
select is(current_setting('t.d')::jsonb #>> '{levels,0,status}', 'completed', 'level 1 completed');
select is((current_setting('t.d')::jsonb ->> 'current_level')::int, 2, 'level 2 is current');

select throws_ok($$ select public.admin_refresh_stats() $$, 'P0001', 'not_admin', 'students cannot refresh stats');

select tests.as_anon();
select throws_ok($$ select public.my_dashboard() $$, '42501', null, 'anon cannot call my_dashboard');

select * from finish();
rollback;
