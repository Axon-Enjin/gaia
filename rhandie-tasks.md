# Rhandie's Task Board — Gaia

**Role:** Lead Engineer (Full-Stack, Azure Infrastructure, AI Foundry)
**Context:** Gaia `v1.1` (Next.js 16.2.x + Supabase + Azure AI Foundry GPT)

This document tracks the core implementation tasks tailored to Rhandie's expertise, bridging the Azure infrastructure, the AI generation pipeline, and the Next.js full-stack foundation.

---

## 1. Azure Infrastructure & AI Foundry Setup
*Goal: Provision the AI backend securely and establish the cloud foundation.*

- [ ] **Provision Azure AI Foundry:** Create the Azure AI resource, ensuring it is in a region with sufficient quota for the required models.
- [ ] **Deploy Models:** Deploy the required OpenAI models and configure their exact deployment names:
  - `gpt-5-4` (mapped to `gpt-5.4`) for heavy course generation.
  - `gpt-5-4-mini` (mapped to `gpt-5.4-mini`) for cheap structural tasks.
- [ ] **Configure Managed Identity:** Set up `DefaultAzureCredential` so the Next.js backend can authenticate with Azure AI without hardcoding `AZURE_OPENAI_API_KEY`.
- [ ] **Vercel Setup:** Initialize the Vercel project and inject the necessary environment variables (`AZURE_OPENAI_ENDPOINT`, Supabase URL/Anon keys).

## 2. Next.js 16 Full-Stack Foundation
*Goal: Lay the boilerplate following the strict `build-gaia.md` guardrails.*

- [ ] **Initialize Next.js 16.2.x:** Setup the App Router with Turbopack and Tailwind CSS.
- [ ] **Authentication Boundary:** Implement Supabase SSR auth. Avoid using `middleware.ts` for complex logic; use `proxy.ts` for headers/redirects and handle auth in layouts and Server Actions.
- [ ] **Database & RLS:** Scaffold the initial Supabase Postgres tables (`courses`, `lessons`, `merit_ledger`) and enforce Row Level Security so ownership is strictly checked server-side.
- [ ] **Explicit Caching:** Establish data fetching patterns utilizing the new `'use cache'` directive where applicable, strictly avoiding legacy Next.js 14 sync APIs.

## 3. AI Course Generation Pipeline (PRD-F1)
*Goal: Build the core AI pipeline that turns raw text into structured courses.*

- [ ] **SDK Integration:** Implement `lib/ai/courseGen.ts` utilizing `openai` + `@azure/openai` + `@azure/identity` with the `AzureOpenAI` client.
- [ ] **System Prompt & Caching:** Write the pedagogical system prompt + Zod JSON schema contract. Ensure this static content is placed *first* in the message array to trigger Azure's automatic prefix caching (≥ 1024 tokens).
- [ ] **Schema Validation & Repair:** Implement the safety mechanism where AI output is strictly validated against a Zod schema. If it fails, trigger a single, bounded repair call using `gpt-5-4-mini` before throwing a 422 error.
- [ ] **Untrusted Input Handling:** Ensure uploaded teacher documents are properly sanitized and wrapped as untrusted input before being sent to the LLM.

## 4. Feature UI & Edge Integrations
*Goal: Connect the backend pipelines to the low-resource frontend.*

- [ ] **Teacher Dashboard:** Build the "Upload & Generate" flow, including uploading a PDF, extracting text on the server, and polling the AI pipeline for the generated JSON draft.
- [ ] **Cost-Gated Interactions:** Ensure the UI never triggers AI on the learner's read path. AI is strictly isolated to the teacher's creation flow.
- [ ] **Low-Resource UI:** Implement the English/Filipino localization toggle and ensure the initial JS payload respects the 220KB budget.
