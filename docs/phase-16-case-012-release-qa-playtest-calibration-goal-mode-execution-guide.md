# Phase 16 Case 012 Release QA And Playtest Calibration Goal Mode Execution Guide

Date: 2026-06-24
Status: execution guide for the executor
Phase: Phase 16 - Case 012 Release QA And Playtest Calibration
Round budget: 8 executor rounds; rounds 1-5 are main QA/playtest preparation, rounds 6-7 are buffer/fix rounds, round 8 is final validation and report.

## 0. Direct Goal Prompt For Executor

You are executing Phase 16 of Room Axioms: Case 012 Release QA And Playtest Calibration.

Read this guide, `README.md`, `Role.md`, `docs/development-plan.md`, `docs/phase-15-retained-difference-candidate-search-promotion-final-report.md`, `docs/phase-15/promoted-case-evidence.md` if present, `docs/phase-15/candidate-inventory.md`, `docs/phase-11/playtest-protocol.md`, `docs/phase-11/playtest-feedback-log.md`, `content/cases/case-012.json`, `apps/web/src/content`, `apps/web/src/logic`, and `apps/web/src/runtime`.

Within 8 executor rounds:

- Treat Phase 15 as accepted and `case-012` as the newly shipped retained-difference case.
- Run a release QA pass focused on `case-012`: selector visibility, player copy, hint/runtime behavior, keyboard/mobile smoke, player secrecy, and Pages availability.
- Review `case-012` Chinese copy for plain-language readability. Make only narrow copy fixes if the current text is awkward, corrupted, or inconsistent with established wording.
- Prepare honest playtest calibration artifacts for `case-012`. Record real participant feedback only if it actually exists; otherwise keep the feedback log explicitly empty and difficulty uncalibrated.
- Fix only P0/P1 defects found in the case-012 player path. Document P2 follow-ups instead of expanding scope.
- Preserve `case-004` as the default case and preserve all shipped cases.
- Do not add new cases, proof techniques, DSL rules, editor scope, UGC, backend, analytics, or broad UI redesign.
- Validate, commit, and push each successful round before moving on.

Use `$donextgoal` to execute this guide. When complete, report back to planner thread `019ef0df-a626-7181-9ca6-1cc75c1f4c47`.

## 1. Required Context

- `README.md`
- `AGENTS.md`
- `Role.md`
- `docs/development-plan.md`
- `docs/phase-15-retained-difference-candidate-search-promotion-final-report.md`
- `docs/phase-15/search-target.md`
- `docs/phase-15/candidate-inventory.md`
- `docs/phase-15/rejection-log.md`
- `docs/phase-15/repair-loop.md`
- `docs/phase-11/playtest-protocol.md`
- `docs/phase-11/playtest-feedback-log.md`
- `content/cases/case-012.json`
- `content/cases`
- `apps/web/src/content`
- `apps/web/src/logic`
- `apps/web/src/runtime`
- `packages/authoring`
- `packages/proof`
- `packages/solver`

Phase 15 is accepted. `case-012` is shipped content and should be treated as release-candidate material, not experimental content.

## 2. Scope

Required deliverables:

- A final report at `docs/phase-16-case-012-release-qa-playtest-calibration-final-report.md`.
- A Phase 16 evidence folder under `docs/phase-16/`.
- A case-012 release QA checklist covering selector, default case preservation, content validation, hint/runtime behavior, player secrecy, responsive containment, keyboard navigation, and Pages smoke.
- Case-012 copy review. If copy changes are made, they must be narrow and must not change mechanics.
- Authoring `report`, `score`, and `minimize --require-technique LOCAL_SCOPE_DIFFERENCE` evidence for `content/cases/case-012.json`.
- Playtest protocol/log updates for case-012. Do not fabricate feedback.
- Issue register with P0/P1/P2 decisions.
- Focused tests and local/online smoke evidence.
- Boundary scans proving authoring/generator internals and experimental content remain private.

Allowed fixes:

- Narrow Chinese copy fixes in `case-012`.
- Narrow runtime/hint/player-secrecy fixes if Phase 16 smoke exposes a defect.
- Narrow test additions for case-012 release QA.
- Documentation and playtest protocol/log updates.

## 3. Non-Scope

Do not implement these in Phase 16:

- New cases or automatic promotion from experimental content.
- New proof techniques, including safe-cell difference semantics.
- Breaking Puzzle Schema v1 changes.
- New shipped DSL rule kinds such as row/column `lineCount`, Manhattan distance, visibility, blocker rules, path rules, or object-specific hidden actions.
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
2. Keep `case-012` in shipped content unless a P0/P1 defect justifies planner-visible rollback guidance in the final report.
3. Keep copy fixes plain Chinese and mechanically neutral.
4. Do not change proof/solver/domain semantics to make QA pass.
5. Keep player-facing UI free of target/candidate/forced/generator/authoring internals.
6. Do not record real playtest feedback unless it actually happened.

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

When `case-012` changes, run:

```powershell
pnpm authoring -- report content/cases/case-012.json
pnpm authoring -- score content/cases/case-012.json
pnpm authoring -- minimize content/cases/case-012.json --require-technique LOCAL_SCOPE_DIFFERENCE
```

When web-visible behavior changes, run local smoke through the project ops wrapper.

