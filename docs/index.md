# Documentation Index — Aniskwela

**Project slug:** `aniskwela`
**Maintained by:** Carlos Jerico Dela Torre
**Last updated:** 2026-06-25 (build progress §6 refreshed)

> **Aniskwela** (formerly "LearnChain", then "Gaia") — an AI educational tool built for Filipino farmers, with blockchain-anchored, standards-based credentials, engineered for low-bandwidth rural use (Philippines-first, EN + Filipino). The name is *ani* (harvest) + *eskwela* (school) — "harvest school": you learn, you reap, and the proof is yours to keep (echoed in the learner levels Seed → Sprout → Scholar → Expert → Mentor). The learning engine is content-agnostic, but the product is built for, and goes to market with, farmers first.

**Application code:** [client/README.md](../client/README.md) (Next.js 16 in `client/`).

---

## 1. Document Suite

| Document | File | Version | Status | Last Updated | Last Reconciled |
|----------|------|---------|--------|--------------|-----------------|
| BRD — Business Requirements | [brd-aniskwela.md](brd-aniskwela.md) | 1.1 | Locked | 2026-06-23 | N/A — pre-build |
| PRD — Product Requirements | [prd-aniskwela.md](prd-aniskwela.md) | 1.2 | Locked | 2026-06-23 | 2026-06-23 |
| DSD — Design System | [dsd-aniskwela.md](dsd-aniskwela.md) | 0.2 | Draft | 2026-06-23 | N/A — pre-build |
| SDD — System Design | [sdd-aniskwela.md](sdd-aniskwela.md) | 1.1 | Locked | 2026-06-23 | 2026-06-23 |
| QAD — QA & Test Plan | [qad-aniskwela.md](qad-aniskwela.md) | 0.1 | Draft | 2026-06-23 | N/A — pre-build |
| SAD — Subagents | [sad-aniskwela.md](sad-aniskwela.md) | 1.0 | Locked | 2026-06-23 | N/A — pre-build |
| BUILD — Build Guide | [build-aniskwela.md](build-aniskwela.md) | 1.2 | Locked | 2026-06-23 | 2026-06-23 |
| CLR — Compliance & Legal | [clr-aniskwela.md](clr-aniskwela.md) | 0.2 | Draft | 2026-06-23 | N/A — pre-build |
| GTM — Go-To-Market | [gtm-aniskwela.md](gtm-aniskwela.md) | 0.2 | Draft | 2026-06-23 | N/A — pre-build |
| OPS — Ops & Observability | [ops-aniskwela.md](ops-aniskwela.md) | 0.1 | Draft | 2026-06-23 | N/A — pre-build |

### RFCs (one per major feature)

| RFC ID | File | Feature | Status | Last Updated |
|--------|------|---------|--------|--------------|
| aniskwela-rfc-001 | [rfc-aniskwela-credential-issuance.md](rfc-aniskwela-credential-issuance.md) | Verifiable Credential issuance + Stellar hash anchoring (PRD-F4) | Approved | 2026-06-23 |
| aniskwela-rfc-002 | [rfc-aniskwela-ai-course-generation.md](rfc-aniskwela-ai-course-generation.md) | AI course generation pipeline (PRD-F1) | Approved | 2026-06-23 |

---

## 2. Change Log

Every material change to a Locked document is recorded as a Change Record. Newest first.

| CR ID | Date | Summary | Trigger doc | Docs touched | File |
|-------|------|---------|-------------|--------------|------|
| CR-001 | 2026-06-23 | Rebrand Gaia → Aniskwela + farmer-first repositioning (docs + client app) | Brand decision (PRD) | PRD, BRD, DSD, GTM, CLR, BUILD, index; all file slugs + client/ | [cr-aniskwela-001.md](cr-aniskwela-001.md) |

> Provenance: this suite supersedes the standalone `LearnChain_PRD_v2.md` (and v1). The PRD content was migrated into [prd-aniskwela.md](prd-aniskwela.md) and rebranded LearnChain → Gaia → Aniskwela (final name locked 2026-06-23 via CR-001). The original PRD markdown files were removed as superseded; the v2 changelog is preserved inside the PRD's history note.

---

## 3. Incident Log (Postmortems)

Every P0/P1 incident gets a Postmortem. Newest first.

