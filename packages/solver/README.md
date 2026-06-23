# @room-axioms/solver

Phase 4 provides the exact CSP backend for the current Puzzle Schema v1 rule
DSL. The solver is a product query layer, not a human-reasoning proof engine.

Supported in this phase:

- `globalCount` and `forEachCount` rules from `@room-axioms/domain`.
- Bitmask cell domains for the current cell-kind vocabulary.
- Trail/rollback mutations for isolated assumptions and search branches.
- Constraint propagation for global and local count bounds.
- Deterministic MRV search with stable row-major and allowed-kind ordering.
- Bounded satisfiability, model search, forced safe/guest cells, guest-layout
  uniqueness, and guest-layout counting.
- Honest caps through `maxNodes`, `maxModels`, `maxGuestLayouts`, `truncated`,
  and `greaterThan`.

Boundaries:

- Runtime code depends on `@room-axioms/domain` and may use
  `@room-axioms/schema` as the content-contract type boundary.
- `@room-axioms/oracle` is a dev/test correctness reference for tiny fixtures
  and schema-loaded regressions.
- `@room-axioms/domain` remains solver-free, schema-free, oracle-free,
  Zod-free, and UI-free.
- No React, Vite UI, DOM, Worker, Node file-system runtime, CLI, generator,
  editor, HumanReasoner, proof DAG, or hint engine is implemented here.

Public queries:

- `isSatisfiable(input, assumptions?, options?)`
- `findModel(input, assumptions?, options?)`
- `findForcedCells(input, options?)`
- `isGuestLayoutUnique(input, options?)`
- `countGuestLayouts(input, cap, options?)`

Guest-layout uniqueness compares only the guest bitset. Different assignments
among safe object kinds do not make a guest layout non-unique.

## Case-004 Budget

`content/cases/case-004.json` is loaded through `@room-axioms/schema` in tests.
The Phase 4 bounded regression verifies:

- authored target satisfies all rules through the oracle reference;
- initial observations are satisfiable within `maxNodes: 200000` and
  `maxModels: 200000`;
- initial forced safe cells are `A1`, `C1`, `B2`, `D2`, `A3`, `B3`, and `C3`;
- guest-layout snapshots shrink as `15`, `5`, `2`, then `1` after observing
  `C1`, `A3`, and `C3` from the target;
- layout caps return `greaterThan` instead of pretending to be complete.

These numbers are regression data for the current deterministic solver. Future
optimization can update the node and propagation metrics while preserving the
logical counts and boundary semantics.
