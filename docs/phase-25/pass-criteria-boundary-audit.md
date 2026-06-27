# Phase 25 PASS Criteria And Boundary Audit

Status: Round 25 readiness evidence.
Guide: `docs/phase-25-authoring-editor-live-diagnostics-goal-mode-execution-guide.md`

This audit prepares the final Phase 25 report. It records current evidence and
remaining final-round work without claiming phase completion early.

## PASS Criteria Matrix

| Criterion | Current evidence | Status before final round |
| --- | --- | --- |
| Final report exists at `docs/phase-25-authoring-editor-live-diagnostics-final-report.md`. | Not written yet; reserved for Round 28. | Pending final report. |
| Phase 25 evidence folder exists. | `docs/phase-25/authoring-workbench-design.md`, `diagnostics-contract.md`, `draft-import-export-contract.md`, `bad-case-diagnostics-corpus.md`, `real-case-workbench-qa.md`, `workbench-authoring-trial.md`, and this audit. | Evidence present. |
| Private workbench route/mode exists and is not normal player flow. | `apps/web/src/workbench/route.ts` gates workbench to `#authoring-workbench` or `?authoring=workbench`; `apps/web/src/App.tsx` lazy-loads `AuthoringWorkbenchScreen` only when the route helper returns true; `apps/web/src/workbench/workbench.test.ts` covers normal path rejection. | Evidence present. |
| In-memory diagnostics API exists without React/browser dependency. | `packages/authoring/src/diagnostics.ts` exposes `evaluateDraftDiagnostics`; web imports the browser-safe `@room-axioms/authoring/diagnostics` subpath. | Evidence present. |
| Workbench can import existing cases and export draft JSON. | `apps/web/src/workbench/caseLibrary.ts`, `model.ts`, and `workbench.test.ts` cover shipped and experimental imports plus export status/file naming. | Evidence present. |
| Workbench can edit board facts and opening observations. | `patchWorkbenchTargetCell`, `patchWorkbenchBoardSize`, `toggleWorkbenchInitialReveal`, and tests in `workbench.test.ts`. | Evidence present. |
| Workbench can edit rules/scopes and copy. | `patchWorkbenchRulesJson`, `patchWorkbenchScopeCollectionsJson`, `patchWorkbenchRulePresentation`, raw JSON editors in `AuthoringWorkbenchScreen`, and tests in `workbench.test.ts` / `authoringTrial.test.ts`. | Evidence present. |
| Workbench can edit title/case name/difficulty metadata/tags/copy. | `patchWorkbenchMetadata`, structured metadata editor in `AuthoringWorkbenchScreen`, metadata tests in `workbench.test.ts`, and Round 24 update to `workbench-authoring-trial.md`. | Evidence present. |
| Live diagnostics show correctness/proof/quality/clone/difficulty/copy/performance signals. | `evaluateWorkbenchDiagnostics`, `createWorkbenchDiagnosticsOverview`, `createWorkbenchDiagnosticsGroupDetails`, and focused tests in `workbench.test.ts`, `realCaseQa.test.ts`, and `authoringTrial.test.ts`. | Evidence present. |
| Known bad-case failures are caught. | `docs/phase-25/bad-case-diagnostics-corpus.md`, private fixtures under `content/experimental/phase-25`, and tests for singleton giveaway, one-rule solution, padded clone, highlight-dependent copy, capped counts, and duplicate contribution. | Evidence present. |
| Real shipped/rejected cases were QA'd through workbench diagnostics. | `docs/phase-25/real-case-workbench-qa.md` and `apps/web/src/workbench/realCaseQa.test.ts`. | Evidence present. |
| Existing player selector/default case remain stable. | `apps/web/src/content/cases.ts` still imports only shipped cases and keeps `DEFAULT_CASE_ID = 'case-004'`; workbench tests assert private fixtures stay out of `contentCases`. | Evidence present. |
| Package boundaries remain clean. | Boundary scans below. | Evidence present; repeat in final round. |
| Full validation and `git diff --check` pass. | Passed each implementation round; must be rerun in Round 28. | Pending final rerun. |
| Local smoke passes if web runtime/routing changed. | Passed after workbench UI/routing rounds; must be rerun in Round 28 because web app changed during Phase 25. | Pending final rerun. |
| Pages deployment evidence recorded if web app changed. | Web changed during Phase 25, so Pages run and online asset evidence must be collected after final push. | Pending final deployment evidence. |

## Boundary Scans

Run on 2026-06-27 during Round 25.

| Boundary | Command | Result |
| --- | --- | --- |
| `packages/domain` must not import schema/solver/proof/authoring/UI/browser APIs. | `rg -n "@room-axioms/authoring|@room-axioms/schema|@room-axioms/solver|@room-axioms/proof|react|vite|browser" packages/domain/src` | Only `vitest` test imports matched; no production boundary violation. |
| `packages/schema` must not import authoring/solver/proof/UI/browser APIs. | `rg -n "@room-axioms/authoring|@room-axioms/solver|@room-axioms/proof|react|vite|browser" packages/schema/src` | Only `vitest` test imports matched; no production boundary violation. |
| `packages/solver` must not import authoring/proof/UI/browser APIs. | `rg -n "@room-axioms/authoring|@room-axioms/schema|@room-axioms/proof|react|vite|browser" packages/solver/src` | Solver imports schema in tests only; no authoring/proof/UI/browser dependency. |
| Web/proof/authoring must not import package internals by `src` path. | `rg -n "@room-axioms/authoring/.+src|packages/authoring/src|@room-axioms/solver/.+src|packages/solver/src" apps/web/src packages/proof/src packages/authoring/src` | No matches. |
| Player selector must not include workbench-only fixtures. | Inspect `apps/web/src/content/cases.ts` and tests in `workbench.test.ts` / `realCaseQa.test.ts`. | Only shipped cases are listed; experimental workbench fixtures stay private. |

## Known Caveats To Carry Into Final Report

- Difficulty remains uncalibrated. The workbench shows heuristic bucket signals
  but cannot replace real playtest evidence.
- Subjective fun/novelty remains a reviewer decision. The workbench records
  clone-risk, rule contribution, degeneracy, and copy warnings, but it should
  not auto-promote content.
- Full-library clone-risk comparison was too expensive for routine web tests.
  Routine QA uses bounded comparisons; broader clone sweeps remain an
  authoring/CLI workflow.
- The private workbench is intentionally not a public editor, UGC feature,
  backend, or content promotion workflow.

## Final-Round Checklist

- Write `docs/phase-25-authoring-editor-live-diagnostics-final-report.md`.
- Rerun full validation: lint, typecheck, test, build, and `git diff --check`.
- Rerun focused web/workbench tests and local smoke.
- Repeat boundary scans and record final results.
- Push final commit, then collect GitHub Pages run/status and online HTTP/asset
  evidence.
- Send READY_FOR_CHECK or READY_FOR_CHECK_WITH_BLOCKER to planner thread
  `019ef0df-a626-7181-9ca6-1cc75c1f4c47`.
