# Phase 23 Difficulty 4+ Puzzle Expansion Goal Mode Execution Guide

Date: 2026-06-26
Status: execution guide for the executor
Phase: Phase 23 - Difficulty 4+ Puzzle Expansion And Degeneracy Gates
Round budget: 40 executor rounds; rounds 1-8 build quality gates and repair known defects, rounds 9-26 produce and promote 20 target-difficulty cases, rounds 27-34 produce and promote 10 super-hard candidates, rounds 35-38 integrate selector/runtime/copy/smoke, round 39 is buffer, and round 40 is final validation and report.

## 0. Direct Goal Prompt For Executor

You are executing Phase 23 of Room Axioms: Difficulty 4+ Puzzle Expansion And Degeneracy Gates.

Read this guide, `README.md`, `Role.md`, `docs/development-plan.md`, `docs/phase-22-expressive-mechanics-and-content-expansion-lab-final-report.md`, `docs/phase-22/`, `content/novelty-claims.json`, `packages/domain/src`, `packages/schema/src`, `packages/solver/src`, `packages/proof/src`, `packages/authoring/src`, `packages/generator/src`, `apps/web/src`, and `content/cases`.

The user's Phase 22 playtest verdict is binding input for this phase:

- `case-015`: 1/5. Too simple, only suitable as a tutorial case.
- `case-013`: 2/5. Acceptable.
- `case-004`: 3/5. Acceptable, but copy must say "必有", for example "酒瓶的上下左右邻格，必有 1 个垃圾桶".
- `case-011`: 2.5/5. Acceptable.
- `case-012`: 2.2/5. Acceptable.
- `case-014`: 1.5/5. Feels familiar.
- `case-017`: 1.5/5.
- `case-018`: 1.2/5.
- `case-019`: invalid or at least not accepted. "east shelf" is unclear English, and the current conditions do not let the user derive that C2 is a guest or that C1 is safe.
- `case-020`: 1/5.
- Many rule terms remain untranslated.
- Degenerate rules are currently lowering difficulty: edge/side rules or sightline rules with only one effective unknown cell are almost equivalent to directly telling the player where a guest is.

Your goal is not to add bulk content. Your goal is to create a production method that avoids trivial, cloned, one-step, or pseudo-hard puzzles, then use it to add 30 new player-facing cases if quality allows:

- 20 new target-difficulty cases with an intended score around 4/5.
- 10 new super-hard cases with intended score around 6-7 on an extended scale.
- Preserve the current library for auditability, but do not count low-rated Phase 22 cases toward the 4+ quota.
- It is acceptable to keep easy accepted cases as tutorial/baseline content, but the new expansion selector must clearly separate tutorial/baseline from 4+ and super-hard cases.

If the project cannot honestly produce 20 + 10 high-quality cases within the budget, do not pad the selector. Return `READY_FOR_CHECK_WITH_BLOCKER` with evidence showing how many passed and which gates failed.

Use `$donextgoal` to execute this guide. When complete, report back to planner thread `019ef0df-a626-7181-9ca6-1cc75c1f4c47`.

## 1. Required Context

- `README.md`
- `AGENTS.md`
- `Role.md`
- `docs/development-plan.md`
- `docs/phase-20/`
- `docs/phase-21/`
- `docs/phase-22-expressive-mechanics-and-content-expansion-lab-final-report.md`
- `docs/phase-22/`
- `content/novelty-claims.json`
- `apps/web/src/content`
- `apps/web/src/runtime`
- `apps/web/src/view`
- `content/cases`
- `content/experimental`
- `packages/domain/src`
- `packages/schema/src`
- `packages/solver/src`
- `packages/proof/src`
- `packages/authoring/src`
- `packages/generator/src`
- `.codex/project-ops-workflow.json`
- `.codex/project-git-workflow.json`

Related but out of implementation scope unless needed for copy consistency:

- `docs/unregistered-scene-ui-requirements.md`
- the theme-setting document whose filename starts with `docs/` and contains `项目设定`

## 2. Scope

Required deliverables:

