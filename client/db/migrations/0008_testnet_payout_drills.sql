-- Demo-only Testnet payout drill for simulated grant disbursements.
-- Keeps PRD-F10 simulation intact while recording separate Testnet audit rows.

alter table public.profiles
  add column if not exists payout_testnet_address text,
  add column if not exists payout_testnet_verified_at timestamptz;

create table if not exists public.grant_payout_drills (
  id                     uuid primary key default gen_random_uuid(),
  program_id             uuid not null references public.grant_programs (id) on delete cascade,
  funder_id              uuid not null references public.profiles (id) on delete cascade,
  source_disbursement_id uuid not null references public.grant_disbursements (id) on delete cascade,
  network                text not null default 'testnet' check (network in ('testnet')),
  funder_address         text not null,
  prepared_xdr           text not null,
  demo_amount_xlm        numeric not null check (demo_amount_xlm > 0),
  recipient_count        int not null check (recipient_count >= 0),
  total_amount_xlm       numeric not null check (total_amount_xlm >= 0),
  status                 text not null check (status in ('prepared', 'signed', 'submitted', 'failed')),
  tx_hash                text,
  signed_xdr             text,
  failure_code           text,
  created_at             timestamptz not null default now(),
  submitted_at           timestamptz
);

create index if not exists grant_payout_drills_program_idx
  on public.grant_payout_drills (program_id);

create index if not exists grant_payout_drills_funder_idx
  on public.grant_payout_drills (funder_id);

create index if not exists grant_payout_drills_disbursement_idx
  on public.grant_payout_drills (source_disbursement_id);

create table if not exists public.grant_payout_drill_recipients (
  id                  uuid primary key default gen_random_uuid(),
  drill_id            uuid not null references public.grant_payout_drills (id) on delete cascade,
  learner_id          uuid not null references public.profiles (id) on delete cascade,
  destination_address text,
  amount_xlm          numeric not null check (amount_xlm > 0),
  included            boolean not null default false,
  created_at          timestamptz not null default now()
);

create index if not exists grant_payout_drill_recipients_drill_idx
  on public.grant_payout_drill_recipients (drill_id);

create index if not exists grant_payout_drill_recipients_learner_idx
  on public.grant_payout_drill_recipients (learner_id);

alter table public.grant_payout_drills enable row level security;
alter table public.grant_payout_drill_recipients enable row level security;

create policy grant_payout_drills_own on public.grant_payout_drills
  for all using (auth.uid() = funder_id) with check (auth.uid() = funder_id);

create policy grant_payout_drill_recipients_via_own_drill
  on public.grant_payout_drill_recipients
  for select using (
    exists (
      select 1
      from public.grant_payout_drills d
      where d.id = grant_payout_drill_recipients.drill_id
        and d.funder_id = auth.uid()
    )
  );
