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
| `0005_credentials_rfc.sql` | PRD-F4/F5: credential idempotency index + `get_credential_for_verify` RPC |
| `0006_teacher_analytics_rls.sql` | PRD-F6: teacher SELECT on enrollments/credentials for owned courses |
| `0007_grant_disbursements.sql` | PRD-F10: simulated disbursement audit trail + RLS |

## Apply to a Supabase project

**Dev project:** migrations `0001`–`0007` applied (issue #5 + PRD-F8 + demo seed + credentials RFC + teacher analytics RLS + grant disbursements).

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

## PRD-F10 — Funder demo (local)

1. Apply `0007_grant_disbursements.sql` if not yet on your Supabase project.
2. Sign up at `/login?mode=sign-up` with role **Funder / NGO** (or use dev Admin API signup with `role: funder` in metadata).
3. As a **learner**, complete the demo Agriculture course (`0004_dev_demo_course.sql`) until you have ≥ 300 XP and the **Consistent Learner** badge (3-day streak or seeded merit).
4. As funder, open `/funder` → **New program** → e.g. industry `Agriculture`, min XP `300`, badge **Consistent Learner**, amount `2500`.
5. Preview eligibility → **Run simulated disbursement** → **Download audit CSV**.

No real funds move; `grant_programs.simulated` and `grant_disbursements.simulated` stay `true`.
