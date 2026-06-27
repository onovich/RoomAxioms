# Phase 29 Proof Skeleton Authoring Workflow Goal Mode Execution Guide

Date: 2026-06-28
Status: execution guide for the executor
Phase: Phase 29 - Proof Skeleton Authoring Workflow
Round budget: 16 executor rounds; rounds 1-3 define skeleton schema and review rubric, rounds 4-7 add private skeleton artifacts/tooling or diagnostics, rounds 8-11 draft and review proof skeleton briefs, rounds 12-14 run limited translation feasibility checks, round 15 buffer, and round 16 final validation/report.

## 0. Direct Goal Prompt For Executor

You are executing Phase 29 of Room Axioms: Proof Skeleton Authoring Workflow.

Read this guide, `README.md`, `Role.md`, `docs/development-plan.md`, `docs/phase-28-nondegenerate-puzzle-rewrite-sprint-final-report.md`, `docs/phase-28/candidate-ledger.md`, `docs/phase-28/c15-survivor-review.md`, `docs/phase-28/late-closure-survivor-review.md`, `docs/phase-27-proof-authoring-bridge-hardening-final-report.md`, `docs/phase-23/difficulty-rubric-v2.md`, `apps/web/src/workbench`, `packages/authoring/src`, `packages/proof/src`, and `content/experimental/phase-28`.

Phase 28 shows that local JSON mutation is exhausted for the current C15/C10 near-miss skeletons. The next method should start with a human-readable proof skeleton: intended waves, facts, dependencies, ambiguity budget, and anti-degeneracy claims before any board/rule JSON is authored.

Your goal is to build the private skeleton-first authoring workflow. Do not run another content production sprint, and do not promote cases in this phase unless a very small proof-of-work skeleton translation naturally passes all existing gates.

Use `$donextgoal` to execute this guide. When complete, report back to planner thread `019ef0df-a626-7181-9ca6-1cc75c1f4c47`.

## 1. Required Context

- `README.md`
- `AGENTS.md`
- `Role.md`
- `docs/development-plan.md`
- `docs/phase-28-nondegenerate-puzzle-rewrite-sprint-final-report.md`
- `docs/phase-28/rewrite-briefs.md`
- `docs/phase-28/candidate-ledger.md`
- `docs/phase-28/c15-survivor-review.md`
- `docs/phase-28/late-closure-survivor-review.md`
- `docs/phase-27-proof-authoring-bridge-hardening-final-report.md`
- `docs/phase-27/proof-authoring-blocker-taxonomy.md`
- `docs/phase-23/difficulty-rubric-v2.md`
- `docs/phase-25/diagnostics-contract.md`
- `packages/authoring/src`
- `packages/proof/src`
- `apps/web/src/workbench`
- `.codex/project-ops-workflow.json`
- `.codex/project-git-workflow.json`

## 2. Scope

Required deliverables:

- A final report at `docs/phase-29-proof-skeleton-authoring-workflow-final-report.md`.
- A Phase 29 evidence folder under `docs/phase-29/`.
- A proof skeleton format document at `docs/phase-29/proof-skeleton-format.md`.
- A skeleton review rubric at `docs/phase-29/proof-skeleton-review-rubric.md`.
- At least three human-readable skeleton briefs, each designed before JSON:
  - one overlap/shared-variable skeleton inspired by C15 but not copying its opener;
  - one late-closure skeleton inspired by C10/C06 but avoiding direct safe dumps;
  - one conditional/comparative skeleton that explicitly preserves opening ambiguity.
- A feasibility review for each skeleton mapping it to current rule grammar, proof techniques, degeneracy risks, and expected authoring diagnostics.
- Private authoring or workbench support where useful, such as:
  - a skeleton checklist in docs and/or workbench maintainer copy;
  - authoring diagnostics that can reference skeleton intent;
  - a CLI or test helper that validates skeleton metadata if that is low-risk;
  - fixture tests for skeleton-review utility functions if implemented.
- A limited translation trial for at most one skeleton into experimental JSON, only to test feasibility. This is not a broad production phase.

## 3. Non-Scope

Do not implement these in Phase 29:

- Broad puzzle production or random generation.
- Ten or more candidate JSON drafts.
- New shipped cases unless one tiny translation trial unexpectedly passes all strict gates.
- New public editor, UGC, backend, analytics, daily challenge, theme/VN, or broad UI redesign.
- Weakening no-guess, uniqueness, degeneracy, target-4, anti-clone, or copy gates.
- New broad rule grammar families.
- Treating a skeleton as valid merely because it is narratively interesting; it must map to concrete rule families and proof techniques.

## 4. Skeleton Format Requirements

Each skeleton brief must include:

