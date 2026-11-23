-- Test helpers shared by every *.test.sql file.
-- Runs first (alphabetical). Kept in the `tests` schema so production code never sees it.
begin;
create extension if not exists pgtap with schema extensions;
create schema if not exists tests;
grant usage on schema tests to anon, authenticated;

create or replace function tests.create_user(p_email text, p_name text default null)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid := gen_random_uuid();
begin
  insert into auth.users (id, instance_id, aud, role, email, raw_user_meta_data, created_at, updated_at)
  values (v_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', p_email,
          jsonb_build_object('full_name', coalesce(p_name, split_part(p_email, '@', 1))), now(), now());
  return v_id;
end;
$$;

-- Act as a signed-in user for the rest of the transaction.
create or replace function tests.as_user(p_user uuid)
returns void
language plpgsql
as $$
begin
  perform set_config('request.jwt.claims', jsonb_build_object('sub', p_user, 'role', 'authenticated')::text, true);
  perform set_config('role', 'authenticated', true);
end;
$$;

create or replace function tests.as_anon()
returns void
language plpgsql
as $$
begin
  perform set_config('request.jwt.claims', jsonb_build_object('role', 'anon')::text, true);
  perform set_config('role', 'anon', true);
end;
$$;

create or replace function tests.as_postgres()
returns void
language plpgsql
as $$
begin
  perform set_config('role', 'postgres', true);
  perform set_config('request.jwt.claims', '{}', true);
end;
$$;

-- One published level with one track, one top section and p_items videos (600s each).
create or replace function tests.make_level(p_number int, p_items int)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_level uuid;
  v_track uuid;
  v_section uuid;
begin
  insert into public.levels (number, title) values (p_number, 'المستوى ' || p_number) returning id into v_level;
  insert into public.tracks (level_id, title) values (v_level, 'مسار ' || p_number) returning id into v_track;
  insert into public.sections (track_id, title) values (v_track, 'قسم ' || p_number) returning id into v_section;
  for i in 1..p_items loop
    insert into public.items (section_id, kind, title, url, duration_seconds, sort)
    values (v_section, 'video', 'درس ' || i, 'https://youtu.be/x' || p_number || '_' || i, 600, i);
  end loop;
  return v_level;
end;
$$;

grant execute on all functions in schema tests to anon, authenticated;
select plan(1);
select pass('test helpers loaded');
select * from finish();
commit;
