# Phase 21 Distinct Puzzle Ladder Production Goal Mode Execution Guide

Date: 2026-06-25
Status: execution guide for the executor
Phase: Phase 21 - Distinct Puzzle Ladder Production
Round budget: 16 executor rounds; rounds 1-11 are skeleton-first content production, rounds 12-14 are selector/runtime hardening and buffer, round 15 is release smoke, and round 16 is final validation and report.

## 0. Direct Goal Prompt For Executor

You are executing Phase 21 of Room Axioms: Distinct Puzzle Ladder Production.

Read this guide, `README.md`, `Role.md`, `docs/development-plan.md`, `docs/phase-20-anti-clone-puzzle-quality-and-ladder-repair-final-report.md`, `docs/phase-20/`, `content/novelty-claims.json`, `packages/authoring/src`, `packages/generator/src`, `packages/proof/src`, `packages/solver/src`, `apps/web/src/content`, and `content/cases`.

Phase 20 deliberately repaired the player-facing selector down to the smaller honest set:

1. `case-011`
2. `case-012`
3. `case-004`

The rejected Phase 19 additions must not return as normal player-facing cases. Your task is to expand the selector only with genuinely distinct puzzles that pass both the standard validation gates and the new Phase 20 anti-clone gates.

Within 16 executor rounds:

- Produce a proof-skeleton-first content plan before authoring new maps.
- Author or sample candidates from distinct deduction skeletons, not from coordinate transforms, label swaps, or padded maps.
- Promote at least two genuinely distinct new player-facing cases if they pass all gates. If two cannot pass after the planned attempts, stop with `READY_FOR_CHECK_WITH_BLOCKER` rather than padding the selector.
- Keep the selector honest. A 4-5 case selector with real novelty is better than an 8-case clone selector.
- Preserve `case-004`, `case-011`, and `case-012` unless a documented superior replacement exists.
- Use `pnpm authoring anti-clone ... --novelty-manifest content/novelty-claims.json` as a mandatory promotion gate.
- Update `content/novelty-claims.json` for every promoted case with reviewer evidence.
- Keep rejected/generated/experimental candidates out of `apps/web/src/content/cases.ts`.
- Do not change Puzzle Schema v1 semantics, solver correctness semantics, proof technique semantics, public editor scope, UGC, backend, analytics, daily challenge, broad UI/theme/VN systems, or fabricated playtest calibration.
- Validate, commit, and push each successful round before moving on.

Use `$donextgoal` to execute this guide. When complete, report back to planner thread `019ef0df-a626-7181-9ca6-1cc75c1f4c47`.

## 1. Required Context

- `README.md`
- `AGENTS.md`
- `Role.md`
- `docs/development-plan.md`
- `docs/phase-20-anti-clone-puzzle-quality-and-ladder-repair-final-report.md`
- `docs/phase-20/phase-19-content-rejection-audit.md`
- `docs/phase-20/selector-repair-decision.md`
- `docs/phase-20/repaired-selector-anti-clone-pass.md`
- `docs/phase-20/replacement-promotion-decision.md`
- `content/novelty-claims.json`
- `packages/authoring/src/antiClone.ts`
- `packages/authoring/src/antiCloneCommand.ts`
- `packages/authoring/src/antiCloneReport.ts`
- `packages/authoring/src/noveltyClaims.ts`
- `packages/authoring/src/qualityGates.ts`
- `packages/generator/src`
- `packages/proof/src`
- `packages/solver/src`
- `apps/web/src/content`
- `content/cases`
- `content/experimental`
- `.codex/project-ops-workflow.json`
- `.codex/project-git-workflow.json`

Related but out of this phase unless directly useful:

- `docs/unregistered-scene-ui-requirements.md`
- the theme-setting document whose filename starts with `docs/` and contains `项目设定`

## 2. Scope

Required deliverables:

- A final report at `docs/phase-21-distinct-puzzle-ladder-production-final-report.md`.
- A Phase 21 evidence folder under `docs/phase-21/`.
- A proof-skeleton catalog at `docs/phase-21/proof-skeleton-catalog.md`.
- Candidate evidence covering:
  - skeleton intent;
  - authoring report/score/minimize output;
  - anti-clone report;
  - novelty claim decision;
  - promotion or rejection reason.
