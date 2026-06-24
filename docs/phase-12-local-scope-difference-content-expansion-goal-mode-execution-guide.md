# Phase 12 Local Scope Difference And Content Expansion Goal Mode Execution Guide

Date: 2026-06-24
Status: execution guide for the executor
Phase: Phase 12 - Local Scope Difference And Content Expansion
Round budget: 14 executor rounds; rounds 1-10 are main implementation, rounds 11-13 are buffer/fix rounds, round 14 is final validation and report.

## 0. Direct Goal Prompt For Executor

You are executing Phase 12 of Room Axioms: Local Scope Difference And Content Expansion.

Read this guide, `README.md`, `Role.md`, `docs/development-plan.md`, `docs/phase-11-candidate-promotion-playtest-calibration-final-report.md`, `docs/phase-9/technique-expansion-decision.md`, `docs/phase-10/local-scope-intersection-semantics.md`, `packages/proof`, `packages/solver`, `packages/schema`, `packages/authoring`, `packages/generator`, `content/cases`, `content/experimental`, and `apps/web/src/runtime`.

Within 14 executor rounds:

- Implement and validate proof-side `LOCAL_SCOPE_DIFFERENCE` using current Puzzle Schema v1 and existing local-count DSL semantics only.
- Keep every emitted deduction explainable from public rules, public observations, and prior human deductions.
- Add positive, negative, solver-backed validation, no-guess verifier, and stable rendering coverage.
- Create one or two experimental fixtures that genuinely need `LOCAL_SCOPE_DIFFERENCE`.
- Use the private authoring CLI to report, score, and minimize those fixtures.
- Promote at most one validated case into shipped content if it passes the same Phase 11 promotion gates.
- Preserve `case-004` as the default case.
- Preserve player secrecy and plain Chinese rule/case copy.
- Validate, commit, and push each successful round before moving on.

Use `$donextgoal` to execute this guide. When complete, report back to planner thread `019ef0df-a626-7181-9ca6-1cc75c1f4c47`.

## 1. Required Context

- `README.md`
- `AGENTS.md`
- `Role.md`
- `docs/development-plan.md`
- `docs/phase-11-candidate-promotion-playtest-calibration-final-report.md`
- `docs/phase-11/`
- `docs/phase-9/technique-expansion-decision.md`
- `docs/phase-10/local-scope-intersection-semantics.md`
- `docs/phase-10/authoring-cli-maintainer-workflow.md`
- `packages/proof`
- `packages/solver`
- `packages/schema`
- `packages/authoring`
- `packages/generator`
- `content/cases`
- `content/experimental`
- `apps/web/src/runtime`
- `apps/web/src/content`

Phase 11 is accepted. Treat `LOCAL_SCOPE_INTERSECTION`, `case-011`, and the private authoring CLI as stable inputs. `LOCAL_SCOPE_DIFFERENCE` is reserved but not yet implemented in shipped proof behavior.

## 2. Scope

Required deliverables:

- A final report at `docs/phase-12-local-scope-difference-content-expansion-final-report.md`.
- A Phase 12 evidence folder under `docs/phase-12/`.
- Exact documented semantics for `LOCAL_SCOPE_DIFFERENCE`.
- Proof emission for `LOCAL_SCOPE_DIFFERENCE`.
- Solver-backed deduction validation proving emitted deductions are entailed.
- Negative tests proving no reverse implication, hidden-target, unsupported-overlap, or intersection-only cases are misclassified as difference.
- No-guess verifier regression where difference closes a gap or prevents a guess point.
- Stable proof rendering for the new technique.
- Experimental fixtures under `content/experimental/phase-12/`.
- Authoring CLI report/score/minimize evidence for those fixtures.
- At most one promoted shipped case, only if all Phase 11 promotion gates pass.
- Runtime/hint tests if a promoted or experimental case exercises the new proof technique through player hints.
- Documentation of any candidate rejected by the quality gate.

`LOCAL_SCOPE_DIFFERENCE` should remain proof-side only. It must not require schema changes, solver contract changes, new DSL rules, new UI scope mechanics, or target-layout access.

