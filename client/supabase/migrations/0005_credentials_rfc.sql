-- RFC-001: credential idempotency + public verify RPC (PRD-F4/F5)
create unique index if not exists credentials_learner_course_idx
  on public.credentials (learner_id, course_id);

create index if not exists credentials_learner_issued_idx
  on public.credentials (learner_id, issued_at desc);

create or replace function public.get_credential_for_verify(p_credential_id uuid)
returns table (
  id uuid,
  learner_id uuid,
  course_id uuid,
  vc_jsonld jsonb,
  credential_hash text,
  stellar_tx_hash text,
  network text,
  issued_at timestamptz,
  course_title text,
  course_industry text,
  learner_display text,
  final_score int
)
language sql
security definer
set search_path = public
stable
as $$
  select
    c.id,
    c.learner_id,
    c.course_id,
    c.vc_jsonld,
    c.credential_hash,
    c.stellar_tx_hash,
    c.network,
    c.issued_at,
    co.title as course_title,
    co.industry as course_industry,
    coalesce(p.display_name, left(c.learner_id::text, 8) || E'\u2026') as learner_display,
    e.final_score
  from public.credentials c
  join public.courses co on co.id = c.course_id
  join public.profiles p on p.id = c.learner_id
  left join public.enrollments e
    on e.learner_id = c.learner_id and e.course_id = c.course_id
  where c.id = p_credential_id;
$$;

revoke all on function public.get_credential_for_verify(uuid) from public;
grant execute on function public.get_credential_for_verify(uuid) to anon, authenticated, service_role;
