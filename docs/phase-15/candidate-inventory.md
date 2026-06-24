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
