-- Gaia — initial schema + Row Level Security
-- Source of truth: sdd-gaia.md §3 (Data Architecture) and §5 (Security & Authorization).
-- Forward-only, backward-compatible for one release. RLS ships with its tables.
--
-- Invariants enforced here:
--   * merit_ledger.xp_delta >= 0  (XP is never burned)
--   * grant_programs.simulated defaults true (MVP: no real funds)
--   * credentials carry hash + VC JSON only; no PII goes on-chain (app concern)

-- ---------------------------------------------------------------------------
-- profiles (extends auth.users)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  role         text not null default 'learner' check (role in ('learner', 'teacher', 'funder')),
  display_name text,
  locale       text not null default 'en' check (locale in ('en', 'fil')),
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- courses
-- ---------------------------------------------------------------------------
create table if not exists public.courses (
  id                  uuid primary key default gen_random_uuid(),
  teacher_id          uuid not null references public.profiles (id) on delete cascade,
  title               text not null,
  industry            text not null,
  mode                text not null default 'standard' check (mode in ('standard', 'ai_assist')),
  passing_score       int  not null default 70 check (passing_score between 0 and 100),
  status              text not null default 'draft' check (status in ('draft', 'published')),
  source_object_path  text,
  created_at          timestamptz not null default now()
);
create index if not exists courses_industry_idx on public.courses (industry);
create index if not exists courses_status_idx on public.courses (status);
create index if not exists courses_teacher_idx on public.courses (teacher_id);

-- ---------------------------------------------------------------------------
-- lessons
-- ---------------------------------------------------------------------------
create table if not exists public.lessons (
  id          uuid primary key default gen_random_uuid(),
  course_id   uuid not null references public.courses (id) on delete cascade,
  order_index int  not null,
  title       text not null,
  body_md     text not null,
  difficulty  text not null default 'beginner'
              check (difficulty in ('beginner', 'intermediate', 'advanced'))
);
create unique index if not exists lessons_course_order_idx
  on public.lessons (course_id, order_index);

-- ---------------------------------------------------------------------------
-- quiz_questions
-- ---------------------------------------------------------------------------
create table if not exists public.quiz_questions (
  id           uuid primary key default gen_random_uuid(),
  lesson_id    uuid not null references public.lessons (id) on delete cascade,
  prompt       text not null,
  choices      jsonb not null,
  answer_index int  not null
);
create index if not exists quiz_questions_lesson_idx on public.quiz_questions (lesson_id);

-- ---------------------------------------------------------------------------
-- enrollments
-- ---------------------------------------------------------------------------
create table if not exists public.enrollments (
  id           uuid primary key default gen_random_uuid(),
  learner_id   uuid not null references public.profiles (id) on delete cascade,
  course_id    uuid not null references public.courses (id) on delete cascade,
  progress     jsonb not null default '{}'::jsonb,
  completed_at timestamptz,
  final_score  int check (final_score between 0 and 100),
  unique (learner_id, course_id)
);

-- ---------------------------------------------------------------------------
-- merit_ledger (append-only XP events; current XP = sum)
-- ---------------------------------------------------------------------------
create table if not exists public.merit_ledger (
  id         uuid primary key default gen_random_uuid(),
  learner_id uuid not null references public.profiles (id) on delete cascade,
  event_type text not null check (event_type in ('lesson', 'quiz', 'streak', 'help')),
  xp_delta   int  not null check (xp_delta >= 0), -- XP is never burned
  ref_id     uuid,
  created_at timestamptz not null default now()
);
create index if not exists merit_ledger_learner_time_idx
  on public.merit_ledger (learner_id, created_at);

-- ---------------------------------------------------------------------------
-- badges
-- ---------------------------------------------------------------------------
create table if not exists public.badges (
  id         uuid primary key default gen_random_uuid(),
  learner_id uuid not null references public.profiles (id) on delete cascade,
  badge_type text not null,
  awarded_at timestamptz not null default now()
);
create index if not exists badges_learner_idx on public.badges (learner_id);
create index if not exists badges_type_idx on public.badges (badge_type);

