# Phase 18 Public Playtest Launch Package And Metadata Cleanup Goal Mode Execution Guide

Date: 2026-06-24
Status: execution guide for the executor
Phase: Phase 18 - Public Playtest Launch Package And Metadata Cleanup
Round budget: 6 executor rounds; rounds 1-4 are launch-package and cleanup work, round 5 is buffer/fix work, round 6 is final validation and report.

## 0. Direct Goal Prompt For Executor

You are executing Phase 18 of Room Axioms: Public Playtest Launch Package And Metadata Cleanup.

Read this guide, `README.md`, `Role.md`, `docs/development-plan.md`, `docs/phase-17-mvp-release-closure-honest-playtest-intake-final-report.md`, `docs/phase-17/release-decision.md`, `docs/phase-17/release-notes.md`, `docs/phase-17/known-limitations.md`, `docs/phase-17/playtest-intake-protocol.md`, `docs/phase-17/playtest-feedback-log.md`, `content/cases`, `apps/web/src/content`, and the project workflow configs.

Within 6 executor rounds:

- Treat Phase 17 as accepted and the current 12-case build as an MVP release candidate for public playtest sharing.
- Prepare a public playtest launch package: share copy, tester instructions, feedback template, issue triage rules, release-candidate caveats, and links to the hosted build.
- Clean non-player-facing shipped-case metadata that still carries internal phase names, as long as mechanics, ids, targets, rules, observations, and shipped case set remain unchanged.
- Keep `case-004` as default and preserve shipped cases `case-001` through `case-012`.
- Do not add cases, mechanics, proof techniques, DSL/schema changes, editor scope, UGC, backend, analytics, daily challenge, or broad UI redesign.
- Do not fabricate playtest feedback. If real participant feedback is provided during the phase, record it exactly and route P0/P1 findings. If none exists, keep difficulty explicitly uncalibrated.
- Validate, commit, and push each successful round before moving on.

Use `$donextgoal` to execute this guide. When complete, report back to planner thread `019ef0df-a626-7181-9ca6-1cc75c1f4c47`.

## 1. Required Context

- `README.md`
- `AGENTS.md`
- `Role.md`
- `docs/development-plan.md`
- `docs/phase-17-mvp-release-closure-honest-playtest-intake-final-report.md`
- `docs/phase-17/release-decision.md`
- `docs/phase-17/release-notes.md`
- `docs/phase-17/known-limitations.md`
- `docs/phase-17/playtest-intake-protocol.md`
- `docs/phase-17/playtest-feedback-log.md`
- `docs/phase-17/release-smoke-boundary-evidence.md`
- `content/cases`
- `apps/web/src/content`
- `apps/web/src/runtime`
- `.codex/project-ops-workflow.json`
- `.codex/project-git-workflow.json`
- `.github/workflows`

Phase 17 is accepted. The build is a release candidate, not a fully playtest-calibrated public release. This phase makes that release candidate easy and honest to share with real testers.

## 2. Scope

Required deliverables:

- A final report at `docs/phase-18-public-playtest-launch-package-metadata-cleanup-final-report.md`.
- A Phase 18 evidence folder under `docs/phase-18/`.
- Public playtest launch package with:
  - hosted build link;
  - short tester instructions;
  - what feedback to collect;
  - how to report P0/P1/P2 issues;
  - clear caveat that difficulty is not calibrated.
- Metadata cleanup for shipped case records that contain internal phase labels in non-player-facing author/notes fields, if it can be done without changing puzzle behavior.
- Validation evidence that case ids, default case, shipped case count, target/rules/observations, and runtime secrecy remain stable.
- Local smoke and online HTTP smoke evidence.
- Boundary scans proving authoring/generator and experimental content remain private.

Allowed fixes:

- Narrow metadata/copy cleanup.
- Narrow release/playtest documentation improvements.
- Narrow smoke/test additions if required to prove metadata cleanup is behavior-preserving.
- P0/P1 release blockers discovered during launch package preparation.

## 3. Non-Scope

Do not implement these in Phase 18:

- New shipped cases or automatic promotion from experimental content.
- New proof techniques or changed proof semantics.
- Breaking Puzzle Schema v1 changes.
- New shipped DSL rule kinds.
- Solver architecture rewrite, SAT/WASM backend, or oracle expansion.
- Public editor, visual editor, UGC upload/share, backend, accounts, analytics, leaderboard, daily challenge, PWA/offline mode, or server-signed content.
- Broad visual redesign, landing page redesign, art direction work, or unrelated UI theming.
- Public player exposure of generator output, target layout, forced cells, candidate counts, proof internals, authoring diagnostics, or internal metadata.
- Fabricated playtest feedback or public difficulty calibration claims without real participant evidence.
- GitHub Release creation or version tagging unless the planner/user explicitly asks for it during this phase.

## 4. Fixed Per-Round Workflow

At the start of every round:

1. Read this guide and `Role.md`.
2. Run `git status --short --branch`.
3. Choose one narrow round goal from the plan below.
4. Check for unrelated user or executor changes and leave them alone.

During implementation:

