# Subagents Document (SAD)

**Project:** Aniskwela
**Date:** 2026-06-23
**Version:** 1.0
**Owner:** Carlos Jerico Dela Torre
**Status:** Locked
**Last reconciled:** N/A — pre-build
**PRD:** [prd-aniskwela.md](prd-aniskwela.md)
**SDD:** [sdd-aniskwela.md](sdd-aniskwela.md)

---

## 1. Purpose & Scope

This roster defines the specialist build subagents for Aniskwela's 2–3 week sprint and beyond. They assist during feature build, testing, and review — not product decisions. They exist because Aniskwela has a few **hard, non-negotiable guardrails** (a strict performance budget, safe migrations, no stale framework APIs, and AI-safety evals) that must be enforced on every relevant change, plus repetitive feature/test work worth offloading from the main agent's context. The main agent (orchestrator) reads the docs and spawns these per §4.

**Out of scope:** Subagents do not make product or architecture decisions — those live in the PRD/SDD/RFCs. They execute and enforce within set boundaries.

---

## 2. Roster Design Rationale

| Considered | Decision | Reason |
|------------|----------|--------|
| feature-builder | Kept | Spawned repeatedly for each PRD-F# feature; offloads implementation context. |
| test-runner | Kept | Guardrail — QAD suite must pass before merge; spawned on every change. |
| schema-stack-guardian | Kept | Guardrail — unsafe migration or a stale framework API (BUILD §3) is a top failure mode; both must be caught every time. |
| perf-budget-auditor | Kept | Guardrail — the ≤220KB / sub-3G budget (SDD §7) is the product's core differentiator; checked on every UI change. |
| ai-safety-eval-runner | Kept | Guardrail — QAD §7 red-team evals must pass before any prompt/model change. |
| docs-indexer | Rejected | Index updates are cheap and contextual; main agent does inline. |
| deploy-bot | Rejected | Vercel Git integration handles deploys; no agent needed. |
| credential-cryptographer | Rejected | One-time `lib/credentials/` build (aniskwela-rfc-001); feature-builder handles it inline. |
| i18n-translator | Rejected | Filipino copy needs a human native speaker (QAD §4), not an agent. |

---

## 3. The Roster

| Agent ID | Name | One-line job | Derived from | Spawn trigger | Model hint |
|----------|------|--------------|--------------|---------------|------------|
| SAD-A1 | feature-builder | Implement a PRD-F# feature against the docs | PRD §3, SDD, RFCs | A feature ticket is ready to build | balanced |
| SAD-A2 | test-runner | Run the QAD suite, triage failures, gate merge | QAD | After any code change / before merge | fast |
| SAD-A3 | schema-stack-guardian | Review migrations for backward-compat + verify framework APIs vs pinned versions | SDD §3, BUILD §3 | A migration or framework-code change appears | deep |
| SAD-A4 | perf-budget-auditor | Enforce JS ≤220KB / image ≤80KB / <5s 3G on UI changes | SDD §7, DSD §8 | A frontend/route change appears | fast |
| SAD-A5 | ai-safety-eval-runner | Run QAD §7 evals before prompt/model changes | QAD §7, SDD §8.1 | Any prompt, schema, or model change to AI gen | balanced |

> **Model hint:** `fast` (cheap/high-volume), `balanced` (most feature work), `deep` (tricky review). Mapped at materialization: fast→haiku, balanced→sonnet, deep→opus.

---

### Agent Cards

#### SAD-A1 — feature-builder

- **Purpose:** Implement a single PRD-F# feature end-to-end against the locked docs. Earns its slot: spawned repeatedly (one per feature) and offloads heavy implementation context from the orchestrator.
- **Derived from:** PRD §3 features, their user stories §4, the relevant SDD components and RFCs.
- **Responsibilities:**
  - Read the traceability path (BUILD §1) for the feature, implement to its acceptance criteria.
  - Write unit/integration tests alongside the code per QAD.
- **Inputs:** a feature ID (`PRD-F#`) + its user story IDs, the relevant RFC.
- **Outputs:** a patch implementing the feature with tests, referencing the IDs it satisfies.
- **Capabilities / tools needed:** read files, edit code, run shell/tests, search.
- **Spawn trigger:** a feature ticket is ready and its docs are Locked.
- **Guardrails (never):** never publish AI output without the human-review gate; never commit secrets; never use a deprecated API from BUILD §3; never edit migrations (hand to SAD-A3).
- **Done when:** acceptance criteria met, tests written, SAD-A2 passes.
- **Model hint:** balanced.

#### SAD-A2 — test-runner

- **Purpose:** Run and triage the test suite; the merge guardrail. Spawned on every change.
- **Derived from:** QAD (all scenario tables + CI gate).
- **Responsibilities:** run lint/typecheck/unit/integration/E2E; on failure isolate the minimal failing context.
- **Inputs:** a diff / branch.
- **Outputs:** PASS, or FAIL with the specific failing tests + smallest reproducing excerpt.
- **Capabilities / tools needed:** Bash, Read, Grep.
- **Spawn trigger:** after code changes, before merge.
- **Guardrails (never):** never edit source to make a test pass; never skip/delete tests.
- **Done when:** clear PASS or actionable FAIL returned.
- **Model hint:** fast.

