-- PRD-F6: teachers read enrollments + credentials for courses they own (analytics only).

create policy enrollments_teacher_select on public.enrollments
  for select using (
    exists (
      select 1 from public.courses c
      where c.id = enrollments.course_id and c.teacher_id = auth.uid()
    )
  );

create policy credentials_teacher_select on public.credentials
  for select using (
    exists (
      select 1 from public.courses c
      where c.id = credentials.course_id and c.teacher_id = auth.uid()
    )
  );
