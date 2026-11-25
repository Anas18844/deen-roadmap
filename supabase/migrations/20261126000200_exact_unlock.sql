-- 70% unlock compares the exact ratio (no rounding: 170/243 = 69.96% must not open the next level).
create or replace function public.level_pct(p_user uuid, p_level_id uuid)
returns numeric
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(100.0 * count(c.item_id) / nullif(count(*), 0), 0)
  from public.level_published_items(p_level_id) li(item_id)
  left join public.item_completions c on c.item_id = li.item_id and c.user_id = p_user;
$$;