#### SAD-A3 — schema-stack-guardian

- **Purpose:** Two top failure modes in one guardrail — unsafe DB migrations and stale framework APIs. Both must be caught on every relevant change.
- **Derived from:** SDD §3 (schema + "backward-compatible one release" rule), BUILD §3 (pinned versions + deprecations register).
- **Responsibilities:**
  - Review any migration for backward compatibility (rollback safety) and RLS coverage.
  - Verify any framework-specific code against the pinned version/official docs; flag stale APIs and add a row to the BUILD §3 deprecations register when drift is found.
- **Inputs:** a migration file or a diff touching framework code.
- **Outputs:** APPROVE or a blocking report naming the unsafe change / stale API + the current convention.
- **Capabilities / tools needed:** Read, Grep, WebFetch (to check current docs), Bash (dry-run migration).
- **Spawn trigger:** a migration or framework-code change appears in a diff.
- **Guardrails (never):** never apply a migration to prod; never approve a non-backward-compatible migration without an explicit CR.
- **Done when:** verdict returned; register updated if drift found.
- **Model hint:** deep.

#### SAD-A4 — perf-budget-auditor

- **Purpose:** Enforce the low-resource budget that is Aniskwela's core differentiator. Repeated guardrail on UI changes.
- **Derived from:** SDD §7 NFRs, DSD §8 performance dimension.
- **Responsibilities:** measure initial-route JS gzipped (≤220KB), image weights (≤80KB), and 3G load (<5s) on changed routes; flag regressions.
- **Inputs:** a frontend/route diff or a built bundle.
- **Outputs:** PASS or a report of budget breaches with the offending route/asset.
- **Capabilities / tools needed:** Bash (build + analyze bundle), Read.
- **Spawn trigger:** a change touching frontend routes/components.
- **Guardrails (never):** never raise the budget to make it pass — flag for a human/CR.
- **Done when:** budget verified or breaches reported.
- **Model hint:** fast.

#### SAD-A5 — ai-safety-eval-runner

- **Purpose:** Gate AI changes behind the QAD §7 eval + red-team suite. Guardrail.
- **Derived from:** QAD §7, SDD §8.1.
- **Responsibilities:** run the eval suite vs the last-known-good baseline; block on any red-team failure or >5% regression.
- **Inputs:** a change to the generation prompt, JSON schema, or model id.
- **Outputs:** PASS/FAIL with per-eval diffs.
- **Capabilities / tools needed:** Bash (run eval harness), Read.
- **Spawn trigger:** any prompt/schema/model change to AI course generation.
- **Guardrails (never):** never weaken an eval to pass; a single red-team failure blocks.
- **Done when:** suite passes vs baseline, or failures reported.
- **Model hint:** balanced.

---

## 4. Orchestration

- **Who spawns them:** main agent autonomously during the build; developer on demand.
- **Sequencing:** `feature-builder` runs per feature (parallelizable across independent features). On any diff: `schema-stack-guardian` (if migration/framework code) and `perf-budget-auditor` (if UI) run, then `test-runner` gates the merge. `ai-safety-eval-runner` gates any AI change before merge.
- **Hand-off:** feature-builder's patch → guardians review → test-runner verdict; shared state is the repo + the docs' stable IDs.
- **Escalation:** any guardian that would have to relax a Locked-doc constraint (raise the perf budget, approve a non-backward-compatible migration, weaken an eval) stops and hands back to a human → triggers a Change Record.

```
developer/orchestrator ─▶ feature-builder (A1) ─▶ [schema-stack-guardian (A3) | perf-budget-auditor (A4) | ai-safety-eval-runner (A5)] ─▶ test-runner (A2) ──gate──▶ merge
                                                          │ any guardian blocks
                                                          └──▶ human / Change Record
```

---

## 5. Materialization (Platform Mapping)

### Materialize to: Claude Code (`.claude/agents/`)

| Agent ID | Materialized file | Format |
|----------|-------------------|--------|
| SAD-A1 | `.claude/agents/feature-builder.md` | Claude Code frontmatter |
| SAD-A2 | `.claude/agents/test-runner.md` | Claude Code frontmatter |
| SAD-A3 | `.claude/agents/schema-stack-guardian.md` | Claude Code frontmatter |
| SAD-A4 | `.claude/agents/perf-budget-auditor.md` | Claude Code frontmatter |
| SAD-A5 | `.claude/agents/ai-safety-eval-runner.md` | Claude Code frontmatter |

Model mapping: fast→haiku, balanced→sonnet, deep→opus. Re-materialize whenever a card changes; treat the `.claude/agents/` files as build artifacts, not sources of truth.

---

## 6. Maintenance

- The SAD is the source of truth — edit cards here, bump version, re-materialize. Don't hand-edit `.claude/agents/`.
- Reconcile on drift: an agent file with no card (orphan) or a card with no file (missing) gets fixed and §5's table updated.
- When a `PRD-F#` an agent traces to is cut/changed, revisit the agent (log a CR).
- Re-run the anti-sprawl rule on any new proposed agent; if it fails all three criteria, record it in §2's rejected table instead of creating it.
