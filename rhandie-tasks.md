# Rhandie's Task Board — Aniskwela

**Role:** Lead Engineer (Full-Stack, Azure Infrastructure, AI Foundry)
**Context:** Aniskwela `v1.1` (Next.js 16.2.x + Supabase + Azure AI Foundry GPT)

This document tracks the core implementation tasks tailored to Rhandie's expertise, bridging the Azure infrastructure, the AI generation pipeline, and the Next.js full-stack foundation.

---

## 1. Azure Infrastructure & AI Foundry Setup
*Goal: Provision the AI backend securely and establish the cloud foundation.*

- [ ] **Provision Azure AI Foundry:** Create the Azure AI resource, ensuring it is in a region with sufficient quota for the required models. _(Infra — Azure portal; not codeable here.)_
- [ ] **Deploy Models:** Deploy the required OpenAI models and configure their exact deployment names: _(Infra — Azure portal.)_
  - `gpt-5-4` (mapped to `gpt-5.4`) for heavy course generation.
  - `gpt-5-4-mini` (mapped to `gpt-5.4-mini`) for cheap structural tasks.
- [x] **Configure Managed Identity:** Set up `DefaultAzureCredential` so the Next.js backend can authenticate with Azure AI without hardcoding `AZURE_OPENAI_API_KEY`. _(Code: `src/lib/ai/client.ts` — Managed Identity preferred, API key local-dev fallback.)_
- [ ] **Vercel Setup:** Initialize the Vercel project and inject the necessary environment variables (`AZURE_OPENAI_ENDPOINT`, Supabase URL/Anon keys). _(Infra — Vercel dashboard; env contract documented in `client/.env.example`.)_

## 2. Next.js 16 Full-Stack Foundation
*Goal: Lay the boilerplate following the strict `build-aniskwela.md` guardrails.*

- [x] **Initialize Next.js 16.2.x:** Setup the App Router with Turbopack and Tailwind CSS. _(`client/` — Next 16.2.9, src-dir, Turbopack default.)_
- [x] **Authentication Boundary:** Implement Supabase SSR auth. Avoid using `middleware.ts` for complex logic; use `proxy.ts` for headers/redirects and handle auth in layouts and Server Actions. _(`src/proxy.ts` refreshes session only; role/ownership in `src/app/teacher/page.tsx` + RLS.)_
- [x] **Database & RLS:** Scaffold the initial Supabase Postgres tables (`courses`, `lessons`, `merit_ledger`) and enforce Row Level Security so ownership is strictly checked server-side. _(`db/migrations/0001_init.sql` — all SDD §3 tables, RLS on every table.)_
- [x] **Supabase dev project (issue #5):** Cloud dev project provisioned; migrations `0001_init` + `0002_course_sources_storage` applied; env contract in `client/.env.example`; dev docs in `client/README.md` + `client/db/README.md`. _([#5](https://github.com/Axon-Enjin/gaia/issues/5), PR #11.)_
- [x] **Explicit Caching:** Establish data fetching patterns utilizing the new `'use cache'` directive where applicable, strictly avoiding legacy Next.js 14 sync APIs. _(`cacheComponents: true`; `src/lib/courses/catalog.ts` uses `'use cache'` + `cacheTag`/`cacheLife` on the cookieless public read path.)_

## 3. AI Course Generation Pipeline (PRD-F1)
*Goal: Build the core AI pipeline that turns raw text into structured courses.*

- [x] **SDK Integration:** Implement `lib/ai/courseGen.ts` utilizing `openai` + `@azure/openai` + `@azure/identity` with the `AzureOpenAI` client. _(`src/lib/ai/course-gen.ts` + `client.ts`.)_
- [x] **System Prompt & Caching:** Write the pedagogical system prompt + Zod JSON schema contract. Ensure this static content is placed *first* in the message array to trigger Azure's automatic prefix caching (≥ 1024 tokens). _(`src/lib/ai/prompts.ts`, `course-schema.ts`; system message sent first.)_
- [x] **Schema Validation & Repair:** Implement the safety mechanism where AI output is strictly validated against a Zod schema. If it fails, trigger a single, bounded repair call using `gpt-5-4-mini` before throwing a 422 error. _(`course-gen.ts` — one repair pass, then 422.)_
- [x] **Untrusted Input Handling:** Ensure uploaded teacher documents are properly sanitized and wrapped as untrusted input before being sent to the LLM. _(`src/lib/ai/untrusted.ts` — delimited + length-capped.)_

## 4. Feature UI & Edge Integrations
*Goal: Connect the backend pipelines to the low-resource frontend.*

- [x] **Teacher Dashboard:** Build the "Upload & Generate" flow, including uploading a PDF, extracting text on the server, and polling the AI pipeline for the generated JSON draft. _(`src/app/teacher/page.tsx` + `components/upload-generate-form.tsx` + `POST /api/courses/generate`; PDF/text extraction in `lib/ai/extract-text.ts`. Synchronous bounded call per rfc-aniskwela-002 §State Management — background worker is a noted scale-up.)_
- [x] **Cost-Gated Interactions:** Ensure the UI never triggers AI on the learner's read path. AI is strictly isolated to the teacher's creation flow. _(Learner catalog `/courses` reads DB only via cached cookieless client; AI only in the teacher route.)_
- [x] **Low-Resource UI:** Implement the English/Filipino localization toggle and ensure the initial JS payload respects the 220KB budget. _(`components/locale-switcher.tsx`; measured shared initial JS ≈ 174 KB gz < 220 KB via `scripts/measure-bundle.js`.)_

## 5. PRD-F8 — Landing Page + Waitlist
*Goal: Marketing surface and email capture for BRD-M2 (hackathon / early access).*

- [x] **Waitlist migration:** `client/db/migrations/0003_waitlist.sql` — RLS on, no public policies; service-role insert only.
- [x] **Waitlist API:** `POST /api/waitlist` — Zod validation, dedupe (`409`), requires `SUPABASE_SERVICE_ROLE_KEY`.
- [x] **Brand Mode landing:** Full scroll landing at `/` — sticky nav, hero, demo showcase, features, tech stack, CSS mockups, FAQ, closing waitlist CTA. _(`src/components/landing/*`; EN/Fil `Landing` namespace.)_
- [x] **DSD tokens in CSS:** Earthen brand palette in `globals.css` (warm paper bg, growth/soil accents, weave pattern — no web fonts).

## 6. PRD Implementation — What's Next

### Completed in code

- [x] **PRD-F7:** Learner dashboard and wallet complete, including grant-status visibility on `/learner`.
- [x] **PRD-F9:** EN/FIL localization complete across shipped product surfaces, including locale-aware metadata and formatting.
- [x] **PRD-F11:** Freighter demo wallet connect added on learner wallet and funder dashboard surfaces.

### Remaining priorities

| Priority | PRD | Why now |
|----------|-----|---------|
| 1 | **Infra** | Vercel project setup, production secrets, Azure model deployments |
| 2 | **Native-speaker localization QA** | Filipino copy review and correction pass on shipped translations |
| 3 | **Phase 1 features** | F12 adaptive engine and F13 offline caching remain deferred |

**Infra still open:** Azure model deploy + Vercel env (§1), apply `0003_waitlist` on any Supabase env missing it.

See [docs/index.md](docs/index.md) §6 for the full PRD status matrix.
