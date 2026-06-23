# @room-axioms/proof

Human-reasoning and proof verification layer for Room Axioms.

This package owns:

- human-readable deduction templates;
- structured proof DAG data;
- deterministic proof rendering for tests and later UI use;
- solver-backed deduction validation through `@room-axioms/solver` public APIs;
- no-guess verification reports.

## Public API

- `deriveHumanDeductions(state)`: emits deterministic human deductions from current observations.
- `buildProofGraph(state, deductions)`: builds fact, rule, and derived proof nodes with stable ids.
- `renderProofText(graph)`: renders stable text lines from a proof graph for snapshots and future UI adapters.
- `verifyDeduction(state, deduction, options)`: validates one deduction with public solver queries.
- `findExplanationGaps(state, deductions, options)`: compares valid human deductions with solver-forced safe/guest cells.
- `verifyNoGuess(puzzle, options)`: simulates proof waves from `initialReveals` through final guest-layout uniqueness.

## Technique Coverage

HumanReasoner v1 currently emits these approved technique ids:

- `GLOBAL_COUNT_SATURATED`
- `GLOBAL_COUNT_ALL_REMAINING`
- `LOCAL_COUNT_SATURATED`
- `LOCAL_COUNT_ALL_REMAINING`
- `UNIQUE_TARGET_NEIGHBOR_INTERSECTION`
- `KNOWN_SAFE_FROM_NON_GUEST_OBJECT`

`LOCAL_SCOPE_INTERSECTION` and `LOCAL_SCOPE_DIFFERENCE` remain reserved ids. They are not emitted until a generic DSL-v1 pattern is justified and tested.

## Verifier Semantics

`verifyDeduction` checks conclusions by contradiction:

- safe: `cellIs guest` must be unsatisfiable;
- guest: `cellIsNot guest` must be unsatisfiable;
- object: every allowed non-object alternative must be unsatisfiable.

`verifyNoGuess` starts from `initialReveals`, derives human deductions, validates each deduction, and advances only with proved facts. Guest deductions become observations directly. Safe deductions reveal the target value only after the cell is proved safe. The verifier stops on contradiction, invalid deduction, solver truncation, explanation gap, guess point, non-progress loop, target violation, or final guest-layout uniqueness.

## Boundaries

- Runtime depends only on `@room-axioms/domain` and `@room-axioms/solver`.
- Tests may use `@room-axioms/schema` as a fixture loader.
- The proof layer does not import solver internals, search traces, React, Vite, DOM, Worker APIs, Node file-system APIs, or UI code.
- HumanReasoner does not read `PuzzleDefinition.target`.
- Only the verifier reads target values, and only to simulate post-proof safe reveals or target consistency checks.

## Case-004 Regression

The schema-loaded `content/cases/case-004.json` regression proves the initial safe set `A1`, `C1`, `B2`, `D2`, `A3`, `B3`, `C3` and reaches the final unique guest layout `D1`, `B4` with `noGuess: true`.

## Phase 6 Handoff

Phase 6 can call `verifyNoGuess` or compose `deriveHumanDeductions` + `buildProofGraph` + `renderProofText` behind a Worker/runtime boundary. UI integration should treat report and graph values as data; it should not duplicate proof validation, solver semantics, or target-reveal policy.
