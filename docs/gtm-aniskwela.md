# Go-To-Market (GTM) Strategy

**Project:** Aniskwela
**Date:** 2026-06-23
**Version:** 0.2
**Owner:** Carlos Jerico Dela Torre
**Status:** Draft
**Last reconciled:** N/A — pre-build
**PRD:** [prd-aniskwela.md](prd-aniskwela.md)

> **Status:** Draft — the immediate motion is the hackathon demo + waitlist; the broader launch motion firms up post-demo. Public launch is gated on **CLR clearance** (§6).

---

## 1. Product Summary (GTM View)

**What it does (one sentence):** Aniskwela is an AI educational tool for Filipino farmers — it turns any document into an AI-built course, lets low-bandwidth rural learners earn a verifiable, blockchain-anchored credential, and lets NGOs fund the most consistent learners transparently.

**Who it's for:** Rural and low-income learners and the teachers/NGOs/funders who serve them in the Philippines and emerging markets — people the global EdTech incumbents price and engineer out.

**Core value proposition:** Learning that's accessible on a 1GB phone over 3G, in Filipino, that produces a credential employers and funders can actually verify — learning-first, with rewards as an earned outcome, not a gimmick.

**Category:** EdTech × Web3 × social impact (verifiable-credential learning for emerging markets).

---

## 2. Target Audience

**Primary ICP:**
- *Who:* Philippine NGOs, foundations, and government education programs (TESDA/DepEd/DICT-adjacent) running skills programs for rural/underserved learners; plus the subject-matter teachers/coaches they work with.
- *Where they hang out:* development-sector networks, DTI/TESDA channels, education and impact conferences, LinkedIn, Stellar/blockchain-for-good ecosystem events.
- *What they already believe:* funding education is hard to target and audit; existing platforms don't fit rural reality.
- *What will make them try this:* a live demo of upload → AI course → learner completion → verifiable on-chain credential, plus a transparent funder dashboard.

**Secondary audience:**
- *Who:* Blockchain ecosystem grant judges and impact investors (the immediate funding source).
- *Why secondary for adoption (primary for funding):* they don't use the product daily, but they fund it; the hackathon demo targets them directly.

---

## 3. Pricing Model

**Model:** `Freemium` (learning is free to learners; teachers/orgs monetize; platform takes a promotional rate).

| Tier | Price | What's Included | Limit / Gate |
|------|-------|-----------------|--------------|
| Learner | Free | All learning, XP/merit, credentials | — |
| Teacher Free | $0 | Up to 3 published courses, AI generation, 100 learner seats | 3 courses |
| Teacher Pro | $9/mo (future) | Unlimited courses, AI Assist mode, analytics, priority support | — |
| Org Starter | Free | Up to 5 teacher seats, 500 learner seats | seats |
| Org Pro | $49/mo (future) | Unlimited seats, branding, funder dashboard, SLA | — |

**Pricing rationale:** Adoption and public-good positioning first; teachers keep the large majority of revenue at a low promotional take rate. **Open decision (PRD §7.3):** a 1% take rate does not cover ~3% payment processing + infra + support; revisit toward an industry-competitive ~15–20% ("lowest in market") or time-box the promo before scale. Ecosystem grants subsidize the near-term.

**Payment processor:** course payments and any disbursement route through a **licensed PH VASP / e-money rail** (Phase 1) — Aniskwela does not process funds directly.

---

## 4. Positioning & Messaging

**Tagline:** `Magsaka. Mag-aral. Mag-ani ng patunay.` (Farm. Learn. Harvest the proof.)

**Primary message (landing hero):**
"Aniskwela turns any farming lesson into a course in minutes, runs on the slowest phone, and gives every farmer a credential the world can verify. Learning-first — rewards are earned, not dangled."

**Proof points:**
- Live: upload → AI course → learner completion → W3C credential anchored on Stellar, verifiable with no login.
- Built for sub-3G, 1GB-RAM Android, Filipino-first — the incumbents don't.
- Learning-first merit ledger that NGOs can fund against transparently (vs reward-first competitors that collapse when funding stops).