- Player-facing intent: why the puzzle should feel different from existing cases.
- Board/space hypothesis: rough shape, effective unknown count, and why every area matters.
- Opening ambiguity target: expected minimum guest-layout ambiguity before deductions.
- Wave plan:
  - Wave 1 public facts and first deductions;
  - Wave 2 dependency on prior deductions;
  - Wave 3+ late closure, if target difficulty requires it.
- Fact dependencies: which cells become guest/safe/object and why.
- Rule families: local, region, overlap, comparative, conditional, anchor, sightline, etc.
- Shared-variable claim: which rules talk about the same uncertain cells.
- Anti-degeneracy claim: why there is no singleton, near-count giveaway, direct edge/sightline giveaway, padding, or mirror clone.
- Minimize expectation: what facts/rules must survive reveal minimization.
- Known risks: likely proof gaps, solver-only closures, or copy ambiguity.

## 5. Fixed Per-Round Workflow

At the start of every round:

1. Read this guide and `Role.md`.
2. Run `git status --short --branch`.
3. Choose one narrow round goal.
4. Leave unrelated untracked docs untouched.

During implementation:

1. Start from skeleton intent and proof waves, not JSON mutation.
2. If you add tooling, keep source-of-truth logic in `packages/authoring` or `packages/proof`; workbench may render but must not duplicate semantics.
3. If translating a skeleton to JSON, stop after one serious trial unless it clearly passes strict gates.
4. Record rejection evidence honestly; do not fabricate playtest or subjective difficulty calibration.

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

Focused validation expected during Phase 29:

```powershell
pnpm --filter @room-axioms/authoring test
pnpm --filter @room-axioms/proof test
pnpm --filter @room-axioms/web test -- src/workbench/workbench.test.ts src/workbench/realCaseQa.test.ts
pnpm authoring -- report <experimental-skeleton-translation>
pnpm authoring -- score <experimental-skeleton-translation>
pnpm authoring -- minimize <experimental-skeleton-translation> --require-technique <technique>
```

Do not stage unrelated untracked files.

## 7. Round Plan

Rounds 1-3: Skeleton format and rubric

- Create `docs/phase-29/proof-skeleton-format.md`.
- Create `docs/phase-29/proof-skeleton-review-rubric.md`.
- Define what a target-4 skeleton must prove before JSON exists.

Rounds 4-7: Private support and diagnostics

- Add lightweight authoring/workbench support only if it materially helps skeleton review.
- Prefer docs plus source-of-truth authoring diagnostics over UI polish.
- Add tests for any new utility or diagnostic.

Rounds 8-11: Skeleton briefs

- Draft at least three skeleton briefs under `docs/phase-29/skeletons/`.
- Include overlap, late-closure, and conditional/comparative directions.
- Review each against the rubric and Phase 28 failure modes.

Rounds 12-14: Limited translation feasibility

- Choose at most one skeleton for experimental JSON translation.
- Run report/score/minimize/anti-clone evidence if translated.
- Stop early if it collapses into opening uniqueness, singleton giveaway, or solver-only closure.

Round 15: Buffer

- Fix validation, diagnostics, docs, or evidence gaps.

Round 16: Final validation and report

- Run full validation, smoke if web changed, boundary scans, and final report.

## 8. PASS Criteria

Phase 29 passes only if all are true:

- Final report exists.
- Skeleton format and review rubric exist.
- At least three skeleton briefs exist and are reviewed against the rubric.
- The workflow explicitly addresses Phase 28 blockers: C15 opener skeleton, C10 late trigger, opening ambiguity, direct safe dumps, and minimization collapse.
- Any implemented tooling has tests and keeps source-of-truth logic out of duplicated UI code.
- If an experimental translation is attempted, it has report/score/minimize evidence and remains out of player selector unless all strict gates pass.
- No rejected/generated/experimental IDs leak into shipped content or player selector.
- Full validation passes: lint, typecheck, test, build, and `git diff --check`.
- Local smoke passes if web workbench or app routing changes.

Accepted blocker condition:

- Phase 29 may pass with blocker if the skeleton-first workflow proves that the current rule grammar cannot express the desired skeletons without new mechanics. The final report must then recommend the smallest next grammar/proof extension, not another JSON mutation sprint.

## 9. Final Report Template

Create `docs/phase-29-proof-skeleton-authoring-workflow-final-report.md` with:

```markdown
# Phase 29 Proof Skeleton Authoring Workflow Final Report

Status: READY_FOR_CHECK or READY_FOR_CHECK_WITH_BLOCKER
Guide: docs/phase-29-proof-skeleton-authoring-workflow-goal-mode-execution-guide.md
Final commit: <hash>

## Summary
## Skeleton Format
## Review Rubric
## Skeleton Briefs
## Tooling Or Diagnostics
## Translation Feasibility
## Validation Evidence
## Smoke / Pages Evidence
## Boundary Scans
## Blockers Or Caveats
## PASS Criteria Matrix
```
