# Design System Document (DSD)

**System Name:** Aniskwela Foundation (the Aniskwela design language)
**Date:** 2026-06-23
**Version:** 0.2
**Owner:** Carlos Jerico Dela Torre
**Status:** Draft
**Last reconciled:** N/A — pre-build
**PRD:** [prd-aniskwela.md](prd-aniskwela.md)

> **Status note:** Draft until the Week-1 build materializes these tokens into a Tailwind config / CSS variables and the §8 Impeccable audit is run. §0 is locked intent; §2–§8 firm up during M2/M3.

---

## 0. Brand Stance

### The Three Rules

| Rule | What it demands | Test |
|---|---|---|
| **Make it relatable** | Ground every choice in Philippine rural learning life and the *growth-from-soil* metaphor already in the product (levels: Seed → Sprout → Scholar → Expert → Mentor) | Could this appear in any other EdTech app? If yes → fail. |
| **Make it human** | Show a person's judgment, not a generator's default — hand-marked growth motifs, real learner names on credentials, warm earthen tones over corporate gradients | Is there a craft mark a generator wouldn't pick? If no → fail. |
| **Make them part of the branding** | Weave actual learners in — their names and course on every credential card, opt-in learner faces/initials on leaderboards, teacher-uploaded course covers as section texture | Does it feel made for Maricel specifically, or for "everyone"? Specific → pass. |

### Mode

- [x] **Both** — **Brand Mode** for the landing/marketing surface (impression-first: the Aniskwela "harvest school" story — *ani* (harvest) + *eskwela* (school), learning you sow, reap, and keep — a committed earthen palette, learner/farmer imagery). **Product Mode** for the app UI (task-first: fluent density, semantic states, repeatable components, ruthless byte budget).

**Selected mode:** `Both` — Brand Mode = landing (PRD-F8); Product Mode = dashboards, course viewer, verifier (PRD-F2/F5/F6/F7/F10).

### Aesthetic Provenance

| Question | Answer |
|---|---|
| **Specific cultural or aesthetic reference** | Philippine *banig* / *inabel* woven-textile geometry + agricultural extension-pamphlet practicality (clear, printed-on-newsprint legibility) + the palette of tilled soil, young rice, and clay. **Not** "modern/clean", not "inspired by Duolingo". |
| **One sentence that would NEVER appear in AI slop for this category** | "Your learning grows like a field — slowly, visibly, and it's yours to keep." (governs voice: patient, earned, ownership-forward — the opposite of "earn rewards now!") |
| **The archetypical user (named, specific)** | Maricel, 22, Region IV; studies agriculture and financial literacy on a shared 1GB-RAM Android over prepaid 3G, Tuesday nights after farm work; reads faster in Filipino than English. |
| **The slop default for this product category** | Indigo→violet hero gradient, Inter everywhere, a cartoon mascot, confetti on every tap, glassmorphism cards over a dashboard screenshot, "Learn. Earn. Repeat." |
| **How users appear in the brand** | Every credential card carries the learner's real name + course + issuing teacher as the hero element; opt-in learner initials/portraits on leaderboards; teacher course-cover thumbnails as subtle section texture. |

### Anti-References

| Anti-reference | Why it's forbidden here |
|---|---|
| Duolingo's gamified-casino energy (streak-panic, confetti, mascot guilt) | Aniskwela is **learning-first, not reward-first** (PRD §5.3) — dopamine-pump UX undercuts the merit-ledger credibility funders rely on. |
| Crypto/Web3 "neon-on-black, glow, hexagons" aesthetic | Our users distrust crypto hype and run low-end screens on a light-only theme; the chain is plumbing, not the brand. |
| Generic B2B SaaS (indigo gradient, Inter, glass cards) | It's the exact slop default above and erases the Filipino, agricultural, earned-growth identity that is the moat. |

---

## 1. Design Philosophy & Vision

**Core aesthetic:** Earthen, legible, unhurried, trustworthy. Warm paper-white backgrounds, soil/clay neutrals, a living-green growth accent, indigo reserved for trust/CTA moments. Generous tap targets, big readable type, near-zero decoration — every byte and pixel earns its place on a 3G phone.

**Emotional intent:** A learner should feel their effort accumulating and *belonging to them* — calm, capable, proud. A funder should feel the record is sober and credible, not gamified theatre.

**Aesthetic references:** Agricultural extension pamphlets (functional legibility), woven-textile geometry (structure without ornament), printed certificate gravitas (for credentials).

