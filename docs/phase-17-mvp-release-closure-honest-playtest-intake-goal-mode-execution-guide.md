# Phase 17 MVP Release Closure And Honest Playtest Intake Goal Mode Execution Guide

Date: 2026-06-24
Status: execution guide for the executor
Phase: Phase 17 - MVP Release Closure And Honest Playtest Intake
Round budget: 6 executor rounds; rounds 1-4 are release closure work, round 5 is buffer/fix work, round 6 is final validation and report.

## 0. Direct Goal Prompt For Executor

You are executing Phase 17 of Room Axioms: MVP Release Closure And Honest Playtest Intake.

Read this guide, `README.md`, `Role.md`, `docs/development-plan.md`, `docs/phase-16-case-012-release-qa-playtest-calibration-final-report.md`, `docs/phase-16/case-012-qa-checklist.md`, `docs/phase-16/playtest-protocol.md`, `docs/phase-16/playtest-feedback-log.md`, `content/cases`, `apps/web/src/content`, `apps/web/src/runtime`, and the project workflow configs.

Within 6 executor rounds:

- Treat Phase 16 as accepted and the current 12-case build as the MVP release candidate.
- Produce a release-closure package: release checklist, known limitations, playtest intake instructions, honest empty/filled feedback log handling, and an MVP release decision.
- Do not add new cases, new mechanics, proof techniques, DSL rules, editor scope, UGC, backend, analytics, daily challenge, or broad UI redesign.
- Run release validation and smoke on the current shipped build.
- If real participant feedback is provided during the phase, record it exactly and route P0/P1 findings. If no real feedback exists, keep calibration explicitly deferred.
- Fix only P0/P1 release blockers found during closure; document P2 follow-ups.
- Preserve `case-004` as the default case and preserve all shipped cases through `case-012`.
- Validate, commit, and push each successful round before moving on.

Use `$donextgoal` to execute this guide. When complete, report back to planner thread `019ef0df-a626-7181-9ca6-1cc75c1f4c47`.

## 1. Required Context

- `README.md`
- `AGENTS.md`
- `Role.md`
- `docs/development-plan.md`
- `docs/phase-16-case-012-release-qa-playtest-calibration-final-report.md`
- `docs/phase-16/case-012-qa-checklist.md`
- `docs/phase-16/runtime-hint-secrecy-qa.md`
- `docs/phase-16/responsive-keyboard-smoke.md`
- `docs/phase-16/playtest-protocol.md`
- `docs/phase-16/playtest-feedback-log.md`
- `content/cases`
- `apps/web/src/content`
- `apps/web/src/runtime`
- `.codex/project-ops-workflow.json`
- `.github/workflows`

Phase 16 is accepted. `case-012` is shipped and QA-passed. This phase is release closure, not content expansion.

## 2. Scope

Required deliverables:

- A final report at `docs/phase-17-mvp-release-closure-honest-playtest-intake-final-report.md`.
- A Phase 17 evidence folder under `docs/phase-17/`.
- MVP release checklist covering shipped cases, default case, validation, smoke, Pages/custom-domain availability, player secrecy, known limitations, and no fabricated calibration.
- Release decision document: release, hold, or release-candidate with explicit caveats.
- Playtest intake protocol and feedback log handling. Record real feedback only if it actually exists.
- Issue register with P0/P1/P2 decisions.
- README or release notes update if needed to describe the current MVP honestly.
- Full validation and local/online smoke evidence.
- Boundary scans proving internal authoring/generator and experimental content remain private.

Allowed fixes:

- P0/P1 release blockers discovered during closure.
- Narrow copy fixes for release-facing documentation.
- Narrow README/release-note updates.
- Narrow smoke/test additions if evidence is missing.

## 3. Non-Scope

Do not implement these in Phase 17:

- New cases or automatic promotion from experimental content.
- New proof techniques, including safe-cell difference semantics.
- Breaking Puzzle Schema v1 changes.
- New shipped DSL rule kinds.
- Solver architecture rewrite, SAT/WASM backend, or oracle expansion.
- Public editor, visual editor, UGC upload/share, backend, accounts, analytics, leaderboard, daily challenge, PWA/offline mode, or server-signed content.
- Broad visual redesign, landing page redesign, art direction work, or unrelated UI theming.
- Public player exposure of generator output, target layout, forced cells, candidate counts, proof internals, or authoring diagnostics.
- Fabricated playtest feedback or public difficulty calibration claims without real participant evidence.

## 4. Fixed Per-Round Workflow

At the start of every round:

1. Read this guide and `Role.md`.
2. Run `git status --short --branch`.
3. Choose one narrow round goal from the plan below.
4. Check for unrelated user or executor changes and leave them alone.

During implementation:

1. Keep `case-004` as default.
2. Keep the shipped case set stable unless a P0/P1 release blocker forces a documented rollback recommendation.
3. Do not change proof/solver/domain/content semantics unless a P0/P1 blocker requires it.
4. Keep player-facing UI free of target/candidate/forced/generator/authoring internals.
5. Do not record real playtest feedback unless it actually happened.
6. Keep difficulty calibration deferred unless real participant evidence exists.

Every round reply must include:

- round goal
- completed work
- Debug self-check
- architecture self-check
- validation commands and results
- commit hash and push result
- next round goal
- whether a buffer round was consumed

Progression rules:

- If validation fails, do not commit, do not push, and do not move to the next round.
- If validation passes but commit fails, do not move to the next round.
- If commit succeeds but push fails, do not move to the next round.
- Only after push succeeds may the executor continue.

