-- WhatsApp number (required at onboarding) + every onboarding field except "previous courses" is required.
-- Numbers are stored normalised as +<country><number>: 01XXXXXXXXX (Egypt) → +201XXXXXXXXX.

alter table public.profiles add column whatsapp text;

create function public.normalize_whatsapp(p_raw text)
returns text
language plpgsql
immutable
set search_path = ''
as $$
declare
  v text;
begin
  -- keep digits and '+', converting Arabic-Indic digits typed on Arabic keyboards
  v := translate(regexp_replace(coalesce(p_raw, ''), '[^0-9+٠-٩]', '', 'g'), '٠١٢٣٤٥٦٧٨٩', '0123456789');
  if v ~ '^01[0125][0-9]{8}$' then return '+2' || v; end if;          -- Egyptian mobile
  if v ~ '^00[1-9][0-9]{7,14}$' then return '+' || substr(v, 3); end if;
  if v ~ '^\+[1-9][0-9]{7,14}$' then return v; end if;
  if v ~ '^20(1[0125][0-9]{8})$' then return '+' || v; end if;
  return null;
end;
$$;

drop function public.complete_onboarding(text, text, int, text, text, int);

create function public.complete_onboarding(
  p_full_name text,
  p_governorate text,
  p_age int,
  p_previous_courses text,
  p_entry_type text,
  p_whatsapp text,
  p_requested_level int default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := public.require_user();
  v_phone text := public.normalize_whatsapp(p_whatsapp);
begin
  if exists (select 1 from public.profiles where id = v_uid and onboarded_at is not null) then
    raise exception 'already_onboarded';
  end if;

  if coalesce(btrim(p_full_name), '') = ''
     or coalesce(btrim(p_governorate), '') = ''
     or p_age is null or p_age not between 7 and 100
     or coalesce(p_entry_type, '') not in ('new', 'returning')
     or (p_entry_type = 'returning' and not public.valid_requested_level(p_requested_level)) then
    raise exception 'invalid_input';
  end if;

  if v_phone is null then
    raise exception 'invalid_whatsapp';
  end if;

  update public.profiles
  set full_name = btrim(p_full_name),
      governorate = btrim(p_governorate),
      age = p_age,
      previous_courses = nullif(btrim(p_previous_courses), ''),
      entry_type = p_entry_type,
      whatsapp = v_phone,
      onboarded_at = now()
  where id = v_uid;

  if p_entry_type = 'returning' then
    if public.placement_needs_approval(p_requested_level) then
      insert into public.placement_requests (user_id, requested_level) values (v_uid, p_requested_level);
    else
      insert into public.placement_requests (user_id, requested_level, status, decided_at)
      values (v_uid, p_requested_level, 'approved', now());
      perform public.place_student(v_uid, p_requested_level);
    end if;
  end if;
end;
$$;

revoke execute on function public.complete_onboarding(text, text, int, text, text, text, int) from public, anon;
grant execute on function public.complete_onboarding(text, text, int, text, text, text, int) to authenticated;
revoke execute on function public.normalize_whatsapp(text) from public, anon, authenticated;

-- Students may correct their own number later (same rule as the other personal fields).
grant update (whatsapp) on public.profiles to authenticated;
alter table public.profiles add constraint profiles_whatsapp_format check (whatsapp is null or whatsapp ~ '^\+[1-9][0-9]{7,14}$');