**What this system explicitly avoids:**
- Indigo→violet gradients and rounded-everything.
- Confetti/celebration spam and streak-panic mechanics.
- Glassmorphism, web-font downloads on first paint, dark/neon Web3 styling.

---

## 2. Brand Primitives

> Values below are the locked intent; generate exact ramps via the impeccable / ui-ux-pro-max skill during M2 and paste final tokens here. Primary `--color-primary` carries forward the PRD §10.2 locked Indigo `#4B6BF1` (trust/CTA); the **growth-green and clay** tokens carry Aniskwela's identity. *If the Aniskwela rebrand should promote green to primary, that changes a Locked PRD decision — raise a Change Record, don't silently swap.*

### Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--color-bg` | `#FBF8F2` | Page background (warm paper, not pure white — easier on low-end screens) |
| `--color-surface` | `#FFFFFF` | Cards, panels |
| `--color-border` | `#E7E0D3` | Dividers, input borders (clay-tinted) |
| `--color-primary` | `#4B6BF1` | Trust/CTA, active states (PRD-locked indigo) |
| `--color-primary-hover` | `#3A57D6` | Hover state |
| `--color-growth` | `#3F8E5B` | Brand identity accent — progress, XP, "Sprout/Scholar" growth states |
| `--color-soil` | `#6B4F3A` | Headings on brand surface, earthen emphasis |
| `--color-text` | `#241F1A` | Body copy (near-black, warm) |
| `--color-text-muted` | `#6E665B` | Secondary text, labels |
| `--color-success` | `#3F8E5B` | Confirmations (= growth) |
| `--color-warning` | `#C8852A` | Caution (clay-amber) |
| `--color-error` | `#C2453B` | Errors, destructive |

*Contrast: verify `--color-text` on `--color-bg` and white text on `--color-primary` meet WCAG AA 4.5:1 before lock (see §8).*

### Typography

System fonts only — **no web-font download on first paint** (PRD §5.6 constraint).

| Role | Font | Weight | Size | Line Height |
|------|------|--------|------|-------------|
| Heading 1 | system-ui / Segoe UI / Roboto stack | 700 | 28–32px | 1.2 |
| Heading 2 | same | 600 | 22–24px | 1.25 |
| Heading 3 | same | 600 | 18px | 1.3 |
| Body | same | 400 | 16px (min — readability on 3G phones) | 1.6 |
| Small / Caption | same | 400 | 13–14px | 1.45 |
| Mono / Code | ui-monospace / Consolas stack | 400 | 14px | 1.5 |

**Font loading:** System font stack only; zero font bytes downloaded.

### Elevation & Depth

| Level | CSS Value | Usage |
|-------|-----------|-------|
| `--shadow-sm` | `0 1px 2px rgba(36,31,26,.06)` | Inline cards |
| `--shadow-md` | `0 4px 12px rgba(36,31,26,.10)` | Floating elements |
| `--shadow-lg` | `0 12px 32px rgba(36,31,26,.16)` | Modals, credential cards |

---

## 3. Layout & Spatial System

**Base unit:** `4px` — all spacing is a multiple.

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Tight internal gaps |
| `--space-2` | 8px | Component internal padding |
| `--space-3` | 12px | — |
| `--space-4` | 16px | Default element spacing |
| `--space-6` | 24px | Section gaps |
| `--space-8` | 32px | Large section gaps |
| `--space-12` | 48px | Page-level spacing |

**Grid:** Mobile-first single column; 12-column max-width 1120px on desktop, 16–24px gutters.

**Breakpoints:**
- Mobile: `375px` (primary; usable from 320px)
- Tablet: `768px`
- Desktop: `1120px`

---

## 4. Core Component Specs

### Buttons

| Variant | Background | Text | Border | Hover | Disabled |
|---------|-----------|------|--------|-------|----------|
| Primary | `--color-primary` | white | none | `--color-primary-hover` | 40% opacity |
| Secondary | transparent | `--color-primary` | `--color-primary` | `--color-surface` bg | 40% opacity |
| Ghost | transparent | `--color-text` | none | `--color-surface` bg | 40% opacity |
| Destructive | `--color-error` | white | none | darkened error | 40% opacity |

**Border radius:** `8px` · **Padding:** `12px 16px` (≥44px tall touch target) · **Font:** 500, 15px

### Inputs & Forms
- Border `1px solid --color-border`; radius `8px`; focus ring `2px solid --color-primary`, offset 2px.
- Error: `--color-error` border + message below. Padding `10px 12px`. Labels always visible (no placeholder-only).

