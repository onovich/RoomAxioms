# Phase 15 Issue Register

Status: Round 1 baseline

## Active Issues

### P15-001 Retained Difference Must Not Be Decorative

Phase 15 requires `LOCAL_SCOPE_DIFFERENCE` to survive the accepted or minimized reveal set. A candidate is not enough merely because the first proof wave names the technique. The technique must be part of the proof that also reaches no-guess and final guest-layout uniqueness.

Gate:

- `pnpm authoring -- minimize <candidate> --require-technique LOCAL_SCOPE_DIFFERENCE`
- expected diagnostic: `TECHNIQUE_RETENTION_PASS`
- expected proof after minimization: `noGuess: true`, `humanExplainable: true`, `guestLayoutUniqueAtEnd: true`

### P15-002 Zero-Wave Initial Uniqueness Does Not Qualify

Phase 14 candidates 002 and 003 passed ordinary validation but failed the phase purpose because the initial observations already made the guest layout unique. Phase 15 candidates must keep initial ambiguity until the proof starts.

Gate:

- initial guest-layout count must be greater than `1`;
- proof wave count must be at least `1`;
- proof technique ids must include `LOCAL_SCOPE_DIFFERENCE`.

### P15-003 Retained Difference Alone Is Not Enough

Phase 14 candidate 001 retained `LOCAL_SCOPE_DIFFERENCE` but still had explanation gaps and no final guest-layout uniqueness. Phase 15 must find a shape where the retained difference deduction unlocks at least one later accepted deduction or final uniqueness.

Gate:

- `report` returns `ok: true`;
- proof issues are empty;
- final guest cells are non-null;
- proof has later progress beyond a single stranded difference deduction.

### P15-004 Scope Creep Remains Out Of Bounds

Do not rescue a candidate by adding safe-cell difference semantics, a new DSL rule, a schema change, a solver rewrite, or target-aware proof logic.

Gate:

- no new proof technique ids;
- no new schema/rule kind terms;
- domain remains free of schema/solver/proof/oracle/generator/authoring/Zod/UI/fs imports.

## Round 1 Decision

Treat these issues as hard gates for candidate search and promotion. If every reviewed candidate fails one of these gates, Phase 15 should stop without shipped content changes and document the remaining blocker.
