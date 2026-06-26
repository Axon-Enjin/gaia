# Project Build Guide — Aniskwela

**Project:** Aniskwela
**Date:** 2026-06-23
**Version:** 1.2
**Owner:** Carlos Jerico Dela Torre
**Status:** Locked
**Last reconciled:** 2026-06-23
**PRD:** [prd-aniskwela.md](prd-aniskwela.md)
**SDD:** [sdd-aniskwela.md](sdd-aniskwela.md)
**SAD:** [sad-aniskwela.md](sad-aniskwela.md)

> This is the canonical Build Guide. It materializes to the project root `AGENTS.md` (+ a `CLAUDE.md` pointer). Edit **this** file and re-materialize; never hand-edit the root copies as the source of truth.

---

## 0. Project state

**Build in progress.** The M3 slice lives in `client/` (Next.js 16.2.9): Supabase SSR auth, AI course generation (PRD-F1), teacher publish flow, cached learner catalog/detail, EN/Fil toggle, and the full initial schema + RLS migration. See [index.md](index.md) §6 Build Status for per-feature coverage. DSD earthen palette tokens are documented but not yet applied in `client/src/app/globals.css`.

---

## 1. How to Build From These Docs

The `docs/` suite is the source of truth. Read in this order before writing code:

1. **`docs/index.md`** — what exists, each doc's status, what's stale. Start here every session.
2. **PRD** ([prd-aniskwela.md](prd-aniskwela.md)) — what to build and why (features `PRD-F#`, user stories, flows).
3. **SDD** ([sdd-aniskwela.md](sdd-aniskwela.md)) — architecture, schema, APIs, security, AI architecture + safety.
4. **RFCs** — [credential issuance](rfc-aniskwela-credential-issuance.md) (PRD-F4/F5), [AI course generation](rfc-aniskwela-ai-course-generation.md) (PRD-F1).
5. **DSD** ([dsd-aniskwela.md](dsd-aniskwela.md)) — design tokens, components, the low-resource + a11y rules.
6. **This guide** — stack conventions, patterns, guardrails.

**Only build against `Locked` docs.** PRD/SDD/SAD/BUILD + both RFCs are Locked; DSD/QAD/CLR/GTM/OPS are Draft pending the sprint — if you need a Draft doc, flag it, don't guess. If reality diverges from a Locked doc, do **not** silently code around it — trigger a Change Record (`docs/cr-aniskwela-NNN.md`).

### Non-negotiable product invariants (violating any one changes Aniskwela's positioning/regulatory posture — stop and flag)

- **Farmer-first.** Built for Filipino farmers and rural learners; agriculture-first go-to-market. The engine is content-agnostic, but default content, examples, and copy target farming/livelihood.
- **Learning-first, not learn-to-earn.** XP/badges are cumulative merit signals, never spent/burned. No reward tournaments. (`merit_ledger.xp_delta` is always ≥ 0.)
- **Aniskwela decides eligibility; a licensed VASP moves money.** Never implement Aniskwela as a money transmitter. MVP disbursement is a labelled simulation (`grant_programs.simulated = true`).
- **Credentials = W3C VC + Open Badges 3.0; hash-only on-chain.** No PII on Stellar; no custom memo blob; no NFT badge.
- **Learners never required to hold a wallet** to learn or earn credentials.
- **AI is cost-gated** — `gpt-5.4` once per course (auto-cached), `gpt-5.4-mini` for cheap tasks; never on the learner read path; mandatory teacher review before publish (no auto-publish).
- **Low-resource is a hard constraint** — initial JS ≤ 220KB gzipped, images ≤ 80KB WebP, <5s on 3G, light theme only, system fonts only.

### Traceability map — "to build X, read Y"

