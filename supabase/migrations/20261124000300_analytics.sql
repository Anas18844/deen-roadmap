-- Rich admin analytics in one call (≈100 students: computed live, no extra caching needed).

create function public.admin_analytics(p_days int default 30)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_today date := public.cairo_today();
  v_from date := public.cairo_today() - greatest(7, least(p_days, 180)) + 1;
begin
  if not public.is_admin() then
    raise exception 'not_admin';
  end if;

  return (
    with students as (
      select p.id, p.full_name, p.governorate, p.age, p.entry_type, p.onboarded_at, p.last_active_at,
             public.user_current_level(p.id) as level
      from public.profiles p
      where p.role = 'student' and p.onboarded_at is not null
    ),
    comp as (
      select c.user_id, c.item_id, c.points_awarded, c.completed_at,
             (c.completed_at at time zone 'Africa/Cairo') as local_at
      from public.item_completions c join students s on s.id = c.user_id
    ),
    days as (select generate_series(v_from, v_today, interval '1 day')::date as d),
    lvl as (select id, number, title from public.levels where is_published),
    -- next unfinished item for each student in their current level
    next_item as (
      select distinct on (s.id) s.id as user_id, o.item_id, o.title, o.section_title, l.number as level
      from students s
      join lvl l on l.number = s.level
      cross join lateral public.level_items_ordered(l.id) o
      where not exists (select 1 from public.item_completions c where c.user_id = s.id and c.item_id = o.item_id)
      order by s.id, o.ord
    ),
    last_item as (
      select distinct on (c.user_id) c.user_id, i.title, c.completed_at
      from comp c join public.items i on i.id = c.item_id
      order by c.user_id, c.completed_at desc
    ),
    inactivity as (
      select s.id, (v_today - (coalesce(s.last_active_at, s.onboarded_at) at time zone 'Africa/Cairo')::date) as idle
      from students s
    )
    select jsonb_build_object(
      'kpis', jsonb_build_object(
        'students', (select count(*) from students),
        'new_7', (select count(*) from students where onboarded_at >= now() - interval '7 days'),
        'new_prev7', (select count(*) from students where onboarded_at >= now() - interval '14 days' and onboarded_at < now() - interval '7 days'),
        'active_7', (select count(distinct a.user_id) from public.activity_days a join students s on s.id = a.user_id where a.day > v_today - 7),
        'active_prev7', (select count(distinct a.user_id) from public.activity_days a join students s on s.id = a.user_id where a.day > v_today - 14 and a.day <= v_today - 7),
        'active_30', (select count(distinct a.user_id) from public.activity_days a join students s on s.id = a.user_id where a.day > v_today - 30),
        'items_7', (select count(*) from comp where completed_at >= now() - interval '7 days'),
        'items_prev7', (select count(*) from comp where completed_at >= now() - interval '14 days' and completed_at < now() - interval '7 days'),
        'points_7', (select coalesce(sum(points_awarded), 0) from comp where completed_at >= now() - interval '7 days'),
        'points_prev7', (select coalesce(sum(points_awarded), 0) from comp where completed_at >= now() - interval '14 days' and completed_at < now() - interval '7 days'),
        'notes_7', (select count(*) from public.section_notes n join students s on s.id = n.user_id where n.created_at >= now() - interval '7 days'),
        'notes_prev7', (select count(*) from public.section_notes n join students s on s.id = n.user_id where n.created_at >= now() - interval '14 days' and n.created_at < now() - interval '7 days'),
        'idle_7', (select count(*) from inactivity where idle >= 7 and idle < 14),
        'idle_14', (select count(*) from inactivity where idle >= 14),
        'pending_placements', (select count(*) from public.placement_requests where status = 'pending')
      ),
      'daily', (
        select jsonb_agg(jsonb_build_object(
          'day', d.d,
          'active', (select count(distinct a.user_id) from public.activity_days a join students s on s.id = a.user_id where a.day = d.d),
          'items', (select count(*) from comp where local_at::date = d.d)
        ) order by d.d)
        from days d
      ),
      'road', (
        select jsonb_agg(jsonb_build_object(
          'number', l.number,
          'title', l.title,
          'here', (select count(*) from students s where s.level = l.number),
          'reached', (select count(*) from students s where s.level >= l.number),
          'earned', (select count(*) from public.level_completions lc join students s on s.id = lc.user_id where lc.level_id = l.id and lc.via = 'earned'),
          'avg_pct', coalesce((select round(avg(st.level_pct), 1) from public.admin_student_stats st where st.current_level = l.number), 0)
        ) order by l.number)
        from lvl l
      ),
      'stuck', coalesce((
        select jsonb_agg(x order by x.students desc, x.level)
        from (
          select n.level, n.title, n.section_title, count(*) as students
          from next_item n join inactivity i on i.id = n.user_id
          where i.idle >= 7
          group by n.level, n.title, n.section_title
          order by count(*) desc
          limit 8
        ) x
      ), '[]'::jsonb),
      'at_risk', coalesce((
        select jsonb_agg(x order by x.idle desc)
        from (
          select s.id, s.full_name, s.level, i.idle, li.title as last_item, ni.title as next_item
          from students s
          join inactivity i on i.id = s.id
          left join last_item li on li.user_id = s.id
          left join next_item ni on ni.user_id = s.id
          where i.idle >= 7
          order by i.idle desc
          limit 30
        ) x
      ), '[]'::jsonb),
      'heatmap', coalesce((
        select jsonb_agg(jsonb_build_object('dow', h.dow, 'hour', h.hour, 'n', h.n))
        from (
          select extract(dow from local_at)::int as dow, extract(hour from local_at)::int as hour, count(*) as n
          from comp where completed_at >= now() - interval '90 days'
          group by 1, 2
        ) h
      ), '[]'::jsonb),
      'governorates', coalesce((
        select jsonb_agg(jsonb_build_object('name', g.name, 'n', g.n) order by g.n desc)
        from (select coalesce(governorate, 'غير محدد') as name, count(*) as n from students group by 1) g
      ), '[]'::jsonb),
      'ages', coalesce((
        select jsonb_agg(jsonb_build_object('band', a.band, 'n', a.n) order by a.ord)
        from (
          select case when age < 18 then 'أقل من 18' when age < 25 then '18–24' when age < 35 then '25–34' when age < 45 then '35–44' else '45 فأكثر' end as band,
                 min(case when age < 18 then 1 when age < 25 then 2 when age < 35 then 3 when age < 45 then 4 else 5 end) as ord,
                 count(*) as n
          from students where age is not null group by 1
        ) a
      ), '[]'::jsonb),
      'entry', jsonb_build_object(
        'new', (select count(*) from students where entry_type = 'new'),
        'returning', (select count(*) from students where entry_type = 'returning')
      ),
      'leaders', jsonb_build_object(
        'points', coalesce((select jsonb_agg(x) from (
            select s.id, s.full_name, sum(c.points_awarded)::int as v from students s join comp c on c.user_id = s.id
            group by s.id, s.full_name order by v desc limit 5) x), '[]'::jsonb),
        'streak', coalesce((select jsonb_agg(x) from (
            select s.id, s.full_name, public.current_streak(s.id) as v from students s
            order by v desc limit 5) x where x.v > 0), '[]'::jsonb),
        'notes', coalesce((select jsonb_agg(x) from (
            select s.id, s.full_name, count(*)::int as v from students s join public.section_notes n on n.user_id = s.id
            group by s.id, s.full_name order by v desc limit 5) x), '[]'::jsonb)
      ),
      'feed', coalesce((
        select jsonb_agg(e order by e.at desc)
        from (
          (select 'level' as kind, s.id, s.full_name, l.title as detail, lc.completed_at as at
           from public.level_completions lc join students s on s.id = lc.user_id join public.levels l on l.id = lc.level_id
           where lc.via = 'earned' order by lc.completed_at desc limit 10)
          union all
          (select 'note', s.id, s.full_name, sec.title, n.created_at
           from public.section_notes n join students s on s.id = n.user_id join public.sections sec on sec.id = n.section_id
           order by n.created_at desc limit 10)
          union all
          (select 'placement', s.id, s.full_name, 'المستوى ' || r.requested_level, r.created_at
           from public.placement_requests r join students s on s.id = r.user_id
           order by r.created_at desc limit 10)
          union all
          (select 'joined', s.id, s.full_name, coalesce(s.governorate, ''), s.onboarded_at
           from students s order by s.onboarded_at desc limit 10)
          order by at desc
          limit 20
        ) e
      ), '[]'::jsonb)
    )
  );
end;
$$;

revoke execute on function public.admin_analytics(int) from public, anon;
grant execute on function public.admin_analytics(int) to authenticated;
