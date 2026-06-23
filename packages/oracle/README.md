# @room-axioms/oracle

Phase 3 provides a small-scale brute-force oracle for regression tests and
cross-checking future solver work. It is deliberately a verification harness,
not the product solver.

Supported in this phase:

- Evaluate `globalCount` and `forEachCount` rules against a complete model.
- Check whether a puzzle target satisfies all rules.
- Enumerate tiny model spaces in stable `allCells(board)` and `allowedKinds`
  order.
- Apply observation facts as fixed `cellId -> kind` constraints.
- Stop bounded searches with `maxModels` and `maxNodes`, returning `truncated`.

Boundaries:

- The oracle may depend on `@room-axioms/domain` and `@room-axioms/schema`.
- `@room-axioms/domain` stays schema-free, oracle-free, Zod-free, and UI-free.
- No CSP solver, forced-cell query, uniqueness product API, human reasoner,
  proof DAG, Worker, generator, editor, or UI redesign is implemented here.
- Large content should not be fully enumerated with this package.

`content/cases/case-004.json` is a 4x4 puzzle with five cell kinds, which has
`5^16` raw assignments before constraints. In Phase 3 it is used only as a
schema-loaded regression that verifies the authored target satisfies the rules.
Phase 4's CSP solver should align with this oracle on tiny fixtures before it
takes over bounded queries for larger puzzles such as case-004.
