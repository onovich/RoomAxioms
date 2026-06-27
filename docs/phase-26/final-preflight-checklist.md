# Phase 26 Final Preflight Checklist

Status: Round 27 final preflight.
Guide: `docs/phase-26-workbench-guided-puzzle-ladder-production-goal-mode-execution-guide.md`

## Purpose

Round 27 closes the buffer/final-prep lane. This checklist is the handrail for
Rounds 28-32: write the final report, rerun validation, gather local smoke and
Pages evidence, then notify the planner. It deliberately does not claim that
Phase 26 is complete.

## Current Preflight State

- Final report file: not yet created.
- Likely completion status: `READY_FOR_CHECK_WITH_BLOCKER`.
- Serious attempts: 15, recorded in `docs/phase-26/candidate-review-log.md`.
- Promotions: 0, recorded in `docs/phase-26/promotion-gate-audit.md`.
- Player selector: unchanged 10-case ladder with `case-004` default.
- Phase 26 candidates: isolated under `content/experimental/phase-26`.
- Unrelated untracked docs: leave untouched unless the user explicitly scopes
  them in.

## Final Report Inputs

Use these sources when writing
`docs/phase-26-workbench-guided-puzzle-ladder-production-final-report.md`:

- `docs/phase-26/puzzle-ladder-target-brief.md`
- `docs/phase-26/current-selector-audit.md`
- `docs/phase-26/authoring-workflow.md`
- `docs/phase-26/candidate-review-log.md`
- `docs/phase-26/promotion-gate-audit.md`
- `docs/phase-26/ladder-copy-review.md`
- `docs/phase-26/runtime-selector-qa.md`
- `docs/phase-26/experimental-isolation-qa.md`
- `docs/phase-26/blocker-readiness-plan.md`
- `docs/phase-26/blocker-follow-up-recommendations.md`
- `docs/phase-26/final-report-evidence-matrix.md`

## Required Final Commands

Run and record these in the final report:

```powershell
C:\Users\Administrator\.codex\skills\project-git-workflow\scripts\git\Status.cmd
rg "p26-c|phase-26" apps\web\src\workbench apps\web\src\content apps\web\src\view apps\web\src\runtime apps\web\src\logic content\cases -n
rg "case-001|case-002|case-003|case-005|case-006|case-019" apps\web\src\content apps\web\src\view apps\web\src\workbench -n
pnpm --filter @room-axioms/web test -- src/content/caseVerification.test.ts src/content/runtimeSmoke.test.ts
pnpm --filter @room-axioms/authoring test
git diff --check
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Validate.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StartDevServer.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Smoke.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StopDevServer.cmd
```

Expected scan interpretation:

- The Phase 26 player-facing scan should return no matches. An `rg` exit code
  of 1 is PASS for "no matches".
- The historical rejected-case scan should match only test exclusion assertions.
  If it matches player imports, views, or workbench imports, stop and repair.

## Required Final Git And Deployment Evidence

After validation and report writing:

1. Commit and push only Phase 26 final-report related paths.
2. Record the final commit hash.
3. Confirm the final push reached `origin/main`.
4. Wait for the GitHub Pages deploy run for the final commit.
5. Record the Pages run id and status.
6. Confirm the deployed site returns HTTP 200.
7. Only then send the planner completion message.

## Final Routing Requirement

Planner thread: `019ef0df-a626-7181-9ca6-1cc75c1f4c47`.

The final executor message to the planner should include:

- phase and guide path;
- status: `READY_FOR_CHECK_WITH_BLOCKER` unless a late strict-gate repair
  changes the result;
- final commit;
- final report path;
- validation evidence;
- local smoke evidence;
- Pages run and online HTTP evidence;
- blocker summary and follow-up recommendation;
- request for planner-side `$checkandgoal`.

Do not call `update_goal complete` before the final report is committed,
pushed, deployed, and the planner notification gate reaches a terminal state.
