# Phase 14 Difference Failure Taxonomy

Status: Round 1 baseline

## Taxonomy

### Retention Failure

A puzzle has a valid no-guess proof and the initial proof uses `LOCAL_SCOPE_DIFFERENCE`, but the minimized no-guess reveal set no longer uses that technique.

Example:

- Phase 13 candidate 001.

Expected Phase 14 response:

- Treat as rejected for promotion.
- Record before-minimize techniques, after-minimize techniques, and which required techniques were lost.
- Do not keep redundant reveals only to preserve a named technique.

### Proof Completion Failure

A puzzle emits `LOCAL_SCOPE_DIFFERENCE` somewhere in the proof, but the proof does not finish as no-guess, human-explainable, and final-unique.

Example:

- Phase 13 candidate 002.

Expected Phase 14 response:

- Treat as a repair or rejection candidate.
- Do not promote even if difference is present.
- Use issue codes and final uniqueness status to direct repair.

### Sampling Shape Failure

The sampling template spends most attempts on targets that fail public rules before proof filtering can evaluate technique retention.

Example:

- Phase 13 seed `1301`.

Expected Phase 14 response:

- Prefer constrained hand-authored templates and report-only sampling around known nested scopes.
- Keep generated artifacts private until a specific candidate is reviewed.

### Scope Creep Failure

A candidate can only be rescued by adding new proof techniques, safe-cell difference semantics, new DSL rules, schema changes, or solver rewrites.

Expected Phase 14 response:

- Stop or defer.
- Preserve the current accepted semantics instead of widening this phase.

## Promotion Implication

Presence of `LOCAL_SCOPE_DIFFERENCE` is necessary but not sufficient. A Phase 14 promotion candidate must:

- pass schema, target, satisfiability, no-guess, and final uniqueness gates;
- remain untruncated under existing caps;
- keep `LOCAL_SCOPE_DIFFERENCE` in the accepted or minimized proof;
- avoid relying on redundant reveals to make the technique appear.

