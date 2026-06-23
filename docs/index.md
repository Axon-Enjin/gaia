# Documentation Index — Aniskwela

**Project slug:** `aniskwela`
**Maintained by:** Carlos Jerico Dela Torre
**Last updated:** 2026-06-23

> **Aniskwela** (formerly "LearnChain", then "Gaia") — an AI educational tool built for Filipino farmers, with blockchain-anchored, standards-based credentials, engineered for low-bandwidth rural use (Philippines-first, EN + Filipino). The name is *ani* (harvest) + *eskwela* (school) — "harvest school": you learn, you reap, and the proof is yours to keep (echoed in the learner levels Seed → Sprout → Scholar → Expert → Mentor). The learning engine is content-agnostic, but the product is built for, and goes to market with, farmers first.

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

- [x] Every Locked doc's **Last Reconciled** date is newer than the last code change to its area. *(N/A — no code yet.)*
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
- **Two source-of-truth materializations:** the BUILD guide materializes to root `AGENTS.md` (+ `CLAUDE.md` pointer); the SAD materializes to `.claude/agents/`. Edit the canonical `docs/` copies, then re-materialize — never hand-edit the materialized copies.
- **Pitch deck:** `LearnChain_VC_Pitch_Deck.pptx/.pdf` still carry the old name and need a rebrand pass to Aniskwela before any external use.