| To implement… | Read | Then verify against |
|---------------|------|---------------------|
| A feature `PRD-F#` | PRD §3/§4 → SDD components it touches → its RFC | QAD scenarios tagged with its `US-##` |
| A schema change | SDD §3 → the RFC's Data Model Changes | SDD §3 migration strategy (backward-compatible one release) |
| An API endpoint | SDD §4 → RFC §3 contracts | QAD sad/abuse paths |
| Credential issuance/verify | aniskwela-rfc-001 §2/§3 → SDD §3 `credentials` | QAD H-03/H-04, AB-01/AB-02 |
| AI course generation | aniskwela-rfc-002 §2/§3 → SDD §8/§8.1 | QAD §7 AI-01..AI-08 |
| A UI surface | DSD §2–§4 + PRD §5 (screen states) | DSD §6 a11y + §8 perf gate |

---

## 2. Subagents

Build agents are defined in the [SAD](sad-aniskwela.md) and materialized to `.claude/agents/`: `feature-builder`, `test-runner`, `schema-stack-guardian`, `perf-budget-auditor`, `ai-safety-eval-runner`. Spawn per SAD §4 orchestration. With no SAD context, the main agent does the work inline but still honors the guardrails.

---

## 3. Stack Currency & Deprecations

> **The rule that prevents stale code:** Do **not** rely on training memory for fast-moving framework conventions. Before writing framework-specific code, verify the current convention against the official docs for the pinned version below. If you cannot verify, say so and ask — do not emit a plausible-but-stale API. The cutoff is past these versions' release; treat every sample as perishable.

### Pinned stack

| Layer | Technology | Pinned version | Convention verified (date) | Authoritative source |
|-------|------------|----------------|-----------------------------|----------------------|
| Language | TypeScript | TBD — pin at M2 | not yet | typescriptlang.org/docs |
| Framework | Next.js (App Router) | **16.2.x** | 2026-06-23 | nextjs.org/docs |
| Styling | Tailwind CSS | TBD — pin at M2 | not yet | tailwindcss.com/docs |
| i18n | next-intl | TBD | not yet | next-intl-docs |
| PWA | next-pwa | TBD (Phase 1) | not yet | — |
| DB/Auth/Storage | Supabase (`@supabase/supabase-js`, `@supabase/ssr`) | TBD — pin at M2 | not yet | supabase.com/docs |
| Blockchain | `stellar-sdk` (JS) + Horizon | TBD — pin at M2 | not yet | stellar.org/developers |
| AI | `openai` + `@azure/openai` + `@azure/identity` via **Azure AI Foundry** — model names: `gpt-5.4` / `gpt-5.4-mini`; Azure deployment names use dashes: `gpt-5-4` / `gpt-5-4-mini` | TBD — pin at M2 | 2026-06-23 | learn.microsoft.com/azure/ai-foundry |
| Validation | Zod | TBD | not yet | zod.dev |

> **Action at M2/M3:** replace every "TBD"/"not yet" with the exact installed version, the date you verified its conventions, and the source URL. Until then, `schema-stack-guardian` (SAD-A3) must verify any framework code live. The Next.js major is pinned at **16.2.x** (Active LTS). The AI provider is **OpenAI GPT** models via Azure AI Foundry; verify deployment availability by region at project setup.

### Deprecations & convention changes — DO NOT use the stale form

This register **overrides training memory**. Add a row every time drift is caught (self-annealing). Rows below reflect the evolution from the initial design.

