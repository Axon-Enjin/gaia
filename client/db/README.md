# Database migrations — Aniskwela

**Source of truth for schema:** [docs/sdd-aniskwela.md](../../docs/sdd-aniskwela.md) §3 (tables) and §5 (RLS).

Migrations are **forward-only** and must stay **backward-compatible for one release** (SDD §3 migration strategy). RLS policies ship in the same migration as their tables.

## Migration list

| File | Purpose |
|------|---------|
| `0001_init.sql` | 9 tables (`profiles`, `courses`, `lessons`, `quiz_questions`, `enrollments`, `merit_ledger`, `badges`, `credentials`, `grant_programs`), indexes, RLS |
| `0002_course_sources_storage.sql` | Private Storage bucket `course-sources` + teacher-scoped object policies |
| `0003_waitlist.sql` | PRD-F8 waitlist table (service-role insert via `POST /api/waitlist` only) |
| `0004_dev_demo_course.sql` | Demo lessons + quiz for dev published test course (optional; idempotent) |

## Apply to a Supabase project

**Dev project:** migrations `0001`–`0004` applied as of 2026-06-23 (issue #5 + PRD-F8 + demo seed).

For a fresh project:

1. Supabase Dashboard → **SQL Editor** → run each file in order, **or**
2. Supabase MCP: `apply_migration` with the file contents, **or**
3. Supabase CLI (linked project): `supabase db push`

Record applied migrations in the Supabase migrations table so drift is visible (`list_migrations` via MCP).

## Verify after apply

```sql
-- All public tables have RLS
SELECT c.relname, c.relrowsecurity
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind = 'r'
ORDER BY c.relname;

-- Policies per table (expect >= 1 each)
SELECT tablename, count(*) AS policies
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- Storage bucket
SELECT id, public, file_size_limit FROM storage.buckets WHERE id = 'course-sources';
```

Run Supabase **security advisors** (Dashboard or MCP `get_advisors`) — no table should be world-writable.

## Auth + profiles

- `profiles.id` FK → `auth.users.id` (no DB trigger; app creates rows via `ensureProfile()` on first login).
- RLS uses `auth.uid()` — JWT must come from Supabase Auth (SSR client in `src/lib/supabase/server.ts`).
- Server-only writes (XP, badges, credentials, waitlist INSERT) use `SUPABASE_SERVICE_ROLE_KEY` — learners have SELECT-only RLS on merit tables.

## Changing schema

1. Read SDD §3; add a new `000N_*.sql` migration.
2. Run **schema-stack-guardian** review (RLS + backward compatibility).
3. If breaking a Locked doc assumption → Change Record (`docs/cr-aniskwela-NNN.md`).
