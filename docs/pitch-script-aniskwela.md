# Aniskwela Grant Pitch Script

**Audience:** NGO, foundation, and government program officers (TESDA, DepEd, CSR teams)  
**Duration:** ~8 to 10 minutes  
**Deck file:** [`Aniskwela-Grant-Pitch.pptx`](../Aniskwela-Grant-Pitch.pptx) (11 slides)  
**Regenerate:** `python scripts/build_pitch_deck.py`  
**Insert market slide in existing deck:** `python scripts/insert_market_slide.py`

Speaker notes for each slide are also embedded in the PowerPoint file.

---

## Slide 1 · Title

**On slide:** Aniskwela · harvest school · grant partner presentation · Team Axon Enjin

**Say:**

Good morning. We are Team Axon Enjin, and this is Aniskwela.

The name comes from two Filipino words: *ani*, harvest, and *eskwela*, school. We built it for Filipino farmers and rural learners who study on shared phones and prepaid data.

Aniskwela turns raw teaching materials into structured courses, helps learners build a visible record of effort, and issues credentials that funders can verify without taking anyone's word for it.

Today we want to show you why that matters for the programs you run, what we have built so far, and what a partnership could look like.

---

## Slide 2 · The Problem

**On slide:** Rural learners lack proof, access, and a fair path to funding

**Say:**

Let me start with Maricel. She is twenty-two, lives in a rural part of Region IV, and shares a one-gigabyte Android phone with her family. She wants to learn agriculture and basic financial literacy, but the platforms she finds were not built for her life.

The courses are mostly in English. They assume fast Wi-Fi. When she finishes something, she has nothing credible to show an employer or a grant officer.

Teachers face the opposite problem. Ramon is an agricultural extension worker. He knows the subject, but building an online course takes tools and time he does not have.

Funders like you see the third gap. Divina runs a foundation program. She wants to reward consistent learners, but she cannot target grants transparently and she cannot audit outcomes without manual paperwork.

Existing tools either gamify rewards without real learning, or they offer credentials that are easy to fake. Neither side gets trust.

---

## Slide 3 · The Opportunity

**On slide:** TAM / reach / funding pool / pilot wedge · cited Philippine figures

**Say:**

Before we show the product, let me quantify the opportunity.

The Registry System for Basic Sectors in Agriculture lists ten point seven million agricultural workers—nearly seven million farmers, two point seven million fisherfolk, plus farm workers and farm youth. Agriculture still employs about one in five Filipino workers according to PSA.

At the same time, ninety-eight million Filipinos are online—eighty-four percent penetration—and most mobile connections run on 3G, 4G, or 5G. That is why we built for prepaid data and shared phones, not campus Wi-Fi.

Public money for skills training already exists. TESDA spent roughly sixteen billion pesos on free tech-voc in twenty twenty-five, but fewer than one quarter of graduates went through scholarship vouchers. The funding pool is there; what is missing is transparent, merit-based targeting for rural farmers.

Our ninety-day wedge is modest: fifty courses, five hundred learners, one simulated grant program, and ten extension teachers through a partner network. That is what we are asking you to help us pilot.

---

## Slide 4 · The Solution

**On slide:** Four pillars · farmer-first · learning-first

**Say:**

Aniskwela addresses all three sides with one platform.

First, teachers upload a PDF or document and our AI pipeline drafts a structured course. Nothing goes live until a teacher reviews it. We do not auto-publish.

Second, learners study on a low-resource interface tuned for 3G and Filipino. Progress shows up as XP and levels, from Seed to Mentor. That record is cumulative. We do not burn or spend XP like a casino game.

Third, when a learner passes a course, we issue a W3C Verifiable Credential in the Open Badges 3.0 profile. Only a hash of that credential goes on Stellar. No personal data on the chain.

Fourth, funders define eligibility against the merit ledger. Aniskwela decides who qualifies. A licensed VASP moves money. We stay on the right side of regulation.

The engine can serve other subjects later, but we are farmer-first because that is where the need and our team's story align.

---

## Slide 5 · Learner Experience (Live)

**On slide:** Mobile-first · EN/Fil · catalog and lessons · Live

**Say:**

This is what a learner sees today. We already ship a course catalog and lesson reader that load quickly on a typical Philippine phone screen.

The shared initial JavaScript bundle measures about one hundred seventy-four kilobytes gzipped, under our two hundred twenty kilobyte budget. Content is cached on the server so learners are not waiting on AI when they open a lesson.

Language toggles between English and Filipino without a full page reload. That matters when someone reads faster in Filipino but still wants English for certain terms.

What is live now: browsing published courses, reading lessons, switching language.

What is on the roadmap for this surface: interactive quizzes, XP and streak display, enrollments, and the credential wallet.

We label that honestly so you know what you can click today versus what we are building next.

---

## Slide 6 · Teacher and Funder Surfaces

**On slide:** Upload to publish (Live) · funder console (Roadmap)

**Say:**

On the teacher side, the flow that works today is upload, generate, review, and publish.