| ❌ Stale / deprecated | ✅ Current convention | Since (version/date) | Source |
|----------------------|----------------------|----------------------|--------|
| `middleware.ts` for auth boundary / complex logic | **`proxy.ts`** for redirects/rewrites/headers only; auth moves to layouts + Server Actions | Next.js 16 / Oct 2025 | nextjs.org/docs |
| Implicit `fetch` caching (`cache: 'force-cache'`, `next: { revalidate }`) | **`'use cache'`** directive at function/component level (explicit, opt-in) | Next.js 16 / Oct 2025 | nextjs.org/docs |
| Synchronous `cookies()`, `headers()`, `params`, `searchParams` | **Must be `await`ed** — sync access fully removed | Next.js 16 / Oct 2025 | nextjs.org/docs |
| `--turbo` flag to enable Turbopack | Turbopack is the **default** bundler (dev + prod) — no flag needed | Next.js 16 / Oct 2025 | nextjs.org/docs |
| `@anthropic-ai/sdk` + `anthropic.messages.create()` | **`openai` + `@azure/openai` + `@azure/identity`** + `AzureOpenAI` client | 2026-06-23 | learn.microsoft.com/azure/ai-foundry |
| `claude-sonnet-4-6` | **`gpt-5.4`** Azure AI Foundry deployment (course generation) | 2026-06-23 | learn.microsoft.com/azure/ai-foundry |
| `claude-haiku-4-5` | **`gpt-5.4-mini`** Azure AI Foundry deployment (cheap structural tasks) | 2026-06-23 | learn.microsoft.com/azure/ai-foundry |
| Anthropic explicit `cache_control` blocks | Azure OpenAI **automatic** prefix caching (≥ 1024 tokens, no SDK flag; configurable up to 24h retention) | 2026-06-23 | learn.microsoft.com/azure/ai-services/openai |
| `new OpenAI()` with `OPENAI_API_KEY` | `new AzureOpenAI({ endpoint, azureADTokenProvider, apiVersion, deployment })` with `DefaultAzureCredential` | 2026-06-23 | learn.microsoft.com/azure/ai-foundry |

**Fast-moving deps that require live verification before coding:** Next.js 16 (App Router/`'use cache'`/`proxy.ts`), Supabase SSR/auth helpers, Azure AI Foundry SDK (`openai`/`@azure/openai`/`@azure/identity` — auth shape and API version move fast), and `stellar-sdk` (transaction building + Horizon endpoints). Verify each against current docs every time.

**Self-anneal:** when drift is found, add it here and (if behavior changed) consider a Change Record.

---

## 4. Golden-Path Patterns

> These show *Aniskwela's* canonical shapes. They are intentionally minimal and **must be re-verified against the pinned versions (§3) before copying** — exact framework signatures are version-sensitive and may be stale. The non-negotiable parts are the *conventions* (validate at the boundary, check ownership server-side, never put AI on the read path), not the exact API calls.

### Server route: validate input + server-side ownership check  ·  *shape only — verify vs Next.js 16.2.x + Supabase SSR at M2*

```ts
// app/api/credentials/issue/route.ts  (shape)
import { z } from "zod";

const Body = z.object({ enrollment_id: z.string().uuid() });

export async function POST(req: Request) {
  const { enrollment_id } = Body.parse(await req.json());      // validate at boundary
  const supabase = getServerClient();                          // SSR client — verify helper name vs pinned @supabase/ssr
  const { data: user } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });

  // ownership + completion verified server-side / via RLS — NEVER trust a client "passed" claim
  const enrollment = await loadOwnedCompletedEnrollment(supabase, enrollment_id, user.id);
  if (!enrollment) return Response.json({ error: "forbidden" }, { status: 403 });

  const credential = await issueCredential(enrollment);       // lib/credentials — see aniskwela-rfc-001
  return Response.json(credential);
}
```

*Why this shape:* Zod at the boundary; ownership/eligibility decided server-side (RLS-backed), never client-side (QAD AB-01); business logic in `lib/`, not the route.

### AI call: cached, gated, schema-validated  ·  *shape only — verify vs Azure AI Foundry SDK + API version at M2*

```ts
// lib/ai/courseGen.ts  (shape)
import { AzureOpenAI } from "openai";
import { DefaultAzureCredential, getBearerTokenProvider } from "@azure/identity";

// Secrets/config — all server-side env vars, never client-side
const endpoint   = process.env.AZURE_OPENAI_ENDPOINT!;    // https://<resource>.openai.azure.com/
const apiVersion = process.env.AZURE_OPENAI_API_VERSION ?? "2026-05-01"; // re-verify at M2
const credential = new DefaultAzureCredential();           // Managed Identity preferred; fallback: AZURE_OPENAI_API_KEY
const tokenProvider = getBearerTokenProvider(credential, "https://cognitiveservices.azure.com/.default");

// One client per deployment; cheap tasks use a separate gpt-5-4-mini client
const client = new AzureOpenAI({ endpoint, azureADTokenProvider: tokenProvider, apiVersion, deployment: "gpt-5-4" });

// Place static content FIRST — Azure OpenAI auto-caches prefix ≥ 1024 tokens (configurable up to 24h retention)
const SYSTEM = "...pedagogy rules + strict JSON schema...";  // static → auto-cached

export async function generateCourse(sourceText: string, hints: Hints) {
  const res = await client.chat.completions.create({
    model: "",             // deployment name set on client; model field unused on Azure
    max_tokens: HARD_CAP,  // hard per-call cap
    messages: [
      { role: "system", content: SYSTEM },                           // static prefix → auto-cached
      { role: "user",   content: wrapUntrusted(sourceText, hints) }, // source is UNTRUSTED data
    ],
  });
  return CourseSchema.parse(extractJson(res));  // validate; one gpt-5-4-mini repair, else 422 — never persist garbage
}
```

