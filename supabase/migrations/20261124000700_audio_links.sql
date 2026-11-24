-- Intro voice note for a whole level, and site-wide voice notes shown on the home page.

alter table public.levels add column intro_audio_url text;

create table public.site_audio (
  key text primary key,
  title text not null,
  url text,
  sort int not null default 0
);
alter table public.site_audio enable row level security;
revoke all on public.site_audio from anon;
grant select on public.site_audio to authenticated;
create policy site_audio_read on public.site_audio for select to authenticated using (true);
create policy site_audio_admin_write on public.site_audio for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

insert into public.site_audio (key, title, sort) values
  ('map', 'شرح خريطة الدين', 0),
  ('howto', 'كيف أتعامل مع الموقع', 1);
