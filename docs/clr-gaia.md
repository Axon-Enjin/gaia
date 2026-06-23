# Compliance & Legal Readiness Register (CLR)

**Project:** Gaia
**Date:** 2026-06-23
**Version:** 0.1
**Owner:** Carlos Jerico Dela Torre
**Status:** Draft
**Last reconciled:** N/A — pre-build

---

> ⚠️ **COUNSEL REQUIRED BEFORE PRODUCTION.** Structural and regulatory awareness only — **NOT legal advice.** This register maps obligations and flags what needs a lawyer; it does not draft your Privacy Policy or Terms of Use. Gaia handles user data and (in Phase 1) regulated financial flows — multiple Section 3 flags are set. Engage counsel qualified in the Philippines (and a financial-regulation specialist for the VASP/grant rail) before any public launch handling real learner data or funds.

---

## 0. Target Markets (drives the rest of this document)

| Region | In scope? | Notes |
|--------|-----------|-------|
| European Union / UK (GDPR / UK GDPR) | Yes (limited) | Diaspora / EU-based Filipino learners possible on a public web app; minimize and treat as in scope. |
| California, USA (CCPA / CPRA) | Yes (limited) | Same diaspora reasoning; low volume expected. |
| Philippines (Data Privacy Act 2012, RA 10173) | **Yes (primary)** | Primary market; NPC registration + DPO required before scale (PRD §11.5). |
| Other: Southeast Asia (Phase 3) | No (not yet) | Consult counsel per market at expansion (Vietnam, Indonesia). |

**Geo-blocking:** None — globally accessible web app, so all declared regions are treated as in scope. MVP mitigates by collecting minimal PII.

---

## 1. Data Inventory / Record of Processing

| Activity | Purpose | Data categories | Data subjects | Recipients / sub-processors | Cross-border transfer | Retention | Legal basis |
|----------|---------|-----------------|---------------|-----------------------------|-----------------------|-----------|-------------|
| Waitlist | Early-access list | email, locale | prospects | Supabase, PostHog | US/EU (vendor regions) | until launch or unsubscribe | consent |
| Authentication | Account access | email, hashed pw | learners/teachers/funders | Supabase Auth | vendor region | life of account + grace | contract / legitimate interest |
| Learning activity | XP/merit ledger, progress | course IDs, scores, timestamps, hashed user id | learners | Supabase | vendor region | life of account | contract |
| Course generation | Build courses | teacher-uploaded document text | teachers (and any persons named in docs) | **Azure AI Foundry / Microsoft Azure OpenAI Service** (not trained on; Azure region configurable — target SE Asia in Phase 1 for PH data-localization) | Azure region (configurable) | transient prompt; output stored | contract / legitimate interest |
| Credential issuance | Verifiable credentials | learner display name, course, score, **hash on-chain only** | learners | Stellar (public ledger — hash only), Supabase | public ledger (hash) | indefinite (credential) | consent / contract |
| Analytics | Product improvement | hashed user id, events (no PII values) | all users | PostHog, Vercel Analytics | vendor region | per tool default | legitimate interest / consent |
| Grant disbursement (Phase 1) | Pay eligible learners | recipient list, payout refs | learners | **licensed VASP / e-money partner** | per partner | per partner + audit | consent + partner KYC |

**Sensitivity flags:**

| Data type | Collected? | Notes |
|-----------|-----------|-------|
| Basic PII (name, email) | Yes | email at MVP; display name optional |
| Special-category / sensitive | No | avoid; health/finance/agri *content* ≠ sensitive personal data, but see R8 advice risk |
| Children's data (under 16 EU / 13 COPPA) | **Possibly** | learners may be minors → escalation flag (Section 3) |
| Precise location | No | region/coarse only for grant criteria |
| Photos / camera / microphone | No (MVP) | opt-in leaderboard portraits = Phase 1 |
| Device IDs / advertising IDs | No | |
| Analytics / telemetry | Yes | hashed IDs, no PII in property values |
| Crash logs | Minimal | no PII |
| Payment / card data | No (Gaia) | **handled entirely by the licensed VASP** — Gaia is not in card scope |

**Self-check:**

| Item | Done? | Evidence link | Counsel needed? |
|------|-------|---------------|-----------------|
| Every processing activity has a retention period | Partial (Draft) | — | No |
| Every sub-processor named + DPA in place | No — Phase 1 | — | Yes (DPAs with Supabase/**Azure**/**Microsoft**/PostHog/VASP) |
| Inventory dated and treated as living | Yes (2026-06-23) | this doc | No |

---

## 2. Multi-Jurisdiction Obligations Matrix

| Dimension | EU / UK GDPR | California CCPA / CPRA | Philippines DPA 2012 |
|-----------|--------------|------------------------|----------------------|
| **Consent / legal basis** | Opt-in; lawful basis per activity | Opt-out of sale/share (Gaia does not sell data) | Consent / lawful criteria; explicit for sensitive |
| **Data subject rights** | Access/rectify/erase/port/object | Know/delete/correct/opt-out | Access/correct/erase/object/portability |
| **Breach notification** | Authority ≤72h; subjects if high risk | Without unreasonable delay | **NPC + subjects ≤72h** from knowledge if real risk |
| **DPO / representative** | DPO if large-scale; EU rep if no establishment | Contact method | **Mandatory DPO + PIA + Privacy Mgmt Program** |
| **Cross-border transfer** | Adequacy/SCCs + risk assessment | Contractual flow-down | Controller stays accountable; comparable protection |
| **Our status / action** | EU rep TBD — counsel; minimize EU data | No data sale; honor delete requests | **DPO designation + NPC registration before Phase 1 scale (PRD §11.5)** |

