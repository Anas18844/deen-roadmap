-- Row Level Security (spec §10). Content of a locked level is invisible to students; progress is read-only
-- for its owner (writes go through the rule functions); anon gets nothing.

-- ── Visibility helpers (security definer so policies don't recurse through other tables' RLS) ──

create function public.track_is_visible(p_track_id uuid, p_level_limit int)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.tracks t join public.levels l on l.id = t.level_id
    where t.id = p_track_id and t.is_published and l.is_published and l.number <= p_level_limit
  );
$$;

create function public.section_is_visible(p_section_id uuid, p_level_limit int)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.sections s
    left join public.sections p on p.id = s.parent_id
    where s.id = p_section_id and s.is_published
      and (p.id is null or p.is_published)
      and public.track_is_visible(s.track_id, p_level_limit)
  );
$$;

-- ── Enable RLS everywhere ───────────────────────────────────────────────────
alter table public.levels enable row level security;
alter table public.tracks enable row level security;
alter table public.sections enable row level security;
alter table public.items enable row level security;
alter table public.profiles enable row level security;
alter table public.placement_requests enable row level security;
alter table public.item_completions enable row level security;
alter table public.level_completions enable row level security;
alter table public.section_notes enable row level security;
alter table public.activity_days enable row level security;
alter table public.progress_snapshots enable row level security;

-- ── Anonymous visitors get nothing ─────────────────────────────────────────
revoke all on all tables in schema public from anon;
revoke execute on all functions in schema public from anon;
alter default privileges in schema public revoke all on tables from anon;
alter default privileges in schema public revoke execute on functions from anon;

-- ── Content ─────────────────────────────────────────────────────────────────
create policy levels_read on public.levels for select to authenticated
  using (is_published or (select public.is_admin()));

create policy tracks_read on public.tracks for select to authenticated
  using ((select public.is_admin()) or public.track_is_visible(id, (select public.my_current_level())));

create policy sections_read on public.sections for select to authenticated
  using ((select public.is_admin()) or public.section_is_visible(id, (select public.my_current_level())));

create policy items_read on public.items for select to authenticated
  using ((select public.is_admin())
         or (is_published and public.section_is_visible(section_id, (select public.my_current_level()))));

create policy levels_admin_write on public.levels for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy tracks_admin_write on public.tracks for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy sections_admin_write on public.sections for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy items_admin_write on public.items for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- ── Profiles: own row (or admin); students edit only their personal fields ─
create policy profiles_read on public.profiles for select to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));
create policy profiles_update_own on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

revoke insert, update, delete on public.profiles from authenticated;
grant update (full_name, governorate, age, previous_courses) on public.profiles to authenticated;

-- ── Progress: read own (or admin); no direct writes ────────────────────────
create policy placement_requests_read on public.placement_requests for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));
create policy item_completions_read on public.item_completions for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));
create policy level_completions_read on public.level_completions for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));
create policy section_notes_read on public.section_notes for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));
create policy activity_days_read on public.activity_days for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));
create policy progress_snapshots_read on public.progress_snapshots for select to authenticated
  using ((select public.is_admin()));

revoke insert, update, delete on
  public.placement_requests, public.item_completions, public.level_completions,
  public.section_notes, public.activity_days, public.progress_snapshots
from authenticated;

-- Policies evaluate these as the querying user, so authenticated keeps EXECUTE (they only return a boolean).
