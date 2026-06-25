# Room Axioms / 房间公理

Room Axioms is a browser-first deduction game prototype: all mechanical rules are public before play, every room cell is fixed before the first investigation, and each click only reveals an objective fact.

《房间公理》是一个浏览器优先的格状推理游戏原型：全部机械规则在开局前公开，房间中的每个格子在开局前已经固定，调查只揭示客观物件。

## Current Build

- React + TypeScript + Vite app in `apps/web`
- Pure TypeScript domain core in `packages/domain` as `@room-axioms/domain`
- Zod-backed puzzle schema and diagnostics in `packages/schema` as `@room-axioms/schema`
- Small-fixture brute-force oracle in `packages/oracle` as `@room-axioms/oracle`
- Exact CSP solver queries in `packages/solver` as `@room-axioms/solver`
- Human reasoning and proof verification in `packages/proof` as `@room-axioms/proof`
- Internal generator spike prototypes in `packages/generator` as private `@room-axioms/generator`
- Private authoring CLI in `packages/authoring` as `@room-axioms/authoring`
- Eight validated shipped cases in `content/cases`
- Private Phase 12 experimental difference fixture in `content/experimental/phase-12`
- Private Phase 13 experimental difference candidates in `content/experimental/phase-13`
- Private Phase 14 difference-retention candidates and evidence in `content/experimental/phase-14` and `docs/phase-14`
- Private Phase 15 retained-difference candidates and promotion evidence in `content/experimental/phase-15` and `docs/phase-15`
- Data-driven 8-case difficulty ladder with `case-004` as the default case
- Rule panel, board interactions, evidence log, hints, developer verification layer, mobile tabs
- GitHub Pages workflow for `http://blog.onovich.com/RoomAxioms/`
- Original design handoff preserved under `docs/room-axioms-handoff`

## Package Boundaries

- `@room-axioms/domain` owns framework-free coordinates, board traversal, DSL v1 rule and puzzle types, game events, and the pure reducer.
- `@room-axioms/schema` owns Puzzle Schema v1 parsing, static semantic diagnostics, and JSON content validation; it may depend on `@room-axioms/domain`.
- `@room-axioms/oracle` owns small-scale brute-force verification fixtures and stays out of product runtime.
- `@room-axioms/solver` owns exact CSP queries, forced-cell analysis, guest-layout uniqueness, and bounded guest-layout counting.
- `@room-axioms/proof` owns human deductions, proof graphs, proof rendering, and no-guess verification.
- `@room-axioms/generator` owns internal, report-only generation, reveal minimization, and provisional difficulty spike code; it is not imported by the player-facing web app.
- `@room-axioms/authoring` owns private offline validation, report, score, minimize, and sample workflows for maintainers; it is not imported by the player-facing web app.
- `apps/web` imports the domain public API and keeps React state, presentation text, labels, and UI-only tool modes in the app layer.
- The domain package does not depend on React, Vite, browser APIs, Zod, oracle/solver/proof packages, or Node filesystem APIs.

## Current Project Status

- Last accepted phase: Phase 20 - Anti-Clone Puzzle Quality And Ladder Repair
- Final report: `docs/phase-20-anti-clone-puzzle-quality-and-ladder-repair-final-report.md`
- Status: Phase 21 ready for executor dispatch
- Active executor phase: Phase 21 - Distinct Puzzle Ladder Production
- Guide: `docs/phase-21-distinct-puzzle-ladder-production-goal-mode-execution-guide.md`
- Budget: 16 executor rounds
- Goal: expand beyond the smaller honest selector only with cases designed from distinct proof skeletons and accepted by the anti-clone gates; do not pad the selector with clones.
- Development plan: `docs/development-plan.md`

## Commands

```powershell
pnpm install
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

For manual testing on Windows, double-click `StartLocalTest.cmd`. To open the hosted build, use `OpenOnlineTest.cmd`.

## Product Contract

- Rules are fixed axioms, not hidden events.
- Observations only add facts; they do not rewrite earlier deductions.
- Player marks are notes, not solver facts.
- The final guest layout must be unique; complete safe-object layout does not have to be unique.
- Candidate, forced-cell, and target overlays are developer information unless surfaced through a hint.

The full handoff, architecture notes, DSL specification, prototype screenshots, and backlog live in `docs/room-axioms-handoff`.
