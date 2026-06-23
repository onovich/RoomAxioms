# Phase 8 Release QA And Playtest Loop Goal Mode Execution Guide

Date: 2026-06-24
Status: execution guide for the executor
Phase: Phase 8 - Release QA And Playtest Loop
Round budget: 6 executor rounds; rounds 1-4 are release QA and fix rounds, round 5 is playtest/readiness synthesis, round 6 is final validation.

## 0. Direct Goal Prompt For Executor

You are executing Phase 8 of Room Axioms: Release QA And Playtest Loop.

Read this guide, `README.md`, `Role.md`, `docs/development-plan.md`, `docs/phase-7-mvp-content-ux-hardening-final-report.md`, `docs/phase-7-mvp-content-ux-hardening-goal-mode-execution-guide.md`, `docs/room-axioms-handoff/docs/01_PRODUCT_DESIGN.md`, `docs/room-axioms-handoff/docs/02_UI_UX_DESIGN.md`, `docs/room-axioms-handoff/docs/03_TECHNICAL_DESIGN.md`, `docs/room-axioms-handoff/docs/04_ARCHITECTURE.md`, `docs/room-axioms-handoff/docs/05_CODEX_HANDOFF.md`, `docs/room-axioms-handoff/docs/07_BACKLOG_AND_DECISIONS.md`, and the current `apps/web`, `content`, and workflow scripts.

Within 6 executor rounds:

- Validate the GitHub Pages release as a playable MVP with the 10-case content baseline.
- Turn Phase 7 smoke caveats into explicit release QA outcomes: fix the project smoke fixed-text mismatch, add repo-supported browser/E2E setup if feasible, or document an environment blocker with deterministic fallback.
- Run focused release QA over content selection, wrong-submission secrecy, hints, keyboard navigation, screen-reader labels, responsive viewports, developer-mode gating, and deployment paths.
- Profile the player runtime path against the 100 ms P95 product target and either improve it or produce a precise Phase 9/maintenance optimization note with measured evidence.
- Prepare a real playtest protocol and feedback log for 5-10 target players. Do not fabricate external participant results; record only actual user-supplied feedback, internal QA observations, and any blockers preventing external playtest.
- Fix P0/P1 defects discovered during QA/playtest. Defer P2 polish unless it is tiny and clearly release-relevant.
- Produce an MVP release-readiness decision: ready, ready with known caveats, or not ready, with concrete release blockers.
- Validate, commit, and push each successful round before moving on.

Use `$donextgoal` to execute this guide. When complete, report back to planner thread `019ef0df-a626-7181-9ca6-1cc75c1f4c47`.

## 1. Required Context

- `README.md`
- `AGENTS.md`
- `Role.md`
- `docs/development-plan.md`
- `docs/phase-7-mvp-content-ux-hardening-final-report.md`
- `docs/phase-7-mvp-content-ux-hardening-goal-mode-execution-guide.md`
- `docs/phase-6-web-runtime-integration-final-report.md`
- `docs/room-axioms-handoff/README.md`
- `docs/room-axioms-handoff/docs/01_PRODUCT_DESIGN.md`
- `docs/room-axioms-handoff/docs/02_UI_UX_DESIGN.md`
- `docs/room-axioms-handoff/docs/03_TECHNICAL_DESIGN.md`
- `docs/room-axioms-handoff/docs/04_ARCHITECTURE.md`
- `docs/room-axioms-handoff/docs/05_CODEX_HANDOFF.md`
- `docs/room-axioms-handoff/docs/06_RULE_DSL_SPEC.md`
- `docs/room-axioms-handoff/docs/07_BACKLOG_AND_DECISIONS.md`
- `content/cases`
- `apps/web/src`
- `.github/workflows`
- `.codex/project-ops-workflow.json`
- launcher scripts such as `StartLocalTest.cmd`, `OpenOnlineTest.cmd`, `StartDevServer.cmd`, and `Smoke.cmd` wrappers

Phase 7 is accepted. Treat the 10-case MVP as the content baseline. Phase 8 is a release-readiness and QA loop, not a new feature phase.

## 2. Scope

Phase 8 completes RA-017 and the release gates around Phase 7's MVP baseline.

Required deliverables:

- A release QA checklist/report document under `docs/`, preferably `docs/phase-8-release-qa-playtest-loop-final-report.md` at completion and smaller QA/playtest artifacts if useful.
- A reproducible Pages release smoke path covering:
  - online URL loads;
  - app starts at the expected base path;
  - default case is case-004;
  - selector lists 10 cases;
  - at least one 3x3 and one 4x4 case can be loaded;
  - no console errors in deterministic browser smoke when the available browser tool supports it.
