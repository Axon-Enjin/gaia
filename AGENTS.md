# AGENTS.md — Aniskwela

> **Materialized from [docs/build-aniskwela.md](docs/build-aniskwela.md). Edit the canonical Build Guide and re-materialize — do not hand-edit this file as the source of truth.** This is the operating manual for whoever builds Aniskwela (human or agent); every agent platform (Codex, Cursor, Gemini CLI, Claude Code) reads it.

**Aniskwela** (*ani* harvest + *eskwela* school) — an AI educational tool built for Filipino farmers, with blockchain-anchored, standards-based credentials, engineered for low-bandwidth rural use (Philippines-first, EN + Filipino). The learning engine is content-agnostic, but the product is built for and goes to market with farmers first.

**Build in progress.** The M3 slice lives in `client/` (Next.js 16.2.9). See [docs/index.md](docs/index.md) §6 Build Status for PRD-F# coverage.

---

## 1. How to Build From These Docs

Read in this order before writing code:

1. **[docs/index.md](docs/index.md)** — manifest: what exists, status, what's stale. Start here every session.
2. **PRD** ([docs/prd-aniskwela.md](docs/prd-aniskwela.md)) — what to build and why (`PRD-F#`, user stories, flows).
3. **SDD** ([docs/sdd-aniskwela.md](docs/sdd-aniskwela.md)) — architecture, schema, APIs, security, AI architecture + safety.
4. **RFCs** — [credential issuance](docs/rfc-aniskwela-credential-issuance.md) (PRD-F4/F5), [AI course generation](docs/rfc-aniskwela-ai-course-generation.md) (PRD-F1).
5. **DSD** ([docs/dsd-aniskwela.md](docs/dsd-aniskwela.md)) — design tokens, components, low-resource + a11y rules.
6. **This guide** — stack conventions, patterns, guardrails.

**Only build against `Locked` docs.** PRD/SDD/SAD/BUILD + both RFCs are Locked; DSD/QAD/CLR/GTM/OPS are Draft pending the sprint — if you need a Draft doc, flag it. If reality diverges from a Locked doc, do **not** silently code around it — trigger a Change Record (`docs/cr-aniskwela-NNN.md`).

### Non-negotiable product invariants (violating any one changes Aniskwela's positioning/regulatory posture — stop and flag)

- **Farmer-first.** Built for Filipino farmers and rural learners; agriculture-first go-to-market. The engine is content-agnostic, but default content, examples, and copy target farming/livelihood.
- **Learning-first, not learn-to-earn.** XP/badges are cumulative merit signals, never spent/burned. No reward tournaments. (`merit_ledger.xp_delta` always ≥ 0.)
- **Aniskwela decides eligibility; a licensed VASP moves money.** Never implement Aniskwela as a money transmitter. MVP disbursement is a labelled simulation (`grant_programs.simulated = true`).
- **Credentials = W3C VC + Open Badges 3.0; hash-only on-chain.** No PII on Stellar; no custom memo blob; no NFT badge.
- **Learners never required to hold a wallet** to learn or earn credentials.
- **AI is cost-gated** — `gpt-5.4` (Azure AI Foundry) once per course (auto-cached), `gpt-5.4-mini` for cheap tasks; never on the learner read path; mandatory teacher review before publish (no auto-publish).
- **Low-resource is a hard constraint** — initial JS ≤ 220KB gzipped, images ≤ 80KB WebP, <5s on 3G, light theme only, system fonts only.

### Traceability map — "to build X, read Y"

| To implement… | Read | Then verify against |
|---------------|------|---------------------|
| A feature `PRD-F#` | PRD §3/§4 → SDD components → its RFC | QAD scenarios tagged with its `US-##` |
| A schema change | SDD §3 → the RFC's Data Model Changes | SDD §3 migration strategy (backward-compatible one release) |
| An API endpoint | SDD §4 → RFC §3 contracts | QAD sad/abuse paths |
| Credential issuance/verify | aniskwela-rfc-001 §2/§3 → SDD §3 `credentials` | QAD H-03/H-04, AB-01/AB-02 |
| AI course generation | aniskwela-rfc-002 §2/§3 → SDD §8/§8.1 | QAD §7 AI-01..AI-08 |
| A UI surface | DSD §2–§4 + PRD §5 (screen states) | DSD §6 a11y + §8 perf gate |

---

## 2. Subagents

Build agents live in the [SAD](docs/sad-aniskwela.md), materialized to `.claude/agents/`: `feature-builder`, `test-runner`, `schema-stack-guardian`, `perf-budget-auditor`, `ai-safety-eval-runner`. Spawn per SAD §4. With no SAD context, the main agent works inline but still honors the guardrails.

---

## 3. Stack Currency & Deprecations

> Do **not** rely on training memory for fast-moving framework conventions. Before writing framework code, verify against the official docs for the pinned version. If you cannot verify, ask — do not emit a plausible-but-stale API.

### Pinned stack (replace TBD at M2 with exact versions + verification date + source URL)

| Layer | Technology | Pinned version | Verified | Source |
|-------|------------|----------------|----------|--------|
| Framework | Next.js (App Router) | **16.2.x** (Active LTS) | 2026-06-23 | nextjs.org/docs |
| Styling | Tailwind CSS | TBD | not yet | tailwindcss.com/docs |
| i18n / PWA | next-intl / next-pwa | TBD | not yet | — |
| DB/Auth/Storage | Supabase (`@supabase/supabase-js`, `@supabase/ssr`) | TBD | not yet | supabase.com/docs |
| Blockchain | `stellar-sdk` + Horizon | TBD | not yet | stellar.org/developers |
| AI | `openai` + `@azure/openai` + `@azure/identity` via **Azure AI Foundry** | TBD | 2026-06-23 | learn.microsoft.com/azure/ai-foundry |
| Validation | Zod | TBD | not yet | zod.dev |

