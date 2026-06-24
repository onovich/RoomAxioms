# Phase 16 Case 012 Release QA And Playtest Calibration Final Report

Status: READY_FOR_CHECK
Guide: `docs/phase-16-case-012-release-qa-playtest-calibration-goal-mode-execution-guide.md`
Phase: Phase 16 - Case 012 Release QA And Playtest Calibration
Planner thread: `019ef0df-a626-7181-9ca6-1cc75c1f4c47`
Executor thread: `019ef271-256c-7be2-9663-e658e2378564`

## Summary

Phase 16 completed the release QA pass for shipped `case-012`. The case remains in `content/cases`, `case-004` remains the default case, and no new cases, DSL semantics, proof techniques, editor, backend, analytics, or broad UI redesign were added.

One narrow player-copy fix was made: `case-012` changed from `走廊差集` to `走廊缺口` so the public title avoids internal proof terminology. Mechanics, target, rules, initial observations, and proof requirements were unchanged.

No real participant playtest feedback was recorded during this phase. Difficulty remains explicitly uncalibrated; the internal authoring score is evidence for review triage only.

## Files Changed By Category

- Release QA docs: `docs/phase-16/issue-register.md`, `docs/phase-16/case-012-qa-checklist.md`, `docs/phase-16/authoring-baseline.md`.
- Copy review: `content/cases/case-012.json`, `apps/web/src/content/caseVerification.test.ts`, `docs/phase-16/copy-review.md`.
- Runtime and secrecy tests: `apps/web/src/runtime/analyzer.test.ts`, `apps/web/src/logic/hints.test.ts`, `apps/web/src/content/runtimeSmoke.test.ts`, `docs/phase-16/runtime-hint-secrecy-qa.md`.
- Smoke evidence: `docs/phase-16/responsive-keyboard-smoke.md`.
- Playtest prep: `docs/phase-16/playtest-protocol.md`, `docs/phase-16/playtest-feedback-log.md`.
- Final status docs: `README.md`, `docs/development-plan.md`, this final report.

## Case 012 QA Checklist

`docs/phase-16/case-012-qa-checklist.md` records the Phase 16 checklist. Covered items include shipped-content presence, default case preservation, selector/runtime loading, schema/proof/authoring gates, public hint behavior, wrong/incomplete submission secrecy, desktop/mobile responsive smoke, keyboard smoke, Pages availability, and playtest honesty.

No P0/P1 release blockers remain. The only P2 copy readability issue found in this phase was resolved by the title/case-name change.

## Authoring Evidence

Authoring commands passed for `content/cases/case-012.json`:

- `pnpm authoring -- report content/cases/case-012.json`: PASS.
- `pnpm authoring -- score content/cases/case-012.json`: PASS, score `12.15`, band `3`, `calibratedWithRealPlaytest: false`.
- `pnpm authoring -- minimize content/cases/case-012.json --require-technique LOCAL_SCOPE_DIFFERENCE`: PASS, `TECHNIQUE_RETENTION_PASS`.

Key retained evidence:

- Schema issues: `0`.
- Target satisfies rules: `true`.
- Initial satisfiable: `true`.
- Initial guest layouts: `2`.
- No-guess proof: `true`.
- Human explainable: `true`.
- Final guest layout unique: `true`.
- Final guests: `B3`, `C3`.
- Techniques retained: `LOCAL_COUNT_SATURATED`, `LOCAL_SCOPE_DIFFERENCE`.
- Minimized reveal set unchanged: `A1`, `B1`, `C1`, `B2`, `D2`.

## Copy Review

Copy review is recorded in `docs/phase-16/copy-review.md`. The only content change was:

- `title`: `客房 12：走廊差集` -> `客房 12：走廊缺口`
- `caseName`: `案卷 12 · 走廊差集` -> `案卷 12 · 走廊缺口`

The change is Chinese, player-facing, and mechanically neutral. Rule titles and rule text stayed unchanged: `酒瓶十字线`, `镜面静区`, `空房静线`, and `住客总数`.

## Runtime Hint And Secrecy QA

Runtime QA is recorded in `docs/phase-16/runtime-hint-secrecy-qa.md`.

Focused tests confirm:

- Player hint request for the initial `case-012` observations returns the first public safe hint for `D1`.
- Player mode does not expose forced cells, candidate guest layouts, unique-guest internals, no-guess verifier details, or target data.
- Developer-only verification reports no-guess, human-explainable, final-unique evidence and includes the retained `LOCAL_SCOPE_DIFFERENCE` technique.
- Wrong and incomplete submissions keep answer information hidden across shipped cases.

Focused web tests passed:

```text
cmd /c pnpm.cmd --filter @room-axioms/web test -- src/runtime/analyzer.test.ts src/logic/hints.test.ts src/content/runtimeSmoke.test.ts src/content/caseVerification.test.ts
PASS: 11 files, 72 tests
```