- A final report at `docs/phase-23-difficulty-4-plus-puzzle-expansion-final-report.md`.
- A Phase 23 evidence folder under `docs/phase-23/`.
- A user-rating intake document at `docs/phase-23/user-rating-intake.md`.
- A degeneracy and difficulty rubric at `docs/phase-23/difficulty-rubric-v2.md`.
- Authoring/anti-clone gates that detect and reject:
  - direct side/edge giveaways where a rule's effective unknown cells equal, or are barely above, the required guest count;
  - singleton or near-singleton sightline/region scopes;
  - rules whose contribution is redundant after earlier rules;
  - puzzles solved by one rule family or one opening observation;
  - padded boards where added cells do not affect the proof frontier;
  - proof-trace, shrink-signature, rule-impact, and effective-board clones of accepted cases.
- Copy cleanup for all shipped visible rule terms:
  - Chinese terms only in the player UI and shipped case names/copy.
  - Replace unclear English such as "east shelf".
  - Use "上下左右邻格" where orthogonal adjacency is meant.
  - Use "周围一圈" only where all 8 surrounding cells are meant.
  - Use "必有" for universal positive rules such as "每个 X 的上下左右邻格，必有 1 个 Y".
- A P0 repair or quarantine for `case-019`:
  - if it is logically valid, make the proof/copy explain why C2 is guest and C1 is safe;
  - if it is not logically valid, remove it from the player-facing selector until repaired.
- New content candidates under `content/experimental/phase-23/`.
- Promoted new cases under `content/cases/`, expected ids `case-021` through `case-050` when all 30 pass.
- Updated `apps/web/src/content/cases.ts` selector grouping/order so baseline, 4+ target, and super-hard cases are readable to players.
- Updated `content/novelty-claims.json` for every promoted or rejected Phase 23 case.
- Focused tests for the new gates and for all promoted cases.
- Full validation, smoke, online HTTP, Pages evidence, and boundary scans.

## 3. Non-Scope

Do not implement these in Phase 23:

- Broad visual/theme/VN work, dialogue system, character portraits, public editor, UGC upload/share, backend, accounts, analytics, leaderboard, daily challenge, PWA/offline mode, or server-signed content.
- Fabricated playtest data. Difficulty scores are intended/authoring scores until the user or real testers rate them.
- Weakening solver/proof correctness to make a candidate pass.
- Promoting a case that only differs by mirror, padding, label changes, or a different irrelevant safe area.
- Promoting a case with untranslated player-facing rule terms.
- Promoting a case with degenerate edge/sightline giveaways unless it is explicitly marked as tutorial and excluded from the 4+ quota.
- Publicly exposing target layouts, forced-cell/candidate diagnostics, generator diagnostics, authoring diagnostics, anti-clone internals, or contaminated-record internals.
- Breaking migration that invalidates existing accepted cases.
- GitHub Release creation or version tagging unless the planner/user explicitly asks for it.

## 4. Difficulty Methodology

Treat difficulty as a combination of automatic metrics and human-readable design intent.

### Target 4/5 Cases

A promoted 4/5 target case should usually have:

- At least 10 effective unknown cells after opening reveals, unless a smaller board has unusually dense overlapping constraints.
- At least 4 meaningful proof waves.
- At least 8 non-trivial deductions before final uniqueness.
- At least 3 contributing rule families or scopes.
- No single rule or single first reveal can identify all guests.
- At least one new reasoning frontier created by a reveal or derived anchor.
- At least one place where two or more rules share the same hidden variable group.
- No degenerate singleton sightline/region/edge giveaway.
- A short reviewer note explaining why a player cannot solve it by simply counting one obvious side/line.

### Super-Hard 6-7 Cases

A promoted super-hard case should usually have:

- At least 14 effective unknown cells after opening reveals, unless the proof is exceptionally deep.
- At least 6 meaningful proof waves.
- At least 12 non-trivial deductions.
- At least 4 contributing rule families or scopes.
- At least two chained frontiers where one deduction unlocks a later rule.
- Either contaminated-record reasoning, high-overlap region/sightline/anchor reasoning, or a similarly demanding interaction.
- A verifier or proof transcript showing the puzzle is still no-guess explainable, or an explicit high-tier verifier if contaminated records are involved.
- A spoiler-safe author note explaining the intended "hard turn" of the puzzle.