## 3. Non-Scope

Do not implement these in Phase 12:

- Public editor, visual editor, UGC upload/share, backend, accounts, analytics, leaderboard, daily challenge, PWA/offline mode, or server-signed content.
- Breaking Puzzle Schema v1 changes.
- New shipped DSL rule kinds such as row/column `lineCount`, Manhattan distance, visibility, or blocker rules.
- SAT/WASM solver replacement or broad solver architecture rewrite.
- Broad visual redesign, landing page redesign, or unrelated UI theming.
- Public player exposure of generator, target layout, forced cells, candidate counts, proof internals, or authoring diagnostics.
- Automatic promotion from generator output into shipped content.
- Public difficulty labels calibrated from non-existent playtest data.
- More than one promoted shipped case unless the planner explicitly accepts expanding scope.

## 4. Fixed Per-Round Workflow

At the start of every round:

1. Read this guide and `Role.md`.
2. Run `git status --short --branch`.
3. Choose one narrow round goal from the plan below.
4. Check for unrelated user or executor changes and leave them alone.

During implementation:

1. Define proof semantics before emission changes.
2. Validate each new deduction with solver-backed contradiction checks.
3. Keep proof rendering human-readable and free of solver trace narration.
4. Keep experimental content out of shipped content unless explicitly promoted.
5. Preserve `case-004` as default.
6. Preserve plain Chinese player-facing copy.
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

When proof logic changes, run `pnpm --filter @room-axioms/proof test`. When authoring evidence changes, run relevant `pnpm authoring -- ...` commands. When shipped content or web selector files change, run local smoke through the project ops wrapper.

Do not stage unrelated files, `apps/web/dist`, `node_modules`, coverage output, local smoke logs, generated bulk datasets, cache files, or unaccepted generated cases.

## 6. Round Plan

### Round 1 - Difference Semantics And Acceptance Harness

Goal:

- Document exact `LOCAL_SCOPE_DIFFERENCE` semantics under `docs/phase-12/`.
- Add an issue/risk register and acceptance checklist.
- Identify smallest positive and negative fixtures.

Architecture self-check:

- Difference remains proof-only.
- No schema or solver API change is required.

### Round 2 - Semantics Tests Before Emission

Goal:

- Add proof tests that describe positive difference behavior.
- Add negative tests for reverse implication, hidden target dependence, unsupported overlap, and intersection-only cases.

Architecture self-check:

- Tests encode human reasoning, not solver search narration.

### Round 3 - Proof Emission

Goal:

- Implement deterministic `LOCAL_SCOPE_DIFFERENCE` deduction emission.
- Keep existing MVP and case-011 proof behavior stable unless changes are intentionally documented.

Architecture self-check:

- Emission uses current public reasoning state only.

### Round 4 - Solver-Backed Validation

Goal:

- Add validation tests proving each emitted difference deduction is entailed.
- Add cap/truncation behavior checks where relevant.

Architecture self-check:

- Solver validates correctness but proof output remains human-readable.

### Round 5 - No-Guess Verifier Regression

Goal:

- Add a fixture where difference is required for no-guess completion.
- Preserve existing guess-point and explanation-gap detection.

Architecture self-check:

- Verifier remains stricter than satisfiability.

### Round 6 - Proof Rendering And Hint Compatibility

Goal:

- Add stable renderer output for `LOCAL_SCOPE_DIFFERENCE`.
- Add runtime/web hint tests only if needed to confirm player-safe display.

Architecture self-check:

- Hints do not expose target/candidate/forced-cell internals.

### Round 7 - Experimental Fixture Authoring

Goal:

- Add one or two experimental Phase 12 fixtures requiring difference.
- Validate through schema, solver, proof/no-guess, final uniqueness, and authoring report.

Architecture self-check:

- Experimental fixtures stay out of the default selector.

### Round 8 - Generator And Minimization Evidence

Goal:

- Use generator/authoring minimization or sampling where useful to simplify Phase 12 fixtures.
- Record rejection reasons and cap status.

Architecture self-check:

