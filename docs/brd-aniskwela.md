# Business Requirements Document (BRD)

**Project:** Aniskwela
**Date:** 2026-06-23
**Version:** 1.1
**Owner:** Carlos Jerico Dela Torre
**Status:** Locked
**Last reconciled:** N/A — pre-build

---

## 1. Executive Summary

Aniskwela is an AI educational tool built for Filipino farmers — delivering gamified, blockchain-verified agricultural and livelihood education to anyone with a low-end smartphone and a low-bandwidth connection in rural emerging markets, starting in the Philippines. (The learning engine is content-agnostic and can serve any subject; farmers are the deliberate first market and the brand focus.) Teachers turn raw materials (PDFs, docs) into structured courses in minutes; learners build a persistent, tamper-evident record of consistency and growth; and NGOs, governments, and foundations can fund the most deserving learners against transparent, verifiable criteria. Aniskwela sits at the intersection of EdTech, Web3, and social impact, and is positioned to win blockchain-ecosystem grants and EdTech investment by being **learning-first** where competitors are reward-first.

---

## 2. The Problem & Opportunity

**The Problem:**
- **Learners** in rural and low-income markets are excluded by expensive, English-centric, high-bandwidth platforms (Coursera, Udemy). Content is linear and lecture-heavy with no reinforcement scheduling, so learners forget as fast as they consume. Credentials are easily faked and hard to verify across borders.
- **Teachers/creators** face a high barrier to building courses (video tools, LMS, time) and earn almost nothing on centralized platforms that take 30–50% of revenue.
- **Funders/NGOs** want to fund education but have no verifiable, transparent way to target merit-based grants to individual learners, and no neutral programmable rail tied to verifiable outcomes.

**The Opportunity:**
Three forces now make this buildable cheaply and credibly: (1) frontier LLMs can convert raw material into structured, pedagogically-sound courses at near-zero marginal cost; (2) open credential standards (W3C Verifiable Credentials + Open Badges 3.0) make credentials portable and instantly credible to institutions; (3) Stellar provides sub-cent settlement and asset rails suited to micro-grants in emerging markets. A learning-first platform that combines these — localized for Filipino and engineered for sub-3G devices — has no direct competitor.

**Target Customer / User:**
Three sides of one marketplace — rural/low-income **learners** on 1GB-RAM Android phones; subject-matter-expert **teachers/coaches** without coding or video skills; and **funders** (NGOs, government agencies like TESDA/DepEd, foundations, CSR programs) seeking transparent, merit-based education grants.

---

## 3. Strategic Alignment

- **Immediate (0–3 weeks):** win a blockchain ecosystem hackathon and the grant/credibility that follows — the near-term funding source. Success = a convincing live demo of the full flow (upload → AI course → learner completion → Stellar-anchored credential) plus a working waitlist.
- **12 months:** establish a defensible position in PH education — a learning-first moat (sustained learning attracts continued grant funding where reward-first engagement collapses), reinforced by Filipino-first localization, low-cost Stellar rails, and offline-capable sub-3G design that global incumbents do not build for.
- This maps to a public-good thesis fundable by ecosystem foundations (Stellar Development Foundation), DTI/TESDA channels, and impact investors — not a pure-commercial SaaS thesis.

---

## 4. Scope

**In Scope:**
- AI course generation from teacher-uploaded text/PDF, with mandatory human review before publish.
- Merit-based gamification (XP, streaks, badges, levels) forming a persistent merit ledger.
- Standards-based credential issuance (W3C VC + Open Badges 3.0) with a tamper-evidence hash anchored on Stellar, plus a public no-login verifier.
- A grant-eligibility layer (criteria evaluated against the merit ledger) with a funder dashboard — *mock/simulated disbursement for the MVP*.
- Filipino + English localization and sub-3G low-resource performance as hard constraints.

**Out of Scope:**
- Aniskwela acting as a money transmitter — **real disbursement always routes through a licensed VASP / e-money partner**; Aniskwela is the eligibility-decision layer only.
- "Learn-to-earn" reward tournaments — Aniskwela is learning-first; rewards are an outcome, not the hook.
- Video upload/processing, the full AI Assist adaptive engine, native mobile apps, and org multi-seat workspaces — all post-MVP (see PRD §6 and roadmap).
- Drafting legal policies, KYC at scale, and on-chain smart-contract disbursement — deferred / counsel-gated.

---

## 5. Success Metrics

| ID | Metric | Baseline | Target | Timeline |
|----|--------|----------|--------|----------|
| BRD-M1 | Hackathon judge score (innovation + social impact) | 0 | ≥ 8/10 | Demo day (end of 3-week sprint) |
| BRD-M2 | Waitlist signups (real emails) | 0 | 200 | Within 7 days of landing-page launch |
| BRD-M3 | Registered learners | 0 | 500 | 3 months post-launch |
| BRD-M4 | Published courses | 0 | 50 | 3 months post-launch |
| BRD-M5 | DAU/MAU ratio (habit signal) | 0 | 15–18% (stretch 22%) | 3 months post-launch |
| BRD-M6 | Credentials anchored on Stellar Mainnet | 0 | 10 | 3 months post-launch |
| BRD-M7 | Grant programs funded by an NGO/foundation partner | 0 | 1 | 3 months post-launch |

*DAU/MAU target reset to the industry-realistic 15–18% (Duolingo, the gamification leader, sits ~15–20%); the earlier 30% figure was ~2× the norm.*

---

## 6. Stakeholders & Owners

| Role | Person | Responsibility |
|------|--------|----------------|
| Sponsor / Decision Maker | Carlos Jerico Dela Torre | Final approval, funding direction, grant/partner relationships |
| Business Owner | Carlos Jerico Dela Torre | Accountable for outcomes and metrics above |
| Product / Tech Lead | Carlos Jerico Dela Torre (+ hackathon team) | Delivering the build |
| Compliance liaison (Phase 1) | TBD (DTI/NPC channel) | DPA compliance, VASP partner routing |

*Solo-founder-led with a hackathon team; all three core hats currently sit with the owner. The compliance liaison is a Phase 1 appointment, not an MVP blocker.*

---

## Self-Check

- [x] Section 1 is readable by a non-technical stakeholder and conveys business value
- [x] Section 2 quantifies the problem (30–50% platform take, sub-3G exclusion, no verifiable grant rail)
- [x] Section 5 has metrics with numbers and timelines
- [x] Section 4 explicitly names out-of-scope items (money transmission, learn-to-earn, video, native apps)
- [x] Nothing here describes *how* to build (architecture lives in the SDD)