- The project smoke fixed-text mismatch fixed, or a documented reason it cannot be fixed in this phase. Prefer updating the expected health-check text/config to match the current Vite HTML or app-visible text.
- Browser/E2E posture clarified:
  - If adding Playwright is feasible within repo policy, add a minimal locked setup and run Chromium at minimum; run Firefox/WebKit when browser binaries are available.
  - If Playwright/browser binaries cannot be installed, keep deterministic in-app browser/HTTP smoke and record the blocker.
- A playtest protocol that can be handed to 5-10 target players, including tasks, observation prompts, failure taxonomy, and privacy-safe feedback fields.
- A playtest feedback log template and any real feedback actually collected during the phase.
- A P0/P1 issue list with status and fixes:
  - P0: blocks loading, completion, content validity, answer secrecy, or release deployment.
  - P1: major usability, accessibility, performance, or responsive regressions that materially hurt MVP play.
  - P2: polish or expansion ideas to defer.
- Performance evidence for the player runtime path:
  - current P95 and worst sample for representative 4x4 player runtime;
  - whether the 100 ms target is met locally/CI;
  - if not met, a clear bottleneck hypothesis and recommended next optimization.
- Release readiness decision with caveats and next steps.

## 3. Non-Scope

Do not implement these in Phase 8:

- Generator v1, difficulty auto-generation, minimization tools, internal editor, UGC, new DSL/rule semantics, new scope kinds, or new object kinds.
- New cases beyond the 10-case MVP baseline unless a replacement is required to fix a release-blocking validation issue.
- Large UI redesign, new art direction, audio, story campaign, monetization, analytics, leaderboard, remote backend, daily challenge, PWA/offline mode, or save/progress system expansion.
- Fabricated playtest participant results. If no external participants are available, report the gap and provide the protocol/log for the user to run.
- Player-facing solver internals, forced-cell overlays, target overlays, candidate counts, or developer verification data.
- Rewriting solver/proof/domain internals unless a release-blocking bug proves a narrow fix is needed.

## 4. Fixed Per-Round Workflow

At the start of every round:

1. Read this guide and `Role.md`.
2. Run `git status --short --branch`.
3. Choose one narrow round goal from the plan below.
4. Check for unrelated user changes and leave them alone.

During implementation:

1. Classify every finding as P0/P1/P2 before fixing.
2. Fix P0/P1 before P2.
3. Keep content, schema, solver, proof, runtime, and UI boundaries intact.
4. Do not loosen validation or hide failures to pass release QA.
5. Keep player-mode secrecy and developer-mode gating as release-critical.
6. Treat smoke/E2E failures as release signals unless there is a concrete environment blocker.
7. Record measured evidence for performance and browser smoke claims.
8. Keep generated reports, screenshots, traces, caches, and browser binaries out of git unless intentionally small docs artifacts.

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

For release QA rounds, also run smoke workflows when feasible:

```powershell
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StartDevServer.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Smoke.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StopDevServer.cmd
```

Do not stage unrelated files, `apps/web/dist`, `node_modules`, coverage output, Playwright reports, traces, caches, screenshots, local port logs, or generated browser binaries.

## 6. Round Plan

### Round 1 - Release QA Baseline And Issue Register

Goal:

- Create a release QA checklist and issue register for Phase 8.
- Confirm the 10-case MVP baseline, current Pages deployment, current smoke caveats, and current performance finding.
- Add or update documentation that tracks P0/P1/P2 findings and release-readiness criteria.

Architecture self-check:

- QA documentation maps findings to existing product contracts and package boundaries.
- No implementation changes are made before the baseline is clear unless a trivial docs fix is needed.

### Round 2 - Smoke And Deployment Gate Hardening

Goal:

- Fix the `StartDevServer.cmd` / `Smoke.cmd` fixed-text health-check mismatch or update the project ops config that drives it.
- Verify local dev HTTP smoke and online Pages smoke.
- If feasible, add minimal browser/E2E tooling that is lockfile-pinned and static-site friendly. If not feasible, document the exact environment blocker and keep deterministic fallback smoke.

Architecture self-check:

- Smoke checks assert user-observable release behavior, not implementation trivia.
- Tooling additions do not require a backend or generated artifacts in git.

### Round 3 - Player Flow, Accessibility, And Responsive QA

Goal:

- Run focused QA over case selection, wrong submission secrecy, hint proof display, keyboard navigation, screen-reader labels, mobile tabs, and responsive viewports.
- Fix P0/P1 regressions found in these flows.
- Confirm developer-only target/forced/candidate data remains gated.

Architecture self-check:

- Accessibility labels describe public player knowledge only.
- UI fixes do not duplicate solver/proof semantics.

### Round 4 - Runtime Performance And Stability

Goal:

