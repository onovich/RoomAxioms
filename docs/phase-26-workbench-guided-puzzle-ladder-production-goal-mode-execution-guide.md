# Phase 26 Workbench-Guided Puzzle Ladder Production Goal Mode Execution Guide

Date: 2026-06-27
Status: execution guide for the executor
Phase: Phase 26 - Workbench-Guided Puzzle Ladder Production
Round budget: 32 executor rounds; rounds 1-4 define authoring targets and seed skeletons, rounds 5-16 author and repair candidate puzzles, rounds 17-22 promote only genuinely non-degenerate cases, rounds 23-27 QA/copy/playtest-prep, rounds 28-31 buffer repairs, and round 32 final validation/report.

## 0. Direct Goal Prompt For Executor

You are executing Phase 26 of Room Axioms: Workbench-Guided Puzzle Ladder Production.

Read this guide, `README.md`, `Role.md`, `docs/development-plan.md`, `docs/phase-25-authoring-editor-live-diagnostics-final-report.md`, `docs/phase-25/`, `docs/phase-24-rule-grammar-expressiveness-expansion-final-report.md`, `docs/phase-24/`, `docs/phase-23/`, `content/novelty-claims.json`, `content/cases`, `content/experimental`, `packages/authoring/src`, and `apps/web/src/workbench`.

Phase 24 expanded rule grammar but could not create strong non-degenerate puzzles. Phase 25 built a private authoring workbench that makes diagnostics visible while leaving subjective fun and novelty to human review. Phase 26 must use that workbench and the CLI diagnostics together to produce a smaller but genuinely stronger puzzle ladder.

Your goal is not to maximize quantity. Your goal is to author, repair, review, and promote only puzzles that are materially distinct in proof flow, avoid the known clone/degeneracy/copy traps, and feel like real additions. If the strict gates block promotions, report that honestly with evidence instead of padding the selector.

Use `$donextgoal` to execute this guide. When complete, report back to planner thread `019ef0df-a626-7181-9ca6-1cc75c1f4c47`.

## 1. Required Context

- `README.md`
- `AGENTS.md`
- `Role.md`
- `docs/development-plan.md`
- `docs/phase-25-authoring-editor-live-diagnostics-final-report.md`
- `docs/phase-25/authoring-workbench-design.md`
- `docs/phase-25/diagnostics-contract.md`
- `docs/phase-25/bad-case-diagnostics-corpus.md`
- `docs/phase-25/real-case-workbench-qa.md`
- `docs/phase-25/workbench-authoring-trial.md`
- `docs/phase-24-rule-grammar-expressiveness-expansion-final-report.md`
- `docs/phase-24/hardness-probe-round-09.md`
- `docs/phase-23/difficulty-rubric-v2.md`
- `docs/phase-23/degeneracy-gate-design.md`
- `docs/phase-23/user-rating-intake.md`
- `content/novelty-claims.json`
- `content/cases`
- `content/experimental`
- `packages/authoring/src`
- `packages/schema/src`
- `packages/solver/src`
- `packages/proof/src`
- `apps/web/src/workbench`
- `apps/web/src/content`
- `.codex/project-ops-workflow.json`
- `.codex/project-git-workflow.json`

## 2. Scope

Required deliverables:

- A final report at `docs/phase-26-workbench-guided-puzzle-ladder-production-final-report.md`.
- A Phase 26 evidence folder under `docs/phase-26/`.
- A puzzle ladder target brief at `docs/phase-26/puzzle-ladder-target-brief.md`.
- A candidate review log that records accepted and rejected candidates with workbench/CLI evidence.
- At least 12 serious authored or repaired candidates attempted through the Phase 25 workbench and authoring CLI.
- Promotion target:
  - preferred: promote 6-10 genuinely non-degenerate cases;
  - minimum PASS target: promote at least 4 genuinely non-degenerate cases;
  - if fewer than 4 pass, report `READY_FOR_CHECK_WITH_BLOCKER` with evidence.
- At least one promoted case should materially use Phase 24 grammar (`scopeOverlapCount`, `comparativeCount`, or `conditionalCount`) in a way that affects proof or review, unless evidence shows the current proof system still cannot support a good case.
- Every promoted case must have:
  - schema pass;
  - target satisfies rules;
  - initial satisfiable;
  - final guest-layout uniqueness;
  - no-guess / human explainability;
  - no truncation under default caps or an explicit cap-aware justification;
  - opening ambiguity greater than one guest layout;
  - at least one proof wave;
  - no hard degeneracy failure;
  - no direct singleton/edge/sightline giveaway;
  - no proof-trace or effective-board clone of an existing shipped case;
  - a novelty claim that a human reviewer can understand;
  - plain Chinese rule copy that does not rely on highlight-only scope meaning.
- Existing shipped cases may be repaired, re-tiered, or quarantined if the workbench exposes quality debt, but do not delete audit history.
- Player selector should become an honest ladder, not a large list. Prefer fewer better cases.

## 3. Non-Scope

Do not implement these in Phase 26:

- Public editor, UGC upload/share, backend, accounts, cloud sync, analytics, leaderboard, daily challenge, PWA/offline authoring, GitHub Release/tagging, or server-signed content.
- Broad visual/theme/VN implementation, dialogue system, character portraits, or art pipeline integration.
- New rule grammar families unless a tiny proof/copy bug fix is required for a candidate and remains within existing architecture.
- Solver/proof rewrites that weaken correctness.
- Fabricated playtest feedback or public difficulty calibration.
- Bulk content padding to satisfy a number.
- Promotion of cases that the workbench identifies as degenerate, clone-like, one-rule, highlight-dependent, or subjectively redundant without a documented human override.

## 4. Authoring Principles

