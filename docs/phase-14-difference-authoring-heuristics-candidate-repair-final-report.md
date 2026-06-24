# Phase 14 Difference Authoring Heuristics And Candidate Repair Final Report

Status: READY_FOR_CHECK
Guide: `docs/phase-14-difference-authoring-heuristics-candidate-repair-goal-mode-execution-guide.md`
Phase: Phase 14 - Difference Authoring Heuristics And Candidate Repair

## Summary

Phase 14 converted the Phase 13 stop evidence into repeatable private authoring support. The authoring CLI now accepts repeated `--require-technique` flags on `minimize` and emits a structured `techniqueRetention` report, so maintainers can see whether required techniques survive after reveal minimization instead of comparing proof output manually.

No shipped case was promoted. The quality gate held: candidate 001 retained `LOCAL_SCOPE_DIFFERENCE` after minimization but still failed proof/no-guess and final guest-layout uniqueness, while candidates 002 and 003 validated only because their initial states were already guest-layout unique and used no human technique. Existing shipped content remains unchanged, `case-004` remains the default, and `case-011` remains the latest shipped case.

## Files Changed By Category

- Final report and phase evidence: `docs/phase-14-difference-authoring-heuristics-candidate-repair-final-report.md`, `docs/phase-14/*`.
- Private retention tooling: `packages/authoring/src/contracts.ts`, `packages/authoring/src/parser.ts`, `packages/authoring/src/caseCommands.ts`, `packages/authoring/src/index.ts`, `packages/authoring/src/parser.test.ts`.
- Experimental candidates only: `content/experimental/phase-14/phase-14-local-scope-difference-001.json`, `phase-14-local-scope-difference-002.json`, `phase-14-local-scope-difference-003.json`, and `phase-14-nested-difference-sample-template.json`.
- Regression guard: `apps/web/src/content/caseVerification.test.ts` asserts Phase 14 experimental IDs are not in shipped content summaries.
- Project status docs: `README.md`, `docs/development-plan.md`.

No Phase 14 file was copied into `content/cases`, and `apps/web/src/content/cases.ts` was not wired to any experimental candidate.

## Phase 13 Failure Model

Phase 13 showed two useful failure modes. A candidate can appear to need `LOCAL_SCOPE_DIFFERENCE` before minimization, then collapse to a count-saturation-only proof once redundant reveals are removed. A different candidate can preserve the interesting local difference shape but still fail proof verification or final guest-layout uniqueness.

Phase 14 records these as authoring requirements in `docs/phase-14/failure-taxonomy.md`, `docs/phase-14/issue-register.md`, and `docs/phase-14/retention-target.md`: the accepted or minimized reveal set must still use `LOCAL_SCOPE_DIFFERENCE`, not merely contain decorative reveals that make the technique visible before minimization.

## Retention Check Or Heuristic

Implemented private authoring support:

- `minimize --require-technique LOCAL_SCOPE_DIFFERENCE` records required technique IDs.
- `techniqueRetention.beforeTechniqueIds` and `afterTechniqueIds` are derived from public proof metrics.
- `preservedTechniqueIds`, `lostTechniqueIds`, `missingRequiredTechniqueIds`, and `requiredTechniquesRetained` make the gate machine-checkable.
- Diagnostics include `TECHNIQUE_RETENTION_PASS` and `TECHNIQUE_RETENTION_FAILED`.
- Parser validation rejects unknown technique names with `INVALID_TECHNIQUE`.

The check consumes proof output and authoring minimization results. It does not reimplement proof semantics.

## Candidate Inventory

- `phase-14-local-scope-difference-001`: report `ok: false`; schema issues 0; target satisfies rules true; initial guest layouts 2; proof noGuess false; humanExplainable false; final guest layout not unique; issue codes `EXPLANATION_GAP` x2; technique IDs include `LOCAL_SCOPE_DIFFERENCE`; minimization keeps the four observed cells; retention PASS.
- `phase-14-local-scope-difference-002`: report `ok: true`; initial guest layouts 1; proof wave count 0; deduction count 0; technique IDs empty; minimization removes redundant reveals; retention FAILED because `LOCAL_SCOPE_DIFFERENCE` is missing.
- `phase-14-local-scope-difference-003`: report `ok: true`; initial guest layouts 1; proof wave count 0; deduction count 0; technique IDs empty; minimization keeps its reveals but still has no technique; retention FAILED because `LOCAL_SCOPE_DIFFERENCE` is missing.
- Seed `1401` sample template: report-only sampler accepted 0 candidates after 96 attempts; rejection was dominated by `TARGET_VIOLATES_RULES`; artifact policy remained report-only.