**Watch list:** PH DPA implementing rules/NPC circulars; crypto-asset/VASP rules under BSP/SEC (affects the grant rail — R10); evolving automated-decision rules (grant eligibility is criteria-based and human-funded, but monitor).

**Self-check:**

| Item | Done? | Evidence link | Counsel needed? |
|------|-------|---------------|-----------------|
| Consent model per in-scope region | No — Phase 1 | — | Yes |
| Working data-subject-request path (access/delete) | No — Phase 1 | — | Yes |
| Breach runbook with tightest timeline (72h) | No — see OPS | — | Yes |
| DPO designated where required (PH) | No — Phase 1 appointment | — | Yes |

---

## 3. Escalation Flags — Counsel Required

| Flag | Present? | Why it escalates |
|------|----------|------------------|
| Children's data | **Yes (possible minors)** | Learners may be under 16/13 → parental consent / age-gating; design an age gate + consent flow (Phase 1) |
| Health / medical data | No (data) / **content risk** | Health *courses* could give harmful advice (R8) — ToS disclaimers + review tier, not a data-privacy issue per se |
| Payments / card data | No (Gaia) | Card/fund handling is entirely the **licensed VASP's** scope — keeps Gaia out of money-transmitter + PCI scope (deliberate, R10) |
| Biometric data | No | — |
| Large-scale monitoring/profiling | Borderline | Merit ledger is activity tracking; not behavioral profiling — keep it that way; DPIA if it grows |
| Automated decisions w/ legal/sig. effect | **Watch** | Grant *eligibility* is automated criteria evaluation but funding is partner-decided + human-initiated; document human-in-the-loop to avoid solely-automated-decision rules |
| Sale / share / behavioral ads | No | Gaia does not sell data or run behavioral ads |
| Operating in a market with no local entity | **Yes** | PH is primary — entity + DPO; EU rep if EU data retained |

**DPIA required?** Likely **Yes** for the grant-eligibility + merit-ledger system before Phase 1 scale — complete a Data Protection Impact Assessment with counsel (out of scope for this register; GDPR Art. 35 / NPC PIA).

---

## 4. Terms of Use / EULA Readiness

| Clause | Present? | Counsel needed? |
|--------|----------|-----------------|
| License grant + scope | No (Phase 1) | — |
| Acceptable use / prohibited conduct | No | — |
| Limitation of liability + warranty disclaimer | No | Yes |
| Governing law + jurisdiction (PH) | No | Yes |
| Dispute resolution | No | Yes |
| Termination + suspension | No | — |
| UGC license + DMCA (teacher-uploaded content) | No | Yes (teacher content IP + third-party material in uploads) |
| Modification / notice mechanism | No | — |
| Payment / refund terms (premium courses) | No | Yes (coordinate with VASP) |
| Age eligibility | No | Yes (minors) |
| **AI-generated content disclaimer + high-stakes-vertical waiver (R8)** | No | **Yes** — disclaim regulated-advice substitution for health/finance/agri |
| Privacy Policy incorporated by reference | No | Yes |

---

## 5. IP Infringement & Protection Readiness

| Item | Status | Counsel needed? |
|------|--------|-----------------|
| **"Gaia" trademark knockout search** (PH IPOPHL + USPTO/EUIPO, relevant classes) | **Not done — do before brand lock** | **Yes** — "Gaia" is a common word; high collision risk in software/education classes; clear before external launch |
| Open-source license compliance — SBOM (SPDX/CycloneDX) | Not done — Phase 1 | — |
| Copyleft scan (GPL/AGPL/LGPL) | Not done | — |
| Third-party assets licensed (fonts/icons/images) | System fonts only (DSD) reduces risk | — |
| AI training-data provenance + output ownership/indemnity | Review **Azure OpenAI Service** terms (not used for training; IP ownership per Microsoft agreement) | Yes |
| DMCA / takedown process (teacher uploads can infringe) | Not done — Phase 1 | Yes |
| Written IP assignment from contractors/contributors | Not done | Yes |

> **Brand-name caution:** "Gaia" is highly generic and widely used across industries (incl. tech/education). A trademark knockout search and domain/handle availability check are prerequisites before committing to the name externally — this was an open question carried from the PRD. Have a fallback shortlist ready.

---

## 6. App Store / Platform Compliance

Not shipping to a mobile app store in MVP (PWA first). Revisit at Phase 2 native apps: Apple App Privacy label, Google Play Data Safety form, account/data deletion mechanism, SDK/ad-network audit.

---

## Self-Check

- [x] §0 declares every market; geo-blocking reality honest (globally accessible)
- [x] §1 one row per processing activity, each with a retention period
- [x] §2 columns filled for in-scope regions
- [x] Every §3 "Yes" has a counsel action; banner set at top
- [x] §4 ToU clause presence checked (drafting left to counsel) incl. AI-content + high-stakes waiver
- [ ] §5 SBOM + copyleft scan (Phase 1) — **"Gaia" trademark search flagged as a pre-launch blocker**
- [x] §6 N/A for MVP (no app store)
- [x] This document maps obligations and escalates — it does not give legal advice
