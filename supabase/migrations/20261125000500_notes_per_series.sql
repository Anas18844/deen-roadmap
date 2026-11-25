-- Notes per series (Anas, 2026-11-25): a note box follows every section that directly holds lessons
-- (each series), not only the big top-level sections. A level is complete when all its lessons are done
-- and every such series has a note.

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

  if v_section.id is null or v_level.id is null or not public.level_is_open_for(v_uid, v_level.id) then
    raise exception 'item_locked';
  end if;
  if not exists (select 1 from public.items i where i.section_id = p_section_id and i.is_published) then
    raise exception 'not_top_section';
  end if;
  if exists (
    select 1 from public.items i where i.section_id = p_section_id and i.is_published
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
  return jsonb_build_object('level_completed', public.try_complete_level(v_uid, v_level.id), 'level_number', v_level.number);
end;
$$;

create or replace function public.try_complete_level(p_user uuid, p_level_id uuid)
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
  -- every published series (section with published lessons) needs a note
  if exists (
    select 1
    from public.sections s
    left join public.sections p on p.id = s.parent_id
    join public.tracks t on t.id = s.track_id
    where t.level_id = p_level_id and s.is_published and t.is_published and (p.id is null or p.is_published)
      and exists (select 1 from public.items i where i.section_id = s.id and i.is_published)
      and not exists (select 1 from public.section_notes n where n.user_id = p_user and n.section_id = s.id)
  ) then
    return false;
  end if;

  insert into public.level_completions (user_id, level_id, via) values (p_user, p_level_id, 'earned') on conflict do nothing;
  return found;
end;
$$;

revoke execute on function public.try_complete_level(uuid, uuid) from public, anon, authenticated;

create or replace function public.my_dashboard()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_uid uuid := public.require_user();
  v_level int := public.user_current_level(v_uid);
  v_level_id uuid := (select id from public.levels where number = v_level and not is_private);
begin
  return jsonb_build_object(
    'current_level', v_level,
    'total_points', coalesce((select sum(points_awarded) from public.item_completions where user_id = v_uid), 0),
    'streak', public.current_streak(v_uid),
    'levels', coalesce((
      select jsonb_agg(x.obj order by x.number)
      from (
        select l.number,
               jsonb_build_object(
                 'number', l.number,
                 'title', l.title,
                 'subtitle', l.subtitle,
                 'private', l.is_private,
                 'status', case when lc.level_id is not null then 'completed'
                                when public.level_is_open_for(v_uid, l.id) then 'open'
                                else 'locked' end,
                 'via', lc.via,
                 'total', case when public.level_is_open_for(v_uid, l.id) then tot.n end,
                 'done', case when public.level_is_open_for(v_uid, l.id) then tot.done end,
                 'pct', case when public.level_is_open_for(v_uid, l.id) then round(100.0 * tot.done / nullif(tot.n, 0), 1) end
               ) as obj
        from public.levels l
        left join public.level_completions lc on lc.level_id = l.id and lc.user_id = v_uid
        cross join lateral (
          select count(*)::int as n, count(c.item_id)::int as done
          from public.level_published_items(l.id) li(item_id)
          left join public.item_completions c on c.item_id = li.item_id and c.user_id = v_uid
        ) tot
        where l.is_published and (not l.is_private or public.has_private_access(v_uid, l.id))
      ) x
    ), '[]'::jsonb),
    'next', (
      select jsonb_build_object('item_id', o.item_id, 'title', o.title, 'url', o.url, 'kind', o.kind,
                                'level', v_level, 'track_id', o.track_id, 'section_title', o.section_title)
      from public.level_items_ordered(v_level_id) o
      where not exists (select 1 from public.item_completions c where c.user_id = v_uid and c.item_id = o.item_id)
      order by o.ord
      limit 1
    ),
    'pending_note', (
      select jsonb_build_object('section_id', s.id, 'title', coalesce(p.title || ' — ', '') || s.title, 'level', l.number, 'track_id', t.id)
      from public.sections s
      left join public.sections p on p.id = s.parent_id
      join public.tracks t on t.id = s.track_id
      join public.levels l on l.id = t.level_id
      where public.level_is_open_for(v_uid, l.id) and s.is_published and t.is_published and (p.id is null or p.is_published)
        and not exists (select 1 from public.level_completions lc where lc.user_id = v_uid and lc.level_id = l.id and lc.via = 'placement')
        and not exists (select 1 from public.section_notes n where n.user_id = v_uid and n.section_id = s.id)
        and exists (select 1 from public.items i where i.section_id = s.id and i.is_published)
        and not exists (
          select 1 from public.items i where i.section_id = s.id and i.is_published
            and not exists (select 1 from public.item_completions c where c.user_id = v_uid and c.item_id = i.id))
      order by l.number, t.sort, coalesce(p.sort, s.sort), (p.id is not null), s.sort
      limit 1
    ),
    'placement', (
      select jsonb_build_object('status', r.status, 'requested_level', r.requested_level, 'created_at', r.created_at)
      from public.placement_requests r where r.user_id = v_uid order by r.created_at desc limit 1
    ),
    'private_requests', coalesce((
      select jsonb_agg(jsonb_build_object('level', l.title, 'status', pa.status))
      from public.private_access pa join public.levels l on l.id = pa.level_id
      where pa.user_id = v_uid and pa.status <> 'approved'
    ), '[]'::jsonb),
    'weekly_points', coalesce((
      select jsonb_agg(jsonb_build_object('week', w.week, 'points', w.points) order by w.week)
      from (
        select date_trunc('week', completed_at at time zone 'Africa/Cairo')::date as week, sum(points_awarded)::int as points
        from public.item_completions where user_id = v_uid and completed_at > now() - interval '12 weeks'
        group by 1
      ) w
    ), '[]'::jsonb)
  );
end;
$$;
