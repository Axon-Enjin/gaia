# Change Record (CR)

**CR ID:** `CR-002`
**Project:** Aniskwela
**Date:** 2026-06-25
**Author:** UI/UX revamp pass
**Status:** Proposed
**Trigger document:** BUILD/AGENTS.md non-negotiable invariant ("system fonts only") + DSD §2; PRD §5.4

---

## 1. What Changed

Introduces a **Brand Mode font/motion exception scoped to public marketing surfaces only** (the landing page `/`, plus the shared verifier/login chrome). Brand Mode is permitted to load **one** self-hosted display web font for headings, and to use richer scroll-reveal motion. All Product Mode surfaces (`/learner/*`, `/teacher/*`, `/courses/*`) are **unchanged** and remain strictly system-font, minimal-motion.

**Before:** A single global rule — *system fonts only, zero font bytes on first paint* — applied uniformly to every surface (PRD §5.4, DSD §2, BUILD invariant).

**After:** The rule still holds for Product Mode (the learner read path and all dashboards). Brand Mode may additionally:
- self-host **one** display typeface for headings only (`font-display: optional`, subset to Latin, preloaded), with the system stack as the immediate fallback (no layout shift, no blocking paint);
- use CSS-driven scroll-reveal transitions (still wrapped in `prefers-reduced-motion`).

Body copy everywhere — including Brand Mode — stays on the system stack.

---

## 2. Why

The product owner explicitly chose to allow richer fonts/motion on the **public landing page only**, to strengthen first-impression branding/positioning, while keeping the low-resource guarantees on the surfaces that farmers actually learn on. Diverging from a Locked-doc invariant requires a Change Record per AGENTS.md §1 ("If reality diverges from a Locked doc … trigger a Change Record").

The risk is contained because:
- The learner read path (the byte-budget-critical surface for Maricel's sub-3G 1GB-RAM device) is untouched.
- `font-display: optional` means the web font is used only if it arrives within ~100ms; otherwise the system fallback paints and the font is ignored for that view — so first paint is never blocked and there is no FOIT/CLS.
- Motion remains CSS-only (no JS animation library such as GSAP) and honors reduced-motion.

---

## 3. Decision

Adopt the scoped exception. The recommended default remains **CSS + IntersectionObserver** for motion (no animation library) and **at most one** subset display font for Brand Mode headings. If the perf gate (initial JS ≤ 220KB, image ≤ 80KB, < 5s on 3G, LCP < 2.5s) regresses on the landing route, the font is to be dropped before any Product Mode concession.

Rejected: relaxing the budget on Product Mode surfaces; adding a JS animation library; loading multiple weights/families.

---

## 4. Propagation Checklist

| Doc | Affected? | Action needed | Done |
|-----|-----------|---------------|------|
| DSD | Yes | §2 typography: note the Brand Mode single-display-font exception; §5 motion: Brand Mode scroll-reveal | [ ] |
| PRD | Yes (note) | §5.4: clarify "system fonts only" applies to Product Mode; Brand Mode exception via CR-002 | [ ] |
| BUILD/AGENTS | Yes (note) | Low-resource invariant annotated: Brand Mode font/motion exception (CR-002) | [ ] |
| QAD | Yes | Add perf assertion: landing route still < 5s on 3G with the display font | [ ] |
| client/ app | Yes | Brand Mode display font wired with `font-display: optional` + preload; scroll-reveal CSS | [ ] |

---

## 5. Impact Summary

- **Scope:** Marketing/Brand Mode only. No change to the learner read path or any dashboard.
- **Perf:** Net-neutral by construction (`font-display: optional`, no blocking paint, CSS-only motion). Gated by the existing perf budget; font is the first thing dropped on regression.
- **A11y:** Motion respects `prefers-reduced-motion`; contrast/targets unchanged.
- **Rollback:** Remove the `@font-face`/preload and the `reveal` classes from Brand Mode; system-font stack resumes with zero other changes.

---

## 6. Rollback

Fully reversible and low-risk: delete the Brand Mode `@font-face` declaration + preload link and the `.reveal` usage. Because the system stack is the fallback, removal causes no layout shift or functional change.
