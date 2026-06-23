# Request for Comments (RFC) / Tech Spec

**Title:** Verifiable Credential issuance with Stellar hash anchoring
**Date:** 2026-06-23
**Author:** Carlos Jerico Dela Torre
**Status:** `Approved`
**Last reconciled:** N/A — pre-build
**PRD Reference:** [prd-aniskwela.md](prd-aniskwela.md) §3 (PRD-F4, PRD-F5), US-03, US-04
**SDD Reference:** [sdd-aniskwela.md](sdd-aniskwela.md) §3 (`credentials`), §4, §5
**RFC ID:** `aniskwela-rfc-001`

---

## 1. Context & Objective

**The problem this solves:**
On course completion, a learner must receive a credential that is (a) portable and verifiable by third parties without Aniskwela's involvement, and (b) tamper-evident via the blockchain — without putting PII on-chain or requiring the learner to own a wallet.

**Reference in PRD/SDD:**
This RFC implements PRD-F4 (issuance) and PRD-F5 (public verifier), built on the SDD `credentials` table.

**Success criteria:**
- A completed course yields a signed W3C Verifiable Credential using the Open Badges 3.0 profile, verifiable in any OB 3.0 / VC-compatible verifier (not just Aniskwela's).
- Only a SHA-256 hash of the canonical credential is written on-chain; no PII on Stellar.
- The public verifier confirms both the signature and that the on-chain hash matches, with no login.
- If Stellar Testnet is unavailable during a live demo, issuance degrades to a clearly-labelled mock anchor rather than failing.

---

## 2. Proposed Solution

**Approach:**
1. Learner passes the final assessment at/above the course's `passing_score`.
2. Server builds a VC (W3C VC Data Model 2.0, Open Badges 3.0 profile) as JSON-LD: subject = learner identifier (opaque, not raw email), achievement = course, issuer = **Aniskwela (platform-level DID)**, plus date and score.
3. Server canonicalizes the VC and computes `credential_hash = SHA-256(canonical)`.
4. Server signs the VC with the issuer key (held server-side in the secrets store).
5. Server submits a Stellar transaction whose memo/data carries `credential_hash` (hash only) and records `stellar_tx_hash` + `network`.
6. Full signed VC stored in `credentials.vc_jsonld` (off-chain, exportable); learner gets a share URL + QR.
7. Public verifier (`GET /api/verify/[credentialId]`) re-canonicalizes, checks signature, recomputes the hash, and confirms it matches the value anchored in the referenced Stellar tx.

**Architecture changes:**
- Add `POST /api/credentials/issue` and `GET /api/verify/[id]` (SDD §4).
- Add issuer key management (env/secrets) + a small VC builder/signer module in `lib/credentials/`.
- `ENABLE_ONCHAIN_ANCHOR` flag toggles real Testnet anchoring vs. mock anchor (`network='mock'`).

---

## 3. Technical Details & Contracts

### Data Model Changes

Uses the existing `credentials` table (SDD §3). No new tables. Key columns: `vc_jsonld JSONB`, `credential_hash TEXT UNIQUE`, `stellar_tx_hash TEXT`, `network TEXT CHECK in ('testnet','mainnet','mock')`.

### API Changes

```
POST /api/credentials/issue
Request:
{
  "enrollment_id": "uuid"      // server verifies completion + passing score from DB, not client
}
Response 200:
{
  "credential_id": "uuid",
  "verify_url": "https://aniskwela.app/verify/<id>",
  "qr_png_base64": "...",
  "network": "testnet" | "mock",
  "stellar_tx_hash": "..." | null
}
Errors: 403 (not the owner / not completed), 409 (already issued), 502 (anchor failed + flag on)
```

```
GET /api/verify/[credentialId]          // public, no auth
Response 200:
{
  "valid": true,
  "checks": { "signature": true, "hash_on_chain": true },
  "course": "...", "learner": "<opaque id / display name>",
  "issued_at": "...", "score": 84, "network": "testnet",
  "stellar_tx_hash": "..."
}
// valid:false with the failing check named when signature or hash mismatch; 404 if unknown id
```

### State Management
Issuance is idempotent per enrollment (UNIQUE `credential_hash`; `409` on re-issue). Verifier is stateless and read-only; it reads the credential row + the referenced Stellar tx via Horizon.

---

## 4. Alternatives Considered

| Option | Why Rejected |
|--------|-------------|
| Custom Stellar memo blob as the credential (v1 design) | Only Aniskwela's own verifier can read it — contradicts the "verifiable across borders and industries" promise; not interoperable with HR systems / Europass. |
| Write the full credential on-chain | Puts PII on a public ledger; cost and privacy non-starter. Hash-only anchoring gives tamper-evidence without exposure. |
| NFT-style badge on Stellar (v1 design) | Conflates collectible/speculative framing with a merit credential; not an accepted credential standard; learner would need a wallet/trustline. |
| Require learner to hold a Stellar account to receive the credential | Imposes XLM trustline-funding burden on every learner — rejected; Aniskwela is learning-first and wallet is only relevant at grant-receipt (PRD §5.5). |

---

## 5. AI / Agent Implementation Notes

No AI component in this feature — issuance and verification are fully deterministic. (AI is confined to course generation, aniskwela-rfc-002.)

---

## 6. Security, Privacy & Performance

**Security surface:**
- Issuer signing key lives server-side in the secrets store — never client-side; key generation/rotation policy is a Phase 1 deliverable (PRD open question Q1 — issuer DID lifecycle).
- `/issue` verifies completion + ownership from the DB; never trusts a client claim of "passed".
- Verifier validates signature before trusting any displayed field.

**Performance:**
- Issuance is a single transaction submit; p95 bounded by Horizon. Verifier is a read; cache the Horizon lookup briefly.
- On-chain submit failures retried with backoff; flag-controlled mock fallback for demo continuity.

**Privacy:**
- No PII on-chain (hash only). Learner subject identifier is opaque. Full VC is off-chain, deletable/exportable per learner (reconcile with CLR data-subject rights).

---

## 7. Execution Plan

**Can this ship behind a feature flag?** Yes — `ENABLE_ONCHAIN_ANCHOR` (real Testnet vs mock anchor); credential issuance itself is gated by course completion.

**Ticket breakdown:**

| Ticket | Description | Size |
|--------|-------------|------|
| CRED-01 | `lib/credentials/` VC builder (OB 3.0 JSON-LD) + canonicalization + SHA-256 | M |
| CRED-02 | Issuer key loading from secrets + signing | S |
| CRED-03 | `POST /api/credentials/issue` with completion/ownership checks + idempotency | M |
| CRED-04 | Stellar anchor submit + `ENABLE_ONCHAIN_ANCHOR` mock fallback | M |
| CRED-05 | `GET /api/verify/[id]` public verifier (signature + on-chain hash) | M |
| CRED-06 | Share URL + QR generation; Credential Wallet UI (PRD-F7) | M |

**Rollout order:** VC builder → signer → issue route → anchor + fallback → verifier → wallet UI → QA (QAD H-03/H-04, AB-01, AB-02).

*These tickets feed PRD §9 M4. Keep milestone mapping consistent.*

---

## Self-Check

- [x] §3 has exact API request/response shapes and reuses the SDD schema (no new tables)
- [x] §3 schema reuse is explicit ("No new tables")
- [x] §4 has real rejected alternatives (custom memo, full on-chain, NFT, wallet-required) — not strawmen
- [x] §5 correctly marks no-AI
- [x] §7 tickets are immediately actionable
- [x] No duplication of PRD features or SDD global architecture
