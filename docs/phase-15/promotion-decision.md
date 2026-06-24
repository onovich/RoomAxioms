# Phase 15 Promotion Decision

Status: Round 5 promotion

## Promoted

### `phase-15-retained-difference-003` -> `case-012`

Decision: promoted as `content/cases/case-012.json`.

Evidence:

- experimental source: `content/experimental/phase-15/phase-15-retained-difference-003.json`;
- shipped copy: `content/cases/case-012.json`;
- authoring `report`: `ok: true`;
- authoring `score`: `12.15`, provisional band `3`;
- real playtest calibration: none; `calibratedWithRealPlaytest: false`;
- schema: pass, zero issues;
- target rules: pass;
- initial satisfiability: pass;
- initial guest layouts: `2`;
- proof/no-guess: pass;
- final guest cells: `B3`, `C3`;
- technique coverage: `LOCAL_COUNT_SATURATED`, `LOCAL_SCOPE_DIFFERENCE`;
- minimization with `--require-technique LOCAL_SCOPE_DIFFERENCE`: `ok: true`, `TECHNIQUE_RETENTION_PASS`;
- minimized cells: unchanged `A1`, `B1`, `C1`, `B2`, `D2`;
- web case verification: pass.

Promotion rationale:

- It satisfies the Phase 15 retained-difference gate without making the initial state unique.
- The retained difference deduction confirms `B3`, and the remaining proof reaches final uniqueness with accepted local-count deductions.
- It required no new proof technique, safe-cell difference semantics, DSL/schema change, solver rewrite, or UI redesign.
- It is the only promoted case in Phase 15.
- `case-004` remains the default case.

## Rejected Or Deferred

### `phase-15-retained-difference-001`

Decision: reject for Phase 15 shipped promotion.

Reason:

- It retains `LOCAL_SCOPE_DIFFERENCE`, but still has explanation gaps for `A3` and `C3`.
- Final guest layout does not become unique.

### `phase-15-retained-difference-002`

Decision: reject for Phase 15 shipped promotion.

Reason:

- It can become a no-guess/final-unique proof after minimization.
- That minimized proof drops `LOCAL_SCOPE_DIFFERENCE`, so it fails the Phase 15 retention gate.

## Count Decision

Phase 15 promotes exactly one case: `case-012`.
