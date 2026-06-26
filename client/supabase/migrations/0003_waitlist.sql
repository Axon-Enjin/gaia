-- PRD-F8: landing-page waitlist capture (SDD §4 POST /api/waitlist)
-- Inserts are server-only via service role; no anon/auth RLS policies.

create table if not exists public.waitlist (
  id         uuid primary key default gen_random_uuid(),
  email      text not null,
  locale     text not null default 'en' check (locale in ('en', 'fil')),
  source     text default 'landing',
  created_at timestamptz not null default now()
);

create unique index if not exists waitlist_email_lower_idx
  on public.waitlist (lower(email));

alter table public.waitlist enable row level security;