*Why this shape:* called once per course, never on a read; `DefaultAzureCredential` (Managed Identity) avoids hardcoded keys; static system prompt placed first for automatic Azure prefix caching; uploaded text is untrusted (SDD §8.1 LLM01); output is validated data, never executed (LLM02).

### Stellar anchor: hash-only + demo fallback  ·  *shape only — verify vs stellar-sdk at M2*

```ts
// lib/credentials/anchor.ts  (shape)
export async function anchorHash(hash: string) {
  if (process.env.ENABLE_ONCHAIN_ANCHOR !== "true") {
    return { network: "mock", stellar_tx_hash: null };         // labelled demo fallback (QAD S-02)
  }
  // build + submit a Stellar tx carrying ONLY `hash` (never PII); retry with backoff on submit failure
  const txHash = await submitMemoTx(hash);
  return { network: "testnet", stellar_tx_hash: txHash };
}
```

*Why this shape:* only the hash touches the chain (aniskwela-rfc-001); the flag keeps a live demo resilient to Testnet downtime.

---

## 5. Conventions & Guardrails

**Repo layout:** `app/` routes + API · `lib/` shared logic (`ai/`, `credentials/`, `grants/`) · `components/` UI · `db/` schema + migrations + RLS · `messages/` i18n (en, fil).

**Naming:** files kebab-case; React components PascalCase; DB tables/columns snake_case; events snake_case past-tense (PRD §5.5).

**Always:**
- Validate external input at the boundary with Zod.
- Decide ownership/eligibility server-side (RLS) — never trust the client.
- Keep AI off the learner read path; cache prompts; cap tokens.
- Respect the perf budget on every UI change (SAD-A4).

**Never:**
- Commit secrets (`AZURE_OPENAI_API_KEY`, Stellar keys, **VC issuer signing key**) — env/secrets store only. Prefer `DefaultAzureCredential` (Managed Identity) over key-based auth for Azure resources.
- Auto-publish AI output, or let `xp_delta` go negative, or put PII on-chain.
- Use a deprecated API from §3 because it "looks right" from memory.
- Implement real fund movement inside Aniskwela (route through the VASP interface).

**Tests:** every Must-Have feature ships with its QAD happy + sad + abuse paths covered. Run the suite (via SAD-A2) before claiming done.

**Definition of Done (one task):**
- [ ] Implements the referenced `PRD-F#` / `US-##` acceptance criteria
- [ ] Framework conventions verified vs §3 (no stale APIs)
- [ ] Tests pass (`npm test` / Playwright as applicable)
- [ ] Perf budget held on touched UI; no new secrets; input validated at boundaries
- [ ] Touched a Locked doc's assumptions? → logged a Change Record

---

## 6. Materialization

| Target | File | Notes |
|--------|------|-------|
| Canonical | `docs/build-aniskwela.md` | edit here |
| All agents | `AGENTS.md` (project root) | full content; auto-read by Codex/Cursor/Gemini/Claude Code |
| Claude Code | `CLAUDE.md` | pointer to `AGENTS.md` + Claude-only notes |
| Cursor | `.cursor/rules/build.mdc` | pointer (`alwaysApply: true`) — add when Cursor is used |
| Gemini CLI | `GEMINI.md` | pointer — add when Gemini is used |

Re-materialize whenever this guide changes. Root copies are build artifacts, not sources of truth.