- At least two promoted new cases, unless the phase returns `READY_FOR_CHECK_WITH_BLOCKER` with evidence that the current DSL/generator cannot yet create two non-clone additions.
- Updated `content/novelty-claims.json` for all player-facing selector cases.
- Updated web selector and case verification tests.
- Full validation, local smoke, online HTTP, Pages, and boundary evidence.

Allowed implementation changes:

- Add private Phase 21 experimental candidates under `content/experimental/phase-21`.
- Add shipped case JSONs or replace rejected Phase 19 JSONs only when candidates pass all gates.
- Update `apps/web/src/content/cases.ts` and focused web tests.
- Add authoring/generator helper tests only when needed to support candidate assessment, not to weaken gates.
- Update docs under `docs/phase-21`.
- Update README/development-plan status after the phase is complete.

## 3. Non-Scope

Do not implement these in Phase 21:

- New Puzzle Schema v1 rule semantics.
- Solver architecture rewrite, SAT/WASM backend, or oracle expansion.
- New proof technique implementation.
- Public editor, visual editor, UGC upload/share, backend, accounts, analytics, leaderboard, daily challenge, PWA/offline mode, or server-signed content.
- Broad UI redesign or theme/VN implementation.
- Public player exposure of generator output, target layouts, forced cells, candidate counts, proof internals, authoring diagnostics, or anti-clone internals.
- Fabricated playtest feedback or difficulty calibration claims.
- A forced 8-case selector.
- Re-promoting rejected Phase 19 clone cases without superior evidence.
- GitHub Release creation or version tagging unless the planner/user explicitly asks for it.

## 4. Fixed Per-Round Workflow

At the start of every round:

1. Read this guide and `Role.md`.
2. Run `git status --short --branch`.
3. Choose one narrow round goal from the round plan.
4. Leave unrelated user or planner files untouched, including unrelated untracked docs.

During implementation:

1. Start from proof skeletons and novelty claims, not visual map variations.
2. Do not ship a candidate until it passes standard validation, Phase 19 quality gates, Phase 20 anti-clone gates, and web runtime verification.
3. A candidate that is formally valid but proof-trace-equivalent to an existing case is rejected.
4. A candidate that requires map padding to look different is rejected.
5. A candidate with only a vague novelty claim is rejected.
6. Preserve `case-004`, `case-011`, and `case-012` as accepted baseline cases.
7. Keep generated/experimental candidates out of `apps/web/src/content/cases.ts` unless deliberately promoted.

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

Additional focused validation expected during content rounds:

```powershell
pnpm --filter @room-axioms/authoring test
pnpm --filter @room-axioms/generator test
pnpm --filter @room-axioms/web test -- src/content/caseVerification.test.ts src/content/runtimeSmoke.test.ts src/runtime/analyzer.test.ts src/runtime/facade.test.ts
pnpm authoring -- report <case-path>
pnpm authoring -- score <case-path>
pnpm authoring -- minimize <case-path>
pnpm authoring -- minimize <case-path> --require-technique <TECHNIQUE_ID>
pnpm authoring -- anti-clone <selector-case-paths...> --novelty-manifest content/novelty-claims.json
```

Run local smoke before final report:

```powershell
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StartDevServer.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Smoke.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StopDevServer.cmd
```

Do not stage unrelated files, `apps/web/dist`, `node_modules`, coverage output, local smoke logs, generated bulk datasets, cache files, or rejected generated cases outside accepted evidence folders.

## 6. Round Plan

### Round 1 - Baseline And Acceptance Contract

Goal:

- Produce `docs/phase-21/baseline-acceptance-contract.md`.
- Reconfirm the repaired selector: `case-011`, `case-012`, `case-004`.
- Record the minimum content target:
  - promote at least two genuinely distinct new cases; or
  - return `READY_FOR_CHECK_WITH_BLOCKER` if the current tooling/DSL cannot produce two after documented attempts.
- Record all gates that a candidate must pass.

Validation:

- `pnpm authoring -- anti-clone content/cases/case-011.json content/cases/case-012.json content/cases/case-004.json --novelty-manifest content/novelty-claims.json`
- `git diff --check`.

### Round 2 - Proof Skeleton Catalog

Goal:

