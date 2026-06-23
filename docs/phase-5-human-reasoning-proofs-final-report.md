# Phase 5 Human Reasoning And Proofs Final Report

Status: READY_FOR_CHECK
Guide: `docs/phase-5-human-reasoning-proofs-goal-mode-execution-guide.md`
Phase: Phase 5 - Human Reasoning And Proofs

## Summary

Phase 5 created `@room-axioms/proof` as the human-reasoning and proof-verification package. It now exposes structured human deductions, proof DAG construction, stable proof text rendering, solver-backed deduction validation, explanation-gap detection, and a no-guess verifier.

The schema-loaded `case-004` regression passes the Phase 5 proof path: initial human deductions cover `A1`, `C1`, `B2`, `D2`, `A3`, `B3`, `C3`, and the verifier reaches the final unique guest layout `D1`, `B4` with `noGuess: true`.

## Files Changed By Category

- Package boundary: `packages/proof/package.json`, `tsconfig.json`, `tsconfig.build.json`, `README.md`.
- Public API barrel: `packages/proof/src/index.ts`.
- Proof model and graph: `types.ts`, `ids.ts`, `graph.ts`.
- Human reasoning: `reasoning.ts`, `reasoner.ts`.
- Solver-backed validation: `validation.ts`.
- No-guess verification: `verifier.ts`.
- Rendering: `renderer.ts`.
- Tests: proof package tests for boundary, graph, reasoning summaries, human techniques, validation, verifier, and renderer.

## Public API Created

- `deriveHumanDeductions(state)`
- `buildProofGraph(state, deductions)`
- `renderProofText(graph)`
- `verifyDeduction(state, deduction, options)`
- `findExplanationGaps(state, deductions, options)`
- `verifyNoGuess(puzzle, options)`

The package also exports proof ids, graph helpers, reasoning summaries, verifier report types, validation result types, and stable technique ids.

## Human Technique Coverage

Implemented and tested:

- `GLOBAL_COUNT_SATURATED`
- `GLOBAL_COUNT_ALL_REMAINING`
- `LOCAL_COUNT_SATURATED`
- `LOCAL_COUNT_ALL_REMAINING`
- `UNIQUE_TARGET_NEIGHBOR_INTERSECTION`
- `KNOWN_SAFE_FROM_NON_GUEST_OBJECT`

Reserved but intentionally not emitted in Phase 5:

- `LOCAL_SCOPE_INTERSECTION`
- `LOCAL_SCOPE_DIFFERENCE`

Those two ids remain available only after a generic DSL-v1 pattern is justified and tested.

## Proof DAG And Renderer

`buildProofGraph` creates stable fact, rule, and derived nodes. Derived premises can point to earlier derived nodes, which lets `KNOWN_SAFE_FROM_NON_GUEST_OBJECT` depend on concrete object deductions such as `B2 is bin`.

`renderProofText` emits deterministic lines in fact, rule, derived order. It is package-level output for snapshots and future UI adapters, not a complete copywriting system.

## Solver Validation Coverage

`verifyDeduction` uses only `@room-axioms/solver` public APIs:

- safe: validates that `cellIs guest` is unsatisfiable;
- guest: validates that `cellIsNot guest` is unsatisfiable;
- object: validates that every allowed non-object alternative is unsatisfiable.

`findExplanationGaps` compares valid human deductions against `findForcedCells` and reports `EXPLANATION_GAP` or `INVALID_DEDUCTION` when appropriate. Truncated solver checks produce `SOLVER_TRUNCATED` and are not accepted as proofs.

## No-Guess Verifier

`verifyNoGuess` starts from `initialReveals`, derives human deductions, validates every deduction, advances with proved guest confirmations and proved-safe target reveals, and stops on contradiction, invalid deduction, solver truncation, explanation gap, guess point, non-progress, target violation, or final guest-layout uniqueness.

HumanReasoner never reads `PuzzleDefinition.target`. The verifier reads target only for target consistency checks and to reveal safe cells after a safe deduction has already been solver-confirmed.

## Case-004 Explainable Chain

Tested through `packages/proof/src/reasoner.test.ts` and `packages/proof/src/verifier.test.ts`:

- `case-004` loads through `@room-axioms/schema`.
- Initial observations come from `initialReveals`.
- Initial human deductions cover exactly the solver-forced safe cells `A1`, `C1`, `B2`, `D2`, `A3`, `B3`, `C3`.
- `UNIQUE_TARGET_NEIGHBOR_INTERSECTION` derives `B2 is bin`.
- `KNOWN_SAFE_FROM_NON_GUEST_OBJECT` derives `B2 is safe`.
- The verifier finishes with `finalGuestCells: ['D1', 'B4']`, `guestLayoutUniqueAtEnd: true`, `noGuess: true`, and `humanExplainable: true`.

