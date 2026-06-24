# Phase 14 Difference Authoring Heuristics And Candidate Repair Goal Mode Execution Guide

Date: 2026-06-24
Status: execution guide for the executor
Phase: Phase 14 - Difference Authoring Heuristics And Candidate Repair
Round budget: 14 executor rounds; rounds 1-10 are main implementation, rounds 11-13 are buffer/fix rounds, round 14 is final validation and report.

## 0. Direct Goal Prompt For Executor

You are executing Phase 14 of Room Axioms: Difference Authoring Heuristics And Candidate Repair.

Read this guide, `README.md`, `Role.md`, `docs/development-plan.md`, `docs/phase-13-difference-case-authoring-release-calibration-final-report.md`, `docs/phase-13/selection-stop-decision.md`, `docs/phase-13/proof-minimization-filter.md`, `docs/phase-13/search-template-smoke.md`, `docs/phase-12/local-scope-difference-semantics.md`, `packages/authoring`, `packages/generator`, `packages/proof`, `packages/schema`, `packages/solver`, `content/cases`, `content/experimental`, and `apps/web/src/content`.

Within 14 executor rounds:

- Convert Phase 13's stop evidence into better private authoring support for `LOCAL_SCOPE_DIFFERENCE` candidates.
- Add deterministic report-only tooling or heuristics that explicitly check whether a minimized no-guess reveal set still uses `LOCAL_SCOPE_DIFFERENCE`.
- Improve experimental difference candidate search around the known failure modes: redundant reveals that collapse into count saturation, and candidates with proof gaps or non-unique final guest layouts.
- Author or sample a small candidate set under `content/experimental/phase-14/`.
- Promote at most one shipped case only if it passes every promotion gate and the minimized or accepted reveal set still uses `LOCAL_SCOPE_DIFFERENCE`.
- If no candidate qualifies, keep shipped content unchanged and produce a clear stop decision with stronger evidence than Phase 13.
- Preserve `case-004` as the default case and preserve all existing shipped cases including `case-011`.
- Keep difficulty scores provisional and uncalibrated without real playtest evidence.
- Validate, commit, and push each successful round before moving on.

Use `$donextgoal` to execute this guide. When complete, report back to planner thread `019ef0df-a626-7181-9ca6-1cc75c1f4c47`.

## 1. Required Context

- `README.md`
- `AGENTS.md`
- `Role.md`
- `docs/development-plan.md`
- `docs/phase-13-difference-case-authoring-release-calibration-final-report.md`
- `docs/phase-13/quality-gate.md`
- `docs/phase-13/proof-minimization-filter.md`
- `docs/phase-13/rejection-log.md`
- `docs/phase-13/search-template-smoke.md`
- `docs/phase-13/selection-stop-decision.md`
- `docs/phase-12/local-scope-difference-semantics.md`
- `docs/phase-11/promotion-checklist.md`
- `docs/phase-11/promoted-case-evidence.md`
- `packages/authoring`
- `packages/generator`
- `packages/proof`
- `packages/schema`
- `packages/solver`
- `content/cases`
- `content/experimental`
- `apps/web/src/content`
- `apps/web/src/runtime`

Phase 13 is accepted. Treat its no-promotion result as useful evidence: the next problem is not lack of effort, but lack of authoring support for finding natural difference shapes that survive minimization.

## 2. Scope

Required deliverables:

- A final report at `docs/phase-14-difference-authoring-heuristics-candidate-repair-final-report.md`.
- A Phase 14 evidence folder under `docs/phase-14/`.
- A documented Phase 14 issue register and candidate strategy based on Phase 13 failure modes.
- A private authoring or generator enhancement that makes `LOCAL_SCOPE_DIFFERENCE` retention after minimization explicit and repeatable. Prefer the smallest API/CLI change that avoids duplicating proof semantics.
- Regression tests for the new retention check or heuristic.
- Experimental Phase 14 candidates under `content/experimental/phase-14/`, not wired into player content by default.
- Authoring CLI `report`, `score`, `minimize`, and any new Phase 14 retention evidence for reviewed candidates.
- A promotion or stop decision.
- At most one promoted shipped case under `content/cases`, only if every gate passes.
- Updated `apps/web/src/content/cases.ts`, shipped content tests, copy review, and runtime smoke only if a case is promoted.
- Boundary scans proving authoring/generator internals remain private.

