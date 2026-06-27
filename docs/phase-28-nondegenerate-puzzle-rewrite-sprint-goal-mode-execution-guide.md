# Phase 28 Nondegenerate Puzzle Rewrite Sprint Goal Mode Execution Guide

Date: 2026-06-28
Status: execution guide for the executor
Phase: Phase 28 - Nondegenerate Puzzle Rewrite Sprint
Round budget: 18 executor rounds; rounds 1-2 prepare rewrite briefs, rounds 3-8 attempt C15 nondegenerate rewrite, rounds 9-13 attempt one late-closure rewrite from C06/C10/C09, rounds 14-16 promotion or rejection evidence, round 17 buffer, and round 18 final validation/report.

## 0. Direct Goal Prompt For Executor

You are executing Phase 28 of Room Axioms: Nondegenerate Puzzle Rewrite Sprint.

Read this guide, `README.md`, `Role.md`, `docs/development-plan.md`, `docs/phase-27-proof-authoring-bridge-hardening-final-report.md`, `docs/phase-27/near-miss-recheck-after-bridge.md`, `docs/phase-27/proof-authoring-blocker-taxonomy.md`, `docs/phase-26/candidate-review-log.md`, `docs/phase-26/blocker-follow-up-recommendations.md`, `docs/phase-23/difficulty-rubric-v2.md`, `packages/proof/src`, `packages/authoring/src`, `apps/web/src/workbench`, and `content/experimental/phase-26`.

Phase 27 improved the proof bridge enough to make `p26-c15-overlap-chain-repair` human-explainable, but it still failed degeneracy and target-4 gates. C06, C10, and C09 still need new explainable late-closure design rather than another blind production batch.

Your goal is to run a narrow rewrite sprint:

1. Prioritize a non-degenerate rewrite of the C15 overlap skeleton.
2. Attempt one focused late-closure rewrite from C06/C10/C09 only if the C15 path is exhausted or finished.
3. Promote at most two cases, and promote zero if strict gates do not pass.

Use `$donextgoal` to execute this guide. When complete, report back to planner thread `019ef0df-a626-7181-9ca6-1cc75c1f4c47`.

## 1. Required Context

- `README.md`
- `AGENTS.md`
- `Role.md`
- `docs/development-plan.md`
- `docs/phase-27-proof-authoring-bridge-hardening-final-report.md`
- `docs/phase-27/near-miss-recheck-after-bridge.md`
- `docs/phase-27/proof-authoring-blocker-taxonomy.md`
- `docs/phase-27/derived-fact-bridge-fixtures.md`
- `docs/phase-27/late-closure-diagnostics.md`
- `docs/phase-26/candidate-review-log.md`
- `docs/phase-26/blocker-follow-up-recommendations.md`
- `docs/phase-26/promotion-gate-audit.md`
- `docs/phase-23/difficulty-rubric-v2.md`
- `content/experimental/phase-26/candidates/p26-c15-overlap-chain-repair.json`
- `content/experimental/phase-26/candidates/p26-c06-two-wave-frontier.json`
- `content/experimental/phase-26/candidates/p26-c10-frontier-repair.json`
- `content/experimental/phase-26/candidates/p26-c09-comparative-repair.json`
- `packages/proof/src`
- `packages/authoring/src`
- `apps/web/src/workbench`
- `.codex/project-ops-workflow.json`
- `.codex/project-git-workflow.json`

## 2. Scope

Required deliverables:

- A final report at `docs/phase-28-nondegenerate-puzzle-rewrite-sprint-final-report.md`.
- A Phase 28 evidence folder under `docs/phase-28/`.
- Rewrite briefs for C15 and at least one of C06/C10/C09.
- At least three serious C15 rewrite attempts that preserve material overlap reasoning while attacking degeneracy.
- At least one serious late-closure rewrite attempt from C06/C10/C09 if C15 does not consume the full phase.
- Authoring report, score, minimize, anti-clone, and copy/degeneracy evidence for every serious survivor.
- Promotion evidence for any case promoted into `content/cases`, including web selector/runtime tests and online deployment evidence.
- Honest rejection evidence when a rewrite fails; do not pad the selector with weak content.

Promotion is allowed only if all are true:

- schema, solver, proof/no-guess, final uniqueness, no truncation all pass;
- target-4 gates pass or the final report explicitly argues for a lower labeled difficulty and the case is not counted as a target-4 win;
- degeneracy gates pass;
- anti-clone gates pass against the current selector;
- rule contribution and technique retention pass;
- copy does not rely on hidden highlight-only membership or undefined labels;
- player-facing selector/default-case changes are deliberate and tested.

## 3. Non-Scope

Do not implement these in Phase 28:

- Broad random generation or a 10+ candidate production batch.
- New rule grammar families.
- Weakening no-guess, uniqueness, degeneracy, target-4, anti-clone, or copy gates.
- Public editor, UGC, backend, analytics, daily challenge, theme/VN implementation, or broad UI redesign.
- Promotion based only on machine score without human-readable design evidence.
- Shipping C15 as-is; it is known proof-explainable but degenerate.

