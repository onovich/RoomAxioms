# Phase 13 Candidate Inventory

Status: Round 3 inventory

## Candidate Sources

Reviewed sources:

- hand-authored natural difference candidates under `content/experimental/phase-13/`;
- report-only sample template at `content/experimental/phase-13/phase-13-difference-sample-template.json`;
- inherited Phase 12 fixture baseline at `content/experimental/phase-12/phase-12-local-scope-difference-001.json`.

## Candidates

### `phase-13-local-scope-difference-001`

Path:

```text
content/experimental/phase-13/phase-13-local-scope-difference-001.json
```

Shape:

- 3x3 board;
- mirror zero-guest local scope reveals a hidden bottle safely;
- bottle orthogonal count plus mirror zero-scope creates a `LOCAL_SCOPE_DIFFERENCE` guest deduction;
- hidden bottle then completes final guest layout.

Round 3 report:

- authoring `report`: `ok: true`;
- schema issue count: `0`;
- target rules satisfy: `true`;
- initial satisfiable: `true`;
- initial guest layouts: `2`;
- proof no-guess: `true`;
- final guest cells: `B3`, `C3`;
- proof wave count: `1`;
- deduction count: `3`;
- technique ids: `LOCAL_COUNT_SATURATED`, `LOCAL_SCOPE_DIFFERENCE`;
- truncation: `false`.

Round 3 status:

- rejected in Round 4 because minimization drops `LOCAL_SCOPE_DIFFERENCE` and the score remains provisional band `2`.

### `phase-13-local-scope-difference-002`

Path:

```text
content/experimental/phase-13/phase-13-local-scope-difference-002.json
```

Shape:

- 4x3 corridor extension of candidate 001;
- same visible local-difference premise;
- extra corridor cells intentionally test pacing pressure.

Round 3 report:

- authoring `report`: `ok: false`;
- schema issue count: `0`;
- target rules satisfy: `true`;
- initial satisfiable: `true`;
- initial guest layouts: `5`;
- proof no-guess: `false`;
- issue codes: `EXPLANATION_GAP`, `EXPLANATION_GAP`, `EXPLANATION_GAP`;
- proof wave count: `2`;
- deduction count: `3`;
- technique ids: `LOCAL_COUNT_SATURATED`, `LOCAL_SCOPE_DIFFERENCE`;
- truncation: `false`.

Round 3 status:

- rejected in Round 4 because proof/no-guess fails and minimization cannot repair final uniqueness.

### `phase-13-difference-sample-template`

Path:

```text
content/experimental/phase-13/phase-13-difference-sample-template.json
```

Round 2 sample smoke:

- seed `1301`;
- accepted candidates: `0`;
- rejection pattern: target rule failures;
- truncation: `false`;
- artifact policy: `report-only`.

Round 3 status:

- template remains a broad search aid only, not a promotion candidate.

### `phase-12-local-scope-difference-001`

Path:

```text
content/experimental/phase-12/phase-12-local-scope-difference-001.json
```

Round 1 baseline:

- mechanically valid;
- score `9.73`, provisional band `2`;
- minimization drops `LOCAL_SCOPE_DIFFERENCE`.

Round 3 status:

- rejected for Phase 13 promotion baseline.
