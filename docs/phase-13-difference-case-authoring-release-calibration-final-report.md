# Phase 13 Difference Case Authoring And Release Calibration Final Report

Status: READY_FOR_CHECK
Guide: `docs/phase-13-difference-case-authoring-release-calibration-goal-mode-execution-guide.md`
Phase: Phase 13 - Difference Case Authoring And Release Calibration

## Summary

Phase 13 authored and reviewed natural `LOCAL_SCOPE_DIFFERENCE` candidates without changing shipped content. The quality gate held: no candidate was promoted because the only no-guess candidate lost `LOCAL_SCOPE_DIFFERENCE` after reveal minimization, while the other reviewed candidate still had explanation gaps and no final guest-layout uniqueness. Existing shipped cases remain unchanged, `case-004` remains the default, and `case-011` remains the latest shipped case.

## Files Changed By Category

- Final report and phase evidence: `docs/phase-13-difference-case-authoring-release-calibration-final-report.md`, `docs/phase-13/*`.
- Experimental candidates only: `content/experimental/phase-13/phase-13-local-scope-difference-001.json`, `content/experimental/phase-13/phase-13-local-scope-difference-002.json`, and the report-only sample template.
- Regression guard: `apps/web/src/content/caseVerification.test.ts` asserts Phase 13 experimental IDs are not in shipped content summaries.
- Project status docs: `README.md`, `docs/development-plan.md`.

No Phase 13 content was copied into `content/cases`, and `apps/web/src/content/cases.ts` was not wired to any experimental candidate.

## Candidate Inventory

- Phase 12 baseline fixture: rejected for promotion because minimization drops `LOCAL_SCOPE_DIFFERENCE`.
- `phase-13-local-scope-difference-001`: hand-authored, report `ok: true`, no-guess proof succeeds, final guest cells `B3,C3`, but minimization removes `B2` and the minimized proof uses only `LOCAL_COUNT_SATURATED`.
- `phase-13-local-scope-difference-002`: hand-authored, target and schema pass, but no-guess verification fails with three `EXPLANATION_GAP` issues and final guest layout is not unique.
- Seed `1301` sample template: report-only sampling accepted 0 candidates after 48 attempts; all attempts failed target-rule validation before promotion gates.

Inventory and rejection details are recorded in `docs/phase-13/candidate-inventory.md`, `docs/phase-13/rejection-log.md`, and `docs/phase-13/selection-stop-decision.md`.

## Authoring Evidence

- Candidate 001 report: `ok: true`; schema issue count 0; target rules satisfy true; initial satisfiable true; initial guest-layout count 2; proof noGuess true; humanExplainable true; guestLayoutUniqueAtEnd true; final guests `B3,C3`; techniques `LOCAL_COUNT_SATURATED`, `LOCAL_SCOPE_DIFFERENCE`; solver stats not truncated.
- Candidate 001 score: `ok: true`; score 9.65; provisional band 2; `calibratedWithRealPlaytest: false`; candidate guest layouts 2; proof wave count 1; deduction count 3; no truncation.
- Candidate 001 minimize: `ok: true`; before cells `A1,B1,C1,B2`; after cells `A1,B1,C1`; removed `B2`; proofBefore includes `LOCAL_SCOPE_DIFFERENCE`; proofAfter includes only `LOCAL_COUNT_SATURATED`.
- Candidate 002 report: `ok: false`; schema issue count 0; target rules satisfy true; initial satisfiable true; initial guest-layout count 5; proof noGuess false; humanExplainable false; guestLayoutUniqueAtEnd false; issue codes `EXPLANATION_GAP` x3; techniques include `LOCAL_SCOPE_DIFFERENCE`; no truncation.
- Candidate 002 score: `ok: true`; score 14.02; provisional band 4; `calibratedWithRealPlaytest: false`; candidate guest layouts 5; proof wave count 2; deduction count 3; no truncation.
- Candidate 002 minimize: `ok: false`; before and after cells remain `A1,B1,C1,B2`; every reveal is required for the current proof, but the proof remains non-no-guess and not final-unique.
- Sampler seed 1301: `ok: false`; accepted 0; attempts 48; rejection dominated by `TARGET_VIOLATES_RULES`; no truncation; artifact policy report-only.

## Minimization And Technique Retention

The Phase 13 promotion gate required the accepted or minimized reveal set to retain `LOCAL_SCOPE_DIFFERENCE`. Candidate 001 fails that gate because minimization removes the reveal that made the difference proof necessary. Candidate 002 fails before promotion because proof verification is incomplete and final guest-layout uniqueness does not hold. Therefore no candidate qualified for shipped promotion.

## Promotion Or Stop Decision

Decision: no shipped promotion in Phase 13.

The stop decision is intentional and documented in `docs/phase-13/selection-stop-decision.md`: quality beats case count, experimental candidates remain private, and the release selector remains stable. `content/cases` still contains the existing eleven shipped cases, `case-004` remains default, and `case-011` remains preserved.

## Runtime And UI Evidence

- Added a content regression guard so Phase 13 experimental IDs cannot appear in `contentCases` or `caseSummaries`.
- Focused web content test passed after the guard was added.
- Hint/runtime focused tests passed after the copy review.
- Local smoke passed through the project ops wrappers:
  - `StartDevServer.cmd`: PASS.
  - `Smoke.cmd`: PASS.
  - `StopDevServer.cmd`: PASS.

