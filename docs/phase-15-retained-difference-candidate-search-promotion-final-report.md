# Phase 15 Retained Difference Candidate Search And Promotion Final Report

Status: READY_FOR_CHECK
Guide: `docs/phase-15-retained-difference-candidate-search-promotion-goal-mode-execution-guide.md`
Phase: Phase 15 - Retained Difference Candidate Search And Promotion

## Summary

Phase 15 found and promoted one retained `LOCAL_SCOPE_DIFFERENCE` case.

The successful repair is `phase-15-retained-difference-003`, copied deliberately into shipped content as `case-012`. It keeps initial ambiguity with 2 guest layouts, proves `B3` by `LOCAL_SCOPE_DIFFERENCE`, reaches final guest uniqueness at `B3,C3`, and still retains the required technique after minimization.

No new proof technique, safe-cell difference semantics, DSL/schema change, solver rewrite, public editor, UGC, backend, analytics, daily challenge, or broad UI redesign entered the phase. `case-004` remains the default.

## Files Changed By Category

- Final report and Phase 15 evidence: `docs/phase-15-retained-difference-candidate-search-promotion-final-report.md`, `docs/phase-15/*`.
- Experimental search content: `content/experimental/phase-15/phase-15-retained-difference-001.json`, `phase-15-retained-difference-002.json`, and `phase-15-retained-difference-003.json`.
- Shipped content: `content/cases/case-012.json`.
- Web content wiring and regression guard: `apps/web/src/content/cases.ts`, `apps/web/src/content/caseVerification.test.ts`.
- Project status docs: `README.md`, `docs/development-plan.md`.

## Search Target And Carryover Blockers

Recorded in `docs/phase-15/search-target.md`, `docs/phase-15/carryover-blockers.md`, and `docs/phase-15/issue-register.md`.

The hard gates were:

- initial guest layouts must be greater than 1;
- proof wave count must be at least 1;
- `LOCAL_SCOPE_DIFFERENCE` must appear in the accepted proof;
- `minimize --require-technique LOCAL_SCOPE_DIFFERENCE` must report `TECHNIQUE_RETENTION_PASS`;
- the minimized proof must remain no-guess, human-explainable, and final-unique.

## Candidate Inventory

- Candidate 001: retained `LOCAL_SCOPE_DIFFERENCE` but failed proof/no-guess and final uniqueness with two explanation gaps.
- Candidate 002: improved the corridor shape, but minimization removed `B2` and dropped `LOCAL_SCOPE_DIFFERENCE`.
- Candidate 003: repaired candidate 002 by adding `D2` as an initial empty reveal; passed report, score, no-guess, final uniqueness, and retention minimization.

Inventory and rejection details are in `docs/phase-15/candidate-inventory.md`, `docs/phase-15/rejection-log.md`, and `docs/phase-15/repair-loop.md`.

## Authoring Evidence

- Candidate 001 report: command PASS, `ok: false`, initial guest layouts 2, issue codes `EXPLANATION_GAP` x2, technique `LOCAL_SCOPE_DIFFERENCE`, no truncation.
- Candidate 001 score: `7.77`, provisional band 2, `calibratedWithRealPlaytest: false`.
- Candidate 001 minimize: command PASS, `ok: false`, `TECHNIQUE_RETENTION_PASS`, but no-guess/final uniqueness remain false.
- Candidate 002 report: command PASS, `ok: false`, initial guest layouts 3, issue code `EXPLANATION_GAP`, techniques `LOCAL_COUNT_SATURATED`, `LOCAL_SCOPE_DIFFERENCE`, no truncation.
- Candidate 002 score: `12.69`, provisional band 3, `calibratedWithRealPlaytest: false`.
- Candidate 002 minimize: command PASS, `ok: true`, `TECHNIQUE_RETENTION_FAILED`, missing `LOCAL_SCOPE_DIFFERENCE`.
- Candidate 003 report: command PASS, `ok: true`, initial guest layouts 2, no-guess true, human-explainable true, final guest cells `B3,C3`, techniques `LOCAL_COUNT_SATURATED`, `LOCAL_SCOPE_DIFFERENCE`, no truncation.
- Candidate 003 score: `12.15`, provisional band 3, `calibratedWithRealPlaytest: false`.
- Candidate 003 minimize: command PASS, `ok: true`, `TECHNIQUE_RETENTION_PASS`, required techniques retained true.
- Shipped `case-012` report/score/minimize repeated the candidate 003 PASS evidence.

All scores remain uncalibrated because no real Phase 15 playtest feedback was collected.

## Minimization And Technique Retention

Candidate 003 and `case-012` both retain the exact reveal set after minimization:

- before cells: `A1`, `B1`, `C1`, `B2`, `D2`;
- after cells: `A1`, `B1`, `C1`, `B2`, `D2`;
- missing required technique ids: none;
- required techniques retained: true;
- proof after minimization: no-guess true, human-explainable true, guest-layout unique true.

## Promotion Or Stop Decision

