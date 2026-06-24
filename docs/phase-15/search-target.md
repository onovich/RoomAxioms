# Phase 15 Search Target

Status: Round 1 baseline

## Target Shape

Phase 15 is searching for a small Puzzle Schema v1 case where a retained `LOCAL_SCOPE_DIFFERENCE` guest deduction unlocks later proof progress under existing human templates.

A candidate qualifies only when:

- initial observations are satisfiable;
- initial guest-layout count is bounded, untruncated, and greater than `1`;
- proof has at least one wave;
- `LOCAL_SCOPE_DIFFERENCE` appears in the accepted proof;
- minimization with `--require-technique LOCAL_SCOPE_DIFFERENCE` reports retention pass;
- final guest layout is unique after proof progress;
- no explanation gap, guess point, solver truncation, new DSL term, or new proof technique is needed.

## Later Proof Progress

For Phase 15, "retained difference unlocks later proof progress" means at least one of these is true after the difference guest deduction:

- the difference guest saturates an existing local or global guest count and produces safe cells through `LOCAL_COUNT_SATURATED` or `GLOBAL_COUNT_SATURATED`;
- the difference guest satisfies an all-remaining count and allows another accepted object or guest deduction;
- the difference guest reduces a neighboring scope so `LOCAL_SCOPE_INTERSECTION` or another existing template can fire;
- the proof reaches final guest-layout uniqueness only after applying the retained difference deduction.

Non-qualifying shapes:

- proof wave count is `0`;
- initial guest-layout count is `1`;
- `LOCAL_SCOPE_DIFFERENCE` appears before minimization but disappears after minimization;
- `LOCAL_SCOPE_DIFFERENCE` remains but the proof still has explanation gaps or ambiguous final guests;
- promotion would require safe-cell difference semantics or a new rule kind.

## Preferred Candidate Size

Start with 3x3 and 4x3 boards before trying larger shapes. Use the existing object set unless a small fixture needs one more safe kind:

```text
empty, bottle, mirror, guest
```

The first repair target is the Phase 14 candidate 001 shape because it already has:

- initial guest-layout count `2`;
- retained `LOCAL_SCOPE_DIFFERENCE`;
- no truncation.

If repairing it collapses into zero-wave uniqueness, move to a new experimental shape rather than weakening the gate.