Inventory and rejection details are recorded in `docs/phase-14/candidate-inventory.md`, `docs/phase-14/rejection-log.md`, `docs/phase-14/repair-loop.md`, and `docs/phase-14/selection-stop-decision.md`.

## Authoring Evidence

- Candidate 001 report: `ok: false`; schema issue count 0; target rules satisfy true; initial satisfiable true; initial guest-layout count 2; proof noGuess false; humanExplainable false; guestLayoutUniqueAtEnd false; techniques `LOCAL_SCOPE_DIFFERENCE`; no truncation.
- Candidate 001 score: score 7.76; provisional band 2; `calibratedWithRealPlaytest: false`.
- Candidate 001 minimize with `--require-technique LOCAL_SCOPE_DIFFERENCE`: `ok: false`; before cells `A1,B1,C1,B2`; after cells `A1,B1,C1,B2`; `TECHNIQUE_RETENTION_PASS`; required techniques retained true.
- Candidate 002 report: `ok: true`; initial guest-layout count 1; noGuess true; guestLayoutUniqueAtEnd true; wave count 0; technique IDs empty.
- Candidate 002 score: score 3.61; provisional band 1; `calibratedWithRealPlaytest: false`.
- Candidate 002 minimize with `--require-technique LOCAL_SCOPE_DIFFERENCE`: `ok: true`; before cells `A1,B1,C1,A2,B2`; after cells `B1,A2,B2`; `TECHNIQUE_RETENTION_FAILED`; missing `LOCAL_SCOPE_DIFFERENCE`.
- Candidate 003 report: `ok: true`; initial guest-layout count 1; noGuess true; guestLayoutUniqueAtEnd true; wave count 0; technique IDs empty.
- Candidate 003 score: score 3.21; provisional band 1; `calibratedWithRealPlaytest: false`.
- Candidate 003 minimize with `--require-technique LOCAL_SCOPE_DIFFERENCE`: `ok: true`; before and after cells `A1,C1,B2,C2,A3,C3`; `TECHNIQUE_RETENTION_FAILED`; missing `LOCAL_SCOPE_DIFFERENCE`.

All reviewed scores remain uncalibrated because no real Phase 14 playtest data was collected.

## Minimization And Technique Retention

Candidate 001 proves the new retention check is useful: a retained-difference candidate can be separated from ordinary count-saturation collapse. It still fails promotion because no-guess proof verification and final guest-layout uniqueness do not pass.

Candidates 002 and 003 prove the opposite repair failure: adding helper observations or constraints can make the puzzle trivially unique before any human wave. The retention check makes that failure explicit by reporting an empty technique set and missing `LOCAL_SCOPE_DIFFERENCE`.

## Promotion Or Stop Decision

Decision: no shipped promotion in Phase 14.

The stop decision is documented in `docs/phase-14/selection-stop-decision.md`. No file was copied into `content/cases`, no selector data changed, `case-004` remains `DEFAULT_CASE_ID`, and existing shipped cases remain `case-001` through `case-011`.

## Runtime And UI Evidence

- Added a content regression guard so Phase 14 experimental IDs cannot appear in `contentCases` or `caseSummaries`.
- Focused web content test passed after the guard was added.
- Hint/runtime focused tests passed after the secrecy review.
- Local smoke passed through the project ops wrappers:
  - `StartDevServer.cmd`: PASS.
  - `Smoke.cmd`: PASS.
  - `StopDevServer.cmd`: PASS.

Because no shipped content or selector source changed, Phase 14 introduced no new player-facing target, candidate, forced-cell, generator, or authoring exposure.

## Copy Review

No shipped player copy changed in Phase 14. Experimental Phase 14 files use internal English titles and remain report-only. Difficulty scores remain explicitly uncalibrated.

## Validation

