# Phase 15 Carryover Blockers

Status: Round 1 baseline

## Phase 14 Carryover

Phase 14 ended without promotion because no reviewed candidate satisfied both proof quality and technique-retention quality.

### Candidate 001

Useful evidence:

- initial guest-layout count `2`;
- proof emits `LOCAL_SCOPE_DIFFERENCE`;
- minimization retains `LOCAL_SCOPE_DIFFERENCE`;
- no truncation.

Blocking evidence:

- `report` returns `ok: false`;
- `noGuess: false`;
- `humanExplainable: false`;
- `guestLayoutUniqueAtEnd: false`;
- proof issues include explanation gaps for safe cells.

Phase 15 implication:

- worth repairing only if added structure lets existing proof templates explain the remaining cells;
- not worth repairing by directly revealing the ambiguous cells or making the initial guest layout unique.

### Candidates 002 And 003

Useful evidence:

- schema, target rules, no-guess, and final uniqueness pass.

Blocking evidence:

- initial guest-layout count `1`;
- proof wave count `0`;
- technique ids empty;
- retention fails for `LOCAL_SCOPE_DIFFERENCE`.

Phase 15 implication:

- keep as regression examples for over-repair;
- reject any candidate with the same zero-wave profile even if ordinary authoring validation passes.

### Phase 14 Sampler

Useful evidence:

- seed `1401` was deterministic;
- no truncation.

Blocking evidence:

- accepted `0` candidates;
- attempts were dominated by `TARGET_VIOLATES_RULES`.

Phase 15 implication:

- prefer hand-authored or tightly constrained fixtures first;
- use sampling only as report-only evidence, not as an automatic promotion path.

## Phase 15 Search Constraint

The next successful candidate must sit between the Phase 14 failures:

- less revealed than 002/003 so initial ambiguity remains;
- more explainable than 001 so proof/no-guess and final uniqueness pass;
- still minimized enough that `LOCAL_SCOPE_DIFFERENCE` is retained without decorative reveals.