Decision: promote one case.

`phase-15-retained-difference-003` was copied into `content/cases/case-012.json` with Chinese player-facing title, case name, rule titles, and rule flavor text. The web selector imports `case-012` from `content/cases`; it does not import from `content/experimental/phase-15`.

`case-004` remains `DEFAULT_CASE_ID`.

## Runtime And UI Evidence

- `apps/web/src/content/cases.ts` now includes `case-012` in stable order after `case-011`.
- `apps/web/src/content/caseVerification.test.ts` verifies the shipped order, default case, no Phase 15 experimental IDs in summaries, and the `case-012` no-guess/final-unique evidence.
- Focused web hint/runtime tests passed.
- Local smoke passed through `StartDevServer.cmd`, `Smoke.cmd`, and `StopDevServer.cmd`.
- GitHub Pages deploy for `a96d52c` completed successfully: run `28094866629`.
- Online URL `http://blog.onovich.com/RoomAxioms/` returned HTTP 200.

Player mode does not expose target cells, candidate cells, forced cells, generator internals, authoring diagnostics, or proof internals beyond existing public hint/runtime behavior.

## Copy Review

`case-012` copy is player-facing Chinese:

- title: `客房 12：走廊差集`;
- case name: `案卷 12 · 走廊差集`;
- rule titles: `酒瓶十字线`, `镜面静区`, `空房静线`, `住客总数`.

No mechanics changed during copy review.

## Validation

- `cmd /c pnpm.cmd --filter @room-axioms/web test -- src/content/caseVerification.test.ts src/logic/hints.test.ts src/runtime/analyzer.test.ts`: PASS.
- `cmd /c pnpm.cmd --filter @room-axioms/proof test`: PASS, 9 files, 46 tests.
- `cmd /c pnpm.cmd --filter @room-axioms/authoring test`: PASS, 1 file, 13 tests.
- Authoring report/score/minimize evidence for candidates 001, 002, 003, and `case-012`: PASS commands with expected outcomes.
- `C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StartDevServer.cmd`: PASS.
- `C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Smoke.cmd`: PASS.
- `C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StopDevServer.cmd`: PASS.
- `C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Validate.cmd`: PASS.
- `git diff --check`: PASS, with normal CRLF working-copy warnings only.

## Boundary Scans

- `rg -n "@room-axioms/(authoring|generator)" apps\web\src content\cases`: no matches.
- `rg -n "phase-15-|content/experimental/phase-15" apps\web\src content\cases --glob "!**/*.test.ts"`: no matches.
- `rg -n "zod|react|node:fs|@room-axioms/(schema|solver|proof|oracle|generator|authoring)" packages\domain`: no matches.
- UI dependency scan over solver/proof/generator/authoring runtime source found no React/Vite/browser API imports.
- `rg -n "lineCount|manhattan|visibility|blocker" content\cases content\experimental\phase-15 apps\web\src packages\domain packages\schema packages\solver packages\proof packages\generator packages\authoring`: no matches.
- Target-access scan found only the existing allowed app boundary in `targetAccess`, verification, tests, developer overlay, and conclusion-checking paths.

## Commits

- `a91bc6b` docs: record Phase 15 dispatch
- `76f626c` docs: add Phase 15 search target
- `8ba13af` docs: plan Phase 15 candidate geometry
- `9976bc0` content: add Phase 15 retained difference candidates
- `1448430` docs: record Phase 15 retention filtering
- `a96d52c` content: promote retained difference case
- Final report commit: `docs: report Phase 15 completion`

## PASS Criteria

- Final report exists: PASS.
- Full validation passes: PASS.
- Candidate search target and Phase 14 carryover blockers are documented: PASS.
- Candidate inventory and rejection log exist: PASS.
- Authoring report/score/minimize/retention evidence exists for reviewed candidates: PASS.
- Promoted case passes all promotion gates and keeps `LOCAL_SCOPE_DIFFERENCE` after minimization: PASS.
- Existing shipped cases, including `case-011`, remain valid: PASS.
- `case-004` remains default: PASS.
- Experimental Phase 15 content remains out of default shipped content except the deliberately promoted copy: PASS.
- Difficulty scoring remains explicitly uncalibrated: PASS.
- Domain remains schema/solver/proof/oracle/generator/authoring/Zod/UI/fs-free: PASS.
- Solver/proof/generator/authoring remain independent of React/Vite/browser UI code: PASS.
- Authoring tooling is not imported by player-facing web code or shipped content: PASS.
- Target reads remain limited to existing targetAccess, verification, tests, conclusion checking, and developer-only surfaces: PASS.
- No public editor, UGC, backend, analytics, daily challenge, broad redesign, breaking schema migration, new proof technique, or new shipped DSL rule entered this phase: PASS.
- Working tree clean and final commit pushed: PASS after final report commit/push.

## Blockers Or Follow-Up Notes

No blockers.

The useful follow-up is playtest calibration for `case-012`; no playtest data was fabricated in this phase.
