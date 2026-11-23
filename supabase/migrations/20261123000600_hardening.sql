-- Fixes from the Plan 1 whole-branch review:
--  1. Note length ignores Unicode whitespace padding (newlines, tabs, NBSP, RTL marks…).
--  2. Progress writes are serialised per student, so two fast clicks can't both miss the level completion.
--  3. Functions are not executable by PUBLIC/anon; students get only the RPCs they need.

-- ── 1. Note length ──────────────────────────────────────────────────────────
-- Any run of whitespace counts as one space; leading/trailing whitespace counts as nothing.
create function public.note_length(p_body text)
returns int
language sql
immutable
set search_path = ''
as $$
  select char_length(btrim(regexp_replace(
    coalesce(p_body, ''),
    '[\s   -‏    　﻿]+', ' ', 'g')));
$$;

create function public.trim_note(p_body text)
returns text
language sql
immutable
set search_path = ''
as $$
  select regexp_replace(
    coalesce(p_body, ''),
    '^[\s   -‏    　﻿]+|[\s   -‏    　﻿]+$',
    '', 'g');
$$;

-- ── 2. Per-student serialisation ────────────────────────────────────────────
-- Each progress write takes a transaction-scoped advisory lock on the student, so the second of two
-- concurrent calls runs after the first commits and sees its rows when it checks level completion.
create or replace function public.complete_item(p_item_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := public.require_user();
  v_level_id uuid;
begin
  perform pg_advisory_xact_lock(hashtextextended(v_uid::text, 0));

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

create or replace function public.uncomplete_item(p_item_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := public.require_user();
begin
  perform pg_advisory_xact_lock(hashtextextended(v_uid::text, 0));

  if exists (
    select 1 from public.level_completions
    where user_id = v_uid and via = 'earned' and level_id = public.item_level_id(p_item_id)
  ) then
    raise exception 'level_closed';
  end if;

  delete from public.item_completions where user_id = v_uid and item_id = p_item_id;
end;
$$;

create or replace function public.save_section_note(p_section_id uuid, p_body text)
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
  perform pg_advisory_xact_lock(hashtextextended(v_uid::text, 0));

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

  if public.note_length(p_body) < 300 then
    raise exception 'too_short';
  end if;

  insert into public.section_notes (user_id, section_id, body)
  values (v_uid, p_section_id, public.trim_note(p_body))
  on conflict (user_id, section_id) do update set body = excluded.body, updated_at = now();

  perform public.record_activity(v_uid);

  return jsonb_build_object(
    'level_completed', public.try_complete_level(v_uid, v_level.id),
    'level_number', v_level.number
  );
end;
$$;

-- ── 3. Function privileges ──────────────────────────────────────────────────
-- Postgres grants EXECUTE to PUBLIC by default; Supabase also grants to anon/authenticated by default.
revoke execute on all functions in schema public from public, anon, authenticated;
alter default privileges in schema public revoke execute on functions from public;
alter default privileges in schema public revoke execute on functions from anon;

-- Student/admin RPCs (each checks the caller itself) and the helpers RLS policies evaluate as the caller.
grant execute on function
  public.is_admin(),
  public.my_current_level(),
  public.track_is_visible(uuid, int),
  public.section_is_visible(uuid, int),
  public.complete_onboarding(text, text, int, text, text, int),
  public.request_placement(int),
  public.decide_placement(uuid, boolean),
  public.complete_item(uuid),
  public.uncomplete_item(uuid),
  public.save_section_note(uuid, text),
  public.note_length(text),
  public.admin_get_student_stats(),
  public.admin_get_level_stats(),
  public.admin_stats_refreshed_at()
to authenticated;