1. Keep `case-004` as default.
2. Keep shipped cases `case-001` through `case-012`.
3. Do not change puzzle mechanics, target layouts, rules, or initial observations unless a P0/P1 blocker requires it.
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

Run local smoke for the launch package:

```powershell
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StartDevServer.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Smoke.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StopDevServer.cmd
```

Do not stage unrelated files, `apps/web/dist`, `node_modules`, coverage output, local smoke logs, generated bulk datasets, cache files, or unaccepted generated cases.

## 6. Round Plan

### Round 1 - Launch Package Baseline

Goal:

- Create `docs/phase-18/`.
- Draft the public playtest launch package outline and issue triage rules.
- Confirm shipped case count, default case, and current release-candidate posture.

Architecture self-check:

- Launch package only; no new content or mechanics.

### Round 2 - Metadata Cleanup

Goal:

- Audit shipped case metadata for internal phase labels.
- Replace internal phase author/notes labels with neutral maintainer-facing metadata where behavior is unaffected.
- Add or update tests/evidence proving puzzle ids, targets, rules, observations, default case, and selector entries remain stable.

Architecture self-check:

- Metadata cleanup must not change solver/proof outcomes or player-facing puzzle behavior.

### Round 3 - Public Tester Instructions

Goal:

- Produce concise public tester instructions and feedback template.
- State the hosted URLs, expected play contract, what to report, and what is intentionally out of scope.
- Keep difficulty uncalibrated unless real feedback is provided.

Architecture self-check:

- No marketing overclaim, no fabricated feedback, no analytics/backend scope.

### Round 4 - Launch Smoke And Secrecy Evidence

Goal:

- Run full validation, focused web tests, local smoke, online HTTP checks, and boundary scans.
- Record evidence under `docs/phase-18/`.

Architecture self-check:

- Player secrecy and package boundaries remain intact.

### Round 5 - Buffer Fixes

Use this only for:

- P0/P1 launch blockers;
- metadata cleanup regressions;
- release/playtest copy clarity issues;
- smoke/test evidence gaps;
- docs evidence gaps.

Do not use this round for new cases, editor, UGC, new proof technique scope, new DSL, solver rewrite, analytics, or broad UI redesign.

### Round 6 - Final Validation And Report

Goal:

- Run full validation.
- Run local and online smoke.
- Produce `docs/phase-18-public-playtest-launch-package-metadata-cleanup-final-report.md`.
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

Phase 18 passes only when all are true:

- Final report exists at `docs/phase-18-public-playtest-launch-package-metadata-cleanup-final-report.md`.
- Public playtest launch package exists under `docs/phase-18/`.
- Feedback template and issue triage rules exist; no fabricated feedback is recorded.
- Difficulty remains explicitly uncalibrated unless real playtest evidence is recorded.
- Internal phase labels are removed or explicitly justified in shipped-case metadata without changing puzzle behavior.
- Full validation passes: lint, typecheck, tests, build, and `git diff --check`.
- Local smoke and online HTTP smoke pass.
- `case-004` remains default.
- Shipped cases remain `case-001` through `case-012`.
- Shipped case mechanics, target/rules/observations, solver verification, proof verification, and selector availability remain stable.
- Domain remains schema/solver/proof/oracle/generator/authoring/Zod/UI/fs-free.
- Solver, proof, generator, and authoring packages remain independent of React/Vite/browser UI code.
- Authoring/generator tooling is not imported by player-facing web code or shipped content.
- Experimental content remains out of default shipped content.
- Target reads remain limited to existing targetAccess, verification, tests, conclusion checking, performance baseline, and explicit developer-only surfaces.
- No public editor, UGC, backend, analytics, daily challenge, broad redesign, breaking schema migration, new proof technique, new case, or new shipped DSL rule enters this phase.
- Working tree is clean and final commit is pushed.

## 8. Debug Self-Check Template

Use this every round:

```text
Debug self-check:
- Smallest release/player workflow tested:
- Metadata behavior impact checked:
- Success path covered:
- Failure/secrecy path covered:
- Empty/stale/error state covered where relevant:
- Public tester instructions checked:
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
- Metadata cleanup avoided mechanic changes:
- Target access stayed behind the narrow app boundary:
- Player marks stayed out of solver/proof facts:
- Developer-only data stayed gated:
- Public editor/UGC/backend/analytics/new DSL/new proof technique/new case scope avoided:
- Unrelated files left untouched:
```

## 10. Final Report Template

```markdown
# Phase 18 Public Playtest Launch Package And Metadata Cleanup Final Report

Status: READY_FOR_CHECK
Guide: `docs/phase-18-public-playtest-launch-package-metadata-cleanup-goal-mode-execution-guide.md`
Phase: Phase 18 - Public Playtest Launch Package And Metadata Cleanup

## Summary
## Files Changed By Category
## Launch Package
## Metadata Cleanup
## Playtest Intake And Feedback Honesty
## Validation
## Smoke And Pages Evidence
## Boundary Scans
## Commits
## PASS Criteria
## Blockers Or Follow-Up Notes
```
