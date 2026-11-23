-- Server-side rules (spec §9, §15). Every write a student makes to progress goes through these functions.
-- Errors are raised with a fixed English code in MESSAGE; the UI translates them (lib/supabase/errors.ts).

-- ── Helpers ───────────────────────────────────────────────────────────────

create function public.require_user()
returns uuid
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;
  return v_uid;
end;
$$;

create function public.cairo_today()
returns date
language sql
stable
set search_path = ''
as $$
  select (now() at time zone 'Africa/Cairo')::date;
$$;

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create function public.max_published_level()
returns int
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(max(number), 1) from public.levels where is_published;
$$;

-- Open level = (highest completed level) + 1, capped at the last published level (spec §15).
create function public.user_current_level(p_user uuid)
returns int
language sql
stable
security definer
set search_path = ''
as $$
  select least(
    coalesce((select max(l.number)
              from public.level_completions lc
              join public.levels l on l.id = lc.level_id
              where lc.user_id = p_user), 0) + 1,
    public.max_published_level()
  );
$$;

create function public.my_current_level()
returns int
language sql
stable
security definer
set search_path = ''
as $$
  select public.user_current_level(auth.uid());
$$;

-- Published items of a level, counting only items whose whole chain (section, parent section, track, level) is published.
create function public.level_published_items(p_level_id uuid)
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select i.id
  from public.items i
  join public.sections s on s.id = i.section_id
  left join public.sections p on p.id = s.parent_id
  join public.tracks t on t.id = s.track_id
  join public.levels l on l.id = t.level_id
  where l.id = p_level_id
    and i.is_published and s.is_published and t.is_published and l.is_published
    and (p.id is null or p.is_published);
$$;

create function public.item_is_open(p_user uuid, p_item_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.items i
    join public.sections s on s.id = i.section_id
    join public.tracks t on t.id = s.track_id
    join public.levels l on l.id = t.level_id
    where i.id = p_item_id
      and i.id in (select public.level_published_items(l.id))
      and l.number <= public.user_current_level(p_user)
  );
$$;

create function public.item_level_id(p_item_id uuid)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select t.level_id
  from public.items i
  join public.sections s on s.id = i.section_id
  join public.tracks t on t.id = s.track_id
  where i.id = p_item_id;
$$;

create function public.current_streak(p_user uuid)
returns int
language sql
stable
security definer
set search_path = ''
as $$
  with anchor as (
    select max(day) as d
    from public.activity_days
    where user_id = p_user and day <= public.cairo_today()
  ),
  ranked as (
    select a.day, a.day + (row_number() over (order by a.day desc))::int as grp
    from public.activity_days a, anchor
    where a.user_id = p_user and a.day <= anchor.d
  )
  select case
    when (select d from anchor) is null or (select d from anchor) < public.cairo_today() - 1 then 0
    else (select count(*)::int from ranked where grp = (select d from anchor) + 1)
  end;
$$;