**Objection handling:**

| Objection | Response |
|-----------|----------|
| "Another learn-to-earn crypto thing." | No — learning-first. XP is a merit signal, never a payout tournament; the chain only anchors a credential hash. |
| "Is this just for crypto people?" | Learners never need a wallet; the blockchain is invisible plumbing for tamper-proof credentials. |
| "How is this different from Duolingo/Coursera?" | Filipino-first, sub-3G, teacher-built courses with high revenue share, and credentials funders can verify and fund against. |
| "Can we trust AI-generated courses?" | Every course is teacher-reviewed before publish; high-stakes topics get an extra review tier. |

---

## 5. Launch Channels & Tactics

**Owned channels:**

| Channel | Audience Size | Planned Action |
|---------|--------------|----------------|
| Landing page (EN/Filipino) + waitlist | building | The pitch artifact + conversion tool; demo CTA |
| Founder network / DTI–TESDA contacts | small/warm | Direct partner intros for pilot NGOs |

**Community / earned channels:**

| Channel | Tactic | Timing |
|---------|--------|--------|
| Hackathon demo + judges | Live full-flow demo; grant pitch | Demo day |
| Stellar / blockchain-for-good ecosystem | Showcase verifiable-credential + grant rail | Post-demo |
| PH education / impact networks | Pilot recruitment (3 NGOs, 2 gov agencies — BRD goal) | Months 1–3 |

**Content assets needed before launch:**
- [ ] Landing page with clear CTA + the three proof points (PRD-F8)
- [ ] 60–90s demo video of the full flow
- [ ] One-pager / pitch deck **rebranded LearnChain → Aniskwela** (current deck still says LearnChain)
- [ ] Public verifier demo link + sample credential

---

## 6. Launch Phases

| Phase | Criteria to Enter | Target Date | Goal |
|-------|------------------|-------------|------|
| **Demo / Alpha** | Core flows pass QAD; 0 P0/P1 | End of 3-week sprint | Judge score ≥8/10 (BRD-M1); waitlist live |
| **Beta** (invite/waitlist) | Demo feedback addressed; no P0 | Months 1–2 | 3 pilot NGOs + 2 gov agencies; early learners/teachers |
| **Public Launch** | Beta retention hit; **CLR cleared** (no open §3 counsel flags — DPO/NPC, ToS, "Aniskwela" trademark — see [clr-aniskwela.md](clr-aniskwela.md)); VASP rail live | Month 3+ | 500 learners, 50 courses (BRD-M3/M4) |
| **Post-launch** | — | Month 3+ | First partner-funded grant program (BRD-M7); 10 Mainnet credentials (BRD-M6) |

---

## 7. Success Metrics (post-launch)

| BRD-M# | Metric | Target | How to Measure (event / source) |
|--------|--------|--------|----------------------------------|
| BRD-M1 | Hackathon judge score | ≥ 8/10 | judges' rubric on demo day |
| BRD-M2 | Waitlist signups | 200 in 7 days | `waitlist_submitted` count (PostHog) |
| BRD-M3 | Registered learners | 500 @ 3mo | `signup_completed` where role=learner |
| BRD-M4 | Published courses | 50 @ 3mo | `course_published` count |
| BRD-M5 | DAU/MAU | 15–18% @ 3mo | `lesson_completed` daily/monthly actives |
| BRD-M6 | Credentials on Mainnet | 10 @ 3mo | `credential_issued` where network=mainnet |
| BRD-M7 | Partner-funded grant programs | 1 @ 3mo | `grant_program_funded` where simulated=false |

---

## Self-Check

- [x] §2 ICP specific enough to name real organizations (PH NGOs, TESDA/DepEd, Stellar ecosystem)
- [x] §3 pricing has a clear gate + the take-rate sustainability decision flagged
- [ ] §5 content assets created before launch (incl. **deck rebrand to Aniskwela**)
- [x] §6 phase criteria are binary; public launch gated on CLR
- [x] §7 metrics trace to BRD-M# and PRD §5.5 events (measurable day 1)
- [x] Drafted before launch, not as a retrospective
