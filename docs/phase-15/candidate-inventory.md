# Phase 15 Candidate Inventory

Status: Round 3 report evidence

## Reviewed Candidates

### `phase-15-retained-difference-001`

Path:

- `content/experimental/phase-15/phase-15-retained-difference-001.json`

Pattern:

- Pattern A guest-subject bridge repair of the Phase 14 compact 3x3 shape.

Intent:

- keep the retained `B3` difference deduction;
- add guest/bin local rules that might let the confirmed difference guest unlock later proof progress.

Report evidence:

- report: `ok: false`;
- schema issue count: `0`;
- target rules satisfy: `true`;
- initial satisfiable: `true`;
- initial guest layouts: `2`;
- proof noGuess: `false`;
- proof humanExplainable: `false`;
- final guest layout unique: `false`;
- issue codes: `EXPLANATION_GAP`, `EXPLANATION_GAP`;
- wave count: `1`;
- deduction count: `1`;
- technique ids: `LOCAL_SCOPE_DIFFERENCE`;
- truncation: `false`.

Round 3 decision:

- keep as a retained-difference proof-gap candidate;
- not eligible for promotion without a proof repair.

### `phase-15-retained-difference-002`

Path:

- `content/experimental/phase-15/phase-15-retained-difference-002.json`

Pattern:

- Pattern B/C corridor repair of the Phase 13 retained-difference corridor.

Intent:

- keep the corridor's retained `B3` difference deduction;
- add an `empty` orthogonal quiet-zone rule to explain the previous D1/A3/D3 safe gaps using existing local count saturation.

Report evidence:

- report: `ok: false`;
- schema issue count: `0`;
- target rules satisfy: `true`;
- initial satisfiable: `true`;
- initial guest layouts: `3`;
- proof noGuess: `false`;
- proof humanExplainable: `false`;
- final guest layout unique: `false`;
- issue codes: `EXPLANATION_GAP`;
- wave count: `1`;
- deduction count: `6`;
- technique ids: `LOCAL_COUNT_SATURATED`, `LOCAL_SCOPE_DIFFERENCE`;
- truncation: `false`.

Round 3 decision:

- keep as the more promising repair base because it reduced the proof-gap count to one while keeping initial ambiguity;
- require Round 4 retention/minimization filtering before any further repair decision.

## Round 3 Outcome

No Phase 15 candidate is promotion-ready from report evidence alone.

Candidate 001 reproduces the compact retained-difference proof-gap blocker. Candidate 002 improves the corridor shape and is worth filtering because it has more accepted proof activity and only one remaining gap.

### `phase-15-retained-difference-003`

Path:

- `content/experimental/phase-15/phase-15-retained-difference-003.json`

Pattern:

- Focused repair of candidate 002.

Intent:

- keep the candidate-002 corridor shape;
- add `D2` as an initial empty reveal so the existing empty orthogonal quiet-zone rule can explain the remaining `D3` safe cell;
- preserve `B2` as a necessary bottle reveal so the `B2`/`B1` difference still forces `B3` as a guest.

Report evidence:

- report: `ok: true`;
- schema issue count: `0`;
- target rules satisfy: `true`;
- initial satisfiable: `true`;
- initial guest layouts: `2`;
- proof noGuess: `true`;
- proof humanExplainable: `true`;
- final guest layout unique: `true`;
- final guest cells: `B3`, `C3`;
- issue codes: none;
- wave count: `1`;
- deduction count: `7`;
- technique ids: `LOCAL_COUNT_SATURATED`, `LOCAL_SCOPE_DIFFERENCE`;
- truncation: `false`.

Score evidence:

- score: `12.15`;
- provisional band: `3`;
- `calibratedWithRealPlaytest: false`;
- solver truncation: `false`.

Round 5 decision:

- promote a reviewed copy as `content/cases/case-012.json`;
- keep the experimental source under `content/experimental/phase-15` as the search trace;
- require shipped-copy `report`, `score`, web verification, and `minimize --require-technique LOCAL_SCOPE_DIFFERENCE` before final PASS.
