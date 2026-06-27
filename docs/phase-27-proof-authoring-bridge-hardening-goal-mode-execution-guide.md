# Phase 27 Proof And Authoring Bridge Hardening Goal Mode Execution Guide

Date: 2026-06-27
Status: execution guide for the executor
Phase: Phase 27 - Proof And Authoring Bridge Hardening
Round budget: 24 executor rounds; rounds 1-4 analyze blocker fixtures, rounds 5-14 harden proof techniques and diagnostics, rounds 15-18 validate repaired micro-fixtures and near-miss candidates, rounds 19-22 authoring/workbench integration and QA, round 23 buffer, and round 24 final validation/report.

## 0. Direct Goal Prompt For Executor

You are executing Phase 27 of Room Axioms: Proof And Authoring Bridge Hardening.

Read this guide, `README.md`, `Role.md`, `docs/development-plan.md`, `docs/phase-26-workbench-guided-puzzle-ladder-production-final-report.md`, `docs/phase-26/candidate-review-log.md`, `docs/phase-26/blocker-follow-up-recommendations.md`, `docs/phase-25-authoring-editor-live-diagnostics-final-report.md`, `docs/phase-24-rule-grammar-expressiveness-expansion-final-report.md`, `packages/proof/src`, `packages/solver/src`, `packages/authoring/src`, `packages/schema/src`, `apps/web/src/workbench`, and `content/experimental/phase-26`.

Phase 26 proved that the current workbench can reject weak content, but broad puzzle production is blocked by repeated proof/authoring gaps. The most common failures were derived facts not feeding later rules, late closure remaining solver-only, comparative/overlap/conditional grammar material not becoming human proof, and near-miss candidates failing no-guess/final uniqueness or degeneracy.

Your goal is to harden the proof and authoring bridge before another broad puzzle production pass. Build focused micro-fixtures and targeted diagnostics that make the Phase 26 blockers either solvable or explicitly detectable earlier. Do not run another 12+ candidate content batch in this phase.

Use `$donextgoal` to execute this guide. When complete, report back to planner thread `019ef0df-a626-7181-9ca6-1cc75c1f4c47`.

## 1. Required Context

- `README.md`
- `AGENTS.md`
- `Role.md`
- `docs/development-plan.md`
- `docs/phase-26-workbench-guided-puzzle-ladder-production-final-report.md`
- `docs/phase-26/candidate-review-log.md`
- `docs/phase-26/blocker-follow-up-recommendations.md`
- `docs/phase-26/promotion-gate-audit.md`
- `docs/phase-25-authoring-editor-live-diagnostics-final-report.md`
- `docs/phase-25/diagnostics-contract.md`
- `docs/phase-24-rule-grammar-expressiveness-expansion-final-report.md`
- `docs/phase-24/hardness-probe-round-09.md`
- `docs/phase-23/difficulty-rubric-v2.md`
- `content/experimental/phase-26`
- `packages/proof/src`
- `packages/solver/src`
- `packages/authoring/src`
- `packages/schema/src`
- `apps/web/src/workbench`
- `.codex/project-ops-workflow.json`
- `.codex/project-git-workflow.json`

## 2. Scope

Required deliverables:

- A final report at `docs/phase-27-proof-authoring-bridge-hardening-final-report.md`.
- A Phase 27 evidence folder under `docs/phase-27/`.
- A blocker taxonomy document at `docs/phase-27/proof-authoring-blocker-taxonomy.md`.
- Focused fixtures or tests for at least these blocker classes:
  - derived safe/guest facts feeding later local/anchor/scope-overlap summaries;
  - `scopeOverlapCount` saturated/all-remaining deductions from non-singleton overlap scopes;
  - comparative late closure that does not collapse to singleton or opening-unique pressure;
  - conditional activation where the condition becomes true through human-visible deductions;
  - object-gated local saturation after an object is derived, not merely opened;
  - two-wave frontier closure where second-wave safe/object/guest facts are human-explainable;
  - no-guess final uniqueness gaps that solver can close but proof cannot explain.
- Authoring diagnostics that can flag known Phase 26 failure patterns earlier:
  - derived-fact bridge unavailable;
  - grammar rule material but no matching proof technique;
  - late closure solver-only;
  - opening-unique or zero-wave collapse;
  - required technique lost under minimization;
  - singleton comparative/overlap side;
  - proof-trace clone after decorative rule additions.
- Workbench summary updates if diagnostics or proof metrics change.
- A narrow repair trial on 2-4 Phase 26 near-miss candidates, preferably C06/C10/C15/C09, to see whether the new proof/diagnostic support changes their status.
- No forced promotion. A repaired case may be promoted only if it passes all Phase 26 gates naturally.

## 3. Non-Scope

Do not implement these in Phase 27:

