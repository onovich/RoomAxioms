# Phase 13 Difference Case Authoring And Release Calibration Goal Mode Execution Guide

Date: 2026-06-24
Status: execution guide for the executor
Phase: Phase 13 - Difference Case Authoring And Release Calibration
Round budget: 12 executor rounds; rounds 1-8 are main implementation, rounds 9-11 are buffer/fix rounds, round 12 is final validation and report.

## 0. Direct Goal Prompt For Executor

You are executing Phase 13 of Room Axioms: Difference Case Authoring And Release Calibration.

Read this guide, `README.md`, `Role.md`, `docs/development-plan.md`, `docs/phase-12-local-scope-difference-content-expansion-final-report.md`, `docs/phase-12/promotion-decision.md`, `docs/phase-12/local-scope-difference-semantics.md`, `packages/authoring`, `packages/generator`, `packages/proof`, `packages/schema`, `packages/solver`, `content/cases`, `content/experimental`, and `apps/web/src/content`.

Within 12 executor rounds:

- Use the already accepted `LOCAL_SCOPE_INTERSECTION` and `LOCAL_SCOPE_DIFFERENCE` proof techniques to author or sample a naturally mid-band candidate.
- Avoid adding new proof techniques, new DSL kinds, schema changes, solver changes, or public editor scope.
- Prefer a case whose minimal no-guess reveal set still uses `LOCAL_SCOPE_DIFFERENCE`; do not promote a case whose difference requirement only exists because redundant reveals were kept.
- Promote at most one shipped case if it passes all Phase 11 promotion gates and improves the shipped pacing curve.
- If no candidate qualifies, keep shipped content unchanged and produce a clear stop decision with evidence.
- Preserve `case-004` as the default case and preserve existing shipped cases including `case-011`.
- Keep difficulty scores provisional and uncalibrated without real playtest evidence.
- Validate, commit, and push each successful round before moving on.

Use `$donextgoal` to execute this guide. When complete, report back to planner thread `019ef0df-a626-7181-9ca6-1cc75c1f4c47`.

## 1. Required Context

- `README.md`
- `AGENTS.md`
- `Role.md`
- `docs/development-plan.md`
- `docs/phase-12-local-scope-difference-content-expansion-final-report.md`
- `docs/phase-12/promotion-decision.md`
- `docs/phase-12/authoring-score-minimize-evidence.md`
- `docs/phase-12/local-scope-difference-semantics.md`
- `docs/phase-11/promoted-case-evidence.md`
- `docs/phase-11/promotion-decisions.md`
- `docs/phase-10/authoring-cli-maintainer-workflow.md`
- `packages/authoring`
- `packages/generator`
- `packages/proof`
- `packages/schema`
- `packages/solver`
- `content/cases`
- `content/experimental`
- `apps/web/src/content`
- `apps/web/src/runtime`

Phase 12 is accepted. Treat `LOCAL_SCOPE_DIFFERENCE` as available but intentionally narrow: guest deductions only, proof-side only, no schema/solver/DSL change.

## 2. Scope

Required deliverables:

- A final report at `docs/phase-13-difference-case-authoring-release-calibration-final-report.md`.
- A Phase 13 evidence folder under `docs/phase-13/`.
- Candidate inventory and rejection log for hand-authored or sampled difference candidates.
- Authoring CLI `report`, `score`, and `minimize` evidence for selected candidates.
- A proof-technique-retention check: the minimized or accepted reveal set must still include `LOCAL_SCOPE_DIFFERENCE` if promoted.
- At most one promoted shipped case under `content/cases`, only if all gates pass.
- Updated `apps/web/src/content/cases.ts` and content/runtime tests only if a case is promoted.
- Copy review for any promoted case using current plain Chinese terms.
- Runtime/hint/player secrecy smoke for any promoted case.
- Playtest protocol or feedback log updates; no fabricated participant feedback.
- A release decision explaining promotion or stop.

Promotion gates:

- Schema parse passes.
- Target satisfies rules.
- Initial observations are satisfiable.
- Initial guest-layout count is bounded and not truncated.
- Final guest layout is unique.
- Proof/no-guess passes.
- Proof techniques include `LOCAL_SCOPE_DIFFERENCE` in the accepted reveal set.
- Authoring `report` returns `ok: true`.
- Authoring `score` remains `calibratedWithRealPlaytest: false`.
- Authoring `minimize` either preserves difference or the phase records why the non-minimized case is not promoted.
- Web runtime/player path stays secret and stable.
- Rule/case copy is Chinese and player-readable.

## 3. Non-Scope

Do not implement these in Phase 13:

- New proof techniques, including safe-cell difference semantics.
- Breaking Puzzle Schema v1 changes.
- New shipped DSL rule kinds such as row/column `lineCount`, Manhattan distance, visibility, or blocker rules.
- Solver architecture rewrite, SAT/WASM backend, or oracle expansion.
- Public editor, visual editor, UGC upload/share, backend, accounts, analytics, leaderboard, daily challenge, PWA/offline mode, or server-signed content.
- Broad visual redesign, landing page redesign, or unrelated UI theming.
- Public player exposure of generator, target layout, forced cells, candidate counts, proof internals, or authoring diagnostics.
- Automatic promotion from generated output into shipped content.
- More than one promoted case unless planner explicitly expands scope.

## 4. Fixed Per-Round Workflow

At the start of every round:

1. Read this guide and `Role.md`.
2. Run `git status --short --branch`.
3. Choose one narrow round goal from the plan below.
4. Check for unrelated user or executor changes and leave them alone.

During implementation:

1. Use authoring CLI evidence instead of duplicating validation logic.
2. Keep experimental candidates outside shipped content until a specific promotion decision is accepted.
3. Do not weaken caps, proof requirements, or minimization evidence to pass a candidate.
4. Keep `case-004` as default.
5. Keep player-facing copy plain Chinese.
6. Keep target access behind existing verification/test/developer-only boundaries.

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

When candidate evidence changes, run relevant `pnpm authoring -- report|score|minimize` commands. When shipped content or web selector files change, run local smoke through the project ops wrapper.

Do not stage unrelated files, `apps/web/dist`, `node_modules`, coverage output, local smoke logs, generated bulk datasets, cache files, or unaccepted generated cases.

## 6. Round Plan

### Round 1 - Candidate Quality Baseline

Goal:

- Create `docs/phase-13/` with quality gate, issue register, and pacing target.
- Re-run authoring evidence for Phase 12 fixture and document why it is not promoted.

Architecture self-check:

- No new proof or DSL scope.
- Phase 12 fixture remains experimental unless quality gate changes with evidence.

### Round 2 - Candidate Search Plan

Goal:

- Define hand-authoring and generator sampling templates for natural difference candidates.
- Record seed/cap policy and rejection categories.

Architecture self-check:

- Generator remains report-only.
- Search plan does not write shipped content.

### Round 3 - Candidate Generation Or Hand Authoring

Goal:

- Produce a small candidate set under `content/experimental/phase-13/`.
- Validate schema and basic rule satisfaction.

Architecture self-check:

- Experimental content stays out of default selector.

### Round 4 - Proof And Minimization Filtering

Goal:

- Run authoring report/score/minimize for candidates.
- Keep only candidates whose accepted or minimized reveal set still uses `LOCAL_SCOPE_DIFFERENCE`.

Architecture self-check:

- Technique retention is an explicit promotion gate.

### Round 5 - Candidate Selection Or Stop Decision

Goal:

- Select one candidate for potential promotion, or write a stop decision if none qualifies.
- Record rejection reasons for all reviewed candidates.

Architecture self-check:

- Quality gate beats case count.

### Round 6 - Optional Shipped Promotion

Goal:

- If a candidate qualifies, copy it into `content/cases` and wire it into `apps/web/src/content/cases.ts`.
- Add content/runtime tests.

Architecture self-check:

- Default `case-004` remains stable.
- No experimental path is imported directly by the app.

### Round 7 - Copy And Hint Review

Goal:

- Review promoted or selected candidate copy.
- Confirm hint text remains public-knowledge-only and developer diagnostics stay gated.

Architecture self-check:

