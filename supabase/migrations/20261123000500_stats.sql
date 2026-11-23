-- Admin numbers without real-time (spec §12): materialized views refreshed hourly by pg_cron,
-- plus a weekly snapshot. Students never read these; admins read them through checked functions.

create materialized view public.admin_student_stats as
with s as (
  select p.id as user_id, p.full_name, p.email, p.governorate, p.entry_type,
         p.last_active_at, p.onboarded_at,
         public.user_current_level(p.id) as current_level
  from public.profiles p
  where p.role = 'student' and p.onboarded_at is not null
)
select
  s.user_id, s.full_name, s.email, s.governorate, s.entry_type,
  s.current_level,
  coalesce((
    select round(100.0 * count(c.item_id) / nullif(count(*), 0), 1)
    from public.levels l
    cross join lateral public.level_published_items(l.id) as li(item_id)
    left join public.item_completions c on c.item_id = li.item_id and c.user_id = s.user_id
    where l.number = s.current_level
  ), 0)::numeric(5, 1) as level_pct,
  coalesce((select sum(points_awarded) from public.item_completions where user_id = s.user_id), 0)::int as total_points,
  s.last_active_at,
  (public.cairo_today() - (coalesce(s.last_active_at, s.onboarded_at) at time zone 'Africa/Cairo')::date) as inactive_days,
  public.current_streak(s.user_id) as streak,
  exists (select 1 from public.placement_requests r where r.user_id = s.user_id and r.status = 'pending') as has_pending_placement,
  (select count(*)::int from public.level_completions lc where lc.user_id = s.user_id) as completed_levels
from s;

create materialized view public.admin_level_stats as
select
  l.number as level_number,
  l.title,
  (select count(*)::int from public.admin_student_stats st where st.current_level = l.number) as students_count,
  coalesce((select round(avg(st.level_pct), 1) from public.admin_student_stats st where st.current_level = l.number), 0)
    ::numeric(5, 1) as avg_pct,
  (select count(*)::int from public.level_completions lc where lc.level_id = l.id and lc.via = 'earned') as completed_count
from public.levels l
where l.is_published;

revoke all on public.admin_student_stats, public.admin_level_stats from anon, authenticated;

create table public.stats_meta (
  id int primary key check (id = 1),
  refreshed_at timestamptz
);
insert into public.stats_meta (id, refreshed_at) values (1, null);
alter table public.stats_meta enable row level security;
revoke all on public.stats_meta from anon, authenticated;

create function public.refresh_admin_stats()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  refresh materialized view public.admin_student_stats;
  refresh materialized view public.admin_level_stats;
  update public.stats_meta set refreshed_at = now() where id = 1;
end;
$$;

create function public.admin_get_student_stats()
returns setof public.admin_student_stats
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'not_admin';
  end if;
  return query select * from public.admin_student_stats;
end;
$$;

create function public.admin_get_level_stats()
returns setof public.admin_level_stats
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'not_admin';
  end if;
  return query select * from public.admin_level_stats order by level_number;
end;
$$;

create function public.admin_stats_refreshed_at()
returns timestamptz
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'not_admin';
  end if;
  return (select refreshed_at from public.stats_meta where id = 1);
end;
$$;

create function public.take_progress_snapshot()
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
begin
  perform public.refresh_admin_stats();
  insert into public.progress_snapshots (data)
  select jsonb_build_object(
    'levels', coalesce((select jsonb_agg(jsonb_build_object(
        'number', level_number, 'students', students_count, 'avg_pct', avg_pct, 'completed', completed_count)
        order by level_number) from public.admin_level_stats), '[]'::jsonb),
    'students', coalesce((select jsonb_agg(jsonb_build_object(
        'user_id', user_id, 'level', current_level, 'pct', level_pct, 'points', total_points))
        from public.admin_student_stats), '[]'::jsonb)
  )
  returning id into v_id;
  return v_id;
end;
$$;

revoke execute on function public.refresh_admin_stats(), public.take_progress_snapshot()
from public, anon, authenticated;

-- ── Schedules ───────────────────────────────────────────────────────────────
create extension if not exists pg_cron with schema pg_catalog;

-- Hourly refresh. Weekly snapshot: Thursday 22:00 UTC = Friday 00:00 Cairo in winter (01:00 in summer).
select cron.schedule('refresh-admin-stats', '0 * * * *', 'select public.refresh_admin_stats()');
select cron.schedule('weekly-snapshot', '0 22 * * 4', 'select public.take_progress_snapshot()');
