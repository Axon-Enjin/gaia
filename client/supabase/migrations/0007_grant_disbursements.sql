-- PRD-F10 — simulated grant disbursement audit trail
-- Forward-only; RLS ships with the table.

create table if not exists public.grant_disbursements (
  id                      uuid primary key default gen_random_uuid(),
  program_id              uuid not null references public.grant_programs (id) on delete cascade,
  funder_id               uuid not null references public.profiles (id) on delete cascade,
  criteria_snapshot       jsonb not null,
  criteria_hash           text not null,
  recipients              jsonb not null,
  recipient_count         int not null check (recipient_count >= 0),
  amount_per_learner      numeric,
  total_simulated_amount  numeric,
  simulated               boolean not null default true,
  created_at              timestamptz not null default now()
);

create index if not exists grant_disbursements_program_idx
  on public.grant_disbursements (program_id);

create index if not exists grant_disbursements_funder_idx
  on public.grant_disbursements (funder_id);

alter table public.grant_disbursements enable row level security;

-- Funders read and insert only their own disbursement records.
create policy grant_disbursements_own on public.grant_disbursements
  for all using (auth.uid() = funder_id) with check (auth.uid() = funder_id);