- A broad new puzzle ladder production batch.
- Public editor, UGC, backend, accounts, analytics, daily challenge, theme/VN implementation, or release packaging.
- New broad rule grammar families.
- Weakening correctness, no-guess, uniqueness, or degeneracy gates.
- Promoting a case just because a new proof technique fires.
- Rewriting the solver architecture unless a small bug fix is required by a focused fixture.

## 4. Technical Principles

- Add proof support only when the deduction is human-readable from public rules and revealed or previously derived facts.
- If a derived fact is allowed to feed a later deduction, the proof graph must preserve the dependency chain.
- Authoring diagnostics should distinguish "proof support missing" from "puzzle design degenerate".
- The workbench should show new warnings, not hide them inside developer-only logs.
- Existing accepted cases must remain valid and player flow must remain unchanged unless a deliberately gated repair is promoted.

## 5. Fixed Per-Round Workflow

At the start of every round:

1. Read this guide and `Role.md`.
2. Run `git status --short --branch`.
3. Choose one narrow round goal.
4. Leave unrelated user/planner files untouched.

During implementation:

1. Start from a failing Phase 26 pattern and write the smallest fixture.
2. Add proof/diagnostic behavior only after the fixture demonstrates the gap.
3. Run focused tests for the package touched.
4. If a near-miss candidate is repaired, run full authoring report/score/minimize/anti-clone evidence before promotion.

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

Focused validation expected during Phase 27:

```powershell
pnpm --filter @room-axioms/proof test
pnpm --filter @room-axioms/authoring test
pnpm --filter @room-axioms/web test -- src/workbench/workbench.test.ts src/workbench/realCaseQa.test.ts src/workbench/authoringTrial.test.ts
pnpm authoring -- report <fixture-or-candidate>
pnpm authoring -- score <fixture-or-candidate>
```

Do not stage unrelated untracked files.

## 7. Round Plan

Rounds 1-2: Blocker taxonomy and fixture plan

- Write `docs/phase-27/proof-authoring-blocker-taxonomy.md`.
- Map C06/C10/C15/C09/C08/C03 failures to minimal test fixtures.

Rounds 3-6: Derived-fact bridge fixtures

- Add proof tests showing where derived safe/guest/object facts should or should not feed later rules.
- Preserve proof graph dependencies.

Rounds 7-10: Phase 24 grammar proof hardening

- Target `scopeOverlapCount`, `comparativeCount`, and `conditionalCount` fixtures.
- Add authoring warnings when grammar is material but no matching proof technique can fire.

Rounds 11-14: Late closure and no-guess diagnostics

- Add diagnostics for solver-only late closure and proof gap clusters.
- Improve report language so workbench users can tell design failure from missing proof support.

Rounds 15-18: Near-miss repair trials

- Re-run 2-4 Phase 26 near misses through the new proof/diagnostic stack.
- Promote none unless strict Phase 26 gates pass.
- Record whether each status improved, regressed, or stayed blocked.

Rounds 19-22: Workbench integration and QA

- Surface new diagnostics in workbench grouped details.
- Update bad-case or real-case QA if needed.
- Ensure normal player flow and selector remain unchanged.

Round 23: Buffer

- Fix regressions, performance/cap issues, or copy warnings.

Round 24: Final validation and report

- Run full validation, focused tests, boundary scans, local smoke if web changed, and final report.

## 8. PASS Criteria

Phase 27 passes only if all are true:

- Final report exists.
- Blocker taxonomy exists and maps Phase 26 rejection patterns to focused fixtures.
- Proof and/or authoring diagnostics are hardened for at least four blocker classes.
- Existing accepted cases remain valid.
- Workbench surfaces any new diagnostics if web-facing diagnostics changed.
- At least two Phase 26 near-miss candidates are re-evaluated with before/after evidence.
- No weak case is promoted.
- Full validation passes: lint, typecheck, test, build, and `git diff --check`.
- Local smoke passes if web runtime/routing changes.
- Pages deployment evidence is recorded if web app changes.

Accepted blocker condition:

- If proof hardening reveals that current DSL semantics cannot support a blocker without a larger design change, Phase 27 may pass with blocker only if it provides focused failing fixtures and a concrete next design recommendation.

## 9. Final Report Template

Create `docs/phase-27-proof-authoring-bridge-hardening-final-report.md` with:

```markdown
# Phase 27 Proof And Authoring Bridge Hardening Final Report

Status: READY_FOR_CHECK or READY_FOR_CHECK_WITH_BLOCKER
Guide: docs/phase-27-proof-authoring-bridge-hardening-goal-mode-execution-guide.md
Final commit: <hash>

## Summary
## Blocker Taxonomy
## Proof Changes
## Authoring Diagnostics Changes
## Workbench Changes
## Near-Miss Re-Evaluation
## Validation Evidence
## Smoke / Pages Evidence
## Boundary Scans
## Blockers Or Caveats
## PASS Criteria Matrix
```