- Start from proof skeletons, not maps.
- Every new case should have a named intended proof shape, for example:
  - crossing overlap unlock;
  - comparative balance fork;
  - conditional frontier unlock;
  - difference/intersection chain;
  - object-gated local saturation;
  - two-wave reveal frontier.
- Prefer 3x3, 4x4, and careful 5x5 boards with high effective-cell density over padded large boards.
- Treat opening ambiguity as necessary but insufficient. A case also needs changing proof frontiers.
- Treat difficulty score as advisory. Human review may downgrade, as happened with `case-021`.
- Record every rejection. The rejection corpus is part of the product learning loop.

## 5. Fixed Per-Round Workflow

At the start of every round:

1. Read this guide and `Role.md`.
2. Run `git status --short --branch`.
3. Choose one narrow round goal from the round plan.
4. Leave unrelated user/planner files untouched, including existing untracked terminology docs unless explicitly needed for copy context.

During authoring:

1. Draft through the workbench or CLI, not by blind JSON edits alone.
2. Run `pnpm authoring -- report <candidate>` and `pnpm authoring -- score <candidate>` for every serious candidate.
3. Run anti-clone/degeneracy checks before any promotion.
4. If a candidate fails, record why and keep it out of the player selector.
5. If a candidate is promoted, update content, web selector tests, novelty claims, QA docs, and smoke evidence.

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

Focused validation expected during candidate rounds:

```powershell
pnpm --filter @room-axioms/authoring test
pnpm --filter @room-axioms/web test -- src/content/caseVerification.test.ts src/content/runtimeSmoke.test.ts
pnpm authoring -- report <candidate-or-case-json>
pnpm authoring -- score <candidate-or-case-json>
```

Run local smoke when player selector or web routing changes:

```powershell
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StartDevServer.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Smoke.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StopDevServer.cmd
```

Do not stage unrelated untracked files.

## 7. Round Plan

Rounds 1-2: Ladder target brief

- Audit current selector and workbench QA evidence.
- Write `docs/phase-26/puzzle-ladder-target-brief.md`.
- Define target proof skeletons, not merely target difficulty numbers.

Rounds 3-4: Candidate templates and review ledger

- Create private candidate folders under `content/experimental/phase-26/`.
- Create `docs/phase-26/candidate-review-log.md`.
- Seed at least six proof-skeleton templates.

Rounds 5-10: First authoring batch

- Author or repair at least six serious candidates.
- Run workbench/CLI diagnostics for each.
- Reject weak candidates immediately with evidence.

Rounds 11-16: Second authoring batch

- Author or repair at least six additional serious candidates.
- Force variety across proof skeletons and rule families.
- Record whether Phase 24 grammar actually helps.

Rounds 17-20: Promotion pass

- Promote only cases that pass the full gate and human novelty review.
- Update `content/cases`, web selector loading, tests, and novelty claims.
- Keep default `case-004` unless a deliberate release decision changes it.

Rounds 21-22: Ladder ordering and copy review

- Order promoted and retained cases into an honest difficulty ladder.
- Fix rule copy, case names, metadata, and terminology.
- Remove or quarantine cases that the workbench now shows as misleading.

Rounds 23-24: Runtime and selector QA

- Run focused web case verification, runtime smoke, wrong-submission secrecy, and selector tests.
- Verify Phase 26 experimental/rejected cases are not player-facing.

Rounds 25-27: Buffer and repair

- Fix performance, cap, copy, proof, or selector issues.
- If fewer than four cases can be promoted honestly, prepare blocker evidence instead of forcing content.

Round 28-32: Final validation and report

- Run full validation, local smoke, Pages evidence, boundary scans, anti-clone/degeneracy reports, and final report.
- Produce `docs/phase-26-workbench-guided-puzzle-ladder-production-final-report.md`.

## 8. PASS Criteria

Phase 26 passes only if all are true:

- Final report exists.
- At least 12 serious candidates were attempted and recorded with evidence.
- At least 4 genuinely non-degenerate cases are promoted, or the phase reports `READY_FOR_CHECK_WITH_BLOCKER` with strong evidence explaining why strict gates blocked promotion.
- Every promoted case passes correctness, no-guess, uniqueness, degeneracy, anti-clone, copy, and novelty gates.
- At least one promoted case materially uses Phase 24 grammar, or a documented blocker explains why that grammar still fails content use.
- Player selector is an honest ladder and does not include rejected/experimental content.
- No public UGC/editor/backend/analytics/theme/VN scope was added.
- Full validation passes: lint, typecheck, test, build, and `git diff --check`.
- Local smoke passes if selector/web content changes.
- Pages deployment evidence is recorded after final push.

Accepted blocker condition:

- If strict gates prevent four promotions, a blocker is acceptable only if the phase provides a high-quality rejection corpus, workbench diagnostics evidence, and a concrete follow-up recommendation.

## 9. Final Report Template

Create `docs/phase-26-workbench-guided-puzzle-ladder-production-final-report.md` with:

```markdown
# Phase 26 Workbench-Guided Puzzle Ladder Production Final Report

Status: READY_FOR_CHECK or READY_FOR_CHECK_WITH_BLOCKER
Guide: docs/phase-26-workbench-guided-puzzle-ladder-production-goal-mode-execution-guide.md
Final commit: <hash>

## Summary
## Candidate Attempt Matrix
## Promoted Cases
## Rejected Cases And Reasons
## Workbench Diagnostics Evidence
## Ladder Ordering And Copy Review
## Validation Evidence
## Smoke / Pages Evidence
## Boundary Scans
## Blockers Or Caveats
## PASS Criteria Matrix
```

Report honestly. A smaller strong ladder is better than a bloated weak one.
