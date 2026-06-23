# Phase 4 Solver Core And Queries Final Report

Status: READY_FOR_CHECK
Guide: `docs/phase-4-solver-core-goal-mode-execution-guide.md`
Phase: Phase 4 - Solver Core And Queries

## Summary

Phase 4 created `packages/solver` as `@room-axioms/solver`, an exact bounded
CSP query package for Puzzle Schema v1. The package implements bitmask domains,
compiled count constraints, trail/rollback propagation, deterministic MRV
search, assumption queries, forced safe/guest cells, guest-layout uniqueness,
and bounded guest-layout counting.

The current web app behavior was left unchanged.

## Files Changed By Category

- Package boundary: `packages/solver/package.json`, `tsconfig.json`,
  `tsconfig.build.json`, `src/index.ts`, `src/types.ts`.
- Solver internals: `src/bitset.ts`, `src/constraints.ts`,
  `src/propagation.ts`, `src/search.ts`, `src/queries.ts`.
- Tests: solver package boundary, bitsets, constraints, propagation,
  rollback, search, assumptions, forced cells, guest-layout queries, oracle
  cross-checks, and bounded `case-004` regression.
- Documentation: `packages/solver/README.md` and this report.

## Public API Created

- `isSatisfiable(input, assumptions?, options?)`
- `findModel(input, assumptions?, options?)`
- `findForcedCells(input, options?)`
- `isGuestLayoutUnique(input, options?)`
- `countGuestLayouts(input, cap, options?)`
- Public types: `SolveInput`, `SolverAssumption`, `SolverOptions`,
  `SolverStats`, `SolverModel`, `SolveResult`, `ForcedCellResult`,
  `UniqueLayoutResult`, and `GuestLayoutCountResult`.

## Solver Algorithm Summary

- Cell domains use fixed bitmasks for the current domain cell kinds.
- Rules compile from domain `RuleDefinition` values into global and local count
  constraints.
- Propagation enforces global lower/upper count bounds, local target count
  feasibility, subject activation, target exclusion, and contradiction
  detection.
- Mutations are recorded through a trail and restored by checkpoint rollback.
- Search uses deterministic MRV DFS with row-major cell ordering and stable
  allowed-kind ordering.
- `maxNodes`, `maxModels`, `maxGuestLayouts`, `truncated`, and `greaterThan`
  are used to avoid presenting budgeted results as complete proofs.

## Oracle Cross-Check Coverage

- Solver model existence and forced-cell conclusions are cross-checked against
  `@room-axioms/oracle` on tiny fixtures.
- Oracle remains a dev/test correctness reference only; no solver runtime file
  imports oracle.
- `case-004` target satisfaction is verified through the oracle reference
  without using unbounded brute-force enumeration.

## Forced-Cell And Uniqueness Coverage

- Forced safe cells are detected by proving `cellIs guest` unsatisfiable.
- Forced guests are detected by proving `cellIsNot guest` unsatisfiable.
- Truncated assumption queries do not produce forced conclusions.
- Guest-layout uniqueness compares only guest bitsets. Multiple safe-object
  assignments sharing the same guest cells still count as one guest layout.
- Guest-layout count caps return `greaterThan` when more layouts exist.

## Case-004 Regression

`content/cases/case-004.json` is loaded through `@room-axioms/schema`.

- Target satisfies all rules: PASS.
- Initial observations are satisfiable with `maxNodes: 200000` and
  `maxModels: 200000`: PASS.
- Initial forced safe cells: `A1`, `C1`, `B2`, `D2`, `A3`, `B3`, `C3`.
- Initial forced guests: none.
- Guest-layout shrink snapshot: `15 -> 5 -> 2 -> 1` after observing target
  values for `C1`, `A3`, and `C3`.
- Final mirror observation guest-layout uniqueness: `D1`, `B4`.
- Layout cap behavior on initial state: cap `3` returns `count: 3`,
  `greaterThan: 3`, and `truncated: false`.

## Tests Added

- Solver tests now cover 7 files and 39 tests.
- Whole workspace validation now reports:
  - `packages/domain`: 3 files, 12 tests.
  - `packages/schema`: 4 files, 24 tests.
  - `packages/oracle`: 5 files, 18 tests.
  - `packages/solver`: 7 files, 39 tests.
  - `apps/web`: 2 files, 2 tests.

## Validation

Final Round 10 validation:

- `pnpm lint`: PASS.
- `pnpm typecheck`: PASS.
- `pnpm test`: PASS.
- `pnpm build`: PASS.
- `git diff --check`: PASS.
- `git status --short --branch`: clean before final report.

The final report commit/push will rerun the wrapper validation before commit.

## Boundary Scans

- Domain runtime scan for schema/oracle/solver/Zod/UI/browser/Worker/fs
  dependencies: no disallowed runtime dependency found.
- Solver runtime scan for oracle/schema/UI/browser/Worker/fs dependencies:
  no disallowed runtime dependency found; only the package-name constant
  `@room-axioms/solver` was matched.
- Solver test scan found oracle/schema imports only in test files, as expected.
- No HumanReasoner, proof DAG, Worker integration, CLI, generator, editor,
  10-level content expansion, or UI redesign was implemented.

## Commits

- `b206f4a` phase4: establish solver package boundary
- `1c48eb0` phase4: add solver domain bitmasks and constraints
- `439ec30` phase4: add solver propagation and trail rollback
- `106fd77` phase4: add solver mrv search queries
- `ca862a6` phase4: add assumptions and forced cell queries
- `b006644` phase4: add guest layout queries
- `30bf226` phase4: add case004 solver regression
- `7cea4e7` phase4: document solver boundaries

## PASS Criteria

- `packages/solver` exists and builds as `@room-axioms/solver`: PASS.
- Solver package depends on domain/schema and uses oracle only in tests:
  PASS.
- Domain remains solver-free, oracle-free, schema-free, Zod-free, and UI-free:
  PASS.
- Solver runtime has no React, Vite UI, browser API, Worker, DOM, or Node fs
  dependency: PASS.
- Bitmask, propagation, rollback, search, assumptions, forced cells,
  guest-layout uniqueness, and guest-layout counting are tested: PASS.
- Solver matches oracle on small fixtures: PASS.
- `case-004` has schema-loaded bounded solver regression coverage: PASS.
- Guest-layout uniqueness compares only guest bitsets: PASS.
- Caps/truncation are represented honestly: PASS.
- Current web app lint/typecheck/test/build passes: PASS.
- Out-of-scope HumanReasoner/proof/Worker/CLI/generator/editor/UI work was
  avoided: PASS.
- Working tree was clean before final report: PASS.

## Phase 5 Notes

- The solver exposes exact facts only; Phase 5 should build HumanReasoner and
  proof DAG logic on top without reusing solver search output as player-facing
  explanation.
- The `case-004` shrink chain is now stable regression data for future proof
  and no-guess verifier work.
- Node/propagation metrics in `case004.test.ts` are implementation snapshots;
  future optimization may update metrics while preserving logical counts.
- No blockers for Phase 5 are known.