> At M2 the Next.js major was fixed at **16.2.x**; and the AI provider at **Azure AI Foundry GPT** (`gpt-5.4` / `gpt-5.4-mini`). Remaining TBD rows lock at M2.

### Deprecations register (overrides training memory; add a row whenever drift is caught)

| ❌ Stale | ✅ Current | Since | Source |
|---------|-----------|-------|--------|
| `middleware.ts` for auth / complex logic | `proxy.ts` for redirects/rewrites only; auth → layouts + Server Actions | Next.js 16 / Oct 2025 | nextjs.org/docs |
| Implicit `fetch` caching | **`'use cache'`** directive (explicit, opt-in) | Next.js 16 / Oct 2025 | nextjs.org/docs |
| Sync `cookies()`/`headers()`/`params`/`searchParams` | Must be **`await`ed** | Next.js 16 / Oct 2025 | nextjs.org/docs |
| `--turbo` flag | Turbopack is **default** — no flag needed | Next.js 16 / Oct 2025 | nextjs.org/docs |
| `@anthropic-ai/sdk` + `anthropic.messages.create()` | `openai` + `@azure/openai` + `@azure/identity`, `AzureOpenAI` client | 2026-06-23 | learn.microsoft.com/azure/ai-foundry |
| `claude-sonnet-4-6` | **`gpt-5.4`** Azure AI Foundry deployment (course generation) | 2026-06-23 | learn.microsoft.com/azure/ai-foundry |
| `claude-haiku-4-5` | **`gpt-5.4-mini`** Azure AI Foundry deployment (cheap tasks) | 2026-06-23 | learn.microsoft.com/azure/ai-foundry |
| Anthropic explicit `cache_control` blocks | Azure OpenAI **automatic** prefix caching (≥ 1024 tokens) | 2026-06-23 | learn.microsoft.com/azure/ai-services/openai |
| `new OpenAI()` + `OPENAI_API_KEY` | `new AzureOpenAI({ endpoint, azureADTokenProvider, apiVersion, deployment })` + `DefaultAzureCredential` | 2026-06-23 | learn.microsoft.com/azure/ai-foundry |

**Fast-moving deps requiring live verification:** Next.js 16 App Router / `'use cache'` / `proxy.ts`; Supabase SSR/auth helpers; Azure AI Foundry SDK (auth shape and API version); `stellar-sdk` (tx build + Horizon).

---

## 4. Golden-Path Patterns

> Minimal shapes — **re-verify against the pinned versions before copying.** The non-negotiable parts are the conventions (validate at boundary, ownership server-side, AI off the read path), not exact signatures. Full samples with rationale live in [docs/build-aniskwela.md](docs/build-aniskwela.md) §4. Verify Azure AI Foundry SDK (`AzureOpenAI` client, auth shape, API version) against current docs before writing real AI calls.

- **Server route:** Zod-validate input at the boundary → SSR Supabase client → `auth.getUser()` → **server-side ownership/eligibility check (RLS-backed), never trust the client** → business logic in `lib/`.
- **AI call:** `AzureOpenAI` client (`openai` pkg + `@azure/openai` + `@azure/identity`); `DefaultAzureCredential` auth; static system prompt first (auto-cached by Azure ≥ 1024 tokens); source document second; variable hints last; hard token cap; uploaded text wrapped as **untrusted**; output `Zod.parse`d (one `gpt-5.4-mini` repair, else 422 — never persist garbage); called **once per course**.
- **Stellar anchor:** hash-only memo tx; `ENABLE_ONCHAIN_ANCHOR=false` → labelled mock fallback (demo resilience); retry submit with backoff.

---

## 5. Conventions & Guardrails

**Repo layout:** `app/` routes + API · `lib/` shared logic (`ai/`, `credentials/`, `grants/`) · `components/` UI · `db/` schema + migrations + RLS · `messages/` i18n (en, fil).

**Naming:** files kebab-case; components PascalCase; DB snake_case; events snake_case past-tense (PRD §5.5).

**Always:** validate external input at the boundary (Zod); decide ownership/eligibility server-side (RLS); keep AI off the learner read path; respect the perf budget on every UI change.

**Never:** commit secrets (`AZURE_OPENAI_API_KEY`, Stellar keys, **VC issuer signing key**); auto-publish AI output; let `xp_delta` go negative; put PII on-chain; use a deprecated API from §3 from memory; move real funds inside Aniskwela (route via the VASP interface).

**Definition of Done (one task):**
- [ ] Implements the referenced `PRD-F#` / `US-##` acceptance criteria
- [ ] Framework conventions verified vs §3 (no stale APIs)
- [ ] Tests pass; QAD happy + sad + abuse paths covered for the feature
- [ ] Perf budget held on touched UI; no new secrets; input validated at boundaries
- [ ] Touched a Locked doc's assumptions? → logged a Change Record

---

## Claude Code notes

- When the user types a `/<skill-name>`, invoke it via the Skill tool.
- The SAD (`docs/sad-aniskwela.md`) is canonical; `.claude/agents/*.md` are materialized artifacts — edit the SAD and re-materialize, never hand-edit the agent files as source of truth.
- This file is materialized from `docs/build-aniskwela.md`; edit there.