| PM ID | Incident date | Severity | Summary | Action items closed? | File |
|-------|---------------|----------|---------|----------------------|------|
| — | — | — | None yet (pre-production). | — | — |

---

## 4. Health Check

Quick triage an agent runs at the start of a session. Anything that fails gets surfaced to the user.

- [x] Every Locked doc's **Last Reconciled** date is newer than the last code change to its area. *(BUILD §5 local-dev + client README updated 2026-06-23 for issue #5; SDD §3 waitlist table reconciled for PRD-F8.)*
- [ ] No doc has been in `Draft` longer than expected without movement. *(DSD/QAD/CLR/GTM/OPS are Draft pending the build sprint — expected.)*
- [x] Every open Change Record has propagated to all docs listed in its "Docs touched" column. *(None open.)*
- [x] Feature IDs (`PRD-F#`) referenced by SDD / RFC / QAD / SAD / BUILD still exist in the PRD.
- [x] Metric IDs (`BRD-M#`) flow to the GTM and have a feeding event in PRD §5.5.
- [x] The SAD roster matches the materialized agent files (`.claude/agents/`).
- [x] The BUILD guide's pinned versions and golden-path samples have been re-verified recently. *(Next.js 16.2.x verified 2026-06-23 via nextjs.org; Azure AI Foundry GPT models verified 2026-06-23 via learn.microsoft.com.)*
- [x] Every open Postmortem's action items are closed. *(None.)*

---

## 5. Notes

- **Scale:** Full (public users, three roles, NGO/government partners, regulated-adjacent flows, compliance program). All 11 numbered docs apply.
- **Application onboarding:** [client/README.md](../client/README.md) — env, Supabase dev, migrations, auth.
- **Two source-of-truth materializations:** the BUILD guide materializes to root `AGENTS.md` (+ `CLAUDE.md` pointer); the SAD materializes to `.claude/agents/`. Edit the canonical `docs/` copies, then re-materialize — never hand-edit the materialized copies.
- **Pitch deck:** `LearnChain_VC_Pitch_Deck.pptx/.pdf` still carry the old name and need a rebrand pass to Aniskwela before any external use.

---

## 6. Build Progress (M3 — living tracker)

The application lives in **`client/`** (Next.js 16.2.9, Supabase, Azure AI Foundry). Migrations: `client/db/migrations/` (`0001_init` … `0007_grant_disbursements`).

| PRD-F# | Feature | Status | Notes |
|--------|---------|--------|-------|
| F1 | AI course generation | **Done** | `POST /api/courses/generate`, RFC-002 |
| F2 | Course viewer & quiz | **Done** | Enroll, lesson reader, server-graded quiz, progress JSON |
| F3 | Gamification & merit ledger | **Done** | `merit_ledger` + badges + learner dashboard (`/learner`) |
| F4 | VC issuance | **Done** | `POST /api/credentials/issue`, OB 3.0 JSON-LD + Ed25519, Stellar hash anchor |
| F5 | Public verifier | **Done** | `GET /api/verify/[id]`, `/verify/[id]` page |
| F6 | Teacher dashboard | **Done** | Course editor, passing score, publish, learner analytics per course |
| F7 | Learner dashboard & wallet | **Done** | `/learner`, `/learner/credentials`, grant status, share links, QR |
| F8 | Landing + waitlist | **Done** | Brand Mode `/`, `POST /api/waitlist`, PR [#14](https://github.com/Axon-Enjin/feat/prd-f8-landing-waitlist) |
| F9 | Localization EN/Fil | **Done** | `next-intl`, cookie-persisted locale, localized metadata/nav/shells, locale-aware dates and numbers |
| F10 | Funder grant (mock) | **Done** | `/funder`, `POST /api/grants/evaluate`, `POST /api/grants/disburse`, audit CSV |
| F11 | Freighter wallet | **Done** | Client-side Freighter connect panel on learner wallet and funder dashboard |
| F12–F15 | Phase 1 / out of MVP | **Deferred** | Per PRD §6 |

### Suggested next PRDs (no blockers beyond env/infra)

1. **Infra** — Vercel deploy, production Stellar/issuer secrets in secrets manager.
2. **PRD-F12 / F13** — Adaptive engine + offline caching for Phase 1.
3. **Native-speaker QA** — Filipino copy review across all localized surfaces.

Task board detail: [rhandie-tasks.md](../rhandie-tasks.md).