-- ---------------------------------------------------------------------------
-- credentials (W3C VC + Open Badges 3.0; hash anchored on Stellar)
-- ---------------------------------------------------------------------------
create table if not exists public.credentials (
  id              uuid primary key default gen_random_uuid(),
  learner_id      uuid not null references public.profiles (id) on delete cascade,
  course_id       uuid not null references public.courses (id),
  vc_jsonld       jsonb not null,
  credential_hash text not null,
  stellar_tx_hash text,
  network         text not null default 'testnet' check (network in ('testnet', 'mainnet', 'mock')),
  issued_at       timestamptz not null default now()
);
create unique index if not exists credentials_hash_idx on public.credentials (credential_hash);
create index if not exists credentials_learner_idx on public.credentials (learner_id);

-- ---------------------------------------------------------------------------
-- grant_programs
-- ---------------------------------------------------------------------------
create table if not exists public.grant_programs (
  id                 uuid primary key default gen_random_uuid(),
  funder_id          uuid not null references public.profiles (id) on delete cascade,
  name               text not null,
  criteria           jsonb not null,
  amount_per_learner numeric,
  simulated          boolean not null default true, -- MVP: always true (no real funds)
  created_at         timestamptz not null default now()
);
create index if not exists grant_programs_funder_idx on public.grant_programs (funder_id);

-- ===========================================================================
-- Row Level Security
-- ===========================================================================
alter table public.profiles       enable row level security;
alter table public.courses        enable row level security;
alter table public.lessons        enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.enrollments    enable row level security;
alter table public.merit_ledger   enable row level security;
alter table public.badges         enable row level security;
alter table public.credentials    enable row level security;
alter table public.grant_programs enable row level security;

-- profiles: a user reads/updates only their own profile.
create policy profiles_select_own on public.profiles
  for select using (auth.uid() = id);
create policy profiles_insert_own on public.profiles
  for insert with check (auth.uid() = id);
create policy profiles_update_own on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- courses: published courses are world-readable; drafts only by their teacher.
-- Teachers write only their own courses.
create policy courses_select_published_or_own on public.courses
  for select using (status = 'published' or auth.uid() = teacher_id);
create policy courses_insert_own on public.courses
  for insert with check (auth.uid() = teacher_id);
create policy courses_update_own on public.courses
  for update using (auth.uid() = teacher_id) with check (auth.uid() = teacher_id);
create policy courses_delete_own on public.courses
  for delete using (auth.uid() = teacher_id);

-- lessons: readable if the parent course is readable; writable by course owner.
create policy lessons_select on public.lessons
  for select using (
    exists (
      select 1 from public.courses c
      where c.id = lessons.course_id
        and (c.status = 'published' or c.teacher_id = auth.uid())
    )
  );
create policy lessons_write_own_course on public.lessons
  for all using (
    exists (
      select 1 from public.courses c
      where c.id = lessons.course_id and c.teacher_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.courses c
      where c.id = lessons.course_id and c.teacher_id = auth.uid()
    )
  );

-- quiz_questions: mirror lesson access via the parent course.
create policy quiz_select on public.quiz_questions
  for select using (
    exists (
      select 1
      from public.lessons l
      join public.courses c on c.id = l.course_id
      where l.id = quiz_questions.lesson_id
        and (c.status = 'published' or c.teacher_id = auth.uid())
    )
  );
create policy quiz_write_own_course on public.quiz_questions
  for all using (
    exists (
      select 1
      from public.lessons l
      join public.courses c on c.id = l.course_id
      where l.id = quiz_questions.lesson_id and c.teacher_id = auth.uid()
    )
  ) with check (
    exists (
      select 1
      from public.lessons l
      join public.courses c on c.id = l.course_id
      where l.id = quiz_questions.lesson_id and c.teacher_id = auth.uid()
    )
  );

-- enrollments / merit_ledger / badges / credentials: a learner sees only their own.
create policy enrollments_own on public.enrollments
  for all using (auth.uid() = learner_id) with check (auth.uid() = learner_id);

-- XP is awarded server-side; learners may read but never write their ledger.
create policy merit_ledger_select_own on public.merit_ledger
  for select using (auth.uid() = learner_id);

create policy badges_select_own on public.badges
  for select using (auth.uid() = learner_id);

-- Credentials: the owning learner reads their own. Public verification reads a
-- minimal projection through a SECURITY DEFINER function / view (added with the
-- verify endpoint), not via a broad anon SELECT policy.
create policy credentials_select_own on public.credentials
  for select using (auth.uid() = learner_id);

-- grant_programs: a funder manages only their own programs.
create policy grant_programs_own on public.grant_programs
  for all using (auth.uid() = funder_id) with check (auth.uid() = funder_id);
