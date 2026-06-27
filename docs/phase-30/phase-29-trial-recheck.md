# Phase 30 Phase 29 Trial Recheck

Status: documented after the non-singleton overlap scope-difference bridge and
authoring diagnostics landed.

Trial:

- `content/experimental/phase-29/p29-overlap-frontier-ledger-trial.json`

## Report

Command:

```text
pnpm authoring -- report content/experimental/phase-29/p29-overlap-frontier-ledger-trial.json
```

Result:

- `ok`: false
- recommendation: `repair-proof`
- no-guess: false
- human-explainable: false
- final guest layout unique at end: false
- issue codes: `GUESS_POINT`
- wave count: 2
- deduction count: 2
- technique IDs: `SCOPE_OVERLAP_SCOPE_DIFFERENCE`
- initial guest layouts: 42
- target-4: false
- target-4 missing: `proof-wave-count`, `deduction-count`,
  `frontier-unlock-count`

Interpretation: the bridge fixes the first unsupported overlap deduction. The
trial no longer fails because the overlap pressure is invisible to the human
reasoner, but it still reaches a genuine proof stall before no-guess final
uniqueness.

## Score

Command:

```text
pnpm authoring -- score content/experimental/phase-29/p29-overlap-frontier-ledger-trial.json
```

Result:

- uncalibrated score: 24.17
- heuristic band: 5
- candidate guest layouts: 42
- proof wave count: 2
- deduction count: 2
- technique count: 1
- technique IDs: `SCOPE_OVERLAP_SCOPE_DIFFERENCE`
- solver truncated: false

Interpretation: the score is still an uncalibrated authoring heuristic and does
not override the failed no-guess and target-4 gates.

## Minimize

Guide-specified command:

```text
pnpm authoring -- minimize content/experimental/phase-29/p29-overlap-frontier-ledger-trial.json --require-technique SCOPE_OVERLAP_COUNT_SATURATED
```

Result:

- `ok`: false
- recommendation: `repair-proof`
- before technique IDs: `SCOPE_OVERLAP_SCOPE_DIFFERENCE`
- after technique IDs: `SCOPE_OVERLAP_SCOPE_DIFFERENCE`
- preserved technique IDs: `SCOPE_OVERLAP_SCOPE_DIFFERENCE`
- required technique IDs: `SCOPE_OVERLAP_COUNT_SATURATED`
- no-guess: false
- issue codes: `GUESS_POINT`

Bridge-specific command:

```text
pnpm authoring -- minimize content/experimental/phase-29/p29-overlap-frontier-ledger-trial.json --require-technique SCOPE_OVERLAP_SCOPE_DIFFERENCE
```

Result:

- `ok`: false
- recommendation: `repair-proof`
- before technique IDs: `SCOPE_OVERLAP_SCOPE_DIFFERENCE`
- after technique IDs: `SCOPE_OVERLAP_SCOPE_DIFFERENCE`
- preserved technique IDs: `SCOPE_OVERLAP_SCOPE_DIFFERENCE`
- lost technique IDs: none
- required technique IDs: `SCOPE_OVERLAP_SCOPE_DIFFERENCE`
- no-guess: false
- issue codes: `GUESS_POINT`

Interpretation: the new bridge technique is retained through minimization, but
the trial is still not a promotable puzzle because the proof does not complete.
The guide-named saturated technique is not the sound shape this fixture needs;
the implemented bridge is a contained overlap scope-difference deduction.

## Authoring Diagnostics

Added authoring diagnostics distinguish two cases:

- `PROOF_SCOPE_OVERLAP_UNSUPPORTED`: a draft uses `scopeOverlapCount`, but no
  approved overlap proof technique fires.
- `PROOF_SCOPE_OVERLAP_BRIDGE_PARTIAL`: an overlap scope-difference deduction
  fires, but proof still stalls before no-guess final uniqueness.

Regression coverage:

- `packages/authoring/src/diagnostics.test.ts`
  - `reports a partial non-singleton overlap bridge separately from later proof stalls`
  - `reports overlap-count drafts that have no supported overlap proof technique`

## Promotion Decision

Do not promote this trial.

Reasons:

- no-guess verification fails;
- final guest layout is not unique at proof end;
- target-4 fails;
- proof wave count, deduction count, and frontier unlock count are too low;
- the trial remains experimental evidence for proof/authoring readiness, not
  player-facing ladder content.
