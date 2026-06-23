# Change Record (CR)

**CR ID:** `CR-001`
**Project:** Aniskwela
**Date:** 2026-06-23
**Author:** Carlos Jerico Dela Torre
**Status:** Applied
**Trigger document:** PRD (brand + positioning decision; resolves PRD §16 open question "final brand name")

---

## 1. What Changed

Renamed the product and sharpened its positioning, across both the docs suite and the `client/` app. The architecture/system is unchanged.

**Before:** Product name **Gaia** (a placeholder carried from the original "LearnChain"). Positioning: a general, multi-industry AI learning platform with agriculture as one vertical among several.

**After:** Product name **Aniskwela** (*ani* "harvest" + *eskwela* "school" → "harvest school"). Positioning: **farmer-first** — an AI educational tool built for Filipino farmers and rural learners, with the learning engine kept **content-agnostic** so other verticals remain a later expansion. All document file slugs renamed `gaia` → `aniskwela`; RFC IDs `gaia-rfc-00x` → `aniskwela-rfc-00x`; the shipped `client/` app rebranded (`package.json` name, i18n `appName` + copy in `en.json`/`fil.json`, page title, the `gaia_locale` → `aniskwela_locale` cookie, SQL/code comments).

---

## 2. Why

A preliminary trademark/availability knockout (2026-06-23) showed **"Gaia" is unsuitable**: highly generic, heavily used across software / agri / climate, and Greek — carrying none of the Filipino-first moat that is the product's actual defensibility. The personas were already agriculture-centric (Maricel the rural agri learner; Ramon the agricultural extension worker), so a farmer-first brand commits to what the product already is.

Availability findings drove the specific name: every plain Filipino agri word is crowded in PH education/agriculture — Linang (DAP Linang LMS + Project Linang), Binhi (Binhi Inc. + DA "Binhi ng Pag-asa" + PhilRice farmer app), Anihan (Anihan Technical School), Sibol (UPLB SIBOL agritech incubator + SIBAT). The coined compound **"Aniskwela"** had no Philippine edtech/agritech collision and `aniskwela.com` is unregistered.

---

## 3. Decision

Adopt **Aniskwela** as the product name and reposition farmer-first, leaving the architecture untouched (engine stays content-agnostic). Rejected: keeping Gaia (trademark risk); plain words Linang/Ani/Binhi/Sibol/Anihan (direct PH collisions); Aralani (`.com` taken). Fallback shortlist retained in the CLR: **AniAral**, **SakaAral**. This is a branding/positioning change only — no feature, data model, API, or stack change. (The stack itself — Next.js 16.2 + Azure AI Foundry GPT-5.4 — was already reconciled on `main` at doc v1.1 and is out of scope for this CR.)

---

## 4. Propagation Checklist

| Doc | Affected? | Action needed | New version | Done |
|-----|-----------|---------------|-------------|------|
| BRD | Yes | §1 reframed farmer-first; name | 1.1 | [x] |
| PRD | Yes | History note (rename) + §1 farmer-first; name throughout | 1.2 | [x] |
| DSD | Yes | §0 Mode name-meaning ("harvest school"); name; provenance already agri-aligned | 0.2 | [x] |
| SDD | Yes (mechanical) | Name/slug/links + RFC IDs only — **no architecture change** | 1.1 (unchanged) | [x] |
| RFC(s) | Yes (mechanical) | Files renamed `rfc-aniskwela-*`; IDs `aniskwela-rfc-001/002`; name in content | Approved (unchanged) | [x] |
| QAD | Yes (mechanical) | Name/links only | 0.1 (unchanged) | [x] |
| CLR | Yes | §5 trademark row + brand-name status rewritten to reflect the knockout findings; name | 0.2 | [x] |
| SAD | Yes (mechanical) | Name/links; re-materialized `.claude/agents/*` | 1.0 (unchanged) | [x] |
| GTM | Yes | Tagline, product summary, primary message → farmer-first; name | 0.2 | [x] |
| OPS | Yes (mechanical) | Name/links only | 0.1 (unchanged) | [x] |
| BUILD | Yes | Added **Farmer-first** invariant; name/slug; re-materialized to `AGENTS.md` (+ `CLAUDE.md` pointer) | 1.2 | [x] |
| index.md | Yes | Title/slug, version bumps, Change Log row, provenance line | — | [x] |
| **client/ app** | Yes | `package.json` name, i18n `appName`/copy, page title, `aniskwela_locale` cookie, SQL/code comments rebranded | n/a (code) | [x] |

> "Mechanical" = name/slug/link substitution only; the document's substance is unchanged, so its version is held (the rename is recorded here in CR-001 rather than as a content revision).

---

## 5. Impact Summary

- **Scope:** Unchanged — no feature added or cut. Positioning narrowed to farmer-first; engine remains content-agnostic, so multi-industry expansion is still open.
- **Stack:** Unchanged by this CR (the Next.js 16.2 + Azure AI Foundry GPT-5.4 reconciliation already landed on `main` at v1.1).
- **Timeline:** No milestone impact.
- **Risk / cost:** Retires the high "Gaia" trademark-collision risk. Residual risk pending **formal IPOPHL + USPTO/EUIPO clearance** by counsel (CLR §5) — the knockout was preliminary, not legal clearance. `.ph`/`.app`/social-handle availability still unchecked.
- **Code already written:** The `client/` app was rebranded in this change (name/strings/cookie/comments). The `gaia_locale` → `aniskwela_locale` cookie rename means an existing locale cookie won't be read after deploy (harmless — falls back to default locale). `client/package-lock.json` still shows the old `name` field; it regenerates on the next `npm install`. The build was **not** run as part of this rename — reviewers should verify `npm run build` / lint before merge.
- **Infrastructure not yet renamed:** the GitHub repo is still `Axon-Enjin/gaia` and the local folder is `learnchain` — optional follow-ups (a `gh repo rename` auto-redirects the old URL). The pitch deck files still carry the old name and need a rebrand pass.

---

## 6. Rollback

Reversible: revert the rebrand PR/commit to restore the `gaia` naming, the prior doc versions, and the app strings. No irreversible elements (the cookie rename self-heals to default locale).
