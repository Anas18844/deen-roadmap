-- Student data: profiles, placement requests, progress. Spec §8.
-- Students never write these tables directly; writes go through the functions in 20261123000300_rules.sql.

create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  role text not null default 'student' check (role in ('student', 'admin')),
  email text,
  full_name text,
  governorate text,
  age int check (age is null or age between 7 and 100),
  previous_courses text,
  entry_type text check (entry_type in ('new', 'returning')),
  onboarded_at timestamptz,
  last_active_at timestamptz,
  created_at timestamptz not null default now()
);

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create table public.placement_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles on delete cascade,
  requested_level int not null check (requested_level >= 2),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  decided_by uuid references public.profiles on delete set null,
  decided_at timestamptz,
  created_at timestamptz not null default now()
);
create unique index placement_requests_one_pending_idx
  on public.placement_requests (user_id) where status = 'pending';

create table public.item_completions (
  user_id uuid not null references public.profiles on delete cascade,
  item_id uuid not null references public.items on delete cascade,
  points_awarded int not null,
  completed_at timestamptz not null default now(),
  primary key (user_id, item_id)
);
create index item_completions_item_id_idx on public.item_completions (item_id);

create table public.level_completions (
  user_id uuid not null references public.profiles on delete cascade,
  level_id uuid not null references public.levels on delete cascade,
  via text not null check (via in ('earned', 'placement')),
  completed_at timestamptz not null default now(),
  primary key (user_id, level_id)
);

create table public.section_notes (
  user_id uuid not null references public.profiles on delete cascade,
  section_id uuid not null references public.sections on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, section_id)
);

create table public.activity_days (
  user_id uuid not null references public.profiles on delete cascade,
  day date not null,
  primary key (user_id, day)
);

create table public.progress_snapshots (
  id uuid primary key default gen_random_uuid(),
  taken_at timestamptz not null default now(),
  data jsonb not null
);
