# Phase 25 Final Validation Runbook

Status: Round 27 final-buffer preparation.
Guide: `docs/phase-25-authoring-editor-live-diagnostics-goal-mode-execution-guide.md`

This runbook prepares Round 28. It records the exact validation, smoke,
deployment, and boundary-evidence steps to run before Phase 25 is reported
`READY_FOR_CHECK`. It does not claim Phase 25 completion early.

## Terminology Context Check

The Phase 25 guide requires the executor to read the two theme/setting context
documents for terminology awareness only:

- `docs/unregistered-scene-ui-requirements.md`
- the Chinese-titled project-setting/play-alignment document under `docs/`

Those files are intentionally left untracked and unmodified in this round.
Their relevant Phase 25 constraints are:

- Theme, narrative, visual, sound, and future dialogue layers must not change
  puzzle rules, target layouts, solver/proof behavior, or validation semantics.
- Player-facing information must come only from public rules, revealed facts,
  and proof-backed hints; visual or narrative presentation must not carry hidden
  answer information.
- Maintainer/developer verification surfaces may show targets, proof internals,
  candidate counts, clone-risk, and authoring diagnostics, but normal player
  flow must not expose them.
- The authoring workbench should use the project vocabulary as a maintainer
  tool while continuing to flag internal or abstract terms when they leak into
  player-facing rule copy.

## Final Round Commands

Run these commands from `D:\WebProjects\RoomAxioms` in Round 28:

```powershell
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Validate.cmd
cmd /c pnpm.cmd --filter @room-axioms/authoring test
cmd /c pnpm.cmd --filter @room-axioms/web test -- src/workbench/workbench.test.ts src/workbench/realCaseQa.test.ts src/workbench/authoringTrial.test.ts
cmd /c pnpm.cmd --filter @room-axioms/web test -- src/content/caseVerification.test.ts src/content/runtimeSmoke.test.ts
cmd /c pnpm.cmd --filter @room-axioms/web typecheck
git diff --check
```

Because Phase 25 changed web routing and runtime code, also run local smoke:

```powershell
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StartDevServer.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Smoke.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StopDevServer.cmd
```

If any validation command fails, repair in Round 28 before writing the final
report or reporting to the planner. Do not push a failing final round.

## Boundary Scans

Repeat these scans in Round 28 and copy the results into
`docs/phase-25-authoring-editor-live-diagnostics-final-report.md`:

```powershell
rg -n "@room-axioms/authoring|@room-axioms/schema|@room-axioms/solver|@room-axioms/proof|react|vite|browser|window|document" packages/domain/src
rg -n "@room-axioms/authoring|@room-axioms/solver|@room-axioms/proof|react|vite|browser|window|document" packages/schema/src
rg -n "@room-axioms/authoring|@room-axioms/proof|react|vite|browser|window|document" packages/solver/src
rg -n "@room-axioms/authoring/.+src|packages/authoring/src|@room-axioms/solver/.+src|packages/solver/src" apps/web/src packages/proof/src packages/authoring/src
rg -n "phase-25|experimental|authoring-workbench|workbench" apps/web/src/content content/cases
rg -n "target|candidate|forced|generator|anti-clone|proof trace|solver internals" apps/web/src/view apps/web/src/logic
```

Expected interpretation:

- Test-only matches are acceptable when the package already uses local tests.
- `apps/web/src/content` may mention workbench only in tests or private import
  helpers, not in the normal shipped case selector.
- Player views may mention proof-backed hints, but must not reveal target data,
  forced-cell overlays, candidate layouts, generator internals, or anti-clone
  internals in normal play.

## Pages Evidence After Final Push

After the final report commit is pushed, collect deployment evidence:

```powershell
gh run list --workflow "Deploy Pages" --limit 5
gh run watch <run-id>
gh run view <run-id> --json status,conclusion,headSha,url
Invoke-WebRequest https://onovich.github.io/RoomAxioms/ -UseBasicParsing
Invoke-WebRequest http://blog.onovich.com/RoomAxioms/ -UseBasicParsing
```

Then identify the served asset from the HTML and verify the final bundle contains
current shipped-case and workbench evidence, for example `case-021`,
`case-004`, and the private `authoring-workbench` route marker. Record the asset
filename and HTTP 200 results in the final report.

## Final Report Checklist

Create `docs/phase-25-authoring-editor-live-diagnostics-final-report.md` with:

- summary of the private workbench surface;
- diagnostics API and package-boundary evidence;
- import/export and editor capability evidence;
- bad-case and real-case QA evidence;
- validation, smoke, Pages, and boundary-scan results;
- PASS criteria matrix;
- honest caveats, especially uncalibrated difficulty and subjective novelty.

After the final commit and push succeed, send the planner completion message to
thread `019ef0df-a626-7181-9ca6-1cc75c1f4c47` with status
`READY_FOR_CHECK` or `READY_FOR_CHECK_WITH_BLOCKER`.
