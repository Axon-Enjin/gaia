# Documentation Index — Gaia

**Project slug:** `gaia`
**Maintained by:** Carlos Jerico Dela Torre
**Last updated:** 2026-06-23

> **Gaia** (formerly "LearnChain") — AI-powered adaptive learning with standards-based, blockchain-anchored credentials, built learning-first for low-bandwidth emerging markets (Philippines-first, EN + Filipino). The name evokes the Earth — "education for every human on Earth" — and the growth metaphor already in the product (learner levels Seed → Sprout → Scholar → Expert → Mentor).

**Application code:** [client/README.md](../client/README.md) (Next.js 16 in `client/`).

---

## 1. Document Suite

| Document | File | Version | Status | Last Updated | Last Reconciled |
|----------|------|---------|--------|--------------|-----------------|
| BRD — Business Requirements | [brd-gaia.md](brd-gaia.md) | 1.0 | Locked | 2026-06-23 | N/A — pre-build |
| PRD — Product Requirements | [prd-gaia.md](prd-gaia.md) | 1.1 | Locked | 2026-06-23 | 2026-06-23 |
| DSD — Design System | [dsd-gaia.md](dsd-gaia.md) | 0.1 | Draft | 2026-06-23 | N/A — pre-build |
| SDD — System Design | [sdd-gaia.md](sdd-gaia.md) | 1.1 | Locked | 2026-06-23 | 2026-06-23 |
| QAD — QA & Test Plan | [qad-gaia.md](qad-gaia.md) | 0.1 | Draft | 2026-06-23 | N/A — pre-build |
| SAD — Subagents | [sad-gaia.md](sad-gaia.md) | 1.0 | Locked | 2026-06-23 | N/A — pre-build |
| BUILD — Build Guide | [build-gaia.md](build-gaia.md) | 1.1 | Locked | 2026-06-23 | 2026-06-23 |
| CLR — Compliance & Legal | [clr-gaia.md](clr-gaia.md) | 0.1 | Draft | 2026-06-23 | N/A — pre-build |
| GTM — Go-To-Market | [gtm-gaia.md](gtm-gaia.md) | 0.1 | Draft | 2026-06-23 | N/A — pre-build |
| OPS — Ops & Observability | [ops-gaia.md](ops-gaia.md) | 0.1 | Draft | 2026-06-23 | N/A — pre-build |

### RFCs (one per major feature)

| RFC ID | File | Feature | Status | Last Updated |
|--------|------|---------|--------|--------------|
| gaia-rfc-001 | [rfc-gaia-credential-issuance.md](rfc-gaia-credential-issuance.md) | Verifiable Credential issuance + Stellar hash anchoring (PRD-F4) | Approved | 2026-06-23 |
| gaia-rfc-002 | [rfc-gaia-ai-course-generation.md](rfc-gaia-ai-course-generation.md) | AI course generation pipeline (PRD-F1) | Approved | 2026-06-23 |

---

## 2. Change Log

Every material change to a Locked document is recorded as a Change Record. Newest first.

| CR ID | Date | Summary | Trigger doc | Docs touched | File |
|-------|------|---------|-------------|--------------|------|
| — | — | No change records yet. Suite created from LearnChain PRD v2 at v1.0, updated to 1.1 with Next.js 16 and Azure AI Foundry. | — | — | — |

> Provenance: this suite supersedes the standalone `LearnChain_PRD_v2.md` (and v1). The PRD content was migrated into [prd-gaia.md](prd-gaia.md) and rebranded LearnChain → Gaia. The original PRD markdown files were removed as superseded; the v2 changelog is preserved inside the PRD's history note.

---

## 3. Incident Log (Postmortems)

Every P0/P1 incident gets a Postmortem. Newest first.

| PM ID | Incident date | Severity | Summary | Action items closed? | File |
|-------|---------------|----------|---------|----------------------|------|
| — | — | — | None yet (pre-production). | — | — |

---

## 4. Health Check

Quick triage an agent runs at the start of a session. Anything that fails gets surfaced to the user.

- [x] Every Locked doc's **Last Reconciled** date is newer than the last code change to its area. *(BUILD §5 local-dev + client README updated 2026-06-23 for issue #5.)*
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
- **Pitch deck:** `LearnChain_VC_Pitch_Deck.pptx/.pdf` still carry the old name and need a rebrand pass to Gaia before any external use.