## 4. Design Principles

- A real rewrite should change the proof experience, not merely rename cells, mirror the board, or add decorative rules.
- More cells are useful only when they create new overlapping constraints or uncertainty; padding is a failure.
- Opening reveals should create a frontier, not directly point to the answer.
- Overlap/comparative/conditional rules must share variables with other rule families.
- If the case becomes easier after minimization, treat that as evidence of design weakness, not success.
- If the tool says "target-4" but human review says baseline, record the human review and do not over-label it.

## 5. Fixed Per-Round Workflow

At the start of every round:

1. Read this guide and `Role.md`.
2. Run `git status --short --branch`.
3. Choose one narrow round goal.
4. Leave unrelated untracked docs untouched.

During rewrite work:

1. Start from a written proof skeleton, not from blind JSON mutations.
2. State what should become hard or non-degenerate before editing.
3. Run `pnpm authoring -- report`, `score`, and `minimize` on every serious survivor.
4. Run anti-clone/degeneracy evidence before considering promotion.
5. If a case is promoted, run focused web content/runtime tests and smoke.

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

Focused validation expected during Phase 28:

```powershell
pnpm --filter @room-axioms/authoring test
pnpm --filter @room-axioms/proof test
pnpm --filter @room-axioms/web test -- src/content/caseVerification.test.ts src/content/runtimeSmoke.test.ts src/workbench/realCaseQa.test.ts
pnpm authoring -- report <candidate-or-case>
pnpm authoring -- score <candidate-or-case>
pnpm authoring -- minimize <candidate-or-case> --require-technique <technique>
```

Do not stage unrelated untracked files.

## 7. Round Plan

Rounds 1-2: Rewrite briefs

- Write `docs/phase-28/rewrite-briefs.md`.
- Define C15's degeneracy cause and the exact intended non-degenerate rewrite target.
- Pick one backup late-closure candidate from C06/C10/C09 and define its missing proof frontier.

Rounds 3-5: C15 rewrite attempt A/B/C

- Create private experimental candidates under `content/experimental/phase-28/`.
- Preserve material overlap proof while changing board shape, openings, and rule coupling enough to avoid degeneracy.
- Reject quickly if minimization collapses the design.

Rounds 6-8: C15 survivor repair

- Pick the best survivor, if any.
- Run authoring report/score/minimize/anti-clone/copy review.
- Promote only if all gates pass; otherwise record why it still fails.

Rounds 9-11: Late-closure rewrite attempt

- Attempt one C06/C10/C09-derived rewrite aimed at explainable second-wave closure.
- Do not try all three unless the first is clearly exhausted early.
- Record whether Phase 27 diagnostics identify the blocker earlier than Phase 26 did.

Rounds 12-13: Survivor review

- Re-run full evidence on any surviving C15 or late-closure candidate.
- Decide promotion, quarantine, or rejection.

Rounds 14-16: Integration or rejection evidence

- If a case is promoted, update shipped content, selector, metadata, novelty claims, and focused web tests.
- If no case is promoted, produce a high-quality rejection dossier and a next-method recommendation.

Round 17: Buffer

- Fix regressions, copy issues, test timeouts, or docs gaps.

Round 18: Final validation and report

- Run full validation, smoke, Pages if web changed, boundary scans, and final report.

## 8. PASS Criteria

Phase 28 passes only if all are true:

- Final report exists.
- Rewrite briefs exist.
- At least three serious C15 rewrite attempts are recorded.
- At least one C06/C10/C09 late-closure rewrite attempt is recorded unless C15 produced a promoted case and consumed the phase budget.
- Every promoted case, if any, passes all strict gates and is tested in web runtime.
- Zero promotions is acceptable only with concrete rejection evidence and a next-method recommendation.
- Current shipped cases remain valid.
- No rejected/generated/experimental IDs leak into player selector unless deliberately promoted.
- Full validation passes: lint, typecheck, test, build, and `git diff --check`.
- Local smoke passes if web content or runtime changed.
- Pages deployment evidence is recorded if shipped content or web app changes.

Accepted blocker condition:

- Phase 28 may pass with blocker if every serious rewrite still fails strict gates, provided it records why each failure is design-level rather than tooling-level and recommends whether the next step should be human-authored skeleton design, additional proof mechanics, or rule grammar expansion.

## 9. Final Report Template

Create `docs/phase-28-nondegenerate-puzzle-rewrite-sprint-final-report.md` with:

```markdown
# Phase 28 Nondegenerate Puzzle Rewrite Sprint Final Report

Status: READY_FOR_CHECK or READY_FOR_CHECK_WITH_BLOCKER
Guide: docs/phase-28-nondegenerate-puzzle-rewrite-sprint-goal-mode-execution-guide.md
Final commit: <hash>

## Summary
## Rewrite Briefs
## C15 Rewrite Attempts
## Late-Closure Rewrite Attempt
## Promotion Or Rejection Decisions
## Validation Evidence
## Smoke / Pages Evidence
## Boundary Scans
## Blockers Or Caveats
## PASS Criteria Matrix
```
