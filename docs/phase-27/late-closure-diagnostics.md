# Phase 27 Late-Closure Diagnostics

Round 6 hardened authoring diagnostics for no-guess and final-uniqueness blockers without changing the proof report contract.

## Added Diagnostic Items

The `human-proof` diagnostics group now keeps the existing broad status items and adds stable detail items when verifier issues are present:

- `PROOF_ISSUE_CODES`
- `PROOF_FINAL_UNIQUENESS_BLOCKER`
- `PROOF_EXPLANATION_GAP`
- `PROOF_GUESS_POINT`
- `PROOF_NON_PROGRESS`
- `PROOF_INVALID_DEDUCTION`
- `PROOF_SOLVER_TRUNCATED`

These items let the workbench and CLI distinguish:

- solver-backed forced cells that lack approved human explanations;
- a proof state where no human deduction can advance;
- final guest-layout non-uniqueness after all current human-proof waves;
- cap/truncation or invalid-deduction problems that should not be treated as content difficulty.

## Fixtures

- `packages/authoring/src/diagnostics.test.ts`: `classifies explanation gaps separately from final uniqueness blockers`
  - Uses `content/experimental/phase-26/candidates/p26-c06-two-wave-frontier.json`.
  - Confirms `EXPLANATION_GAP` is surfaced separately from final uniqueness.
- `packages/authoring/src/diagnostics.test.ts`: `classifies guess points separately from final uniqueness blockers`
  - Uses a tiny in-memory 3x3 ambiguous case with exactly one guest and insufficient human progress.
  - Confirms `GUESS_POINT` is surfaced separately from final uniqueness.

## Scope Notes

This is diagnostics-only hardening. It does not relax no-guess gates, change solver semantics, promote content, or expose player-facing internals.
