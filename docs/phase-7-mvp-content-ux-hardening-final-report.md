# Phase 7 MVP Content And UX Hardening Final Report

Status: READY_FOR_CHECK
Guide: `docs/phase-7-mvp-content-ux-hardening-goal-mode-execution-guide.md`
Phase: Phase 7 - MVP Content And UX Hardening
Date: 2026-06-23
Executor thread: 019ef271-256c-7be2-9663-e658e2378564
Planner/checker thread: 019ef0df-a626-7181-9ca6-1cc75c1f4c47

## Summary

Phase 7 produced the first 10 checked-in MVP cases, added data-driven web content loading and case selection, hardened keyboard/screen-reader and responsive behavior, revised rule copy for one-way local semantics, added runtime/browser smoke coverage, and added repeatable MVP performance baseline tests.

All 10 cases are schema-loadable from `content/cases`, listed through `apps/web/src/content/cases.ts`, and covered by schema, solver, proof/no-guess, final uniqueness, and web runtime verification tests.

## Files Changed By Category

- Content: `content/cases/case-001.json` through `case-010.json`; `case-004` metadata regularized to `validated`.
- Content loading: `apps/web/src/content/cases.ts`.
- Verification and smoke tests: `caseVerification.ts`, `caseVerification.test.ts`, `runtimeSmoke.test.ts`, `performanceBaseline.test.ts`.
- Web runtime and UX: `RoomAxiomsScreen.tsx`, `TopBar.tsx`, board keyboard navigation, board/cell accessibility metadata, runtime analyzer player/developer split.
- Copy and layout: `scopeText.ts`, `RulePanel.tsx`, `App.css`.
- Legacy fixture sync: `apps/web/src/data/case004.ts`.

## Case List And Content Index

`contentCases` enumerates all MVP cases in stable order and `DEFAULT_CASE_ID` remains `case-004`.

| Case | Board | Difficulty | Status | Initial reveals |
| --- | --- | ---: | --- | --- |
| case-001 - Room 01: Last Door | 3x3 | 1 | validated | A1, B1, C1, A2, C2, A3, B3, C3 |
| case-002 - Room 02: Clear Hallway | 3x3 | 1 | validated | A1, B1, C1, A2, B2, C2, A3, B3 |
| case-003 - Room 03: Mirror Note | 3x3 | 1 | validated | A1, B1, C1, A2, C2, A3, B3, C3 |
| case-004 - 客房 04：清扫记录 | 4x4 | 2 | validated | B1, A2, C2 |
| case-005 - Room 05: West Wing Sweep | 4x4 | 2 | validated | C1, B2, D2 |
| case-006 - Room 06: South Ledger | 4x4 | 2 | validated | A3, C3, B4 |
| case-007 - Room 07: Turned Register | 4x4 | 2 | validated | B3, D3, C4 |
| case-008 - Room 08: Two Keys | 3x3 | 1 | validated | A1, B1, C1, A2, C2, A3, B3 |
| case-009 - Room 09: Bottle Corner | 3x3 | 1 | validated | B1, C1, A2, B2, C2, A3, B3 |
| case-010 - Room 10: Mirror Pair | 3x3 | 1 | validated | A1, B1, C1, A2, C2, A3, B3 |

## Per-Case Validation Matrix

`apps/web/src/content/caseVerification.test.ts` verifies every listed case through the public schema, solver, proof, and runtime APIs.

| Gate | case-001..case-010 |
| --- | --- |
| Schema parse | PASS |
| Complete target board | PASS |
| Target satisfies rules | PASS |
| Initial state satisfiable | PASS |
| Final guest layout unique | PASS |
| Proof/no-guess | PASS |
| Human explainable | PASS |
| Runtime `VERIFY_CASE` ready | PASS |
| Runtime no-guess summary | PASS |
| No solver truncation | PASS |

## Proof And No-Guess Verification

- All 10 cases pass `verifyNoGuess` through the verification harness.
- All 10 cases reach final guest-layout uniqueness.
- `case-004` preserves the established chain: initial safe/object deductions cover `A1`, `C1`, `B2`, `D2`, `A3`, `B3`, `C3`, and final guests are `D1`, `B4`.
- Verification uses public `@room-axioms/schema`, `@room-axioms/solver`, and `@room-axioms/proof` APIs.

## Web Runtime Integration

