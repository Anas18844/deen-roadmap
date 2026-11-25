-- Announcements shown to students on the home page, and Mohamed's private notes about each student.

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text,
  active boolean not null default true,
  created_by uuid references public.profiles on delete set null,
  created_at timestamptz not null default now()
);
alter table public.announcements enable row level security;
revoke all on public.announcements from anon;
create policy announcements_read on public.announcements for select to authenticated
  using (active or (select public.is_admin()));
create policy announcements_admin on public.announcements for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create table public.student_admin_notes (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles on delete cascade,
  body text not null check (char_length(btrim(body)) > 0),
  created_by uuid references public.profiles on delete set null,
  created_at timestamptz not null default now()
);
create index student_admin_notes_student_idx on public.student_admin_notes (student_id, created_at desc);
alter table public.student_admin_notes enable row level security;
revoke all on public.student_admin_notes from anon;
-- admins only: students never see what is written about them
create policy student_admin_notes_admin on public.student_admin_notes for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