- Generator remains internal and report-only.

### Round 9 - Optional Single Case Promotion

Goal:

- Promote at most one Phase 12 candidate if it passes all gates.
- If none qualifies, record the stop decision and keep shipped content unchanged.

Architecture self-check:

- Quality gate beats case count.
- Default `case-004` remains stable.

### Round 10 - Copy, Runtime, And Smoke Evidence

Goal:

- Review promoted or experimental player-facing copy.
- Run runtime/hint/selector tests and smoke where shipped content changed.
- Update docs with evidence.

Architecture self-check:

- Copy changes do not alter puzzle mechanics.
- Player secrecy remains intact.

### Rounds 11-13 - Buffer Fixes

Use these only for:

- proof correctness or validation gaps;
- renderer/hint wording issues;
- experimental fixture quality problems;
- authoring report or minimization evidence gaps;
- runtime/smoke failures caused by Phase 12 scope.

Do not use buffer rounds for public editor, UGC, new DSL semantics, broad redesign, or unrelated refactors.

### Round 14 - Final Validation And Report

Goal:

- Run full validation.
- Run focused proof and authoring checks.
- Run local smoke if shipped content or web selector files changed.
- Produce `docs/phase-12-local-scope-difference-content-expansion-final-report.md`.
- Confirm working tree is clean, final commit is pushed, and Pages deploy health is checked if web-visible files changed.

Required commands:

```powershell
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm --filter @room-axioms/proof test
pnpm --filter @room-axioms/authoring test
git diff --check
git status --short --branch
```

If shipped content or web selector files changed, also run:

```powershell
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StartDevServer.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Smoke.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StopDevServer.cmd
```

## 7. PASS Criteria

Phase 12 passes only when all are true:

- Final report exists at `docs/phase-12-local-scope-difference-content-expansion-final-report.md`.
- Full validation passes: lint, typecheck, tests, build, and `git diff --check`.
- `LOCAL_SCOPE_DIFFERENCE` has documented semantics, positive tests, negative tests, solver-backed validation, no-guess regression coverage, and stable rendering.
- Existing shipped cases, including `case-011`, remain valid.
- `case-004` remains default.
- Experimental Phase 12 fixtures are validated and remain out of default shipped content unless explicitly promoted.
- Any promoted case passes schema, target rules, initial satisfiability, final uniqueness, proof/no-guess, authoring report, runtime loading, copy review, and smoke.
- Difficulty scoring remains explicitly uncalibrated unless real playtest evidence is recorded.
- Domain remains schema/solver/proof/oracle/generator/authoring/Zod/UI/fs-free.
- Solver, proof, generator, and authoring packages remain independent of React/Vite/browser UI code.
- Authoring tooling is not imported by player-facing web code or shipped content.
- Target reads remain limited to existing targetAccess, verification, tests, and explicit developer-only surfaces.
- No public editor, UGC, backend, analytics, daily challenge, broad redesign, breaking schema migration, or new shipped DSL rule enters this phase.
- Working tree is clean and final commit is pushed.

## 8. Debug Self-Check Template

Use this every round:

```text
Debug self-check:
- Smallest proof fixture tested:
- Success path covered:
- Failure/rejection path covered:
- Empty/cap/truncated path covered:
- Difference-vs-intersection distinction checked:
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
- Public editor/UGC/backend/new DSL scope avoided:
- Unrelated files left untouched:
```

## 10. Final Report Template

```markdown
# Phase 12 Local Scope Difference And Content Expansion Final Report

Status: READY_FOR_CHECK
Guide: `docs/phase-12-local-scope-difference-content-expansion-goal-mode-execution-guide.md`
Phase: Phase 12 - Local Scope Difference And Content Expansion

## Summary
## Files Changed By Category
## Difference Semantics
## Proof Technique Implementation
## Solver-Backed Validation
## Experimental Fixture Evidence
## Authoring CLI Evidence
## Promotion Decision
## Runtime And UI Evidence
## Validation
## Boundary Scans
## Commits
## PASS Criteria
## Blockers Or Follow-Up Notes
```
