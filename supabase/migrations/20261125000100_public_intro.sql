-- The landing intro is public: visitors who aren't signed in may see level names and the two intro voice notes.
-- Nothing else is exposed (no tracks, sections, lessons or links inside levels).

create function public.public_levels()
returns table (number int, title text, subtitle text)
language sql
stable
security definer
set search_path = ''
as $$
  select l.number, l.title, l.subtitle from public.levels l where l.is_published order by l.number;
$$;

revoke execute on function public.public_levels() from public;
grant execute on function public.public_levels() to anon, authenticated;

grant select on public.site_audio to anon;
create policy site_audio_public_read on public.site_audio for select to anon using (url is not null);
