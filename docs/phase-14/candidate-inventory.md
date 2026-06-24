# Phase 14 Candidate Inventory

Status: Round 5 evidence

## Reviewed Candidates

### `phase-14-local-scope-difference-001`

Path:

- `content/experimental/phase-14/phase-14-local-scope-difference-001.json`

Intent:

- Keep the Phase 12/13 positive difference geometry, but change the inner mirror count from `0` to `1` so the outer bottle reveal is not redundant under minimization.

Authoring evidence:

- report: `ok: false`;
- schema issue count: `0`;
- target rules satisfy: `true`;
- initial satisfiable: `true`;
- initial guest layouts: `2`;
- proof noGuess: `false`;
- issue codes: `EXPLANATION_GAP`, `EXPLANATION_GAP`;
- technique ids: `LOCAL_SCOPE_DIFFERENCE`;
- score: `7.76`;
- provisional band: `2`;
- calibrated with real playtest: `false`;
- minimization: `ok: false`;
- retention: `TECHNIQUE_RETENTION_PASS`;
- missing required techniques: none;
- truncation: `false`.

Decision:

- keep as a useful retained-difference proof-gap fixture;
- not eligible for promotion until proof/no-guess and final uniqueness are repaired.

### `phase-14-local-scope-difference-002`

Path:

- `content/experimental/phase-14/phase-14-local-scope-difference-002.json`

Intent:

- Add an extra initial safe reveal to close the Phase 14 candidate 001 ambiguity.

Authoring evidence:

- report: `ok: true`;
- initial guest layouts: `1`;
- proof wave count: `0`;
- technique ids: none;
- score: `3.61`;
- provisional band: `1`;
- minimization: `ok: true`;
- retention: `TECHNIQUE_RETENTION_FAILED`;
- missing required techniques: `LOCAL_SCOPE_DIFFERENCE`;
- truncation: `false`.

Decision:

- reject for Phase 14 difference promotion;
- reason: over-revealed initial state is already guest-layout unique and needs no human technique.

### `phase-14-local-scope-difference-003`

Path:

- `content/experimental/phase-14/phase-14-local-scope-difference-003.json`

Intent:

- Add a helper `bin` count intended to close the remaining guest after a difference deduction.

Authoring evidence:

- report: `ok: true`;
- initial guest layouts: `1`;
- proof wave count: `0`;
- technique ids: none;
- score: `3.21`;
- provisional band: `1`;
- minimization: `ok: true`;
- retention: `TECHNIQUE_RETENTION_FAILED`;
- missing required techniques: `LOCAL_SCOPE_DIFFERENCE`;
- truncation: `false`.

Decision:

- reject for Phase 14 difference promotion;
- reason: helper constraints make the initial guest layout unique before any no-guess proof technique is needed.

## Round 5 Outcome

No reviewed Phase 14 candidate qualifies for shipped promotion yet.

Candidate 001 is the only useful repair base because it keeps `LOCAL_SCOPE_DIFFERENCE` through minimization, but it still fails proof/no-guess and final uniqueness. Candidates 002 and 003 demonstrate the opposite failure mode: repair by extra reveals or helper constraints can erase the need for human difference reasoning.

