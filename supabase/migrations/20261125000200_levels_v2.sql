-- Levels v2 (Anas, 2026-11-25):
--  1. The next level opens at 70% of the current one (a full level still needs 100% + notes for its shield).
--  2. Private levels (level 4): invisible to everyone except students Mohamed approves via an invite link.

-- ── 1. 70% unlock ────────────────────────────────────────────────────────────
create table public.level_unlocks (
  user_id uuid not null references public.profiles on delete cascade,
  level_id uuid not null references public.levels on delete cascade,
  unlocked_at timestamptz not null default now(),
  primary key (user_id, level_id)
);
alter table public.level_unlocks enable row level security;
create policy level_unlocks_read on public.level_unlocks for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));
revoke insert, update, delete on public.level_unlocks from authenticated;
revoke all on public.level_unlocks from anon;

create function public.level_pct(p_user uuid, p_level_id uuid)
returns numeric
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(round(100.0 * count(c.item_id) / nullif(count(*), 0), 1), 0)
  from public.level_published_items(p_level_id) li(item_id)
  left join public.item_completions c on c.item_id = li.item_id and c.user_id = p_user;
$$;

-- ── 2. Private levels ────────────────────────────────────────────────────────
alter table public.levels add column is_private boolean not null default false;
update public.levels set is_private = true where number = 4;

create table public.private_access (
  user_id uuid not null references public.profiles on delete cascade,
  level_id uuid not null references public.levels on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  invite_id uuid,
  created_at timestamptz not null default now(),
  decided_at timestamptz,
  decided_by uuid references public.profiles on delete set null,
  primary key (user_id, level_id)
);
alter table public.private_access enable row level security;
create policy private_access_read on public.private_access for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));
revoke insert, update, delete on public.private_access from authenticated;
revoke all on public.private_access from anon;

create table public.invite_links (
  id uuid primary key default gen_random_uuid(),
  token text not null unique default replace(gen_random_uuid()::text, '-', ''),
  level_id uuid not null references public.levels on delete cascade,
  note text,
  active boolean not null default true,
  created_by uuid references public.profiles on delete set null,
  created_at timestamptz not null default now()
);
alter table public.invite_links enable row level security;
create policy invite_links_admin on public.invite_links for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
revoke all on public.invite_links from anon;

create function public.has_private_access(p_user uuid, p_level_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.private_access where user_id = p_user and level_id = p_level_id and status = 'approved');
$$;

-- Normal progression ignores private levels.
create or replace function public.max_published_level()
returns int
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(max(number), 1) from public.levels where is_published and not is_private;
$$;

create or replace function public.user_current_level(p_user uuid)
returns int
language sql
stable
security definer
set search_path = ''
as $$
  select least(
    coalesce((
      select max(l.number) from public.levels l
      where not l.is_private and (
        exists (select 1 from public.level_completions lc where lc.user_id = p_user and lc.level_id = l.id)
        or exists (select 1 from public.level_unlocks u where u.user_id = p_user and u.level_id = l.id))
    ), 0) + 1,
    public.max_published_level()
  );
$$;

-- A level (or its content) is visible when it is public and reached, or private and the student is approved.
create or replace function public.level_is_open_for(p_user uuid, p_level_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.levels l
    where l.id = p_level_id and l.is_published
      and ((not l.is_private and l.number <= public.user_current_level(p_user))
           or (l.is_private and public.has_private_access(p_user, l.id)))
  );
$$;

create or replace function public.track_is_visible(p_track_id uuid, p_level_limit int)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.tracks t join public.levels l on l.id = t.level_id
    where t.id = p_track_id and t.is_published and l.is_published
      and ((not l.is_private and l.number <= p_level_limit)
           or (l.is_private and public.has_private_access(auth.uid(), l.id)))
  );
$$;

create or replace function public.item_is_open(p_user uuid, p_item_id uuid)
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
    where i.id = p_item_id
      and i.id in (select public.level_published_items(t.level_id))
      and public.level_is_open_for(p_user, t.level_id)
  );
$$;

drop policy levels_read on public.levels;
create policy levels_read on public.levels for select to authenticated
  using ((select public.is_admin()) or (is_published and (not is_private or public.has_private_access((select auth.uid()), id))));

create or replace function public.public_levels()
returns table (number int, title text, subtitle text)
language sql
stable
security definer
set search_path = ''
as $$
  select l.number, l.title, l.subtitle from public.levels l where l.is_published and not l.is_private order by l.number;
$$;