## 5. Commit And Push Workflow

Prefer the project GitFlow wrapper:

```powershell
C:\Users\Administrator\.codex\skills\project-git-workflow\scripts\git\Status.cmd
C:\Users\Administrator\.codex\skills\project-git-workflow\scripts\git\CommitAndPush.cmd -Message "<message>" -Paths <phase-relevant paths>
```

Minimum validation before every successful round commit:

```powershell
pnpm lint
pnpm typecheck
pnpm test
pnpm build
git diff --check
```

Run local smoke for release closure:

```powershell
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StartDevServer.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Smoke.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StopDevServer.cmd
```

Do not stage unrelated files, `apps/web/dist`, `node_modules`, coverage output, local smoke logs, generated bulk datasets, cache files, or unaccepted generated cases.

## 6. Round Plan

### Round 1 - Release Closure Baseline

Goal:

- Create `docs/phase-17/` with issue register and MVP release checklist.
- Confirm shipped case count, default case, and release scope.

Architecture self-check:

- Release closure only; no new cases or mechanics.

### Round 2 - Release Notes And Known Limitations

Goal:

- Draft honest release notes and known limitations.
- State clearly that difficulty is internally scored but not playtest-calibrated.

Architecture self-check:

- No marketing overclaim or fabricated calibration.

### Round 3 - Playtest Intake Protocol

Goal:

- Prepare a lightweight playtest intake protocol and feedback log for future real participants.
- Record feedback only if real evidence is available during the phase.

Architecture self-check:

- No fabricated playtest feedback.

### Round 4 - Release Smoke And Secrecy Evidence

Goal:

- Run full validation, focused web smoke where feasible, local smoke, online HTTP checks, and boundary scans.
- Record evidence under `docs/phase-17/`.

Architecture self-check:

- Player secrecy and package boundaries remain intact.

### Round 5 - Buffer Fixes

Use this only for:

- P0/P1 release blockers;
- release-note clarity issues;
- smoke/test evidence gaps;
- docs evidence gaps.

Do not use this round for new cases, editor, UGC, new proof technique scope, new DSL, solver rewrite, or broad UI redesign.

### Round 6 - Final Validation And Report

Goal:

- Run full validation.
- Run local and online smoke.
- Produce `docs/phase-17-mvp-release-closure-honest-playtest-intake-final-report.md`.
- Confirm working tree is clean, final commit is pushed, and Pages deploy health is checked.

Required commands:

```powershell
pnpm lint
pnpm typecheck
pnpm test
pnpm build
git diff --check
git status --short --branch
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StartDevServer.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Smoke.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StopDevServer.cmd
```

## 7. PASS Criteria

Phase 17 passes only when all are true:

- Final report exists at `docs/phase-17-mvp-release-closure-honest-playtest-intake-final-report.md`.
- Full validation passes: lint, typecheck, tests, build, and `git diff --check`.
- MVP release checklist exists and is complete.
- Release decision exists and honestly states release status and caveats.
- Playtest intake protocol and feedback log exist; no fabricated feedback is recorded.
- Difficulty remains explicitly uncalibrated unless real playtest evidence is recorded.
- Local smoke and online HTTP smoke pass.
- `case-004` remains default.
- Shipped cases through `case-012` remain valid.
- Domain remains schema/solver/proof/oracle/generator/authoring/Zod/UI/fs-free.
- Solver, proof, generator, and authoring packages remain independent of React/Vite/browser UI code.
- Authoring/generator tooling is not imported by player-facing web code or shipped content.
- Experimental content remains out of default shipped content.
- Target reads remain limited to existing targetAccess, verification, tests, conclusion checking, and explicit developer-only surfaces.
- No public editor, UGC, backend, analytics, daily challenge, broad redesign, breaking schema migration, new proof technique, new case, or new shipped DSL rule enters this phase.
- Working tree is clean and final commit is pushed.

## 8. Debug Self-Check Template

Use this every round:

```text
Debug self-check:
- Smallest release/player workflow tested:
- Success path covered:
- Failure/secrecy path covered:
- Empty/stale/error state covered where relevant:
- Release notes checked:
- Smoke checked:
- Playtest evidence honesty checked:
- Regression risk:
```

## 9. Architecture Self-Check Template

Use this every round:

```text
Architecture self-check:
- Domain remains the source of truth for puzzle/rule/board types:
- Schema remains the content contract:
- Solver remains exact backend:
- Proof remains human explanation backend:
- Generator/authoring remain private maintainer tooling:
- Shipped content stayed stable:
- Default case-004 stayed stable:
- Target access stayed behind the narrow app boundary:
- Player marks stayed out of solver/proof facts:
- Developer-only data stayed gated:
- Public editor/UGC/backend/new DSL/new proof technique/new case scope avoided:
- Unrelated files left untouched:
```

## 10. Final Report Template

```markdown
# Phase 17 MVP Release Closure And Honest Playtest Intake Final Report

Status: READY_FOR_CHECK
Guide: `docs/phase-17-mvp-release-closure-honest-playtest-intake-goal-mode-execution-guide.md`
Phase: Phase 17 - MVP Release Closure And Honest Playtest Intake

## Summary
## Files Changed By Category
## MVP Release Checklist
## Release Decision
## Known Limitations
## Playtest Intake And Feedback Log
## Validation
## Smoke And Pages Evidence
## Boundary Scans
## Commits
## PASS Criteria
## Blockers Or Follow-Up Notes
```
