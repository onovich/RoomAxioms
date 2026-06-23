# Phase 1 Domain Core Final Report

Status: READY_FOR_CHECK
Date: 2026-06-23T16:12:16.1977202+08:00
Guide: `docs/phase-1-domain-core-goal-mode-execution-guide.md`
Phase: Phase 1 - Domain Core Package

## Summary

Phase 1 created the internal workspace package `@room-axioms/domain` and moved the pure domain surface out of the web app:

- Coordinates, board traversal, cell id parsing/formatting, neighbors, and stable sorting now live in `packages/domain`.
- DSL v1 rule and puzzle types now live in `packages/domain`.
- Game event, state, and pure reducer API now live in `packages/domain`.
- `apps/web` imports the domain public API from `@room-axioms/domain`.
- UI labels, React state, hint text, and UI-only tool modes remain in `apps/web`.

## Files Changed By Category

- Workspace/package boundary: `package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`, `packages/domain/package.json`, `packages/domain/tsconfig.json`, `packages/domain/tsconfig.build.json`.
- Domain public API: `packages/domain/src/index.ts`, `packages/domain/src/types.ts`, `packages/domain/src/coordinates.ts`, `packages/domain/src/events.ts`.
- Domain tests: `packages/domain/src/coordinates.test.ts`, `packages/domain/src/rules.test.ts`, `packages/domain/src/events.test.ts`.
- Web migration: `apps/web/package.json`, `apps/web/src/data/case004.ts`, `apps/web/src/hooks/useRoomAxiomsGame.ts`, `apps/web/src/logic/*`, `apps/web/src/view/components/*`, `apps/web/src/view/types.ts`.
- Removed app-local duplicates: `apps/web/src/domain/coordinates.ts`, `apps/web/src/domain/coordinates.test.ts`, `apps/web/src/domain/types.ts`.
- Documentation: `README.md`, `apps/web/README.md`, this report.

## Public API Created

- Types: `CellKind`, `CellId`, `Coord`, `BoardSize`, `ScopeKind`, `Comparator`, `RuleDefinition`, `PuzzleDefinition`, `Observation`, `ObservationEntry`, `PlayerMark`, `GameEvent`, `GameState`, `GameStatus`.
- Coordinate helpers: `columnsForWidth`, `parseCellId`, `formatCellId`, `allCells`, `neighbors`, `sortCellIds`, `isInside`.
- Reducer helpers: `createInitialGameState`, `reduceGameState`.
- Exhaustiveness helper: `assertNever`.

## Tests Added

- Coordinate and neighborhood tests for row-major ordering, multi-letter columns, invalid coordinates, corners, edges, and interior cells.
- Rule DSL v1 shape tests for `globalCount` and `forEachCount` with an exhaustiveness switch.
- Game reducer tests for start, inspect, marks, hints, failed/completed status, submitted conclusions, and reset.

## Validation

- `pnpm lint`: PASS
- `pnpm typecheck`: PASS
- `pnpm test`: PASS
  - `packages/domain`: 3 files, 12 tests
  - `apps/web`: 1 file, 1 test
- `pnpm build`: PASS
- Domain runtime boundary scan for React/Vite/Zod/browser/Node fs APIs: PASS
- App-local domain import scan for old `apps/web/src/domain` paths: PASS
- GitHub Pages workflow: PASS
  - Latest run: `28011980281`, `Deploy Pages`, `completed/success`
- Manual local HTTP smoke:
  - `http://127.0.0.1:5175/RoomAxioms/`: PASS
  - `http://127.0.0.1:5175/RoomAxioms/src/main.tsx`: PASS
  - Note: project `Smoke.cmd` fixed health URL `5173` failed because that port was occupied by an unrelated existing process; fallback local server on `5175` served the app successfully.

## Commits

- `3f007fc` - `phase1: establish domain package boundary`
- `b8b8df3` - `phase1: lift coordinates into domain package`
- `88647c6` - `phase1: lift domain rule types`
- `eabe745` - `phase1: add domain game events reducer`
- `e88bd9e` - `docs: describe domain package boundary`

## PASS Criteria

- `packages/domain` exists and builds as `@room-axioms/domain`: PASS
- Domain package has no React, Vite, browser API, Zod, solver, or Node fs runtime dependency: PASS
- `apps/web` imports domain public API instead of duplicating equivalent domain code: PASS
- Orthogonal and adjacent scope semantics are covered by tests: PASS
- Invalid coordinate tests exist: PASS
- Rule DSL v1 type definitions exist and use an exhaustiveness helper: PASS
- Game event/reducer API exists with tests for current basic session events: PASS
- Current web app passes lint/typecheck/test/build: PASS
- GitHub Pages workflow is green after final pushed implementation commit: PASS
- Working tree clean: to be confirmed after this report commit is pushed.

## Phase 2 Notes

- No Schema/Zod, Oracle, CSP solver, human reasoner, Worker, new levels, editor, or UI redesign was implemented in Phase 1.
- Phase 2 can add Schema v1 on top of the exported `PuzzleDefinition` and `RuleDefinition` types without needing React/UI dependencies.
- `caseName` remains an optional compatibility display field on `PuzzleDefinition` for the current prototype data.