### Surfaces (Cards, Modals, Panels)
- Bg `--color-surface`; border `1px solid --color-border`; radius `10px`; `--shadow-sm` inline, `--shadow-md` floating.
- Modal backdrop `rgba(36,31,26,0.4)` (no blur — GPU/battery on low-end).
- **Credential card** is a signature surface: certificate gravitas, learner name as hero, `--shadow-lg`, woven-border motif.

---

## 5. Motion & Micro-interactions

**Transition default:** `all 150ms ease-in-out`. Motion is minimal by mandate — sub-3G devices and battery.

| Interaction | Duration | Easing | Notes |
|-------------|----------|--------|-------|
| Button hover/active | 120ms | ease-out | |
| Modal open | 180ms | ease-out | fade + slight translate |
| Modal close | 140ms | ease-in | |
| XP gain | 200ms | ease-out | single subtle count-up — **no confetti** |
| Loading skeleton | 1.5s | linear | shimmer; prefer instant SSR content where possible |

**Avoid:** animations > 300ms, looping motion without intent, celebration spam. All non-essential motion wrapped in `prefers-reduced-motion`.

---

## 6. Accessibility (a11y)

- Contrast: WCAG AA — 4.5:1 text, 3:1 UI (ADHD/low-vision learners; outdoor screen glare).
- Focus indicators always visible; never remove `outline` without replacement.
- Touch targets ≥ `44×44px`.
- Full keyboard operability; semantic HTML first, ARIA only where needed.
- `@media (prefers-reduced-motion: reduce)` honored for all non-essential animation.
- ADHD-friendly: explicit progress indicators, ≤7-min lesson chunks, frequent low-key micro-rewards.
- Language: EN/Filipino toggle reachable on every screen; `lang` attribute updates on switch.

---

## 7. Taste-Skill Settings

```
DESIGN_VARIANCE:    3   (restrained, coherent — credibility + byte budget over expressiveness)
MOTION_INTENSITY:   2   (subtle only — sub-3G + battery + reduced-motion)
VISUAL_DENSITY:     5   (balanced — readable big type, not dashboard-dense)
```

**Chosen variant:** `minimalist-skill` (with earthen warmth from `soft-skill` for the brand/landing surface).
**Reason:** The hard low-resource + accessibility constraints demand restraint; the brand warmth comes from palette and learner imagery, not motion or ornament.

---

## 8. Impeccable Quality Gate

### Phase: Start — Init
- [ ] `npx impeccable install`; run `/impeccable init`; commit `PRODUCT.md` / `DESIGN.md` (M2).

### Phase: Polish — Audit Score (run before launch)

| Dimension | Score (0–4) | Open P0 / P1 findings |
|---|---|---|
| Accessibility | TBD | run at M3 |
| Performance | TBD | run at M3 — must hold ≤220KB JS / <5s 3G |
| Theming | TBD | |
| Responsive | TBD | from 320px |
| Anti-patterns | TBD | |

**FMD launch gate:** no open P0/P1 and every dimension ≥ 3.

### Phase: Polish — Detected Anti-Patterns

| Pattern | Status | Location | Fix Applied |
|---|---|---|---|
| Indigo→violet gradient | Must stay absent | — | designed out (earthen palette) |
| Inter-as-only-font | Must stay absent | — | system stack, no web font |
| Confetti / celebration spam | Must stay absent | — | single subtle XP count-up |

### Phase: Maintain — Document
**Last documented:** N/A until first run.

### Section 0 Compliance Check
- [ ] **Relatable** — every color/type/layout traces to the banig/soil/growth provenance, not a default.
- [ ] **Human** — deliberate idiosyncrasy present: `woven-border credential card + hand-marked growth-stage icons`.
- [ ] **Part of the branding** — learner name-on-credential and opt-in leaderboard presence implemented, not deferred.

---

## Self-Check

- [x] §0 fully filled (Three Rules, Mode, Provenance, Anti-References)
- [x] §0 Mode selected (Both)
- [x] §2 has exact HEX values
- [x] §3 spacing scale consistent (multiples of 4px)
- [x] §4 defines Disabled + Focus states
- [x] §7 dials set + variant chosen
- [ ] WCAG AA contrast verified for primary pairings (do at M2/M3 before lock)
- [ ] Impeccable audit run (M3)
- [ ] §0 compliance verified against final design (M3)
- [ ] Tokens exist as Tailwind config / CSS variables, not just docs (M2)
