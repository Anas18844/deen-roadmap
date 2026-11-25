-- MCQ exams, one per series (section). Students take it once they finish the series' lessons; grading is server-side
-- and the correct answers are never readable by students.

create table public.exams (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null unique references public.sections on delete cascade,
  title text not null,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.exam_questions (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references public.exams on delete cascade,
  body text not null,
  options text[] not null check (array_length(options, 1) between 2 and 6),
  correct int not null check (correct >= 0),
  sort int not null default 0,
  check (correct < array_length(options, 1))
);
create index exam_questions_exam_idx on public.exam_questions (exam_id);

create table public.exam_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles on delete cascade,
  exam_id uuid not null references public.exams on delete cascade,
  answers int[] not null,
  score int not null,
  total int not null,
  created_at timestamptz not null default now()
);
create index exam_attempts_user_idx on public.exam_attempts (user_id, exam_id);

alter table public.exams enable row level security;
alter table public.exam_questions enable row level security;
alter table public.exam_attempts enable row level security;
revoke all on public.exams, public.exam_questions, public.exam_attempts from anon;

create policy exams_read on public.exams for select to authenticated
  using ((select public.is_admin()) or (is_published and public.section_is_visible(section_id, (select public.my_current_level()))));
create policy exams_admin on public.exams for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy exam_questions_admin on public.exam_questions for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy exam_attempts_read on public.exam_attempts for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));
revoke insert, update, delete on public.exam_attempts from authenticated;

create function public.section_done_for(p_user uuid, p_section_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select not exists (
    select 1 from public.items i join public.sections s on s.id = i.section_id
    where (s.id = p_section_id or s.parent_id = p_section_id) and i.is_published and s.is_published
      and not exists (select 1 from public.item_completions c where c.user_id = p_user and c.item_id = i.id)
  );
$$;

create function public.exam_section_open(p_user uuid, p_section_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.level_is_open_for(p_user, t.level_id)
  from public.sections s join public.tracks t on t.id = s.track_id
  where s.id = p_section_id;
$$;

-- Questions without the answers.
create function public.get_exam(p_exam_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_uid uuid := public.require_user();
  v_exam public.exams;
begin
  select * into v_exam from public.exams where id = p_exam_id and is_published;
  if not found or not coalesce(public.exam_section_open(v_uid, v_exam.section_id), false) then raise exception 'item_locked'; end if;
  if not public.section_done_for(v_uid, v_exam.section_id) then raise exception 'section_incomplete'; end if;
  return jsonb_build_object(
    'id', v_exam.id,
    'title', v_exam.title,
    'questions', coalesce((select jsonb_agg(jsonb_build_object('id', q.id, 'body', q.body, 'options', to_jsonb(q.options)) order by q.sort, q.id)
                           from public.exam_questions q where q.exam_id = v_exam.id), '[]'::jsonb),
    'best', (select jsonb_build_object('score', a.score, 'total', a.total) from public.exam_attempts a
             where a.user_id = v_uid and a.exam_id = v_exam.id order by a.score desc, a.created_at limit 1)
  );
end;
$$;

-- Grade an attempt; answers are option indexes in question order. Returns the score and, after submitting, the key.
create function public.submit_exam(p_exam_id uuid, p_answers int[])
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := public.require_user();
  v_exam public.exams;
  v_correct int[];
  v_score int := 0;
  v_total int;
begin
  select * into v_exam from public.exams where id = p_exam_id and is_published;
  if not found or not coalesce(public.exam_section_open(v_uid, v_exam.section_id), false) then raise exception 'item_locked'; end if;
  if not public.section_done_for(v_uid, v_exam.section_id) then raise exception 'section_incomplete'; end if;

  select array_agg(q.correct order by q.sort, q.id) into v_correct from public.exam_questions q where q.exam_id = p_exam_id;
  v_total := coalesce(array_length(v_correct, 1), 0);
  if v_total = 0 or coalesce(array_length(p_answers, 1), 0) <> v_total then raise exception 'invalid_input'; end if;

  for i in 1..v_total loop
    if p_answers[i] = v_correct[i] then v_score := v_score + 1; end if;
  end loop;

  insert into public.exam_attempts (user_id, exam_id, answers, score, total) values (v_uid, p_exam_id, p_answers, v_score, v_total);
  perform public.record_activity(v_uid);
  return jsonb_build_object('score', v_score, 'total', v_total, 'correct', to_jsonb(v_correct));
end;
$$;

revoke execute on function public.section_done_for(uuid, uuid), public.exam_section_open(uuid, uuid) from public, anon, authenticated;
revoke execute on function public.get_exam(uuid), public.submit_exam(uuid, int[]) from public, anon;
grant execute on function public.get_exam(uuid), public.submit_exam(uuid, int[]) to authenticated;