- Copy changes do not alter mechanics.

### Round 8 - Runtime, Selector, And Accessibility Smoke

Goal:

- Run selector/runtime smoke for promoted content if any.
- Record keyboard/mobile/player secrecy evidence.

Architecture self-check:

- Selector remains static-bundle compatible.

### Rounds 9-11 - Buffer Fixes

Use these only for:

- candidate validation failures;
- proof/minimization evidence gaps;
- runtime/hint/selector regressions caused by promoted content;
- copy review issues;
- docs evidence gaps.

Do not use buffer rounds for editor, UGC, new proof technique scope, new DSL, or broad UI redesign.

### Round 12 - Final Validation And Report

Goal:

- Run full validation.
- Run authoring evidence for selected/promoted candidates.
- Run smoke if shipped content or web selector files changed.
- Produce `docs/phase-13-difference-case-authoring-release-calibration-final-report.md`.
- Confirm working tree is clean, final commit is pushed, and Pages deploy health is checked if web-visible files changed.

Required commands:

```powershell
pnpm lint
pnpm typecheck
pnpm test
pnpm build
git diff --check
git status --short --branch
```

If shipped content or selector files changed, also run:

```powershell
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StartDevServer.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Smoke.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StopDevServer.cmd
```

## 7. PASS Criteria

Phase 13 passes only when all are true:

- Final report exists at `docs/phase-13-difference-case-authoring-release-calibration-final-report.md`.
- Full validation passes: lint, typecheck, tests, build, and `git diff --check`.
- Candidate inventory and rejection log exist.
- Authoring report/score/minimize evidence exists for reviewed candidates.
- If a case is promoted, it passes all promotion gates and keeps `LOCAL_SCOPE_DIFFERENCE` in the accepted reveal proof.
- If no case is promoted, the stop decision explains why and shipped content remains unchanged.
- Existing shipped cases, including `case-011`, remain valid.
- `case-004` remains default.
- Experimental Phase 13 content remains out of default shipped content unless explicitly promoted.
- Difficulty scoring remains explicitly uncalibrated unless real playtest evidence is recorded.
- Domain remains schema/solver/proof/oracle/generator/authoring/Zod/UI/fs-free.
- Solver, proof, generator, and authoring packages remain independent of React/Vite/browser UI code.
- Authoring tooling is not imported by player-facing web code or shipped content.
- Target reads remain limited to existing targetAccess, verification, tests, and explicit developer-only surfaces.
- No public editor, UGC, backend, analytics, daily challenge, broad redesign, breaking schema migration, new proof technique, or new shipped DSL rule enters this phase.
- Working tree is clean and final commit is pushed.

## 8. Debug Self-Check Template

Use this every round:

```text
Debug self-check:
- Smallest candidate/player workflow tested:
- Success path covered:
- Failure/rejection path covered:
- Empty/no-candidate path covered:
- Cap/truncation status checked:
- Difference technique retention checked:
- Runtime/player secrecy checked:
- Copy regression checked:
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
- Generator remains internal sampling/minimization/scoring support:
- Authoring CLI consumes public APIs instead of duplicating semantics:
- Experimental content stayed out of default shipped content unless explicitly copied and promoted:
- Default case-004 stayed stable:
- Target access stayed behind the narrow app boundary:
- Player marks stayed out of solver/proof facts:
- Developer-only data stayed gated:
- Public editor/UGC/backend/new DSL/new proof technique scope avoided:
- Unrelated files left untouched:
```

## 10. Final Report Template

```markdown
# Phase 13 Difference Case Authoring And Release Calibration Final Report

Status: READY_FOR_CHECK
Guide: `docs/phase-13-difference-case-authoring-release-calibration-goal-mode-execution-guide.md`
Phase: Phase 13 - Difference Case Authoring And Release Calibration

## Summary
## Files Changed By Category
## Candidate Inventory
## Authoring Evidence
## Minimization And Technique Retention
## Promotion Or Stop Decision
## Runtime And UI Evidence
## Copy Review
## Validation
## Boundary Scans
## Commits
## PASS Criteria
## Blockers Or Follow-Up Notes
```
