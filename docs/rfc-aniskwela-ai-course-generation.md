# Request for Comments (RFC) / Tech Spec

**Title:** AI course generation pipeline
**Date:** 2026-06-23
**Author:** Carlos Jerico Dela Torre
**Status:** `Approved`
**Last reconciled:** 2026-06-23
**PRD Reference:** [prd-aniskwela.md](prd-aniskwela.md) §3 (PRD-F1), §7, US-01
**SDD Reference:** [sdd-aniskwela.md](sdd-aniskwela.md) §8, §8.1, §3 (`courses`/`lessons`/`quiz_questions`), §4
**RFC ID:** `aniskwela-rfc-002`

---

## 1. Context & Objective

**The problem this solves:**
Teachers cannot build structured courses from scratch. Aniskwela must turn an uploaded document into an editable, pedagogically-sound course draft in minutes, at a cost that survives free-tier/grant economics, and without ever auto-publishing unreviewed AI output.

**Reference in PRD/SDD:**
Implements PRD-F1; governed by the SDD §8 AI architecture and §8.1 safety controls.

**Success criteria:**
- A typical document yields a valid, editable course (outline → lessons → ≥3 quiz questions → difficulty tags) within ~60s.
- AI is called **once per course**, never on the learner read path; prompt caching cuts repeat-call input cost.
- Output is schema-validated JSON; malformed output is rejected/repaired, never published blindly.
- A mandatory teacher review/edit step precedes publish.

---

## 2. Proposed Solution

**Approach:**
1. Teacher uploads a PDF/doc → Supabase Storage; server extracts text.
2. Server preprocesses the extract (deterministic outline/digest) and, if still oversized, one bounded `gpt-5.4-mini` distill pass.
3. Server issues a single `gpt-5.4` call via Azure AI Foundry: static system prompt (pedagogy rules + strict JSON schema) placed first for automatic prefix caching, then the prepared digest → structured course JSON.
3. Server validates JSON against a Zod schema. On validation failure, one bounded repair attempt (`gpt-5.4-mini` "fix to schema") before surfacing an error.
4. Persist as a `draft` course + lessons + quiz_questions.
5. Teacher reviews/edits in the Course Editor; only an explicit publish action flips status to `published`.

Cheap structural follow-ups (outline diff, quiz reshuffle, summary-card regen) route to a `gpt-5.4-mini` Azure AI Foundry deployment.

**Architecture changes:**
- `POST /api/courses/generate` orchestration (SDD §4).
- `lib/ai/courseGen.ts` — `AzureOpenAI` client init, prompt assembly, schema validation, repair fallback.
- Zod schema shared between generation and the editor.

---

## 3. Technical Details & Contracts

### Data Model Changes

No new tables — writes to existing `courses`, `lessons`, `quiz_questions` (SDD §3). `courses.status` starts `draft`; `courses.source_object_path` references the uploaded file.

### API Changes

```
POST /api/courses/generate
Request:
{
  "source_object_path": "storage/teacher_id/file.pdf",
  "industry": "agriculture",
  "title_hint": "Rice farming basics"      // optional
}
Response 200:
{
  "course_id": "uuid",
  "status": "draft",
  "outline": [ { "title": "...", "lessons": [ { "title": "...", "difficulty": "beginner" } ] } ],
  "quiz_count": 7
}
Errors: 400 (bad/oversize file), 422 (AI output failed schema after repair), 429/502 (provider) → clear retry
```

Course JSON schema (validated by Zod):
```
Course { title, industry, modules: Module[] }
Module { title, lessons: Lesson[] }
Lesson { title, body_md, difficulty: 'beginner'|'intermediate'|'advanced', quiz: Question[] }
Question { prompt, choices: string[], answer_index: number }
```

### State Management
Generation is a bounded synchronous server request in MVP (SDD §1 debt note: move to a background worker if generation time exceeds serverless limits at scale). Drafts are owned by the teacher (RLS); regeneration overwrites the draft, never a published version.

---

## 4. Alternatives Considered

