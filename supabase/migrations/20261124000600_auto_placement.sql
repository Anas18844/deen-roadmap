-- Placement rule (Anas, 2026-11-24): returning students who reached level 2 or 3 are placed immediately;
-- only level 4 and above waits for Mohamed's approval. Levels below the placement are marked
-- "completed earlier" (level_completions.via = 'placement'); no lesson points are awarded for them.

create function public.place_student(p_user uuid, p_level int)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.level_completions (user_id, level_id, via)
  select p_user, l.id, 'placement'
  from public.levels l
  where l.is_published and l.number < p_level
  on conflict do nothing;
$$;

create function public.placement_needs_approval(p_level int)
returns boolean
language sql
immutable
set search_path = ''
as $$ select p_level >= 4; $$;

create or replace function public.complete_onboarding(
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
     or coalesce(p_entry_type, '') not in ('new', 'returning')
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
    if public.placement_needs_approval(p_requested_level) then
      insert into public.placement_requests (user_id, requested_level) values (v_uid, p_requested_level);
    else
      insert into public.placement_requests (user_id, requested_level, status, decided_at)
      values (v_uid, p_requested_level, 'approved', now());
      perform public.place_student(v_uid, p_requested_level);
    end if;
  end if;
end;
$$;

create or replace function public.request_placement(p_level int)
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

  if public.placement_needs_approval(p_level) then
    insert into public.placement_requests (user_id, requested_level) values (v_uid, p_level);
  else
    insert into public.placement_requests (user_id, requested_level, status, decided_at)
    values (v_uid, p_level, 'approved', now());
    perform public.place_student(v_uid, p_level);
  end if;
end;
$$;

-- decide_placement reuses the same placement helper
create or replace function public.decide_placement(p_request_id uuid, p_approve boolean)
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
    perform public.place_student(v_req.user_id, v_req.requested_level);
  end if;
end;
$$;

revoke execute on function public.place_student(uuid, int), public.placement_needs_approval(int) from public, anon, authenticated;
