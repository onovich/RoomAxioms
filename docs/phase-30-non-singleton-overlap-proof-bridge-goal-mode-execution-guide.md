# Phase 30 Non-Singleton Overlap Proof Bridge Goal Mode Execution Guide

Date: 2026-06-28
Status: execution guide for the executor
Phase: Phase 30 - Non-Singleton Overlap Proof Bridge
Round budget: 18 executor rounds; rounds 1-3 isolate the failing overlap-frontier fixture, rounds 4-9 implement the smallest proof bridge or explicit unsupported diagnostic, rounds 10-13 re-run the Phase 29 translation and related fixtures, rounds 14-16 authoring/workbench diagnostics and QA, round 17 buffer, and round 18 final validation/report.

## 0. Direct Goal Prompt For Executor

You are executing Phase 30 of Room Axioms: Non-Singleton Overlap Proof Bridge.

Read this guide, `README.md`, `Role.md`, `docs/development-plan.md`, `docs/phase-29-proof-skeleton-authoring-workflow-final-report.md`, `docs/phase-29/translation-feasibility.md`, `docs/phase-29/skeletons/overlap-frontier-ledger.md`, `docs/phase-29/proof-skeleton-review-rubric.md`, `content/experimental/phase-29/p29-overlap-frontier-ledger-trial.json`, `packages/proof/src`, `packages/authoring/src`, and `packages/solver/src`.

Phase 29 proved that a non-singleton overlap-frontier skeleton can avoid the old C15 singleton/near-count degeneracy and preserve large opening ambiguity, but current HumanReasoner emits no human overlap deductions. The next step is not another JSON mutation sprint. Your goal is to add the smallest proof/authoring bridge for this skeleton class, or an explicit early diagnostic saying this skeleton class is not currently expressible.

Use `$donextgoal` to execute this guide. When complete, report back to planner thread `019ef0df-a626-7181-9ca6-1cc75c1f4c47`.

## 1. Required Context

- `README.md`
- `AGENTS.md`
- `Role.md`
- `docs/development-plan.md`
- `docs/phase-29-proof-skeleton-authoring-workflow-final-report.md`
- `docs/phase-29/translation-feasibility.md`
- `docs/phase-29/proof-skeleton-format.md`
- `docs/phase-29/proof-skeleton-review-rubric.md`
- `docs/phase-29/skeletons/overlap-frontier-ledger.md`
- `content/experimental/phase-29/p29-overlap-frontier-ledger-trial.json`
- `docs/phase-27/derived-fact-bridge-fixtures.md`
- `docs/phase-27/proof-authoring-blocker-taxonomy.md`
- `docs/phase-24-rule-grammar-expressiveness-expansion-final-report.md`
- `packages/proof/src`
- `packages/authoring/src`
- `packages/solver/src`
- `apps/web/src/workbench`
- `.codex/project-ops-workflow.json`
- `.codex/project-git-workflow.json`

## 2. Scope

Required deliverables:

- A final report at `docs/phase-30-non-singleton-overlap-proof-bridge-final-report.md`.
- A Phase 30 evidence folder under `docs/phase-30/`.
- A minimal failing fixture or test that reproduces why `p29-overlap-frontier-ledger-trial` has solver-material non-singleton overlap pressure but no human overlap deduction.
- One of these two outcomes:
  - **Bridge outcome:** proof support for a human-readable non-singleton overlap deduction that can use derived facts and preserve proof graph dependencies; or
  - **Diagnostic outcome:** explicit authoring/workbench diagnostic that identifies this skeleton as unsupported by current proof semantics before authors mutate JSON further.
- Focused tests for the chosen outcome.
- Re-run evidence for `content/experimental/phase-29/p29-overlap-frontier-ledger-trial.json` after the change:
  - `pnpm authoring -- report`
  - `pnpm authoring -- score`
  - `pnpm authoring -- minimize --require-technique SCOPE_OVERLAP_COUNT_SATURATED`
  - anti-clone/degeneracy evidence if it becomes no-guess explainable
- Boundary scans showing the experimental trial remains out of shipped selector/cases unless every strict gate passes.

Promotion is not a goal. If the trial becomes no-guess explainable, it still must stay experimental unless it passes all existing schema, solver, proof, target-4, degeneracy, anti-clone, copy, web runtime, and validation gates.

## 3. Non-Scope

Do not implement these in Phase 30:

- Broad content generation or a new puzzle production sprint.
- New shipped cases by default.
- New broad rule grammar families or schema-breaking changes.
- Weakening no-guess, uniqueness, degeneracy, target-4, anti-clone, copy, or rule-contribution gates.
- Public editor, UGC, backend, analytics, daily challenge, theme/VN work, or broad UI redesign.
- Solver rewrite or search-trace-as-proof exposure.
- Player-facing target/candidate/forced internals.

## 4. Technical Principles

