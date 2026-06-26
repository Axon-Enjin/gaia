# Change Record — CR-002

**Date:** 2026-06-26  
**Status:** Closed  
**Owner:** Carlos Jerico Dela Torre  
**Trigger docs:** [prd-aniskwela.md](prd-aniskwela.md), [sdd-aniskwela.md](sdd-aniskwela.md), [build-aniskwela.md](build-aniskwela.md), [index.md](index.md)

## Summary

Allow a **demo-only Stellar Testnet payout drill** to run from the latest simulated grant disbursement snapshot, signed by the funder’s own Freighter wallet, without changing the official MVP posture that Aniskwela is the eligibility-decision layer and not a money transmitter.

## Why this change was needed

The product already demonstrates Stellar-based verifiable credentials and a simulated NGO grant flow. For live demos, the team also needs a controlled way to prove that a simulated recipient snapshot can be replayed into an actual **Testnet** transfer flow without introducing platform custody, fiat, stablecoin rails, or partner payout semantics.

The previous Locked wording allowed only simulated grant disbursement and would have made this implementation diverge from the documented product. This CR narrows the exception to a **demo-only Testnet drill**:

- it is always downstream of an existing simulated disbursement snapshot
- it is signed client-side by the funder wallet in Freighter
- it uses native XLM on Stellar Testnet only
- it does not replace the simulated audit flow
- it does not change the Phase 1 partner-executed production payout model

## Before

- MVP grant disbursement was documented as simulation-only.
- Freighter was documented as connect-only demo wallet support.

## After

- MVP grant disbursement remains simulation-first.
- A separate, explicitly labeled **demo-only Testnet payout drill** is allowed from the latest simulated snapshot.
- Freighter remains optional for learners, but can also be used to save a demo payout address and to sign the funder-side Testnet payout drill.

## Docs touched

- [prd-aniskwela.md](prd-aniskwela.md)
- [sdd-aniskwela.md](sdd-aniskwela.md)
- [build-aniskwela.md](build-aniskwela.md)
- [index.md](index.md)