Do not stage unrelated files, `apps/web/dist`, `node_modules`, coverage output, local smoke logs, generated bulk datasets, cache files, or unaccepted generated cases.

## 6. Round Plan

### Round 1 - Release QA Baseline

Goal:

- Create `docs/phase-16/` with issue register and case-012 QA checklist.
- Re-run case-012 authoring report/score/minimize evidence and record the baseline.

Architecture self-check:

- `case-012` remains shipped.
- `case-004` remains default.

### Round 2 - Player Copy Review

Goal:

- Review case-012 title, case name, rule titles, rule flavor text, and visible web copy.
- Make narrow Chinese copy fixes only if needed.

Architecture self-check:

- Copy changes do not alter mechanics, target, rules, or initial observations.

### Round 3 - Runtime, Hint, And Secrecy QA

Goal:

- Verify case-012 selector order, runtime analysis, hint behavior, wrong-submission secrecy, and developer-only gating.
- Add or update focused tests only where evidence is missing.

Architecture self-check:

- Player mode does not expose target/candidate/forced/generator/authoring internals.

### Round 4 - Responsive, Keyboard, And Smoke Evidence

Goal:

- Run local smoke and focused in-app or browser smoke for case-012 where feasible.
- Record desktop/mobile/keyboard evidence and console-error status.

Architecture self-check:

- Avoid broad UI redesign; fix only concrete P0/P1 defects.

### Round 5 - Playtest Protocol And Feedback Log

Goal:

- Prepare or update a case-012 playtest protocol and feedback log.
- Record real feedback only if available; otherwise explicitly record that no real participant data exists.
- Keep public difficulty calibration deferred unless real evidence exists.

Architecture self-check:

- No fabricated playtest or difficulty claims.

### Rounds 6-7 - Buffer Fixes

Use these only for:

- P0/P1 player-path defects found in Phase 16 QA;
- copy readability defects;
- hint/runtime/player-secrecy regressions;
- test or smoke evidence gaps;
- docs evidence gaps.

Do not use buffer rounds for new cases, editor, UGC, new proof technique scope, new DSL, solver rewrite, or broad UI redesign.

### Round 8 - Final Validation And Report

Goal:

- Run full validation.
- Run case-012 authoring evidence.
- Run focused web/proof/authoring tests.
- Run local smoke and online HTTP smoke.
- Produce `docs/phase-16-case-012-release-qa-playtest-calibration-final-report.md`.
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

Phase 16 passes only when all are true:

- Final report exists at `docs/phase-16-case-012-release-qa-playtest-calibration-final-report.md`.
- Full validation passes: lint, typecheck, tests, build, and `git diff --check`.
- Case-012 authoring report/score/minimize evidence passes and retains `LOCAL_SCOPE_DIFFERENCE`.
- Case-012 is present in shipped content and selector order; `case-004` remains default.
- Existing shipped cases, including `case-011`, remain valid.
- Player copy review is complete; any copy changes are Chinese, plain-language, and mechanically neutral.
- Runtime/hint/player-secrecy QA is complete.
- Local smoke and online HTTP smoke pass.
- Playtest protocol/log honestly record whether real participant feedback exists.
- Difficulty scoring remains explicitly uncalibrated unless real playtest evidence is recorded.
- Domain remains schema/solver/proof/oracle/generator/authoring/Zod/UI/fs-free.
- Solver, proof, generator, and authoring packages remain independent of React/Vite/browser UI code.
- Authoring/generator tooling is not imported by player-facing web code or shipped content.
- Experimental Phase 15 content remains out of default shipped content except the deliberate `case-012` copy.
- Target reads remain limited to existing targetAccess, verification, tests, conclusion checking, and explicit developer-only surfaces.
- No public editor, UGC, backend, analytics, daily challenge, broad redesign, breaking schema migration, new proof technique, or new shipped DSL rule enters this phase.
- Working tree is clean and final commit is pushed.

## 8. Debug Self-Check Template

Use this every round:

```text
Debug self-check:
- Smallest case-012 player workflow tested:
- Success path covered:
- Failure/secrecy path covered:
- Empty/stale/error state covered where relevant:
- Copy regression checked:
- Keyboard/mobile smoke checked:
- Runtime/player secrecy checked:
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
- Case-012 copy changes, if any, stayed mechanically neutral:
- Experimental content stayed out of default shipped content except the deliberate case-012 copy:
- Default case-004 stayed stable:
- Target access stayed behind the narrow app boundary:
- Player marks stayed out of solver/proof facts:
- Developer-only data stayed gated:
- Public editor/UGC/backend/new DSL/new proof technique scope avoided:
- Unrelated files left untouched:
```

## 10. Final Report Template

```markdown
# Phase 16 Case 012 Release QA And Playtest Calibration Final Report

Status: READY_FOR_CHECK
Guide: `docs/phase-16-case-012-release-qa-playtest-calibration-goal-mode-execution-guide.md`
Phase: Phase 16 - Case 012 Release QA And Playtest Calibration

## Summary
## Files Changed By Category
## Case 012 QA Checklist
## Authoring Evidence
## Copy Review
## Runtime Hint And Secrecy QA
## Responsive Keyboard And Smoke Evidence
## Playtest Protocol And Feedback Log
## Validation
## Boundary Scans
## Commits
## PASS Criteria
## Blockers Or Follow-Up Notes
```