- A proof bridge is valid only if the deduction is human-readable from public rules, observations, and previously derived facts.
- Derived facts used by overlap deductions must appear in proof graph parents.
- Do not treat solver enumeration as a player-facing explanation.
- Prefer conservative diagnostics over unsound deductions.
- If a deduction would require a broader semantics change, document the smallest future grammar/proof extension instead of forcing it.

## 5. Fixed Per-Round Workflow

At the start of every round:

1. Read this guide and `Role.md`.
2. Run `git status --short --branch`.
3. Choose one narrow round goal.
4. Leave unrelated untracked docs untouched.

During implementation:

1. Start from a failing fixture/test before changing proof behavior.
2. Keep source-of-truth reasoning in `packages/proof` and diagnostics in `packages/authoring`.
3. If workbench rendering changes, it should render existing diagnostics rather than duplicate proof logic.
4. Re-run the Phase 29 trial after any proof/diagnostic change.

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

## 6. Commit And Push Workflow

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

Focused validation expected during Phase 30:

```powershell
pnpm --filter @room-axioms/proof test
pnpm --filter @room-axioms/authoring test
pnpm --filter @room-axioms/web test -- src/workbench/workbench.test.ts src/workbench/realCaseQa.test.ts
pnpm authoring -- report content/experimental/phase-29/p29-overlap-frontier-ledger-trial.json
pnpm authoring -- score content/experimental/phase-29/p29-overlap-frontier-ledger-trial.json
pnpm authoring -- minimize content/experimental/phase-29/p29-overlap-frontier-ledger-trial.json --require-technique SCOPE_OVERLAP_COUNT_SATURATED
```

Do not stage unrelated untracked files.

## 7. Round Plan

Rounds 1-3: Isolate the failing overlap-frontier fixture

- Add or document the smallest fixture that reproduces non-singleton overlap pressure with no human proof deduction.
- Record expected human-readable deduction, derived facts, and proof graph parents.

Rounds 4-6: Proof bridge feasibility

- Determine whether existing `scopeOverlapCount` semantics can soundly produce a saturated or all-remaining deduction from this non-singleton pressure.
- If yes, implement the smallest proof bridge with dependency preservation.
- If no, write the explicit unsupported diagnostic path.

Rounds 7-9: Authoring diagnostics and regression tests

- Add authoring diagnostics that distinguish solver-material overlap from proof-supported overlap.
- Ensure singleton/near-count degeneracy gates remain hard.
- Add tests for pass, warning, and blocked cases.

Rounds 10-13: Re-run Phase 29 trial and related fixtures

- Re-run report/score/minimize for `p29-overlap-frontier-ledger-trial`.
- If improved, document whether it is still blocked by final uniqueness, target-4, degeneracy, copy, or minimization.
- If not improved, document the exact unsupported semantics.

Rounds 14-16: Workbench/QA and boundary checks

- Update maintainer-facing workbench diagnostic rendering only if diagnostics changed and are not already visible.
- Run focused web workbench tests if web changed.
- Run boundary scans for experimental IDs and player secrecy.

Round 17: Buffer

- Fix validation, performance, docs, or diagnostics gaps.

Round 18: Final validation and report

- Run full validation, smoke if web changed, boundary scans, and final report.

## 8. PASS Criteria

Phase 30 passes only if all are true:

- Final report exists.
- Minimal failing fixture/evidence exists.
- Either the non-singleton overlap proof bridge is implemented with tests, or an explicit authoring diagnostic identifies the unsupported skeleton class before JSON mutation.
- Phase 29 translation trial is re-run and documented after the change.
- Existing accepted cases remain valid.
- Degeneracy and anti-clone gates are not weakened.
- Experimental Phase 29/30 IDs stay out of shipped content and player selector unless deliberately promoted through all strict gates.
- Full validation passes: lint, typecheck, test, build, and `git diff --check`.
- Local smoke passes if web runtime/workbench routing changes.

Accepted blocker condition:

- Phase 30 may pass with blocker if the minimal fixture proves that the desired deduction is not soundly expressible under current proof semantics. In that case, the final report must identify the smallest next grammar/proof extension and must add an early diagnostic preventing authors from chasing this skeleton through JSON mutation.

## 9. Final Report Template

Create `docs/phase-30-non-singleton-overlap-proof-bridge-final-report.md` with:

```markdown
# Phase 30 Non-Singleton Overlap Proof Bridge Final Report

Status: READY_FOR_CHECK or READY_FOR_CHECK_WITH_BLOCKER
Guide: docs/phase-30-non-singleton-overlap-proof-bridge-goal-mode-execution-guide.md
Final commit: <hash>

## Summary
## Minimal Fixture
## Proof Bridge Or Diagnostic Decision
## Authoring Diagnostics
## Phase 29 Trial Recheck
## Validation Evidence
## Smoke / Pages Evidence
## Boundary Scans
## Blockers Or Caveats
## PASS Criteria Matrix
```