These are not blind numeric gates. If a candidate misses one metric but is genuinely strong, it may be accepted only with explicit evidence in `docs/phase-23/` and a novelty claim. If a candidate meets the metrics but feels like a clone or giveaway, reject it.

## 5. Fixed Per-Round Workflow

At the start of every round:

1. Read this guide and `Role.md`.
2. Run `git status --short --branch`.
3. Choose one narrow round goal from the round plan.
4. Leave unrelated user or planner files untouched, including unrelated untracked docs.

During implementation:

1. Start from proof/experience skeletons, not map padding.
2. Before promoting a case, write a one-paragraph intended player experience.
3. Reject degenerate cases early; do not "dress them up" with more labels.
4. Keep rejected candidates as evidence under `content/experimental/phase-23/rejected/` when useful.
5. Keep current accepted cases available unless a case is logically broken or player-facing copy is wrong.
6. If a candidate needs new mechanics beyond Phase 22, stop and record the design need; do not quietly expand the DSL without planner approval.

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

Additional focused validation expected during quality/content rounds:

```powershell
pnpm --filter @room-axioms/domain test
pnpm --filter @room-axioms/schema test
pnpm --filter @room-axioms/solver test
pnpm --filter @room-axioms/proof test
pnpm --filter @room-axioms/authoring test
pnpm --filter @room-axioms/generator test
pnpm --filter @room-axioms/web test -- src/content/caseVerification.test.ts src/content/runtimeSmoke.test.ts src/runtime/analyzer.test.ts src/runtime/facade.test.ts
pnpm authoring -- report <case-path>
pnpm authoring -- score <case-path>
pnpm authoring -- minimize <case-path>
pnpm authoring -- anti-clone <selector-case-paths...> --novelty-manifest content/novelty-claims.json
```

Run local smoke before final report:

```powershell
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StartDevServer.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Smoke.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StopDevServer.cmd
```

Do not stage unrelated files, `apps/web/dist`, `node_modules`, coverage output, local smoke logs, generated bulk datasets, cache files, or rejected generated cases outside accepted evidence folders.

## 7. Round Plan

### Rounds 1-2 - User Rating Intake And Copy Defect Audit

Goals:

- Create `docs/phase-23/user-rating-intake.md`.
- Record the user's ratings and the exact defect notes above.
- Audit shipped cases and visible UI/rule text for untranslated or unclear terms.
- Fix the mandatory `case-004` "必有" wording and all low-risk terminology issues.
- Decide whether `case-019` is repaired or quarantined.

PASS note:

- Do not start producing new cases until the defect intake is documented.

### Rounds 3-5 - Degeneracy Gates

Goals:

- Add authoring checks for direct edge/side giveaways, singleton sightlines, singleton regions, non-contributing rules, and padded effective boards.
- Add fixtures/tests for bad examples and accepted examples.
- Ensure tutorial-grade cases can be labeled as tutorial but excluded from 4+ quota.

### Rounds 6-8 - Difficulty Rubric V2 And Review Reports

Goals:

- Create `docs/phase-23/difficulty-rubric-v2.md`.
- Extend authoring reports to include effective unknown count, proof wave count, deduction count, contributing rule families, frontier unlocks, shared-variable overlap, and degeneracy warnings.
- Add a reviewer manifest format for intended difficulty and qualitative novelty.

### Rounds 9-18 - First Ten Target 4/5 Cases

Goals:

- Produce candidates for ten new target-difficulty cases.
- Promote only candidates that pass schema, solver/proof, difficulty rubric, degeneracy gates, anti-clone, novelty claims, runtime tests, and player copy review.
- Expected promoted ids: `case-021` through `case-030` if all pass.

### Rounds 19-26 - Second Ten Target 4/5 Cases

Goals:

- Produce ten more target-difficulty cases.
- Expected promoted ids: `case-031` through `case-040` if all pass.
- Reject or defer candidates that feel like variants of earlier Phase 23 cases.

