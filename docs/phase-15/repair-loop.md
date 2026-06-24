# Phase 15 Repair Loop

Status: Round 5 evidence

## Starting Point

Candidate 002 was the most promising Round 4 base:

- it had initial ambiguity with `3` guest layouts;
- it already produced accepted `LOCAL_COUNT_SATURATED` and `LOCAL_SCOPE_DIFFERENCE` deductions;
- it still had one proof explanation gap for `D3`;
- minimization removed `B2`, making the proof ordinary and dropping `LOCAL_SCOPE_DIFFERENCE`.

## Repair Attempt

`phase-15-retained-difference-003` keeps the candidate-002 corridor rules and adds `D2` as an initial empty reveal.

The added reveal lets rule `R3` explain `D3` as safe using the existing empty orthogonal quiet-zone template. It does not collapse the puzzle to initial uniqueness: bounded enumeration still reports `2` initial guest layouts.

## Result

Candidate 003 succeeds:

- `report`: `ok: true`;
- `score`: `12.15`, provisional band `3`;
- initial guest layouts: `2`;
- proof: `noGuess: true`, `humanExplainable: true`, `guestLayoutUniqueAtEnd: true`;
- proof metrics: one wave, seven deductions, four revealed safe cells, one confirmed guest;
- techniques: `LOCAL_COUNT_SATURATED`, `LOCAL_SCOPE_DIFFERENCE`;
- final guest cells: `B3`, `C3`;
- truncation: `false`;
- `minimize --require-technique LOCAL_SCOPE_DIFFERENCE`: `ok: true`, `TECHNIQUE_RETENTION_PASS`.

## Promotion Decision

The repaired candidate was copied deliberately into `content/cases/case-012.json` with Chinese player-facing title, case name, rule titles, and rule flavor text.

No generator output, authoring diagnostics, target data, forced-cell data, or experimental file path was wired into the player UI.
