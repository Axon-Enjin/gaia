# Operations & Observability Runbook (OPS)

**Project:** Aniskwela
**Date:** 2026-06-23
**Version:** 0.1
**Owner:** Carlos Jerico Dela Torre
**Status:** Draft
**Last reconciled:** N/A — pre-production
**SDD:** [sdd-aniskwela.md](sdd-aniskwela.md)

> **Status:** Draft — the MVP runs at demo scale; this runbook becomes Locked before the first production deployment handling real learner data (Phase 1).

---

## 1. SLOs & SLIs

Pull targets from SDD §7. This is where they become measured commitments.

| SLI (what you measure) | SLO (target) | Measured by | Breach action |
|------------------------|--------------|-------------|---------------|
| Availability | 99.5%/mo | Uptime monitor on key routes | page on 2 consecutive failed checks |
| Core content load on 3G | <5s | Vercel Analytics / synthetic 3G check | investigate bundle/asset regressions (SAD-A4) |
| Initial-route JS | ≤220KB gzipped | bundle analyzer in CI | block deploy; SAD-A4 audit |
| API p95 latency (excl. AI gen) | <500ms | Vercel logs / metrics | investigate slow query / N+1 |
| Credential issuance success | >99% (excl. labelled mock) | issuance logs | alert; check Horizon + issuer key |
| AI cost per generated course | <2× baseline | generation token logs / PostHog | review prompt/caching; alert |

---

## 2. Observability — Logs, Metrics, Traces

| Pillar | Tool | What's captured | Retention |
|--------|------|-----------------|-----------|
| Logs | Vercel logs (structured JSON, `request_id` per line) | API requests, errors, issuance/anchor events | per Vercel plan |
| Metrics | PostHog + Vercel Analytics | SLIs above + PRD §5.5 business events | per tool default |
| Traces | (MVP: none formal) — generation token logs | per-course token cost + latency | rolling |

**Dashboards:** (1) health (SLIs), (2) AI cost (token cost/course), (3) funnel (PRD §5.5 events: waitlist→signup→lesson→credential).

**Correlation ID:** `request_id` propagated client → API → Supabase/Stellar calls → logs, so one user action is traceable end to end.

**No-PII-in-logs rule:** never log raw PII or secrets; hash user IDs; never log document contents, VC PII, or keys. Reconcile with CLR §1.

---

## 3. Alerting & On-Call

| Alert | Condition | Severity | Who / how notified |
|-------|-----------|----------|--------------------|
| Site down | 2 consecutive failed health checks | P0 | owner phone/email |
| Issuance failing | credential issuance error rate >5% (excl. mock) | P1 | owner |
| Stellar anchor failing | Horizon submit failures sustained | P1 | owner — consider `ENABLE_ONCHAIN_ANCHOR=false` |
| AI cost spike | cost/course >2× baseline | P2 | owner (review, not page) |
| Perf regression | initial JS >220KB on a deploy | P1 | CI blocks; owner notified |

**On-call model:** solo best-effort — alerts to phone; no formal rotation at MVP.
**Alert hygiene:** every alert must be actionable; a noisy alert gets tuned or deleted (alert fatigue kills response).

---

## 4. Incident Response

**Severity ladder:** reuse the QAD P0–P3 scale.

**When an incident fires:**
1. **Acknowledge** — claim it.
2. **Assess** — severity, blast radius, worsening?
3. **Mitigate first, diagnose later** — roll back per PRD §9 (redeploy previous tag), flip a kill switch (`ENABLE_ONCHAIN_ANCHOR`, `ENABLE_AI_GENERATION`), or scale up.
4. **Communicate** — status note + a line to affected users if user-facing; for any disbursement/credential issue, notify the relevant partner.
5. **Resolve & verify** — confirm SLIs back to normal.
6. **Postmortem** — for any P0/P1, write `docs/pm-aniskwela-NNN.md` within 48h; fold action items back into QAD/OPS/Build Guide.

**Rollback trigger & mechanism:** see PRD §9 (single source of truth) — redeploy previous tagged Vercel release; migrations backward-compatible one release; `ENABLE_ONCHAIN_ANCHOR=false` falls back to mock anchoring.

**Kill switches / feature flags:** `ENABLE_ONCHAIN_ANCHOR`, `ENABLE_AI_GENERATION` — both disable without a deploy.

---

## 5. Routine Operations

- **Secret rotation:** Claude key, Stellar keys, **VC issuer signing key** rotated per policy; issuer DID key lifecycle is a Phase 1 deliverable (PRD Q1).
- **Dependency / security updates:** Dependabot weekly; security patches within 7 days; re-verify fast-moving framework conventions (BUILD §3) on major bumps.
- **Backup restore drill:** run a Supabase restore drill before production launch and quarterly thereafter (SDD §6 RTO 4h / RPO 24h).
- **Cost review:** monthly infra + AI spend vs the ~$50–150/mo production budget (PRD §11.4).
- **Cert / domain expiry:** auto-renew; calendar reminder as backstop.
- **Stellar network watch:** Testnet now; Mainnet migration is a config change at launch — re-verify Horizon endpoints and fee handling.

---

## Self-Check

- [x] Every §1 SLO has a real measurement source
- [x] Logs carry a correlation ID and contain no PII/secrets
- [x] Every §3 alert is actionable and routes to a real person
- [x] §4 names the rollback mechanism and kill switches
- [ ] A backup has actually been restored at least once (do before production — SDD §6)
- [x] P0/P1 incidents have a Postmortem SLA (48h) and template path
