# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Read [AGENTS.md](AGENTS.md) first — it is the canonical operating guide for building Gaia.** It carries the read-order, the non-negotiable product invariants, the traceability map ("to build X, read Y"), the pinned stack + deprecations register, golden-path patterns, and guardrails. AGENTS.md is itself materialized from [docs/build-gaia.md](docs/build-gaia.md) — edit the Build Guide and re-materialize; never hand-edit AGENTS.md or this file as the source of truth.

## Project state

Application code lives in **`client/`** (Next.js 16.2.x). Start at [docs/index.md](docs/index.md), then PRD/SDD/RFCs. Local dev: [client/README.md](client/README.md) (`npm run dev` in `client/` — confirm scripts in `client/package.json`).

## Claude-Code-specific notes

- When the user types a `/<skill-name>`, invoke it via the Skill tool — don't hand-roll the behavior.
- **Subagents:** the SAD ([docs/sad-gaia.md](docs/sad-gaia.md)) is the canonical roster, materialized to `.claude/agents/`. Edit the SAD and re-materialize; treat the `.claude/agents/*.md` files as build artifacts, not sources of truth.
- **Stack currency:** do not emit Next.js/Supabase/Stellar/Azure AI Foundry APIs from training memory — verify against current official docs for the pinned version (AGENTS.md §3) before writing framework code. Verify the `AzureOpenAI` client shape and API version against current Azure docs before writing real AI calls.
- **The `FMD/` subfolder is a separate tool** (its own git repo — the documentation-template system that generated this suite). Its rules govern FMD itself, not Gaia. Don't apply them to Gaia work, and don't commit Gaia changes into `FMD/`.

## Everything else

…lives in [AGENTS.md](AGENTS.md) and the [docs/](docs/) suite. Start there.