-- Notes in a private level follow the same visibility rule.
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
  if v_section.parent_id is not null then
    raise exception 'not_top_section';
  end if;
  if exists (
    select 1 from public.items i join public.sections s on s.id = i.section_id
    where (s.id = p_section_id or s.parent_id = p_section_id) and i.is_published and s.is_published
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

-- complete_item records the 70% unlock.
create or replace function public.complete_item(p_item_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := public.require_user();
  v_level_id uuid;
  v_before int;
  v_unlocked boolean := false;
begin
  perform pg_advisory_xact_lock(hashtextextended(v_uid::text, 0));

  if not public.item_is_open(v_uid, p_item_id) then
    raise exception 'item_locked';
  end if;

  v_before := public.user_current_level(v_uid);

  insert into public.item_completions (user_id, item_id, points_awarded)
  select v_uid, i.id, i.points from public.items i where i.id = p_item_id
  on conflict do nothing;

  perform public.record_activity(v_uid);
  v_level_id := public.item_level_id(p_item_id);

  if public.level_pct(v_uid, v_level_id) >= 70 then
    insert into public.level_unlocks (user_id, level_id) values (v_uid, v_level_id) on conflict do nothing;
  end if;
  v_unlocked := public.user_current_level(v_uid) > v_before;

  return jsonb_build_object(
    'level_completed', public.try_complete_level(v_uid, v_level_id),
    'level_number', (select number from public.levels where id = v_level_id),
    'next_unlocked', v_unlocked
  );
end;
$$;

-- ── Invites ──────────────────────────────────────────────────────────────────
create function public.admin_create_invite(p_level_number int, p_note text default null)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_token text;
begin
  if not public.is_admin() then raise exception 'not_admin'; end if;
  insert into public.invite_links (level_id, note, created_by)
  select id, nullif(btrim(p_note), ''), auth.uid() from public.levels where number = p_level_number and is_private
  returning token into v_token;
  if v_token is null then raise exception 'invalid_input'; end if;
  return v_token;
end;
$$;

-- The invited (signed-in, onboarded) student asks to join; Mohamed decides.
create function public.redeem_invite(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := public.require_user();
  v_inv public.invite_links;
begin
  select * into v_inv from public.invite_links where token = p_token and active;
  if not found then raise exception 'invalid_invite'; end if;
  insert into public.private_access (user_id, level_id, invite_id)
  values (v_uid, v_inv.level_id, v_inv.id)
  on conflict (user_id, level_id) do update
    set status = case when public.private_access.status = 'rejected' then 'pending' else public.private_access.status end,
        invite_id = excluded.invite_id;
  return jsonb_build_object(
    'status', (select status from public.private_access where user_id = v_uid and level_id = v_inv.level_id),
    'level', (select title from public.levels where id = v_inv.level_id)
  );
end;
$$;

create function public.decide_private_access(p_user uuid, p_level_id uuid, p_approve boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then raise exception 'not_admin'; end if;
  update public.private_access
  set status = case when p_approve then 'approved' else 'rejected' end, decided_at = now(), decided_by = auth.uid()
  where user_id = p_user and level_id = p_level_id;
  if not found then raise exception 'not_pending'; end if;
end;
$$;

-- ── Dashboard: private levels appear only for approved students; locks follow the 70% rule ──
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
      select jsonb_build_object('section_id', s.id, 'title', s.title, 'level', l.number, 'track_id', t.id)
      from public.sections s
      join public.tracks t on t.id = s.track_id
      join public.levels l on l.id = t.level_id
      where public.level_is_open_for(v_uid, l.id) and s.parent_id is null and s.is_published and t.is_published
        and not exists (select 1 from public.level_completions lc where lc.user_id = v_uid and lc.level_id = l.id and lc.via = 'placement')
        and not exists (select 1 from public.section_notes n where n.user_id = v_uid and n.section_id = s.id)
        and exists (select 1 from public.items i join public.sections ss on ss.id = i.section_id
                    where (ss.id = s.id or ss.parent_id = s.id) and i.is_published)
        and not exists (
          select 1 from public.items i join public.sections ss on ss.id = i.section_id
          where (ss.id = s.id or ss.parent_id = s.id) and i.is_published and ss.is_published
            and not exists (select 1 from public.item_completions c where c.user_id = v_uid and c.item_id = i.id))
      order by l.number, t.sort, s.sort
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

-- ── Leaderboard (first names only) ───────────────────────────────────────────
create function public.leaderboard(p_limit int default 20)
returns table (rank bigint, first_name text, points int, level int)
language sql
stable
security definer
set search_path = ''
as $$
  select rank() over (order by sum(c.points_awarded) desc),
         split_part(btrim(p.full_name), ' ', 1),
         sum(c.points_awarded)::int,
         public.user_current_level(p.id)
  from public.profiles p
  join public.item_completions c on c.user_id = p.id
  where p.role = 'student' and p.onboarded_at is not null
  group by p.id, p.full_name
  order by 3 desc
  limit least(greatest(p_limit, 1), 100);
$$;

-- ── Privileges ───────────────────────────────────────────────────────────────
revoke execute on function public.level_pct(uuid, uuid), public.has_private_access(uuid, uuid), public.level_is_open_for(uuid, uuid)
  from public, anon, authenticated;
-- RLS policies call has_private_access as the querying user
grant execute on function public.has_private_access(uuid, uuid) to authenticated;
revoke execute on function public.admin_create_invite(int, text), public.redeem_invite(text),
  public.decide_private_access(uuid, uuid, boolean), public.leaderboard(int) from public, anon;
grant execute on function public.admin_create_invite(int, text), public.redeem_invite(text),
  public.decide_private_access(uuid, uuid, boolean), public.leaderboard(int) to authenticated;