- Web loading is data-driven through the content registry.
- The top bar selector lists all 10 cases and remounts/reset state by selected puzzle id.
- Player runtime mode keeps developer diagnostics out of ordinary analysis: forced cells, bin candidates, uniqueness detail, explanation gaps, and no-guess summaries are reserved for developer/`VERIFY_CASE`.
- Player hints remain proof-backed and use public observations/rules only.
- Wrong or incomplete guest submissions do not reveal target cells; the conclusion evaluator returns only `incomplete`, `incorrect`, or `correct`.

## Keyboard And Screen Reader

- Board grid uses dynamic row/column counts, `role="grid"`, row/column metadata, and stable `data-cell-id` selectors.
- Grid cells expose public-state accessible labels only: revealed object, unknown state, and player mark.
- Arrow-key focus navigation works on the board; final browser smoke confirmed `A1` + ArrowRight focuses `B1`.
- Tool shortcuts, Esc dialog close, rule focus, case selection, status and dialogs remain covered by web tests and DOM smoke.
- Developer target overlay remains gated by explicit developer mode and target toggle.

## Responsive Layout

Responsive smoke used the in-app browser viewport capability:

| Viewport | Result |
| --- | --- |
| 1280x800 | No horizontal overflow; top bar, board, tools, and submit control contained. |
| 768x1024 | No horizontal overflow; board and tools contained; mobile tabs visible. |
| 390x844 | No horizontal overflow; board and tools contained; mobile tabs visible. |

Additional tablet/mobile evidence-tab smoke confirmed the submit button becomes visible and horizontally contained after selecting the evidence tab.

## Rule Copy

- `ruleSemantics` now states local `forEachCount` rules as one-way constraints.
- Orthogonal/adjacent scope copy names the neighborhood type and notes that edge/corner cells naturally have fewer neighbors.
- Local rule copy explicitly says the target kind does not reverse-require the subject kind nearby.
- Runtime and conclusion copy was made case-agnostic instead of hard-coded to case-004 facts.

## E2E And Smoke

Automated/runtime smoke:

- `apps/web/src/content/runtimeSmoke.test.ts` loads and analyzes all 10 cases in player and developer modes.
- Player mode: ready, satisfiable, no warnings, no no-guess/dev summary.
- Developer `VERIFY_CASE`: no-guess true, human explainable true, final unique guest layout true.
- Wrong/incomplete conclusion helpers do not include target cells in returned data.

Browser smoke:

- `StartDevServer.cmd` launches Vite but its wrapper health check fails because the configured fixed text is not present in the Vite HTML.
- Manual HTTP smoke PASS:
  - `http://127.0.0.1:5173/RoomAxioms/` returned HTTP 200.
  - `http://127.0.0.1:5173/RoomAxioms/src/main.tsx` returned HTTP 200 JavaScript.
- `Smoke.cmd` dry-runs local/online launchers, then fails on the same fixed-text HTTP check.
- In-app browser smoke PASS:
  - default selected case: `case-004`;
  - selector options: 10;
  - default grid: 4 by 4, 16 grid cells;
  - player leak selectors `.dev-safe`, `.dev-guest`, `.target-spoiler`: 0;
  - one-way rule copy present;
  - switched to `case-001`, selected label `Case 01 - Last Door`;
  - `case-001` grid: 3 by 3, 9 grid cells;
  - keyboard focus after `A1` ArrowRight: `B1`;
  - console error count: 0.

Chromium/Firefox/WebKit Playwright coverage was not run because this repo currently has no Playwright dependency or browser binaries. The deterministic in-app browser and HTTP smoke paths were used instead.

## Performance Baseline

`apps/web/src/content/performanceBaseline.test.ts` adds repeatable baseline checks:

- 4x4 player runtime analysis for `case-004` stays under the current 200 ms P95 regression ceiling in the shared Vitest runner and does not truncate.
- 5x5 synthetic candidate-cap scenario returns `count: 20`, `greaterThan: 20`, no solver truncation, and stays under 200 ms P95.
- Full verification for all 10 shipped MVP cases stays under 2 s P95 in Node.

Note: after splitting player and developer runtime work, observed shared-runner 4x4 player runtime P95 was still about 102-145 ms during development, above the aspirational 100 ms product target. This is documented as a concrete Phase 8 performance target, while the committed regression ceiling prevents backsliding.

## Tests Added

Final workspace matrix:

- packages/domain: 3 files, 12 tests.
- packages/schema: 4 files, 24 tests.
- packages/oracle: 5 files, 18 tests.
- packages/solver: 7 files, 39 tests.
- packages/proof: 7 files, 28 tests.
- apps/web: 11 files, 47 tests.