## Responsive Keyboard And Smoke Evidence

Smoke evidence is recorded in `docs/phase-16/responsive-keyboard-smoke.md`.

Local wrapper smoke passed:

```text
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StartDevServer.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Smoke.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StopDevServer.cmd
PASS
```

Manual Playwright smoke used system Chrome because bundled Playwright browsers were not installed. Desktop `1366x768` and mobile `390x844` checks passed for selector, `case-004` default preservation, `case-012` load, visible title/copy/rules, 12 cell buttons, keyboard focus reaching the hint control, mobile tab visibility, and zero console errors.

Online HTTP checks passed:

- `http://blog.onovich.com/RoomAxioms/`: HTTP `200`.
- `https://onovich.github.io/RoomAxioms/`: HTTP `200`.

## Playtest Protocol And Feedback Log

Playtest prep is recorded in:

- `docs/phase-16/playtest-protocol.md`
- `docs/phase-16/playtest-feedback-log.md`

The feedback log is intentionally empty. No real Phase 16 participant feedback exists yet, so no public difficulty calibration claim was made. `case-012` remains uncalibrated beyond internal authoring metrics.

## Validation

Final validation commands passed before this report:

```text
cmd /c pnpm.cmd authoring -- report content/cases/case-012.json
cmd /c pnpm.cmd authoring -- score content/cases/case-012.json
cmd /c pnpm.cmd authoring -- minimize content/cases/case-012.json --require-technique LOCAL_SCOPE_DIFFERENCE
cmd /c pnpm.cmd --filter @room-axioms/web test -- src/runtime/analyzer.test.ts src/logic/hints.test.ts src/content/runtimeSmoke.test.ts src/content/caseVerification.test.ts
cmd /c pnpm.cmd --filter @room-axioms/proof test
cmd /c pnpm.cmd --filter @room-axioms/authoring test
git diff --check
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Validate.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StartDevServer.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Smoke.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StopDevServer.cmd
```

`Validate.cmd` result:

- lint: PASS.
- typecheck: PASS.
- test: PASS.
- build: PASS.
- `git diff --check`: PASS.

Package test counts in the final full validation:

- domain: 3 files, 12 tests.
- schema: 4 files, 24 tests.
- oracle: 5 files, 18 tests.
- solver: 7 files, 39 tests.
- proof: 9 files, 46 tests.
- generator: 8 files, 15 tests.
- web: 11 files, 72 tests.
- authoring: 1 file, 13 tests.

## Boundary Scans

Boundary scans passed:

- No `@room-axioms/authoring` or `@room-axioms/generator` imports in `apps/web/src` or `content/cases`.
- No `phase-15`, `phase-16`, or experimental content path references in non-test player code or shipped cases.
- `packages/domain` remains free of Zod, React, fs, schema, solver, proof, oracle, generator, and authoring dependencies.
- Solver, proof, generator, and authoring source remain free of React, Vite, browser DOM, localStorage, HTMLElement, and Worker dependencies outside tests.
- No forbidden new DSL terms such as `lineCount`, `manhattan`, `visibility`, or `blocker` were introduced.
- Target reads remain limited to existing `targetAccess`, verification, tests, conclusion checking, and explicit developer-only surfaces.

## Commits

- `3d22f3e` `docs: add Phase 16 QA baseline`
- `fb5345f` `copy: revise case 012 title`
- `527dc3d` `test: add case 012 runtime secrecy coverage`
- `2b74c06` `docs: record case 012 smoke evidence`
- `d0c1aa4` `docs: prepare case 012 playtest protocol`

The final report/status commit and executor route update commit are reported in the planner handoff.

## PASS Criteria

- Final report exists: PASS.
- Full validation passes: PASS.
- Case-012 report/score/minimize retain `LOCAL_SCOPE_DIFFERENCE`: PASS.
- `case-012` remains shipped and `case-004` remains default: PASS.
- Existing shipped cases including `case-011` remain valid: PASS.
- Player copy review complete and copy change mechanically neutral: PASS.
- Runtime/hint/player-secrecy QA complete: PASS.
- Local smoke and online HTTP smoke pass: PASS.
- Playtest protocol/log honest and empty of fabricated feedback: PASS.
- Difficulty remains uncalibrated without real playtest evidence: PASS.
- Package boundaries remain clean: PASS.
- Authoring/generator internals stay out of player web code and shipped content: PASS.
- Experimental content stays private except deliberate shipped `case-012`: PASS.
- Target access remains narrow and developer-gated where appropriate: PASS.
- No public editor, UGC, backend, analytics, daily challenge, broad redesign, schema break, new proof technique, or new shipped DSL rule entered Phase 16: PASS.

## Blockers Or Follow-Up Notes

No blockers.

Follow-up remains honest playtest calibration with real participant data. Until that exists, `case-012` should not be described as publicly calibrated.
