-- Admins are recognised by email: whoever signs up (Google or email/password) with one of these
-- addresses becomes an admin automatically. No passwords are created for anyone.

create table public.admin_emails (
  email text primary key check (email = lower(email))
);
alter table public.admin_emails enable row level security;
revoke all on public.admin_emails from anon, authenticated;

insert into public.admin_emails (email) values ('spaniol188@gmail.com'), ('rodmab2006@gmail.com');

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    case when exists (select 1 from public.admin_emails a where a.email = lower(new.email)) then 'admin' else 'student' end
  );
  return new;
end;
$$;

-- Anyone on the list who already signed up becomes admin now.
update public.profiles p set role = 'admin'
where exists (select 1 from public.admin_emails a where a.email = lower(p.email));
