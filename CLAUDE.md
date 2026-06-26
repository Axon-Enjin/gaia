# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Read [AGENTS.md](AGENTS.md) first — it is the canonical operating guide for building Aniskwela.** It carries the read-order, the non-negotiable product invariants, the traceability map ("to build X, read Y"), the pinned stack + deprecations register, golden-path patterns, and guardrails. AGENTS.md is itself materialized from [docs/build-aniskwela.md](docs/build-aniskwela.md) — edit the Build Guide and re-materialize; never hand-edit AGENTS.md or this file as the source of truth.

## Project state

**Build in progress.** The M3 slice lives in [`client/`](client/) (Next.js 16.2.9): Supabase auth, AI course generation (PRD-F1), teacher publish flow, cached learner catalog/detail, EN/Fil toggle, full schema + RLS. The FMD document suite in [docs/](docs/) remains the source of truth for what to build next. Start at [docs/index.md](docs/index.md) (manifest + §6 Build Status), then the PRD/SDD/RFCs. Run from `client/`: `npm run dev`, `npm run build`, `npm run typecheck` (see `client/package.json`).

## Claude-Code-specific notes

- When the user types a `/<skill-name>`, invoke it via the Skill tool — don't hand-roll the behavior.
- **Subagents:** the SAD ([docs/sad-aniskwela.md](docs/sad-aniskwela.md)) is the canonical roster, materialized to `.claude/agents/`. Edit the SAD and re-materialize; treat the `.claude/agents/*.md` files as build artifacts, not sources of truth.
- **Stack currency:** do not emit Next.js/Supabase/Stellar/Azure AI Foundry APIs from training memory — verify against current official docs for the pinned version (AGENTS.md §3) before writing framework code. Verify the `AzureOpenAI` client shape and API version against current Azure docs before writing real AI calls.
- **The `FMD/` subfolder is a separate tool** (its own git repo — the documentation-template system that generated this suite). Its rules govern FMD itself, not Aniskwela. Don't apply them to Aniskwela work, and don't commit Aniskwela changes into `FMD/`.

## Everything else

…lives in [AGENTS.md](AGENTS.md) and the [docs/](docs/) suite. Start there.