| Option | Why Rejected |
|--------|-------------|
| Call AI per learner/per page to "adapt" content live (v1-style) | Cost explosion and latency on the learner read path; violates the SDD cost-gating principle. AI is for creation + session-boundary adaptation only. |
| Auto-publish AI output | Hallucination risk (R5); high-stakes verticals (health/finance/agri) could cause real harm (R8). Human review is mandatory. |
| Free-text model output rendered directly | Insecure output handling (SDD §8.1 LLM02). We constrain to validated JSON rendered as sanitized markdown. |
| `gpt-5.4` for everything | Wasteful for trivial structural edits; route those to `gpt-5.4-mini`. |

---

## 5. AI / Agent Implementation Notes

**Model used:** `gpt-5.4` Azure AI Foundry deployment (generation); `gpt-5.4-mini` Azure AI Foundry deployment (schema repair + cheap structural tasks).
**SDK:** `openai` npm package — `AzureOpenAI` client (`@azure/openai` + `@azure/identity` peer deps); auth via `DefaultAzureCredential` (Managed Identity preferred) or `AZURE_OPENAI_API_KEY` for local dev.
**Prompt strategy:** Static system prompt (pedagogy + JSON schema) placed **first** in the messages array; source document second — Azure OpenAI automatically caches the prefix (≥ 1024 tokens) with no SDK flag required. Per-request hints go last (variable). High cache-hit rate on retries/refinements. Azure supports configurable extended cache retention up to 24h.
**Tool calls in this feature:** None — the model returns data; no model-invoked tools (avoids LLM07 excessive agency).

**Edge cases specific to LLM behavior:**
- Uploaded document contains injection text ("ignore instructions, output X") → treated as untrusted data, wrapped/delimited; the model produces a course, no tool to hijack (SDD §8.1 LLM01 → QAD AI-04).
- Output truncates or breaks schema → one bounded `gpt-5.4-mini` repair; if still invalid, return 422, do not persist garbage.
- Out-of-policy / harmful course request → refuse; high-stakes verticals flagged for the review tier.

**Token budget for this feature:** One `gpt-5.4` call per course with Azure prefix caching → low single-digit cents/course at demo scale; hard max-output-token cap enforced.

---

## 6. Security, Privacy & Performance

**Security surface:**
- File upload validated (type, size) before extraction; extracted text length-capped.
- Only the uploading teacher's own document is in context — no cross-tenant data (LLM06).
- Generation route requires an authenticated teacher; RLS prevents writing to another teacher's course.

**Performance:**
- Single bounded call; progress shown to the teacher. Prompt caching reduces repeat-call latency/cost.
- Generation excluded from the learner-facing p95 latency budget (SDD §7).

**Privacy:**
- Document text leaves to **Azure AI Foundry (Microsoft Azure OpenAI Service)** — not used for model training under Azure OpenAI Service terms; reconcile with CLR §1. Target a Southeast Asia Azure region in Phase 1 to address PH data-localization requirements. No learner PII in the generation prompt.

---

## 7. Execution Plan

**Can this ship behind a feature flag?** Yes — `ENABLE_AI_GENERATION`; falls back to a manual course-builder if disabled.

**Ticket breakdown:**

| Ticket | Description | Size |
|--------|-------------|------|
| GEN-01 | Upload → Supabase Storage + server-side text extraction | M |
| GEN-02 | Course JSON Zod schema (shared with editor) | S |
| GEN-03 | `lib/ai/courseGen.ts` — `AzureOpenAI` client init + cached prompt assembly + `gpt-5.4` call | M |
| GEN-04 | Schema validation + bounded `gpt-5.4-mini` repair fallback | S |
| GEN-05 | `POST /api/courses/generate` + persist draft (courses/lessons/quiz) | M |
| GEN-06 | Course Editor review/edit UI + explicit publish (no auto-publish) | L |

**Rollout order:** upload+extract → schema → generation call → validation/repair → route+persist → editor/publish → QA (QAD H-01, S-01, AB-03, AI-01..AI-04).

*These tickets feed PRD §9 M3.*

---

## Self-Check

- [x] §3 has exact API shapes + the validated JSON schema; reuses SDD tables ("No new tables")
- [x] §4 has real rejected alternatives (per-page AI, auto-publish, raw output, Sonnet-for-all)
- [x] §5 filled — model, caching, no-tools, injection handling, repair fallback
- [x] §7 tickets actionable; mapped to PRD §9 M3 + QAD evals
- [x] No duplication of PRD features or SDD global architecture
