# Documentation Index — Aniskwela

**Project slug:** `aniskwela`
**Maintained by:** Carlos Jerico Dela Torre
**Last updated:** 2026-06-26

> **Aniskwela** (formerly "LearnChain", then "Gaia") — an AI educational tool built for Filipino farmers, with blockchain-anchored, standards-based credentials, engineered for low-bandwidth rural use (Philippines-first, EN + Filipino). The name is *ani* (harvest) + *eskwela* (school) — "harvest school": you learn, you reap, and the proof is yours to keep (echoed in the learner levels Seed → Sprout → Scholar → Expert → Mentor). The learning engine is content-agnostic, but the product is built for, and goes to market with, farmers first.

---

## 1. Document Suite

| Document | File | Version | Status | Last Updated | Last Reconciled |
|----------|------|---------|--------|--------------|-----------------|
| BRD — Business Requirements | [brd-aniskwela.md](brd-aniskwela.md) | 1.1 | Locked | 2026-06-23 | 2026-06-26 |
| PRD — Product Requirements | [prd-aniskwela.md](prd-aniskwela.md) | 1.2 | Locked | 2026-06-23 | 2026-06-26 |
| DSD — Design System | [dsd-aniskwela.md](dsd-aniskwela.md) | 0.2 | Draft | 2026-06-23 | 2026-06-26 |
| SDD — System Design | [sdd-aniskwela.md](sdd-aniskwela.md) | 1.1 | Locked | 2026-06-23 | 2026-06-26 |
| QAD — QA & Test Plan | [qad-aniskwela.md](qad-aniskwela.md) | 0.1 | Draft | 2026-06-23 | 2026-06-26 |
| SAD — Subagents | [sad-aniskwela.md](sad-aniskwela.md) | 1.0 | Locked | 2026-06-23 | 2026-06-26 |
| BUILD — Build Guide | [build-aniskwela.md](build-aniskwela.md) | 1.2 | Locked | 2026-06-23 | 2026-06-26 |
| CLR — Compliance & Legal | [clr-aniskwela.md](clr-aniskwela.md) | 0.2 | Draft | 2026-06-23 | 2026-06-26 |
| GTM — Go-To-Market | [gtm-aniskwela.md](gtm-aniskwela.md) | 0.2 | Draft | 2026-06-23 | 2026-06-26 |
| OPS — Ops & Observability | [ops-aniskwela.md](ops-aniskwela.md) | 0.1 | Draft | 2026-06-23 | 2026-06-26 |

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

- [x] Every Locked doc's **Last Reconciled** date is newer than the last code change to its area. *(Reconciled 2026-06-26 against `client/` M3 slice.)*
- [ ] No doc has been in `Draft` longer than expected without movement. *(DSD/QAD/CLR/GTM/OPS are Draft pending the build sprint. DSD tokens not yet materialized in `client/src/app/globals.css`.)*
- [x] Every open Change Record has propagated to all docs listed in its "Docs touched" column. *(None open.)*
- [x] Feature IDs (`PRD-F#`) referenced by SDD / RFC / QAD / SAD / BUILD still exist in the PRD.
- [x] Metric IDs (`BRD-M#`) flow to the GTM and have a feeding event in PRD §5.5.
- [x] The SAD roster matches the materialized agent files (`.claude/agents/`).
- [x] The BUILD guide's pinned versions and golden-path samples have been re-verified recently. *(Next.js 16.2.x verified 2026-06-23 via nextjs.org; Azure AI Foundry GPT models verified 2026-06-23 via learn.microsoft.com.)*
- [x] Every open Postmortem's action items are closed. *(None.)*
- [x] Build Status matrix (§6) matches the current `client/` codebase.

---

## 5. Notes

- **Scale:** Full (public users, three roles, NGO/government partners, regulated-adjacent flows, compliance program). All 11 numbered docs apply.
- **Two source-of-truth materializations:** the BUILD guide materializes to root `AGENTS.md` (+ `CLAUDE.md` pointer); the SAD materializes to `.claude/agents/`. Edit the canonical `docs/` copies, then re-materialize. Do not hand-edit the materialized copies.
- **Application code:** lives in [`client/`](../client/). Run `npm run dev` from that directory after copying [`client/.env.example`](../client/.env.example) to `.env.local`.
- **Pitch deck:** [`Aniskwela-Grant-Pitch.pptx`](../Aniskwela-Grant-Pitch.pptx) (grant/partner deck) with speaker script in [`pitch-script-aniskwela.md`](pitch-script-aniskwela.md). Regenerate via [`scripts/build_pitch_deck.py`](../scripts/build_pitch_deck.py).
- **Open M2 task:** DSD earthen palette tokens are documented but not yet applied in `client/src/app/globals.css` (still default Next.js theme).

---

## 6. Build Status

Reconciled against `client/` on 2026-06-26. The Locked specs describe the full product; this matrix tracks what is implemented in code today.

| PRD-F# | Feature | Code status | Notes |
|--------|---------|-------------|-------|
| PRD-F1 | AI Course Generation | **Built** | `client/src/lib/ai/`, `POST /api/courses/generate` |
| PRD-F2 | Course Viewer & Quiz | **Partial** | Published lessons render; quiz is display-only (no submit/score) |
| PRD-F3 | Gamification & Merit Ledger | **Schema only** | `merit_ledger`, `badges` tables + RLS; no award logic or UI |
| PRD-F4 | Verifiable Credential Issuance | **Schema only** | `credentials` table; no `lib/credentials/` or issuance flow |
| PRD-F5 | Public Credential Verifier | **Not started** | No verifier route or endpoint |
| PRD-F6 | Teacher Dashboard | **Partial** | Upload/generate + publish; no course editor or analytics |
| PRD-F7 | Learner Dashboard & Credential Wallet | **Not started** | Catalog/detail only; no XP bar, wallet, or enrollments |
| PRD-F8 | Landing Page + Waitlist | **Partial** | Home page exists; no waitlist capture |
| PRD-F9 | Localization (EN/Filipino) | **Built** | `next-intl`, cookie locale, `messages/en.json` + `fil.json` |
| PRD-F10 | Funder Grant Program (mock) | **Schema only** | `grant_programs` table; no funder UI |
| PRD-F11 | Wallet Connect (Freighter) | **Not started** | |
| PRD-F12 | AI Assist Adaptive Engine | **Not started** | Phase 1 |
| PRD-F13 | Offline Lesson Caching (PWA) | **Not started** | Phase 1 |
| PRD-F14 | Real Stablecoin Disbursement | **Out of scope** | v1 / MVP |
| PRD-F15 | Org Multi-Seat Workspaces | **Out of scope** | v1 / MVP |

**Also built:** Supabase SSR auth (`proxy.ts`, Server Actions), Next.js 16 Cache Components on public reads, initial migration `client/db/migrations/0001_init.sql`, bundle budget script (~174 KB gz shared JS).

**Infra not yet wired:** Azure AI Foundry provisioning, Vercel deploy, `client/.env.example` must be copied locally; `ENABLE_ONCHAIN_ANCHOR` flag defined but unused.
