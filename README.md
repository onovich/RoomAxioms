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
- Validated and quarantined case files in `content/cases`
- Additive region, sightline/blocker, anchor-frontier, and internal contaminated-record verification mechanics
- Private Phase 12 experimental difference fixture in `content/experimental/phase-12`
- Private Phase 13 experimental difference candidates in `content/experimental/phase-13`
- Private Phase 14 difference-retention candidates and evidence in `content/experimental/phase-14` and `docs/phase-14`
- Private Phase 15 retained-difference candidates and promotion evidence in `content/experimental/phase-15` and `docs/phase-15`
- Data-driven 10-case selector with `case-004` as the default case
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

- Last completed check: Phase 28 - Nondegenerate Puzzle Rewrite Sprint, accepted with blocker
- Current executor result: Phase 28 complete with blocker; Phase 29 pending dispatch
- Final report: `docs/phase-28-nondegenerate-puzzle-rewrite-sprint-final-report.md`
- Active executor phase: none pending planner dispatch
- Guide: `docs/phase-28-nondegenerate-puzzle-rewrite-sprint-goal-mode-execution-guide.md`
- Next planned phase: Phase 29 - Proof Skeleton Authoring Workflow
- Result: Phase 23 added stricter degeneracy/difficulty gates, quarantined `case-019`, and produced `case-021` as a machine-valid high-tier candidate; Phase 24 user review later kept `case-021` but downgraded its player-facing difficulty to 3, reinforcing that deeper puzzles remain blocked under the current mechanics/content method.
- Latest hotfix: Pages deployment now serves `case-021` online after relaxing CI-only heavy verification timeouts and release performance ceiling without weakening correctness checks.
- Latest checkpoint: Phase 24 case-021 content repair is accepted at commit `24fa876`; the fixed five-cell region rule was removed, the ambiguous safe-area/bin wording was cleared, and a follow-up downgrade keeps `case-021` released as difficulty 3 rather than a 4+ candidate.
- Latest phase result: Phase 24 implemented `scopeOverlapCount`, `comparativeCount`, and `conditionalCount` end to end, but accepted a blocker because its experimental cases are grammar fixtures, not non-degenerate high-difficulty puzzles.
- Latest phase result: Phase 25 delivered a maintainer-only authoring editor and live diagnostics workbench with import/edit/export, solver/proof/degeneracy/clone/copy/difficulty diagnostics, bad-case fixtures, and real-case QA.
- Latest phase result: Phase 26 attempted 15 serious workbench-guided candidates and promoted none under strict gates; the blocker is proof/authoring support for derived facts, late closure, and Phase 24 grammar material, not runtime correctness.
- Latest phase result: Phase 27 hardened derived-fact and grammar-count proof bridges, improved proof-closure diagnostics, and turned C15 from a proof blocker into a degeneracy/content blocker; no player-facing cases changed.
- Latest phase result: Phase 28 attempted three C15 rewrites and two C10 late-closure rewrites; all were rejected under strict gates, confirming that the next method should start from human-readable proof skeletons before JSON editing.
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