- Profile representative player runtime analysis and identify why the 100 ms target is or is not met.
- Apply narrow optimizations only when they are low-risk and backed by tests.
- Keep a measured performance note if the target remains unmet, including current P95, worst sample, and likely next work.
- Confirm no solver truncation/cap behavior is hidden from developer mode.

Architecture self-check:

- Optimizations preserve solver/proof correctness and public package boundaries.
- Performance tests remain regression guards, not brittle machine-specific promises.

### Round 5 - Playtest Protocol, Feedback Log, And Readiness Synthesis

Goal:

- Produce a playtest protocol for 5-10 target players with task list, observation prompts, privacy-safe feedback fields, and severity taxonomy.
- Add a feedback log template and record any real feedback available during the phase.
- Convert QA/playtest findings into release decision inputs: fixed, accepted caveat, or deferred.

Architecture self-check:

- No fake external results are recorded.
- Findings map to concrete product behavior and release risk.

### Round 6 - Final Validation And Release Readiness Report

Goal:

- Run full validation.
- Run local/online smoke and E2E/browser checks where feasible.
- Confirm GitHub Pages workflow is green after the final push.
- Produce final executor report back to planner.

Required commands:

```powershell
pnpm lint
pnpm typecheck
pnpm test
pnpm build
git diff --check
git status --short --branch
```

Run smoke workflows when feasible:

```powershell
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StartDevServer.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Smoke.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StopDevServer.cmd
```

Final report must include:

- files changed by category
- release QA checklist summary
- P0/P1/P2 issue register and outcomes
- local smoke, online smoke, browser/E2E results
- Pages workflow run id and result
- playtest protocol/log summary
- actual feedback collected, or explicit note that external playtest was not available
- performance measurements and 100 ms target status
- validation results
- boundary scans
- release readiness decision
- commit hashes
- push status
- PASS criteria status
- blockers or notes for Phase 9 Generator And Expansion Spike

## 7. PASS Criteria

Phase 8 passes only when all are true:

- Final report exists at `docs/phase-8-release-qa-playtest-loop-final-report.md`.
- Full validation passes: lint, typecheck, tests, build, and `git diff --check`.
- GitHub Pages deploy is green after final push and online URL returns HTTP 200.
- Local and online smoke are either passing or have concrete environment blockers; the Phase 7 fixed-text smoke mismatch is fixed or explicitly routed with evidence.
- Release QA checklist covers 10-case loading, default case, case switching, completion path, wrong-submission secrecy, hints, keyboard, screen-reader labels, responsive viewports, developer gating, and deployment.
- All P0 findings are fixed.
- P1 findings are fixed or explicitly accepted as release caveats with rationale.
- P2 findings are deferred.
- Playtest protocol and feedback log exist; actual feedback is recorded only if real participants or user-supplied observations are available.
- Performance evidence is recorded; 100 ms P95 status is either met or documented as an accepted caveat/next optimization target.
- Domain remains schema/solver/proof/oracle/Zod/UI/fs-free.
- Solver/proof packages remain independent of React/Vite/browser UI code.
- Target reads remain limited to targetAccess, verification, and tests.
- Player marks are not sent as solver/proof facts.
- Player mode does not expose target, forced-cell, candidate-count, no-guess, or developer-only data.
- No generator, editor, new DSL/backend, new case expansion, broad redesign, or deferred scope entered this phase.
- Working tree is clean.

## 8. Debug Self-Check Template

Use this every round:

```text
Debug self-check:
- Smallest release flow tested:
- Success path covered:
- Failure/error/empty/stale/truncated path covered:
- Smoke or browser coverage checked:
- Accessibility/keyboard checked:
- Performance checked:
- QA finding severity:
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
- Web runtime consumes public solver/proof APIs only:
- UI did not duplicate solver/proof semantics:
- Target access stayed behind the narrow app boundary:
- Player marks stayed out of solver/proof facts:
- Developer-only data stayed gated:
- Release tooling stayed static-site compatible:
- Deferred generator/editor/new DSL/backend scope avoided:
- Unrelated files left untouched:
```

## 10. Final Report Template

```markdown
# Phase 8 Release QA And Playtest Loop Final Report

Status: READY_FOR_CHECK
Guide: `docs/phase-8-release-qa-playtest-loop-goal-mode-execution-guide.md`
Phase: Phase 8 - Release QA And Playtest Loop

## Summary
## Files Changed By Category
## Release QA Checklist
## P0/P1/P2 Issue Register
## Smoke And Browser Results
## GitHub Pages Release
## Playtest Protocol And Feedback
## Performance Findings
## Fixes And Accepted Caveats
## Validation
## Boundary Scans
## Release Readiness Decision
## Commits
## PASS Criteria
## Phase 9 Notes
```
