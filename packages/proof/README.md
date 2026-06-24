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
- `LOCAL_SCOPE_INTERSECTION`
- `LOCAL_SCOPE_DIFFERENCE`
- `KNOWN_SAFE_FROM_NON_GUEST_OBJECT`

## Phase 10 Local Scope Intersection Contract

`LOCAL_SCOPE_INTERSECTION` is the next planned production technique. Its first supported form explains safe cells from overlapping local `forEachCount` scopes:

- both scopes target `guest`;
- subject cells are known from observations or prior object deductions;
- one provider scope must place enough remaining guests into the shared unknown cells to consume the remaining guest capacity of the consumer scope;
- every consumer-only unknown cell is then safe.

The technique must not infer from reverse implications, hidden target values, or unsupported scope differences. The full Phase 10 semantics live in `docs/phase-10/local-scope-intersection-semantics.md`.

## Phase 12 Local Scope Difference Contract

`LOCAL_SCOPE_DIFFERENCE` explains guest cells from nested local `forEachCount` guest scopes:

- both scopes target `guest`;
- subject cells are known from observations or prior object deductions;
- the inner remaining unknown cells must be contained in the outer remaining unknown cells;
- the outer scope must require exactly enough extra guests beyond the inner scope capacity to fill every difference cell.

The first supported form emits guest deductions only. It does not emit safe deductions from equal-scope differences because the accepted Phase 10 intersection technique already covers the first production safe-cell overlap pattern. The full Phase 12 semantics live in `docs/phase-12/local-scope-difference-semantics.md`.

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