A teacher signs in, uploads a PDF, and the server extracts text and calls Azure AI Foundry once per course. The model returns modules, lessons, and quiz questions. If the JSON fails validation, a smaller model tries one repair pass. If that still fails, we return an error. We never save garbage.

The teacher sees the draft in their dashboard and publishes when ready. Published courses appear in the public catalog.

The funder dashboard is not built yet, but the database already has grant program tables with a simulated flag. The design lets a program officer set criteria like agriculture learners above a certain XP threshold, preview the eligible list, and run a labelled simulation with an exportable audit trail. Real disbursement always routes through a licensed partner.

---

## Slide 7 · How It Works

**On slide:** Six steps from document to anchored credential

**Say:**

Here is the end-to-end story we are completing.

Step one: a teacher uploads source material.

Step two: Azure AI Foundry generates a structured draft. AI runs once per course, not on every page view.

Step three: the teacher edits if needed and publishes.

Step four: a learner studies lessons and takes assessments. We record completion in the merit ledger.

Step five: on pass, the platform issues a verifiable credential and signs it with our issuer key.

Step six: we anchor only the credential hash in a Stellar transaction. Anyone can verify the link between the credential and the chain entry without seeing private learner data on ledger.

If Testnet is down during a demo, we fall back to a clearly labelled mock anchor so learning never blocks on infrastructure.

---

## Slide 8 · Merit Ledger and Credentials

**On slide:** W3C VC · Open Badges 3.0 · hash-only on Stellar

**Say:**

This slide is about trust without hype.

The merit ledger is an append-only record of positive events: lesson completed, quiz passed, badge earned. XP never goes negative and never gets spent. Funders read that ledger when they ask who stayed consistent.

Credentials follow open standards, not a proprietary badge NFT. Employers and other institutions can verify them with tools they already trust.

On-chain, we store a hash. That proves the credential existed at issuance time and was not altered afterward. We do not put names, emails, or grades in the memo.

A public verifier page, no login required, will let anyone scan a QR or open a link and see valid or invalid with course, date, and score. That piece is specified and schema-ready; we are building it in the next sprint.

---

## Slide 9 · Grant Model for Partners

**On slide:** Eligibility layer · simulated disbursement · audit trail

**Say:**

This is the slide most relevant to your work.

Aniskwela is not a money transmitter. We do not move pesos inside the app. We tell you who meets the criteria you set. Your licensed VASP or e-money partner executes payout.

In the MVP, disbursement is a simulation. Every screen and export says so clearly. That lets you pilot policy, report to donors, and train staff before real funds flow.

You might fund learners who completed an agriculture track, held a thirty-day streak, and earned a specific badge. The platform returns a list backed by ledger data, not self-reported forms.

For compliance, we lean on row-level security in Postgres, server-side eligibility checks, and exportable audit logs. CLR work covers privacy and trademark next steps.

We are looking for one foundation or agency partner willing to co-design the first pilot program criteria.

---

## Slide 10 · Technology and Data Model

**On slide:** Next.js 16 · Supabase · Azure AI Foundry · Stellar

**Say:**

Under the hood we use a stack chosen for speed, cost, and honesty about constraints.

The app is Next.js sixteen on Vercel. Auth, database, and storage run on Supabase with row-level security on every table. Teachers only see their drafts; learners only see their own progress rows when those flows ship.

AI goes through Azure AI Foundry with GPT five point four for course generation and the mini model for cheap repair tasks. Managed Identity in production, API key only for local development.

The initial migration defines nine tables: profiles, courses, lessons, quiz questions, enrollments, merit ledger, badges, credentials, and grant programs. Several are wired in schema today and waiting for application code.

Performance is a requirement, not a nice-to-have. Light theme, system fonts, no web font download on first paint, images capped at eighty kilobytes WebP where we use them.

---

## Slide 11 · Impact and Next Step

**On slide:** What we ask · pilot partner · live demo

**Say:**

We are not asking you to fund a slide deck. We are asking for a conversation about a pilot.

Help us define real eligibility rules for farmers in your network. Point us to ten teachers who can upload extension materials. Give us feedback when the verifier and funder console land in the next build weeks.

Success for us in the next ninety days looks like fifty published courses, five hundred registered learners, and at least one simulated grant program run with a partner who exports an audit report they would actually show a donor.

Scan the QR or open the link to try the live teacher and catalog flows. Talk to us after about co-designing the first grant criteria.

Thank you. We are Carlos, Rhandie, and Aidan from Team Axon Enjin. Aniskwela: learn, earn credentials you can prove, and grow.

---

## Delivery tips

- Pause after Slide 2 so the funder persona (Divina) lands; use Slide 3 to anchor the opportunity with numbers before diving into product.
- On Slides 5 and 6, point at the **Live** and **Roadmap** labels rather than overselling roadmap items.
- Slide 9 is the heart of the grant conversation. Leave time for questions there.
- If demoing live, sign in as a teacher first, then show the public catalog in a second browser tab.
