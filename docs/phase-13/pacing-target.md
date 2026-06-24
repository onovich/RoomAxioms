# Phase 13 Pacing Target

Status: Round 1 baseline

## Current Shipped Baseline

Shipped content currently contains `case-001` through `case-011`.

The most recent promoted case is `case-011`:

- technique ids: `LOCAL_SCOPE_INTERSECTION`;
- provisional score: `10.36`;
- provisional band: `3`;
- initial guest layouts: `2`;
- proof wave count: `1`;
- deduction count: `5`;
- calibrated with real playtest: `false`.

## Phase 13 Target

Prefer a natural difference candidate that:

- uses `LOCAL_SCOPE_DIFFERENCE` in the accepted reveal proof;
- remains no-guess after minimization or after an explicitly justified accepted reveal set;
- lands near the mid-band pacing target used by Phase 11, approximately provisional band `3`;
- avoids cap pressure and truncation;
- can be expressed with plain Chinese player-facing copy;
- does not require any new DSL, schema, solver, or proof semantics.

## Stop Condition

If candidates are valid as proof fixtures but are low-band, redundant-reveal, or lose `LOCAL_SCOPE_DIFFERENCE` under minimization, Phase 13 should stop without promotion and preserve shipped content.