New Phase 7 web coverage includes case verification, selector/default behavior, keyboard board navigation, rule-copy semantics, runtime smoke, conclusion secrecy, and performance baselines.

## Validation

Final validation before report authoring:

- `pnpm lint`: PASS.
- `pnpm typecheck`: PASS.
- `pnpm test`: PASS.
- `pnpm build`: PASS.
- `git diff --check`: PASS, with normal CRLF working-copy warnings only.
- Production build size: `dist/assets/index-DktR8WH9.js` 265.93 kB, gzip 80.92 kB; CSS gzip 4.43 kB.

The final report commit reruns the project validation wrapper before push.

## Boundary Scans

- `rg "@room-axioms/(schema|solver|proof|oracle)|zod|react|vite|fs|node:" packages/domain/src`
  - only `vitest` imports in domain tests; no schema/solver/proof/oracle/Zod/UI/fs imports.
- `rg "react|vite|.tsx|window|document|localStorage|@room-axioms/oracle" packages/solver/src packages/proof/src`
  - no React/Vite/browser/DOM/localStorage imports in solver/proof source.
  - oracle imports appear only in solver tests.
- `rg ".target|targetGuestCells|targetKindForDeveloperOverlay|observationForTargetCell|initialActionLogForTarget" apps/web/src`
  - target reads are limited to `targetAccess`, verification, tests, and explicit conclusion/developer overlay helpers.
- `rg "@room-axioms/solver" apps/web/src packages` and `rg "@room-axioms/proof" apps/web/src packages`
  - web imports solver/proof through runtime, verification, contracts, or test/perf paths; proof imports solver public APIs only.

Boundary result: PASS.

## Commits

- `e3b5c3e` docs: record Phase 7 dispatch
- `e145e57` test: add case verification harness
- `9170000` content: add MVP cases 001-003
- `a694b4a` content: add MVP cases 005-007
- `07cf409` content: add MVP cases 008-010 and registry
- `d0e1965` feat: add data-driven case selection
- `58da466` feat: harden board keyboard navigation
- `29e0b51` feat: clarify rule text and responsive layout
- `2042e95` test: add runtime smoke coverage
- `7244028` test: add MVP performance baseline

The final report/content-status commit is reported in the executor READY_FOR_CHECK message after push.

## PASS Criteria

- Ten MVP cases exist and are loadable from the app: PASS.
- Every case parses through schema and has a complete valid target board: PASS.
- Every target satisfies all rules: PASS.
- Every initial state is satisfiable: PASS.
- Every case has a unique final guest layout: PASS.
- Every case passes proof/no-guess verification: PASS.
- Web runtime analyzes every case without hard-coded app branches: PASS.
- Case selection is data-driven and static-bundle compatible: PASS.
- Keyboard-only main flow is covered and usable: PASS.
- Screen-reader/accessibility labels do not expose target/forced/candidate/developer data in player mode: PASS.
- Responsive layouts at 1280x800, 768x1024, and 390x844 keep core controls contained and essential actions reachable: PASS.
- Rule/status copy clarifies one-way implications and neighborhood semantics: PASS.
- Deterministic browser/HTTP smoke covers main flows; missing Playwright engines are documented: PASS.
- Performance baselines are recorded; 100 ms runtime target remains a Phase 8 optimization note: PASS with finding.
- Domain remains schema/solver/proof/oracle/Zod/UI/fs-free: PASS.
- Solver/proof packages remain independent of React/Vite/browser UI code: PASS.
- Target reads remain limited to targetAccess, verification, and tests: PASS.
- Player marks are not sent as solver/proof facts: PASS.
- Generator/editor/new DSL/backend/broad redesign scope avoided: PASS.
- Working tree clean after final push: pending final report commit.
- GitHub Pages workflow green after final push: pending final push check.

## Blockers

- No implementation blockers.
- `StartDevServer.cmd` and `Smoke.cmd` still have a fixed-text HTTP health check mismatch with current Vite HTML; manual HTTP smoke passes.
- Multi-engine Playwright smoke remains deferred because Playwright is not configured in the repo and local browser binaries are absent.

## Phase 8 Notes

- Add repo-supported Playwright setup if Phase 8 requires Chromium/Firefox/WebKit gates.
- Decide whether to update the project smoke expected text to match the shipped Vite HTML.
- Profile the player runtime path toward the 100 ms P95 product target.
- Continue Pages/deployment QA, playtest observations, and release-blocker triage on top of this MVP content baseline.