- Produce `docs/phase-21/proof-skeleton-catalog.md`.
- Define at least six candidate skeletons before writing case JSON:
  - local-count intro with a different final-cell topology from `case-012`;
  - intersection case with a different dependency graph from `case-011`;
  - difference case with a different dependency graph from `case-012`;
  - mixed case that cannot collapse to `case-004`;
  - two experimental skeletons that may fail but probe the DSL ceiling.

PASS note:

- Skeletons must describe proof movement and candidate narrowing, not just board size or story.

### Round 3 - Authoring Templates And Candidate Fixtures

Goal:

- Create private Phase 21 templates/candidate fixture area under `content/experimental/phase-21`.
- Build candidate JSONs from skeletons, not by modifying accepted case coordinates.
- Record source skeleton for every candidate.

### Round 4 - Local-Count Candidate Attempt

Goal:

- Author or sample one local-count candidate.
- It must not share the B3/C3 answer pattern or proof trace that caused Phase 20 rejections.
- Run report, score, minimize, and anti-clone checks.

Outcome:

- Promote only if accepted by all gates.
- Otherwise record rejection evidence and continue.

### Round 5 - Intersection Candidate Attempt

Goal:

- Author or sample one intersection candidate.
- It must be distinct from `case-011` under proof-trace and candidate-shrink gates.
- Require `LOCAL_SCOPE_INTERSECTION` retention when appropriate.

### Round 6 - Difference Candidate Attempt

Goal:

- Author or sample one difference candidate.
- It must be distinct from `case-012` under proof-trace and candidate-shrink gates.
- Require `LOCAL_SCOPE_DIFFERENCE` retention when appropriate.

### Round 7 - Mixed Candidate Attempt

Goal:

- Author or sample one mixed candidate.
- It must not collapse to `case-004` after effective-board reduction.
- It must differ from `case-004` in proof-trace and rule-impact vector.

### Round 8 - Second-Pass Repair On Best Candidates

Goal:

- Pick the best rejected or near-pass candidates from rounds 4-7.
- Repair them by changing proof skeleton, not by adding padding.
- Re-run standard and anti-clone gates.

### Round 9 - Generator Capability Evidence

Goal:

- Run bounded generator/authoring attempts using Phase 21 skeleton templates.
- Record:
  - attempts;
  - accepted candidates;
  - rejected candidates;
  - rejection reasons;
  - whether rejection was caused by anti-clone gates, proof gaps, uniqueness failure, or triviality.

PASS note:

- Honest zero-accepted generator output is acceptable if manual authoring still produces the required promotions or the phase reports a blocker.

### Round 10 - First Promotion Decision

Goal:

- Promote the first accepted non-clone case if one exists.
- Update `content/novelty-claims.json`, web selector, and focused tests.
- Record why it is distinct from every existing selector case.

### Round 11 - Second Promotion Decision

Goal:

- Promote the second accepted non-clone case if one exists.
- Update `content/novelty-claims.json`, web selector, and focused tests.
- If no second accepted case exists, document the blocker and do not pad.

### Round 12 - Selector Ladder Ordering And Copy

Goal:

- Order the selector as a readable difficulty ladder.
- Keep `case-004` default unless there is a strong reason to change it.
- Ensure player-facing names are clear and Chinese.
- Ensure rejected Phase 19 cases remain absent from selector.

### Round 13 - Buffer Fixes

Use this only for:

- content validation failures;
- anti-clone false positives or false negatives;
- proof/no-guess gaps;
- selector/runtime regressions;
- P0/P1 player-facing copy or secrecy issues.

Do not use this round for theme/VN implementation, new DSL/proof semantics, broad UI redesign, or public editor/backend.

### Round 14 - Final Candidate Gate Sweep

Goal:

- Run a combined anti-clone report on the entire proposed selector.
- Run authoring report/score/minimize for every promoted new case.
- Confirm novelty claims are accepted for all player-facing cases.
- Confirm all rejected/experimental candidates are out of the player selector.

### Round 15 - Runtime Smoke And Pages Prep

Goal:

- Run focused web runtime tests on the final selector.
- Run local smoke.
- Confirm player UI does not expose target/candidate/forced/generator/authoring/anti-clone internals.
- Prepare online smoke evidence after final push if Pages deploy completes.

