-- Books as private PDFs in Supabase Storage (optional per item — Drive links keep working).
-- Students never read the bucket directly: the app checks the item is visible to them (RLS)
-- and hands out a short-lived signed URL. Only admins may write to the bucket.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('books', 'books', false, 52428800, array['application/pdf'])
on conflict (id) do nothing;

alter table public.items add column storage_path text;
alter table public.items add column file_size bigint;

create policy books_admin_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'books' and (select public.is_admin()));
create policy books_admin_update on storage.objects for update to authenticated
  using (bucket_id = 'books' and (select public.is_admin()));
create policy books_admin_delete on storage.objects for delete to authenticated
  using (bucket_id = 'books' and (select public.is_admin()));
create policy books_admin_select on storage.objects for select to authenticated
  using (bucket_id = 'books' and (select public.is_admin()));

create function public.admin_storage_usage()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'not_admin';
  end if;
  return jsonb_build_object(
    'bytes', coalesce((select sum((metadata ->> 'size')::bigint) from storage.objects where bucket_id = 'books'), 0),
    'files', (select count(*) from storage.objects where bucket_id = 'books'),
    'limit_bytes', 1073741824
  );
end;
$$;

revoke execute on function public.admin_storage_usage() from public, anon;
grant execute on function public.admin_storage_usage() to authenticated;
