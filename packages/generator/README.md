# @room-axioms/generator

Status: Phase 9 internal spike package.

This package owns experimental generator contracts and prototypes. It is private, deterministic by seed, and not player-facing. Generated content is not part of the default web case selector unless the planner explicitly accepts a promotion in a later phase.

## Boundary

- May depend on `@room-axioms/domain`, `@room-axioms/schema`, `@room-axioms/solver`, and `@room-axioms/proof`.
- Must consume public solver/proof APIs rather than duplicating acceptance semantics.
- Must not be imported by `@room-axioms/domain`.
- Must not add generated or experimental cases to `content/cases` or `apps/web/src/content/cases.ts`.

## Contract

Inputs:

- deterministic seed policy;
- board size and allowed kinds within Puzzle Schema v1;
- guest count and current DSL v1 rules;
- initial reveal range;
- explicit attempt, model, node, and accepted-candidate caps;
- artifact policy.

Outputs:

- accepted candidates with validation-stage evidence;
- rejected candidates with structured failure codes;
- aggregate solver stats;
- optional reveal minimization and provisional difficulty reports.

## Validation Pipeline

Every accepted generated or minimized candidate must pass:

1. Puzzle Schema v1 parse and diagnostics.
2. Target satisfies all current DSL v1 rules.
3. Initial observations are satisfiable.
4. Final guest layout is unique.
5. Proof/no-guess verifier passes without explanation gaps.
6. Runtime/web loading path remains compatible before any promotion.

## Failure Modes

The spike records failures instead of hiding them:

- invalid schema;
- target violates rules;
- unsatisfiable initial observations;
- ambiguous final guest layout;
- proof guess point;
- proof explanation gap;
- solver truncation;
- search cap reached;
- no accepted candidate.

## Search Limits

Phase 9 prototypes should stay small: 3x3 or 4x4 boards, existing cell kinds, and current DSL v1 semantics only. Caps are part of the input contract and must be reflected in reports.

## Current Prototype

Round 2 adds deterministic target and initial-observation sampling:

- `createGeneratorSeed(seed)` records the deterministic seed policy.
- `sampleTargetAndObservationPools(input)` samples target layouts and initial reveal pools.
- Candidate previews are not publishable content; they are only inputs for later generate-verify-filter work.
- Target, initial-state, uniqueness-preview, proof, and cap failures are recorded as structured rejections.
