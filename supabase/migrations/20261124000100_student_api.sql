-- Read API for the student pages (home, /me) and a manual stats refresh for admins.

-- Items of a level in study order: track → top section → sub-section → item.
create function public.level_items_ordered(p_level_id uuid)
returns table (item_id uuid, title text, url text, kind public.item_kind, track_id uuid, section_title text, ord bigint)
language sql
stable
security definer
set search_path = ''
as $$
  select i.id, i.title, i.url, i.kind, t.id,
         coalesce(p.title || ' — ', '') || s.title,
         row_number() over (order by t.sort, coalesce(p.sort, s.sort), (p.id is not null), s.sort, i.sort, i.created_at)
  from public.items i
  join public.sections s on s.id = i.section_id
  left join public.sections p on p.id = s.parent_id
  join public.tracks t on t.id = s.track_id
  where t.level_id = p_level_id
    and i.id in (select public.level_published_items(p_level_id));
$$;

create function public.my_dashboard()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_uid uuid := public.require_user();
  v_level int := public.user_current_level(v_uid);
  v_level_id uuid := (select id from public.levels where number = v_level);
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
                 'status', case when lc.level_id is not null then 'completed'
                                when l.number <= v_level then 'open'
                                else 'locked' end,
                 'via', lc.via,
                 'total', case when l.number <= v_level then tot.n end,
                 'done', case when l.number <= v_level then tot.done end,
                 'pct', case when l.number <= v_level then round(100.0 * tot.done / nullif(tot.n, 0), 1) end
               ) as obj
        from public.levels l
        left join public.level_completions lc on lc.level_id = l.id and lc.user_id = v_uid
        cross join lateral (
          select count(*)::int as n,
                 count(c.item_id)::int as done
          from public.level_published_items(l.id) li(item_id)
          left join public.item_completions c on c.item_id = li.item_id and c.user_id = v_uid
        ) tot
        where l.is_published
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
      select jsonb_build_object('section_id', s.id, 'title', s.title, 'level', v_level, 'track_id', t.id)
      from public.sections s
      join public.tracks t on t.id = s.track_id
      where t.level_id = v_level_id and s.parent_id is null and s.is_published and t.is_published
        and not exists (select 1 from public.section_notes n where n.user_id = v_uid and n.section_id = s.id)
        and exists (select 1 from public.items i join public.sections ss on ss.id = i.section_id
                    where (ss.id = s.id or ss.parent_id = s.id) and i.is_published)
        and not exists (
          select 1 from public.items i join public.sections ss on ss.id = i.section_id
          where (ss.id = s.id or ss.parent_id = s.id) and i.is_published and ss.is_published
            and not exists (select 1 from public.item_completions c where c.user_id = v_uid and c.item_id = i.id))
      order by t.sort, s.sort
      limit 1
    ),
    'placement', (
      select jsonb_build_object('status', r.status, 'requested_level', r.requested_level, 'created_at', r.created_at)
      from public.placement_requests r where r.user_id = v_uid order by r.created_at desc limit 1
    ),
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

create function public.admin_refresh_stats()
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'not_admin';
  end if;
  perform public.refresh_admin_stats();
  return (select refreshed_at from public.stats_meta where id = 1);
end;
$$;

revoke execute on function public.level_items_ordered(uuid), public.my_dashboard(), public.admin_refresh_stats()
from public, anon;
revoke execute on function public.level_items_ordered(uuid) from authenticated;
grant execute on function public.my_dashboard(), public.admin_refresh_stats() to authenticated;