### Rounds 27-34 - Ten Super-Hard 6-7 Candidates

Goals:

- Produce ten super-hard candidates.
- Expected promoted ids: `case-041` through `case-050` if all pass.
- At least three should use contaminated-record or similarly high-tier cross-check reasoning if readable.
- If contaminated cases remain unreadable, promote fewer super-hard cases and report the blocker honestly.

### Rounds 35-36 - Selector Integration And Player Presentation

Goals:

- Update selector order/grouping so players can distinguish tutorial/baseline, 4+ target, and super-hard cases.
- Do not hide existing cases, but do not let low-rated tutorial cases masquerade as hard cases.
- Ensure all shipped case names, summaries, rule copy, status text, and scope labels are Chinese and readable.

### Rounds 37-38 - Smoke, Boundary, And Online Evidence

Goals:

- Run focused runtime tests, local smoke, online HTTP checks, and boundary scans.
- Record evidence under `docs/phase-23/`.

### Round 39 - Buffer

Use only for repairs discovered by validation, smoke, copy audit, or anti-clone review.

### Round 40 - Final Validation And Report

Goals:

- Run full validation and final anti-clone/difficulty report.
- Create `docs/phase-23-difficulty-4-plus-puzzle-expansion-final-report.md`.
- Include:
  - exact promoted target 4/5 count;
  - exact promoted super-hard count;
  - rejected/deferred candidate count;
  - average intended difficulty of the new target set;
  - average intended difficulty of the super-hard set;
  - `case-019` resolution;
  - copy localization status;
  - generator/authoring capability ceiling;
  - Pages and smoke evidence.
- Commit and push the final report.
- Return `READY_FOR_CHECK` only if PASS criteria are met; otherwise return `READY_FOR_CHECK_WITH_BLOCKER`.

## 8. PASS Criteria

Phase 23 PASS requires:

- Final report exists at `docs/phase-23-difficulty-4-plus-puzzle-expansion-final-report.md`.
- User rating intake and difficulty rubric docs exist.
- `case-004` universal positive copy uses "必有".
- `case-019` is repaired with proof/copy evidence or removed from player-facing selector until repaired.
- All player-facing visible case/rule terminology is Chinese; no unclear English terms like "east shelf" remain in shipped player copy.
- Degeneracy gates cover edge/side giveaways, singleton sightlines/regions, redundant rules, padded maps, and clone-like proof/shrink/rule-impact signatures.
- At least 20 new target-difficulty candidates are attempted, with honest accepted/rejected evidence.
- At least 10 new super-hard candidates are attempted, with honest accepted/rejected evidence.
- If fewer than 20 target or fewer than 10 super-hard cases are promoted, the final status must be `READY_FOR_CHECK_WITH_BLOCKER` and the report must explain why.
- Every promoted Phase 23 case passes schema, solver/proof or appropriate verifier, no-guess/readability requirements, anti-clone, novelty, degeneracy, copy review, and web runtime smoke.
- Existing accepted cases remain valid unless explicitly quarantined for a documented defect.
- Player UI does not expose target/candidate/forced/generator/authoring internals.
- No public editor, UGC, backend, analytics, daily challenge, broad theme/VN implementation, fabricated playtest calibration, or breaking schema migration is introduced.
- `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `git diff --check`, local smoke, online HTTP, and relevant boundary scans pass before final push.

## 9. Final Report Template

```markdown
# Phase 23 Difficulty 4+ Puzzle Expansion Final Report

Status: READY_FOR_CHECK or READY_FOR_CHECK_WITH_BLOCKER
Guide: docs/phase-23-difficulty-4-plus-puzzle-expansion-goal-mode-execution-guide.md
Final commit:

## Summary

## User Rating Intake

## Copy And Case-019 Resolution

## Degeneracy Gates Implemented

## Target 4/5 Cases

## Super-Hard 6-7 Cases

## Rejected And Deferred Candidates

## Selector Order

## Validation Evidence

## Smoke / Pages Evidence

## Boundary Scans

## Blockers Or Caveats

## PASS Criteria Status
```