### Round 16 - Final Validation And Report

Goal:

- Run full validation.
- Run focused authoring/generator/web tests.
- Run local smoke and online HTTP checks.
- Check GitHub Pages deploy health after final push.
- Produce `docs/phase-21-distinct-puzzle-ladder-production-final-report.md`.

Required final evidence:

- Proof skeleton catalog.
- Candidate attempt table.
- Promotion/rejection decisions.
- Final selector list.
- Anti-clone report for final selector.
- Novelty claims for all player-facing cases.
- Generator capability report.
- Boundary and player-secrecy evidence.

## 7. PASS Criteria

Phase 21 passes only when all are true:

- Final report exists at `docs/phase-21-distinct-puzzle-ladder-production-final-report.md`.
- `docs/phase-21/` contains baseline contract, skeleton catalog, candidate evidence, generator capability evidence, promotion decisions, and final selector evidence.
- At least two new player-facing cases are promoted beyond the Phase 20 selector, or the phase returns `READY_FOR_CHECK_WITH_BLOCKER` instead of PASS.
- Every player-facing selector case passes:
  - schema parse;
  - target rule satisfaction;
  - initial satisfiability;
  - final target layout uniqueness;
  - proof/no-guess verification;
  - Phase 19 quality gates;
  - Phase 20 anti-clone gates;
  - focused web runtime verification.
- Every player-facing case has an accepted novelty claim in `content/novelty-claims.json`.
- No promoted case is accepted only because it is a coordinate transform, label swap, padded map, same proof skeleton, or same candidate-shrink/rule-impact pattern.
- Rejected Phase 19 cases do not re-enter the player selector.
- Generator/authoring evidence reports attempts, accepted candidates, rejected candidates, and rejection reasons honestly.
- Full validation passes: lint, typecheck, tests, build, and `git diff --check`.
- Local smoke and online HTTP smoke pass.
- GitHub Pages final deployment succeeds.
- Domain remains schema/solver/proof/oracle/generator/authoring/Zod/UI/fs-free.
- Solver/proof/generator/authoring packages remain independent of React/Vite/browser UI code outside tests.
- Authoring/generator tooling is not imported by player-facing web code or shipped content.
- Experimental/rejected candidates remain out of the player selector.
- Target reads remain limited to existing targetAccess, verification, tests, conclusion checking, performance baseline, and explicit developer-only surfaces.
- No public editor, UGC, backend, analytics, daily challenge, broad UI redesign, breaking schema migration, new proof technique, or new shipped DSL rule enters this phase.
- Working tree has no unexpected tracked changes and the final commit is pushed.

## 8. Debug Self-Check Template

Use this every round:

```text
Debug self-check:
- Smallest candidate/skeleton tested:
- Standard validation covered:
- Anti-clone report covered:
- Novelty claim covered:
- Proof/no-guess path covered:
- Rejected Phase 19 cases stayed out:
- Generator/authoring rejection evidence recorded:
- Runtime/player secrecy checked:
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
- Generator/authoring remain private maintainer tooling:
- Candidate design starts from proof skeletons, not map padding:
- Anti-clone gates consume public APIs rather than duplicating solver/proof semantics:
- Shipped content is intentionally promoted:
- Experimental/rejected candidates remain private:
- Target access stayed behind the narrow app boundary:
- Player marks stayed out of solver/proof facts:
- Developer-only data stayed gated:
- Theme/VN/editor/backend/new DSL/new proof technique scope avoided:
- Unrelated files left untouched:
```

## 10. Final Report Template

```markdown
# Phase 21 Distinct Puzzle Ladder Production Final Report

Status: READY_FOR_CHECK
Guide: `docs/phase-21-distinct-puzzle-ladder-production-goal-mode-execution-guide.md`
Phase: Phase 21 - Distinct Puzzle Ladder Production

## Summary
## Files Changed By Category
## Proof Skeleton Catalog
## Candidate Attempts
## Promoted Cases
## Rejected Cases
## Final Selector And Novelty Claims
## Anti-Clone Evidence
## Generator Capability Evidence
## Validation
## Smoke And Pages Evidence
## Boundary Scans
## Commits
## PASS Criteria
## Blockers Or Follow-Up Notes
```
