begin;
select plan(6);

select tests.create_user('a@x.com', 'أحمد');

select is((select email from public.profiles where email = 'a@x.com'), 'a@x.com', 'signup creates a profile');
select is((select role from public.profiles where email = 'a@x.com'), 'student', 'new profiles are students');
select is((select full_name from public.profiles where email = 'a@x.com'), 'أحمد', 'profile takes full_name from metadata');

insert into public.placement_requests (user_id, requested_level)
select id, 3 from public.profiles where email = 'a@x.com';

select throws_ok(
  $$ insert into public.placement_requests (user_id, requested_level)
     select id, 2 from public.profiles where email = 'a@x.com' $$,
  '23505', null,
  'only one pending placement request per student'
);

select tests.create_user('Rodmab2006@gmail.com', 'محمد');
select is((select role from public.profiles where email = 'Rodmab2006@gmail.com'), 'admin', 'listed admin email becomes admin on signup (case-insensitive)');
select is((select role from public.profiles where email = 'a@x.com'), 'student', 'other emails stay students');

select * from finish();
rollback;
