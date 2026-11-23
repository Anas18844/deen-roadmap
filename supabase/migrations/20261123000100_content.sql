-- Content model: level → track → section (→ sub-section) → item.
-- Spec §7. RLS is enabled in 20261123000400_rls.sql.

create table public.levels (
  id uuid primary key default gen_random_uuid(),
  number int not null unique check (number >= 1),
  title text not null,
  subtitle text,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.tracks (
  id uuid primary key default gen_random_uuid(),
  level_id uuid not null references public.levels on delete cascade,
  title text not null,
  description text,
  accent text not null default 'green' check (accent in ('green', 'gold', 'blue')),
  intro_audio_url text,
  sort int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);
create index tracks_level_id_idx on public.tracks (level_id);

create table public.sections (
  id uuid primary key default gen_random_uuid(),
  track_id uuid not null references public.tracks on delete cascade,
  parent_id uuid references public.sections on delete cascade,
  title text not null,
  description text,
  intro_audio_url text,
  sort int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);
create index sections_track_id_idx on public.sections (track_id);
create index sections_parent_id_idx on public.sections (parent_id);

create type public.item_kind as enum ('video', 'book');

create table public.items (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.sections on delete cascade,
  kind public.item_kind not null,
  title text not null,
  full_title text,
  description text,
  url text not null,
  duration_seconds int check (duration_seconds is null or duration_seconds >= 0),
  pages int check (pages is null or pages > 0),
  points int not null default 1 check (points >= 0),
  points_is_manual boolean not null default false,
  sort int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index items_section_id_idx on public.items (section_id);

-- Points rule (spec §7): video = 1 per started 10 minutes (min 1); book = 1 per started 20 pages, 5 if unknown.
create function public.compute_points(p_kind public.item_kind, p_duration_seconds int, p_pages int)
returns int
language sql
immutable
set search_path = ''
as $$
  select case p_kind
    when 'video' then
      case when p_duration_seconds is null then 1
           else greatest(1, ceil(p_duration_seconds / 600.0)::int) end
    else
      case when p_pages is null then 5
           else greatest(1, ceil(p_pages / 20.0)::int) end
  end;
$$;

create function public.items_set_points()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not new.points_is_manual then
    new.points := public.compute_points(new.kind, new.duration_seconds, new.pages);
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create trigger items_set_points
before insert or update on public.items
for each row execute function public.items_set_points();

create function public.section_level_number(p_section_id uuid)
returns int
language sql
stable
security definer
set search_path = ''
as $$
  select l.number
  from public.sections s
  join public.tracks t on t.id = s.track_id
  join public.levels l on l.id = t.level_id
  where s.id = p_section_id;
$$;

create function public.item_level_number(p_item_id uuid)
returns int
language sql
stable
security definer
set search_path = ''
as $$
  select public.section_level_number(i.section_id) from public.items i where i.id = p_item_id;
$$;