Promotion gates:

- Schema parse passes.
- Target satisfies rules.
- Initial observations are satisfiable.
- Initial guest-layout count is bounded and not truncated.
- Final guest layout is unique.
- Proof/no-guess passes.
- The accepted or minimized reveal set includes `LOCAL_SCOPE_DIFFERENCE`.
- The difference move is not present only because redundant reveals were kept.
- Authoring `report` returns `ok: true`.
- Authoring `score` remains `calibratedWithRealPlaytest: false`.
- Authoring `minimize` evidence is preserved in docs.
- Web runtime/player path stays secret and stable.
- Rule/case copy is Chinese and player-readable if promoted.

## 3. Non-Scope

Do not implement these in Phase 14:

- New proof techniques, including safe-cell difference semantics.
- Breaking Puzzle Schema v1 changes.
- New shipped DSL rule kinds such as row/column `lineCount`, Manhattan distance, visibility, blocker rules, or path rules.
- Solver architecture rewrite, SAT/WASM backend, or oracle expansion.
- Public editor, visual editor, UGC upload/share, backend, accounts, analytics, leaderboard, daily challenge, PWA/offline mode, or server-signed content.
- Broad visual redesign, landing page redesign, art direction work, or unrelated UI theming.
- Public player exposure of generator output, target layout, forced cells, candidate counts, proof internals, or authoring diagnostics.
- Automatic promotion from generated output into shipped content.
- More than one promoted case unless planner explicitly expands scope.

## 4. Fixed Per-Round Workflow

At the start of every round:

1. Read this guide and `Role.md`.
2. Run `git status --short --branch`.
3. Choose one narrow round goal from the plan below.
4. Check for unrelated user or executor changes and leave them alone.

During implementation:

1. Prefer authoring/generator APIs over ad hoc JSON/string parsing.
2. Do not duplicate solver or proof semantics inside CLI glue.
3. Keep experimental candidates outside shipped content until a specific promotion decision is accepted.
4. Do not weaken caps, proof requirements, or minimization evidence to pass a candidate.
5. Keep `case-004` as default.
6. Keep player-facing copy plain Chinese if shipped content changes.
7. Keep target access behind existing verification/test/developer-only boundaries.

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

When candidate evidence or authoring/generator behavior changes, run focused package tests and relevant `pnpm authoring -- report|score|minimize|sample` commands. When shipped content or web selector files change, run local smoke through the project ops wrapper.

Do not stage unrelated files, `apps/web/dist`, `node_modules`, coverage output, local smoke logs, generated bulk datasets, cache files, or unaccepted generated cases.

## 6. Round Plan

### Round 1 - Phase 13 Failure Model

Goal:

- Create `docs/phase-14/` with issue register, failure taxonomy, and retention target.
- Summarize why candidate 001 collapsed after minimization and why candidate 002 failed proof/uniqueness.

Architecture self-check:

- Treat existing proof semantics as source of truth.
- Do not change shipped content.

### Round 2 - Retention Check Design

Goal:

- Design the smallest authoring or generator change that can report: before-minimize techniques, after-minimize techniques, and whether required techniques survived.
- Document CLI/API behavior before implementation.

Architecture self-check:

- The new check consumes public proof/authoring results instead of reimplementing deduction rules.

### Round 3 - Retention Check Implementation

Goal:

- Implement the retention check or report field.
- Add unit tests using Phase 12/13 fixtures, including a positive retained case if available and a negative drops-difference case.

Architecture self-check:

- Keep authoring private and out of player-facing app imports.

### Round 4 - Candidate Strategy And Templates

Goal:

- Add or revise report-only sampling/hand-authoring templates for natural nested-scope difference shapes.
- Document seed/cap policy and rejection categories.

Architecture self-check:

- Generator remains internal and report-only.
- Templates do not imply automatic promotion.

### Round 5 - Candidate Production

Goal:

- Produce a small Phase 14 candidate set under `content/experimental/phase-14/`.
- Run schema, report, score, minimize, and retention evidence.

Architecture self-check:

- Experimental content stays out of default selector.

### Round 6 - Candidate Repair Loop

Goal:

- Repair or discard candidates based on concrete evidence.
- Avoid keeping redundant reveals solely to preserve `LOCAL_SCOPE_DIFFERENCE`.

Architecture self-check:

- Quality gates remain stricter than case-count goals.

### Round 7 - Candidate Selection Or Stop Decision

Goal:

- Select one candidate for potential promotion, or write a stop decision if none qualifies.
- Record rejection reasons for all reviewed candidates.

Architecture self-check:

- Stop is acceptable if gates fail.

### Round 8 - Optional Shipped Promotion

Goal:

- If a candidate qualifies, copy it into `content/cases` and wire it into `apps/web/src/content/cases.ts`.
- Add content/runtime tests.

Architecture self-check:

- Default `case-004` remains stable.
- No experimental path is imported directly by the app.

### Round 9 - Copy, Hint, And Secrecy Review

Goal:

- Review promoted or selected candidate copy.
- Confirm hint text remains public-knowledge-only and developer diagnostics stay gated.

Architecture self-check:

- Copy changes do not alter mechanics.

### Round 10 - Runtime And Selector Smoke

Goal:

- Run selector/runtime smoke if shipped content changed.
- Record keyboard/mobile/player secrecy evidence when relevant.

Architecture self-check:

- Selector remains static-bundle compatible.

### Rounds 11-13 - Buffer Fixes

Use these only for:

- retention-check correctness issues;
- candidate validation failures;
- proof/minimization evidence gaps;
- runtime/hint/selector regressions caused by promoted content;
- copy review issues;
- docs evidence gaps.

Do not use buffer rounds for editor, UGC, new proof technique scope, new DSL, solver rewrite, or broad UI redesign.

### Round 14 - Final Validation And Report

Goal:

- Run full validation.
- Run focused authoring/generator/proof tests.
- Run authoring evidence for reviewed candidates.
- Run smoke if shipped content or web selector files changed.
- Produce `docs/phase-14-difference-authoring-heuristics-candidate-repair-final-report.md`.
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

Phase 14 passes only when all are true:

- Final report exists at `docs/phase-14-difference-authoring-heuristics-candidate-repair-final-report.md`.
- Full validation passes: lint, typecheck, tests, build, and `git diff --check`.
- Phase 13 failure modes are documented as Phase 14 authoring requirements.
- A repeatable private retention check or heuristic exists and is tested, or the final report explains why the smallest safe version was blocked.
- Candidate inventory and rejection log exist.
- Authoring report/score/minimize/retention evidence exists for reviewed candidates.
- If a case is promoted, it passes all promotion gates and keeps `LOCAL_SCOPE_DIFFERENCE` in the accepted or minimized reveal proof.
- If no case is promoted, the stop decision explains why and shipped content remains unchanged.
- Existing shipped cases, including `case-011`, remain valid.
- `case-004` remains default.
- Experimental Phase 14 content remains out of default shipped content unless explicitly promoted.
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
- Smallest retention/candidate workflow tested:
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
- Retention checks consume proof output rather than reimplementing proof rules:
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
# Phase 14 Difference Authoring Heuristics And Candidate Repair Final Report

Status: READY_FOR_CHECK
Guide: `docs/phase-14-difference-authoring-heuristics-candidate-repair-goal-mode-execution-guide.md`
Phase: Phase 14 - Difference Authoring Heuristics And Candidate Repair

## Summary
## Files Changed By Category
## Phase 13 Failure Model
## Retention Check Or Heuristic
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
