# @room-axioms/proof

Phase 5 will provide the human-reasoning layer for Room Axioms.

This package owns:

- human-readable deduction templates;
- structured proof DAG data;
- deterministic proof rendering for tests and later UI use;
- solver-backed deduction validation through `@room-axioms/solver` public APIs;
- no-guess verification reports.

Boundaries:

- Runtime may depend on `@room-axioms/domain` and `@room-axioms/solver`.
- Tests may use `@room-axioms/schema` and `@room-axioms/oracle` as fixtures or
  references.
- The proof layer must not import solver internals, search traces, React, Vite,
  DOM, Worker APIs, Node file-system APIs, or UI code.
- HumanReasoner must not read `PuzzleDefinition.target`; only the verifier may
  read target values after a safe deduction is already proved.

This skeleton is intentionally narrow. Later Phase 5 rounds add the technique
library, DAG helpers, solver validation, case-004 no-guess regression, and
stable renderer.