create function public.record_activity(p_user uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.activity_days (user_id, day) values (p_user, public.cairo_today()) on conflict do nothing;
  update public.profiles set last_active_at = now() where id = p_user;
$$;

-- True only when this call newly records an earned completion.
create function public.try_complete_level(p_user uuid, p_level_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if exists (select 1 from public.level_completions where user_id = p_user and level_id = p_level_id) then
    return false;
  end if;

  if not exists (select 1 from public.level_published_items(p_level_id)) then
    return false;
  end if;

  if exists (
    select 1 from public.level_published_items(p_level_id) as li(item_id)
    where not exists (select 1 from public.item_completions c where c.user_id = p_user and c.item_id = li.item_id)
  ) then
    return false;
  end if;

  if exists (
    select 1
    from public.sections s
    join public.tracks t on t.id = s.track_id
    where t.level_id = p_level_id and s.parent_id is null and s.is_published and t.is_published
      and not exists (select 1 from public.section_notes n where n.user_id = p_user and n.section_id = s.id)
  ) then
    return false;
  end if;

  insert into public.level_completions (user_id, level_id, via)
  values (p_user, p_level_id, 'earned')
  on conflict do nothing;
  return found;
end;
$$;

create function public.valid_requested_level(p_level int)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select p_level is not null and p_level between 2 and public.max_published_level();
$$;

-- ── Onboarding & placement ────────────────────────────────────────────────

create function public.complete_onboarding(
  p_full_name text,
  p_governorate text,
  p_age int,
  p_previous_courses text,
  p_entry_type text,
  p_requested_level int default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := public.require_user();
begin
  if exists (select 1 from public.profiles where id = v_uid and onboarded_at is not null) then
    raise exception 'already_onboarded';
  end if;

  if coalesce(btrim(p_full_name), '') = ''
     or p_entry_type not in ('new', 'returning')
     or (p_age is not null and p_age not between 7 and 100)
     or (p_entry_type = 'returning' and not public.valid_requested_level(p_requested_level)) then
    raise exception 'invalid_input';
  end if;

  update public.profiles
  set full_name = btrim(p_full_name),
      governorate = nullif(btrim(p_governorate), ''),
      age = p_age,
      previous_courses = nullif(btrim(p_previous_courses), ''),
      entry_type = p_entry_type,
      onboarded_at = now()
  where id = v_uid;

  if p_entry_type = 'returning' then
    insert into public.placement_requests (user_id, requested_level) values (v_uid, p_requested_level);
  end if;
end;
$$;

create function public.request_placement(p_level int)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := public.require_user();
begin
  if not exists (select 1 from public.profiles where id = v_uid and onboarded_at is not null)
     or not public.valid_requested_level(p_level) then
    raise exception 'invalid_input';
  end if;

  if exists (select 1 from public.placement_requests where user_id = v_uid and status = 'pending') then
    raise exception 'not_pending';
  end if;

  insert into public.placement_requests (user_id, requested_level) values (v_uid, p_level);
end;
$$;

create function public.decide_placement(p_request_id uuid, p_approve boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_req public.placement_requests;
begin
  if not public.is_admin() then
    raise exception 'not_admin';
  end if;

  select * into v_req from public.placement_requests where id = p_request_id and status = 'pending' for update;
  if not found then
    raise exception 'not_pending';
  end if;

  update public.placement_requests
  set status = case when p_approve then 'approved' else 'rejected' end,
      decided_by = auth.uid(),
      decided_at = now()
  where id = p_request_id;

  if p_approve then
    insert into public.level_completions (user_id, level_id, via)
    select v_req.user_id, l.id, 'placement'
    from public.levels l
    where l.is_published and l.number < v_req.requested_level
    on conflict do nothing;
  end if;
end;
$$;

-- ── Progress ──────────────────────────────────────────────────────────────

create function public.complete_item(p_item_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := public.require_user();
  v_level_id uuid;
begin
  if not public.item_is_open(v_uid, p_item_id) then
    raise exception 'item_locked';
  end if;

  insert into public.item_completions (user_id, item_id, points_awarded)
  select v_uid, i.id, i.points from public.items i where i.id = p_item_id
  on conflict do nothing;

  perform public.record_activity(v_uid);

  v_level_id := public.item_level_id(p_item_id);
  return jsonb_build_object(
    'level_completed', public.try_complete_level(v_uid, v_level_id),
    'level_number', (select number from public.levels where id = v_level_id)
  );
end;
$$;

create function public.uncomplete_item(p_item_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := public.require_user();
begin
  if exists (
    select 1 from public.level_completions
    where user_id = v_uid and via = 'earned' and level_id = public.item_level_id(p_item_id)
  ) then
    raise exception 'level_closed';
  end if;

  delete from public.item_completions where user_id = v_uid and item_id = p_item_id;
end;
$$;

create function public.save_section_note(p_section_id uuid, p_body text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := public.require_user();
  v_section public.sections;
  v_level public.levels;
begin
  select s.* into v_section from public.sections s where s.id = p_section_id and s.is_published;
  select l.* into v_level
  from public.tracks t join public.levels l on l.id = t.level_id
  where t.id = v_section.track_id and t.is_published and l.is_published;

  if v_section.id is null or v_level.id is null or v_level.number > public.user_current_level(v_uid) then
    raise exception 'item_locked';
  end if;

  if v_section.parent_id is not null then
    raise exception 'not_top_section';
  end if;

  if exists (
    select 1
    from public.items i
    join public.sections s on s.id = i.section_id
    where (s.id = p_section_id or s.parent_id = p_section_id)
      and i.is_published and s.is_published
      and not exists (select 1 from public.item_completions c where c.user_id = v_uid and c.item_id = i.id)
  ) then
    raise exception 'section_incomplete';
  end if;

  if char_length(btrim(coalesce(p_body, ''))) < 300 then
    raise exception 'too_short';
  end if;

  insert into public.section_notes (user_id, section_id, body)
  values (v_uid, p_section_id, btrim(p_body))
  on conflict (user_id, section_id) do update set body = excluded.body, updated_at = now();

  perform public.record_activity(v_uid);

  return jsonb_build_object(
    'level_completed', public.try_complete_level(v_uid, v_level.id),
    'level_number', v_level.number
  );
end;
$$;

-- ── Privileges ────────────────────────────────────────────────────────────
-- Supabase grants EXECUTE on new functions to anon/authenticated by default. Internal helpers must not be callable.
revoke execute on function
  public.require_user(),
  public.max_published_level(),
  public.user_current_level(uuid),
  public.level_published_items(uuid),
  public.item_is_open(uuid, uuid),
  public.item_level_id(uuid),
  public.record_activity(uuid),
  public.try_complete_level(uuid, uuid),
  public.valid_requested_level(int),
  public.current_streak(uuid)
from public, anon, authenticated;
