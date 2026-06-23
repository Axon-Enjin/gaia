-- Private bucket for teacher-uploaded course source documents (RFC gaia-rfc-002)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'course-sources',
  'course-sources',
  false,
  10485760,
  array['application/pdf', 'text/plain', 'text/markdown']
)
on conflict (id) do nothing;

create policy course_sources_insert_own on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'course-sources'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy course_sources_select_own on storage.objects
  for select to authenticated
  using (
    bucket_id = 'course-sources'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy course_sources_delete_own on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'course-sources'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy course_sources_update_own on storage.objects
  for update to authenticated
  using (
    bucket_id = 'course-sources'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'course-sources'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
