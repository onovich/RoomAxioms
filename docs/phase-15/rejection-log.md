# Phase 15 Rejection Log

Status: Round 6 evidence

## Rejected For Shipped Promotion

### `phase-15-retained-difference-001`

Path:

- `content/experimental/phase-15/phase-15-retained-difference-001.json`

Reason:

- `LOCAL_SCOPE_DIFFERENCE` is retained by minimization, but the proof remains incomplete.
- Authoring report has explanation gaps for `A3` and `C3`.
- Final guest layout is not unique.
- Score is provisional band `2`, and no real playtest calibration exists.

Disposition:

- Keep as a compact retained-difference proof-gap fixture under experimental content.
- Do not wire into shipped content.

### `phase-15-retained-difference-002`

Path:

- `content/experimental/phase-15/phase-15-retained-difference-002.json`

Reason:

- The candidate can reach ordinary no-guess/final uniqueness after minimization.
- The minimized proof removes `B2` and drops `LOCAL_SCOPE_DIFFERENCE`.
- `minimize --require-technique LOCAL_SCOPE_DIFFERENCE` reports `TECHNIQUE_RETENTION_FAILED`.

Disposition:

- Keep as the documented repair base for candidate 003.
- Do not wire into shipped content.

## Promoted Candidate

`phase-15-retained-difference-003` was not rejected. It was deliberately copied into shipped content as `case-012` after all promotion gates passed.