## Tests Added

After Phase 5, proof package validation reports:

- 7 proof test files.
- 28 proof tests.

Full workspace test matrix at final validation:

- domain: 3 files, 12 tests.
- schema: 4 files, 24 tests.
- oracle: 5 files, 18 tests.
- solver: 7 files, 39 tests.
- proof: 7 files, 28 tests.
- web: 2 files, 2 tests.

## Validation

Final validation before this report:

- `pnpm lint`: PASS.
- `pnpm typecheck`: PASS.
- `pnpm test`: PASS.
- `pnpm build`: PASS.
- `git diff --check`: PASS.
- `git status --short --branch`: clean on `main...origin/main` before report authoring.

The final report commit will rerun the same project wrapper validation before push.

## Boundary Scans

Commands and results:

- `rg '@room-axioms/(schema|solver|oracle|proof)|zod|react|from [''\"]vite[''\"]|node:fs|from [''\"]fs[''\"]|Worker|document\.|window\.' packages\domain\src`: no matches.
- `rg 'puzzle\.target|target\[' packages\proof\src\reasoner.ts packages\proof\src\reasoning.ts packages\proof\src\graph.ts packages\proof\src\validation.ts packages\proof\src\renderer.ts`: no matches.
- `rg '@room-axioms/solver/(src|dist)|\.\/search|\.\/constraints|\.\/propagation|\.\/bitset|react|from [''\"]vite[''\"]|document\.|window\.|Worker|node:fs|from [''\"]fs[''\"]' packages\proof\src`: no matches.
- `rg 'from [''\"]@room-axioms/solver[''\"]' packages\proof\src`: only public package imports in `types.ts`, `validation.ts`, `verifier.ts`, and proof tests.
- `rg 'target\[' packages\proof\src`: target reads only in `verifier.ts` and tests.
- `rg '@room-axioms/oracle|@room-axioms/schema' packages\proof\src`: schema appears only in proof tests; oracle has no proof source matches.

Boundary result: PASS.

## Commits

- `0bbdb28` phase5: establish proof package boundary
- `65da993` phase5: add proof graph primitives
- `f6ecbce` phase5: add proof reasoning summaries
- `37690a6` phase5: add global proof techniques
- `f6627e2` phase5: add local proof techniques
- `4b92a20` phase5: add intersection proof technique
- `1c0fa44` phase5: add solver-backed proof validation
- `689ef27` phase5: add no-guess verifier
- `14bf9c1` phase5: add proof rendering docs

This final report is committed after the listed implementation commits; the terminal commit hash is reported in the executor READY_FOR_CHECK message.

## PASS Criteria

- `packages/proof` exists and builds as `@room-axioms/proof`: PASS.
- Human deductions, proof DAG construction, proof rendering, deduction validation, and no-guess verification APIs are exposed: PASS.
- HumanReasoner v1 uses approved technique ids and structured premises: PASS.
- Explanations are human technique based, not solver-search summaries: PASS.
- Every emitted deduction can be solver-validated or rejected with structured issues: PASS.
- Explanation gaps are detected: PASS.
- `case-004` loads through schema and passes no-guess verification: PASS.
- Initial `case-004` human deductions cover `A1`, `C1`, `B2`, `D2`, `A3`, `B3`, `C3`: PASS.
- Final `case-004` guest layout is unique as `D1`, `B4`: PASS.
- Domain remains proof-free, solver-free, schema-free, Zod-free, UI-free, and fs-free: PASS.
- Proof runtime has no React, Vite UI, browser API, Worker, DOM, or Node fs dependency: PASS.
- Proof uses solver public APIs only: PASS.
- UI/Worker/CLI/generator/editor/10-level content scope avoided: PASS.
- Web app still passes lint/typecheck/test/build: PASS.
- Working tree clean after final push: pending final commit push.
- GitHub Pages workflow green after final push: pending final push check.

## Phase 6 Notes

Phase 6 can integrate proof through a runtime or Worker boundary by calling `verifyNoGuess` for full reports, or by composing `deriveHumanDeductions`, `buildProofGraph`, and `renderProofText` for hint/display flows. UI code should treat proof reports and graph nodes as data and must not duplicate solver semantics, validation logic, or target-reveal policy.