- `cmd /c pnpm.cmd --filter @room-axioms/authoring test`: PASS, 1 file, 13 tests.
- `cmd /c pnpm.cmd authoring -- minimize content/experimental/phase-14/phase-14-local-scope-difference-001.json --require-technique LOCAL_SCOPE_DIFFERENCE`: PASS command, expected `ok: false`, `TECHNIQUE_RETENTION_PASS`.
- `cmd /c pnpm.cmd authoring -- minimize content/experimental/phase-14/phase-14-local-scope-difference-002.json --require-technique LOCAL_SCOPE_DIFFERENCE`: PASS command, expected `ok: true`, `TECHNIQUE_RETENTION_FAILED`.
- `cmd /c pnpm.cmd authoring -- minimize content/experimental/phase-14/phase-14-local-scope-difference-003.json --require-technique LOCAL_SCOPE_DIFFERENCE`: PASS command, expected `ok: true`, `TECHNIQUE_RETENTION_FAILED`.
- `cmd /c pnpm.cmd --filter @room-axioms/web test -- src/content/caseVerification.test.ts`: PASS.
- `cmd /c pnpm.cmd --filter @room-axioms/web test -- src/logic/hints.test.ts src/runtime/analyzer.test.ts`: PASS.
- `C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Validate.cmd`: PASS.
- `git diff --check`: PASS.

## Boundary Scans

- `rg -n "@room-axioms/authoring" apps content\cases packages\domain packages\schema packages\solver packages\proof packages\generator`: no matches.
- `rg -n "phase-14-|content/experimental/phase-14" apps\web\src --glob "!**/*.test.ts" content\cases`: no matches.
- `rg -n "@room-axioms/generator|@room-axioms/authoring" apps\web\src content\cases`: no matches.
- `rg -n "zod|react|node:fs|@room-axioms/(schema|solver|proof|oracle|generator|authoring)" packages\domain`: no matches.
- `rg -n "lineCount|manhattan|visibility|blocker" content\cases content\experimental\phase-14 apps\web\src packages\domain packages\schema packages\solver packages\proof packages\generator packages\authoring`: no matches.
- UI dependency scan over solver/proof/generator/authoring runtime source found no React/Vite/browser API imports.
- Target-access scan found only the existing allowed app boundary in `targetAccess`, verification, tests, developer overlay, and conclusion-checking paths.

## Commits

- `fc00aa5` docs: record Phase 14 dispatch
- `710fb8f` docs: add Phase 14 failure model
- `0373270` docs: design Phase 14 retention check
- `593fb44` feat: add authoring technique retention check
- `c75ec69` docs: add Phase 14 candidate strategy
- `1b6af3f` content: add Phase 14 difference candidates
- `550ece4` docs: record Phase 14 candidate repair loop
- `93b01ab` docs: record Phase 14 stop decision
- `dd7a60d` test: guard Phase 14 experimental boundary
- `cec28ae` docs: add Phase 14 secrecy review
- `efa9579` docs: record Phase 14 runtime smoke
- Final report commit: `docs: report Phase 14 completion`

## PASS Criteria

- Final report exists: PASS.
- Full validation passes: PASS.
- Phase 13 failure modes are documented as Phase 14 authoring requirements: PASS.
- Repeatable private retention check exists and is tested: PASS.
- Candidate inventory and rejection log exist: PASS.
- Authoring report/score/minimize/retention evidence exists for reviewed candidates: PASS.
- No promoted case required a Phase 14 shipped gate: PASS, because no candidate qualified.
- Stop decision explains why and shipped content remains unchanged: PASS.
- Existing shipped cases, including `case-011`, remain valid: PASS.
- `case-004` remains default: PASS.
- Experimental Phase 14 content remains out of default shipped content: PASS.
- Difficulty scoring remains uncalibrated: PASS.
- Domain remains schema/solver/proof/oracle/generator/authoring/Zod/UI/fs-free: PASS.
- Solver/proof/generator/authoring remain independent of player-facing React UI code: PASS.
- Authoring tooling is not imported by player-facing web code or shipped content: PASS.
- Target reads remain limited to existing targetAccess, verification, tests, conclusion checking, and developer-only surfaces: PASS.
- No public editor, UGC, backend, analytics, daily challenge, broad redesign, breaking schema migration, new proof technique, or new shipped DSL rule entered this phase: PASS.
- Working tree clean and final commit pushed: PASS after final report commit/push.

## Blockers Or Follow-Up Notes

No blockers.

The useful follow-up is candidate-search work, not a release defect: future difference authoring should look for shapes where a retained `LOCAL_SCOPE_DIFFERENCE` deduction unlocks later safe-object observations without making the initial guest layout unique.
