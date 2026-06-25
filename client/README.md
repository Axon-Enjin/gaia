# Gaia — Next.js client

Application code for Gaia lives here. Specs and guardrails: [docs/index.md](../docs/index.md) → PRD/SDD → [docs/build-gaia.md](../docs/build-gaia.md) (materialized as root [AGENTS.md](../AGENTS.md)).

## Prerequisites

- Node.js 20+
- A Supabase **dev** project (Postgres + Auth + Storage) — see [db/README.md](db/README.md)
- Optional: Azure AI Foundry credentials for course generation (`ENABLE_AI_GENERATION=true`)
- Optional: VC issuer key + Stellar Testnet anchor for credentials (`VC_ISSUER_*`, `STELLAR_*`, `ENABLE_ONCHAIN_ANCHOR`)

## Quick start

```bash
cd client
cp .env.example .env.local
# Fill NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign up or sign in at `/login`.

## Environment variables

Contract: [.env.example](.env.example). Never commit `.env.local`.

| Variable | Scope | Purpose |
|----------|-------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | public | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public | Anon / publishable key (browser + SSR) |
| `SUPABASE_SERVICE_ROLE_KEY` | **server only** | Admin API, future XP/credential routes; enables dev signup without auth emails |
| `SUPABASE_DEV_ADMIN_SIGNUP` | server | Set `false` to disable Admin API signup in dev (default: on when service role key is set) |
| `ENABLE_AI_GENERATION` | server | `true` to enable `POST /api/courses/generate` |
| `ENABLE_ONCHAIN_ANCHOR` | server | `true` for real Stellar testnet anchors; `false` uses labelled mock |
| `VC_ISSUER_DID` | server | Platform issuer DID for W3C VC signing |
| `VC_ISSUER_PRIVATE_KEY` | server | Ed25519 PEM for credential signatures |
| `STELLAR_ANCHOR_SECRET` | server | Testnet secret when on-chain anchor enabled |
| `STELLAR_HORIZON_URL` | server | Horizon endpoint (default Testnet) |
| `NEXT_PUBLIC_APP_URL` | public | Base URL for verify links + QR |
| `AZURE_OPENAI_*` | server | Azure AI Foundry — see `.env.example` |

## Supabase (dev)

**Status:** Dev project provisioned under [issue #5](https://github.com/Axon-Enjin/gaia/issues/5) (PR #11).

| Item | Detail |
|------|--------|
| Migrations | [db/migrations/0001_init.sql](db/migrations/0001_init.sql) (schema + RLS), [db/migrations/0002_course_sources_storage.sql](db/migrations/0002_course_sources_storage.sql) (Storage) |
| Auth | Email/password; **Confirm email off** (`mailer_autoconfirm: true`) for instant dev signup |
| Storage | Private bucket `course-sources` — path `{teacher_id}/{filename}`; 10 MB; PDF/text/markdown |
| RLS | Enabled on all 9 `public` tables; see SDD §3/§5 |

Apply migrations to a **new** project: SQL Editor, Supabase CLI, or MCP `apply_migration`. Details: [db/README.md](db/README.md).

### Dev signup (avoid mailer rate limits)

1. **Preferred:** set `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` — signup uses the Admin API (no confirmation email).
2. **Project setting:** Supabase Dashboard → Authentication → Providers → Email → **Confirm email off**.
3. **Staging/prod:** re-enable confirm email or use custom SMTP; do not rely on Admin API signup outside `NODE_ENV=development`.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local dev (Turbopack default) |
| `npm run build` | Production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run preprocess-doc -- path/to/file.pdf` | Test document preprocessing without calling Azure |
| `node scripts/measure-bundle.js` | Initial JS budget check (≤ 220 KB gz) |

## Layout

```
client/
  src/app/          # App Router routes + Server Actions
  src/lib/          # supabase/, auth/, ai/, courses/
  src/components/   # UI
  db/migrations/    # Forward-only SQL + RLS
  messages/         # i18n (en, fil)
```

Auth boundary: `src/proxy.ts` refreshes session; role checks in layouts/Server Actions + Postgres RLS.
