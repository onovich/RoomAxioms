# Phase 26 Runtime And Selector QA

Status: Round 23 evidence.
Guide: `docs/phase-26-workbench-guided-puzzle-ladder-production-goal-mode-execution-guide.md`

## Purpose

Round 23 verifies the player-facing runtime and selector boundaries after the
Phase 26 authoring and promotion pass produced no promotable cases. This round
does not change shipped content, selector order, default case, runtime logic, or
workbench logic.

The goal is to prove that the current public ladder remains honest while Phase
26 moves toward final blocker reporting.

## Selector Boundary

Authoritative selector source: `apps/web/src/content/cases.ts`.

Expected selected case ids:

1. `case-004`
2. `case-011`
3. `case-013`
4. `case-015`
5. `case-012`
6. `case-014`
7. `case-017`
8. `case-018`
9. `case-020`
10. `case-021`

`DEFAULT_CASE_ID` remains `case-004`.

Round 23 boundary scans:

```powershell
rg "p26-c|phase-26" content\cases apps\web\src\content apps\web\src -n
```

Result: PASS. No matches. Phase 26 experimental candidates are not wired into
player-facing content or web runtime paths.

```powershell
rg "case-001|case-002|case-003|case-005|case-006|case-019" apps\web\src\content apps\web\src\view apps\web\src\workbench -n
```

Result: PASS with expected matches only in
`apps/web/src/content/caseVerification.test.ts`, where rejected historical case
ids are asserted not to appear in the selector. They are not imported by player
content, view, or workbench runtime code.

## Runtime And Secrecy Coverage

Round 23 focused test command:

```powershell
pnpm --filter @room-axioms/web test -- src/content/caseVerification.test.ts src/content/runtimeSmoke.test.ts src/runtime/analyzer.test.ts src/runtime/facade.test.ts src/logic/developerInspector.test.ts src/workbench/realCaseQa.test.ts
```

Result: PASS. 14 test files and 113 tests passed.

Coverage proved by the focused suite:

- `caseVerification.test.ts` verifies stable selector order, `case-004` default,
  no rejected early cases in `contentCases`, no `target-4` or `super-hard`
  summary tier, no internal phase labels in shipped metadata, and public
  correctness for every shipped case.
- `runtimeSmoke.test.ts` verifies every shipped case loads and analyzes in
  player and developer modes, player mode omits `noGuess`, developer mode can
  verify no-guess, warnings are empty, rule copy remains plain, and wrong or
  incomplete submissions do not reveal target guest cell ids.
- `runtime/analyzer.test.ts` verifies solver/proof-backed player hints, keeps
  no-guess summaries developer-only, confirms case-011 and case-012 technique
  evidence remains developer-gated, and reports truncation as incomplete rather
  than ready.
- `runtime/facade.test.ts` verifies request ids, stale response discard,
  cancellation, and structured runtime errors.
- `logic/developerInspector.test.ts` verifies developer inspector data is null
  when developer mode is off and only summarizes internals when developer mode
  is on.
- `workbench/realCaseQa.test.ts` verifies workbench diagnostics still load
  private rejected/experimental QA cases without adding them to player content,
  and records current shipped-case quality caveats.

## Local Smoke

Round 23 smoke commands:

```powershell
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StartDevServer.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Smoke.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StopDevServer.cmd
```

Result: PASS.

Evidence:

- dev server started on `http://127.0.0.1:5173/RoomAxioms/`;
- `Smoke.cmd` completed successfully and performed HTTP GET checks against the
  local RoomAxioms path;
- `StopDevServer.cmd` terminated the process tree rooted at the started dev
  server PID.

## QA Decision

No runtime or selector defect was found in Round 23.

The current public selector remains acceptable as a stable, caveated ladder:
Phase 26 did not improve it with new promoted cases, but it also has not leaked
experimental candidates, rejected historical cases, target data, forced-cell
analysis, or developer diagnostics into normal player mode.

Remaining Phase 26 work should continue with Round 24 QA and final blocker
preparation unless a concrete P0/P1 issue appears.

## Round 24 Follow-up

Round 24 experimental/rejected isolation QA is recorded in
`docs/phase-26/experimental-isolation-qa.md`.

It hardens the web content test so `p26-*` ids and historical `case-019` are
explicitly excluded from player-facing content, then verifies that Phase 26
candidate ids appear only in experimental files and Phase 26 evidence docs.