Because no shipped content or selector source changed, Phase 13 introduced no new player-facing target, candidate, forced-cell, generator, or authoring exposure.

## Copy Review

No shipped player copy was changed in Phase 13. Reviewed candidate copy remains experimental and report-only. Difficulty scores remain explicitly uncalibrated because no real playtest feedback was collected in this phase.

## Validation

- `cmd /c pnpm.cmd authoring -- report content/experimental/phase-13/phase-13-local-scope-difference-001.json`: PASS, `ok: true`.
- `cmd /c pnpm.cmd authoring -- score content/experimental/phase-13/phase-13-local-scope-difference-001.json`: PASS, `ok: true`.
- `cmd /c pnpm.cmd authoring -- minimize content/experimental/phase-13/phase-13-local-scope-difference-001.json`: PASS, expected promotion rejection because minimized proof drops `LOCAL_SCOPE_DIFFERENCE`.
- `cmd /c pnpm.cmd authoring -- report content/experimental/phase-13/phase-13-local-scope-difference-002.json`: PASS, expected `ok: false`.
- `cmd /c pnpm.cmd authoring -- score content/experimental/phase-13/phase-13-local-scope-difference-002.json`: PASS, `ok: true`.
- `cmd /c pnpm.cmd authoring -- minimize content/experimental/phase-13/phase-13-local-scope-difference-002.json`: PASS, expected `ok: false`.
- `cmd /c pnpm.cmd authoring -- sample --seed 1301 --template content/experimental/phase-13/phase-13-difference-sample-template.json`: PASS, expected `ok: false` with accepted 0.
- `cmd /c pnpm.cmd --filter @room-axioms/web test -- src/content/caseVerification.test.ts`: PASS.
- `cmd /c pnpm.cmd --filter @room-axioms/web test -- src/logic/hints.test.ts src/runtime/analyzer.test.ts`: PASS.
- `C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Validate.cmd`: PASS.
- `git diff --check`: PASS.

## Boundary Scans

- `rg -n "@room-axioms/authoring" apps content\cases packages\domain packages\schema packages\solver packages\proof packages\generator`: no matches.
- `rg -n "phase-13-|content/experimental/phase-13" apps\web\src --glob "!**/*.test.ts" content\cases`: no matches.
- `rg -n "@room-axioms/generator|@room-axioms/authoring" apps\web\src content\cases`: no matches.
- `rg -n "zod|react|node:fs|@room-axioms/(schema|solver|proof|oracle|generator|authoring)" packages\domain`: no matches.
- `rg -n "lineCount|manhattan|visibility" content\cases content\experimental\phase-13 apps\web\src packages\domain packages\schema packages\solver packages\proof packages\generator packages\authoring`: no matches.
- Target-access scan found only the existing allowed app boundary in `targetAccess`, verification, tests, and developer overlay paths.
- UI dependency scan found only package/test tooling references such as Vite/Vitest config and tests; no React/Vite/browser UI imports were added to solver/proof/generator/authoring runtime source.

## Commits

- `95c13b5` docs: record Phase 13 dispatch
- `a208bb7` docs: add Phase 13 quality baseline
- `8c59257` docs: define Phase 13 candidate search plan
- `f34d81d` content: add Phase 13 difference candidates
- `a3ad451` docs: record Phase 13 candidate filtering
- `2129c82` docs: record Phase 13 stop decision
- `23e8d55` test: guard Phase 13 experimental boundary
- `71efd99` docs: add Phase 13 copy review
- `1852a72` docs: record Phase 13 runtime smoke
- Final report commit: `docs: report Phase 13 completion`

## PASS Criteria

- Final report exists: PASS.
- Full validation passes: PASS.
- Candidate inventory and rejection log exist: PASS.
- Authoring report/score/minimize evidence exists for reviewed candidates: PASS.
- No promoted case required a Phase 13 shipped gate: PASS, because no candidate qualified.
- Stop decision explains why and shipped content remains unchanged: PASS.
- Existing shipped cases, including `case-011`, remain valid: PASS.
- `case-004` remains default: PASS.
- Experimental Phase 13 content remains out of default shipped content: PASS.
- Difficulty scoring remains uncalibrated: PASS.
- Domain remains schema/solver/proof/oracle/generator/authoring/Zod/UI/fs-free: PASS.
- Solver/proof/generator/authoring remain independent of player-facing React UI code: PASS.
- Authoring tooling is not imported by player-facing web code or shipped content: PASS.
- Target reads remain limited to existing targetAccess, verification, tests, and developer-only surfaces: PASS.
- No public editor, UGC, backend, analytics, daily challenge, broad redesign, breaking schema migration, new proof technique, or new shipped DSL rule entered this phase: PASS.
- Working tree clean and final commit pushed: PASS after final report commit/push.

## Blockers Or Follow-Up Notes

No blockers. The useful follow-up is not a code defect: future authoring work needs a candidate shape whose minimized reveal set still structurally requires `LOCAL_SCOPE_DIFFERENCE`, likely by hiding the observation that currently collapses candidate 001 into a count-saturation-only proof.
