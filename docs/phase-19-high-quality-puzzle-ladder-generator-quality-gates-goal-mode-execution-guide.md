# Phase 19 High-Quality Puzzle Ladder And Generator Quality Gates Goal Mode Execution Guide

Date: 2026-06-25
Status: execution guide for the executor
Phase: Phase 19 - High-Quality Puzzle Ladder And Generator Quality Gates
Round budget: 14 executor rounds; rounds 1-11 are main content/tooling work, rounds 12-13 are buffer and release hardening, round 14 is final validation and report.

## 0. Direct Goal Prompt For Executor

You are executing Phase 19 of Room Axioms: High-Quality Puzzle Ladder And Generator Quality Gates.

Read this guide, `README.md`, `Role.md`, `docs/development-plan.md`, `docs/high-quality-puzzle-production-plan.md`, `docs/phase-18-public-playtest-launch-package-metadata-cleanup-final-report.md`, `packages/generator/README.md`, `packages/authoring/src`, `packages/generator/src`, `packages/proof/src`, `apps/web/src/content`, and `content/cases`.

The user playtested the current demo and found that only `case-004`, `case-011`, and `case-012` are real puzzles. `case-001` to `case-003` and `case-008` to `case-010` are opening-state trivial; `case-005` to `case-007` are mirror variants of `case-004`. Your goal is to replace the filler experience with a real difficulty ladder and demonstrate the current automation ceiling honestly.

Within 14 executor rounds:

- Audit all shipped cases and record which are keep/reskin/demote/replace.
- Add automated quality gates for opening ambiguity, rule contribution, non-isomorphism, technique retention, and no trivial global-count closure.
- Use authoring/generator tooling plus manual review to produce a player-facing 8-10 case difficulty ladder.
- Demote trivial and mirror cases to internal fixtures or explicitly non-player-facing evidence; do not present them as distinct player-facing puzzles.
- Preserve or reskin the currently useful cases: `case-004`, `case-011`, and `case-012`.
- Promote only cases that pass schema, solver, proof/no-guess, final uniqueness, quality gates, web runtime compatibility, and player-secrecy checks.
- Report generator/authoring success rate and rejection breakdown. Do not pretend that generation is fully automatic if most candidates are rejected.
- Do not change Puzzle Schema v1 semantics, solver/proof algorithms, public editor scope, UGC, backend, analytics, daily challenge, broad UI redesign, or theme/VN systems in this phase.
- Validate, commit, and push each successful round before moving on.

Use `$donextgoal` to execute this guide. When complete, report back to planner thread `019ef0df-a626-7181-9ca6-1cc75c1f4c47`.

## 1. Required Context

- `README.md`
- `AGENTS.md`
- `Role.md`
- `docs/development-plan.md`
- `docs/high-quality-puzzle-production-plan.md`
- `docs/phase-18-public-playtest-launch-package-metadata-cleanup-final-report.md`
- `packages/generator/README.md`
- `packages/generator/src/difficulty.ts`
- `packages/generator/src/filter.ts`
- `packages/generator/src/minimization.ts`
- `packages/generator/src/sampling.ts`
- `packages/authoring/src`
- `packages/proof/src`
- `packages/solver/src`
- `apps/web/src/content`
- `content/cases`
- `content/experimental`
- `.codex/project-ops-workflow.json`
- `.codex/project-git-workflow.json`

Related but out of this phase unless directly useful as copy context:

- `docs/unregistered-scene-ui-requirements.md`
- `docs/未登记现场_项目设定与玩法对接文档.md`

## 2. Scope

Required deliverables:

- A final report at `docs/phase-19-high-quality-puzzle-ladder-generator-quality-gates-final-report.md`.
- A Phase 19 evidence folder under `docs/phase-19/`.
- A current-case audit with:
  - authoring score/report for each shipped case;
  - keep/reskin/demote/replace decision;
  - explanation of trivial cases and mirror variants.
- Automated quality gates covering:
  - opening ambiguity;
  - rule contribution;
  - non-isomorphism / mirror duplicate detection;
  - required technique retention after minimization;
  - rejection of non-onboarding cases with zero proof waves or zero deductions.
- A promoted player-facing difficulty ladder of 8-10 cases.
- Web selector order updated to reflect the ladder.
- Internal fixture policy for demoted trivial/mirror cases.
- Generator/authoring run evidence:
  - attempts;
  - accepted candidates;
  - rejection breakdown;
  - best accepted candidate per tier;
  - manual review notes.
- Full validation, smoke, online HTTP, Pages, and boundary evidence.

Allowed implementation changes:

- Add tests and authoring/generator helpers for quality gates.
- Add or revise private generation templates.
- Add experimental candidate JSON under `content/experimental/phase-19`.
- Replace shipped case JSONs when candidates pass all gates.
- Update `apps/web/src/content/cases.ts` and case verification tests for the final ladder.
- Update README/development-plan copy that describes the real player-facing case set.

## 3. Non-Scope

Do not implement these in Phase 19:

- New Puzzle Schema v1 rule semantics.
- Solver architecture rewrite, SAT/WASM backend, or oracle expansion.
- New proof technique implementation unless the planner explicitly opens a separate proof phase.
- Public editor, visual editor, UGC upload/share, backend, accounts, analytics, leaderboard, daily challenge, PWA/offline mode, or server-signed content.
- Broad UI redesign or 《未登记现场》 visual-novel/theme implementation.
- Public player exposure of generator output, target layouts, forced cells, candidate counts, proof internals, authoring diagnostics, or internal metadata.
- Fabricated playtest feedback or difficulty calibration claims.
- GitHub Release creation or version tagging unless the planner/user explicitly asks for it during this phase.

## 4. Fixed Per-Round Workflow

At the start of every round:

1. Read this guide and `Role.md`.
2. Run `git status --short --branch`.
3. Choose one narrow round goal from the round plan.
4. Check for unrelated user or executor changes and leave them alone.

During implementation:

1. Do not stage unrelated untracked docs unless they are explicitly part of this phase.
2. Preserve `case-004`, `case-011`, and `case-012` unless a better non-isomorphic replacement is intentionally promoted with evidence.
3. Treat current `case-001` to `case-003`, `case-005` to `case-010` as suspect until quality gates decide their final location.
4. Keep generated/experimental candidates out of `apps/web/src/content/cases.ts` unless deliberately promoted.
5. Do not claim real difficulty calibration; scores remain provisional until real playtest evidence exists.
6. Every promoted case must remain human-explainable, no-guess, unique at completion, and player-secret-safe.

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
pnpm authoring -- report <case-path>
pnpm authoring -- score <case-path>
pnpm authoring -- minimize <case-path>
pnpm authoring -- minimize <case-path> --require-technique <TECHNIQUE_ID>
pnpm --filter @room-axioms/web test -- src/content/caseVerification.test.ts src/content/runtimeSmoke.test.ts src/runtime/analyzer.test.ts src/runtime/facade.test.ts
```

Run local smoke before final report:

```powershell
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StartDevServer.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Smoke.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StopDevServer.cmd
```

Do not stage unrelated files, `apps/web/dist`, `node_modules`, coverage output, local smoke logs, generated bulk datasets, cache files, or rejected generated cases outside the accepted evidence folders.

## 6. Round Plan

### Round 1 - Current Case Audit

Goal:

- Produce `docs/phase-19/current-case-audit.md`.
- Run authoring report/score for all shipped cases.
- Record player-facing decision for each shipped case: keep, reskin, demote, replace.
- Confirm the known issue:
  - `case-001` to `case-003` and `case-008` to `case-010` are opening-trivial.
  - `case-005` to `case-007` are mirror variants of `case-004`.

Validation:

- Focused authoring commands for all shipped cases.
- `git diff --check`.

### Round 2 - Quality Gate Contracts

Goal:

- Define machine-readable quality gate result types and fixture helpers.
- Add tests for:
  - opening ambiguity;
  - zero proof-wave rejection;
  - zero deduction rejection;
  - non-onboarding trivial closure rejection.

Architecture self-check:

- Quality gates consume public authoring/generator/proof/solver APIs; they must not duplicate solver semantics.

### Round 3 - Rule Contribution Gate

Goal:

- Implement a report-only rule contribution checker.
- For each rule, remove it and re-run the relevant checks to determine whether it contributes.
- Add tests for useful, redundant, and purely decorative rule cases.

PASS note:

- This gate can warn rather than hard-fail during discovery, but promoted cases must not contain multiple redundant rules.

### Round 4 - Non-Isomorphism Gate

Goal:

- Implement mirror/rotation duplicate detection for board shapes supported by the shipped cases.
- Add tests proving `case-005` to `case-007` are equivalent to `case-004` or record the precise equivalence class.
- Add a report that identifies duplicate signatures across shipped cases.

Architecture self-check:

- This gate must be about player-facing puzzle shape, not about target spoilers in runtime UI.

### Round 5 - Technique Retention Gate

Goal:

- Extend authoring reports or tests so promoted cases can require retained proof techniques after minimization.
- Cover `LOCAL_SCOPE_INTERSECTION`, `LOCAL_SCOPE_DIFFERENCE`, and mixed-technique examples.

Validation:

- Existing proof/authoring tests pass.
- Focused minimize commands for `case-011` and `case-012`.

### Round 6 - Template Families And Sampling Evidence

Goal:

- Create Phase 19 private generation templates under `content/experimental/phase-19`.
- At minimum include:
  - local count/exclusion template;
  - intersection template;
  - difference template;
  - mixed 4x4 template.
- Run report-only sampling/generation with capped attempts.
- Record acceptance/rejection breakdown.

Non-scope:

- Do not ship generated candidates yet.

### Round 7 - Tier 0-1 Candidates

Goal:

- Author or generate onboarding and first-deduction replacements for current trivial cases.
- Target:
  - one onboarding case that is not solved at open;
  - two first-deduction cases.
- Validate QG-1 through QG-7.

Candidate themes from the plan:

- 《别按那个键：封锁线外》
- 《无主病床》
- 《最后一席》

### Round 8 - Tier 2 Candidates

Goal:

- Preserve/reskin `case-011` as an intersection intro.
- Author or generate one additional non-isomorphic intersection case.
- Validate required `LOCAL_SCOPE_INTERSECTION` retention.

Candidate theme:

- 《无灯楼层》

### Round 9 - Tier 3 Candidates

Goal:

- Preserve/reskin `case-012` as a difference intro.
- Author or generate one additional non-isomorphic difference case.
- Validate required `LOCAL_SCOPE_DIFFERENCE` retention.

Candidate theme:

- 《缺席货舱》

### Round 10 - Tier 4-5 Candidates

Goal:

- Preserve/reskin `case-004` as one mixed 4x4 baseline.
- Author or generate one mixed mid-band case.
- Attempt one showcase/automation-ceiling case.
- Do not promote the showcase case if it is merely tedious, truncated, or not human-explainable.

Candidate themes:

- 《重复遗体》
- 《未放映母带》
- 《缺席货舱：舱门复核》

### Round 11 - Promotion And Selector Ladder

Goal:

- Promote only the accepted ladder cases to `content/cases`.
- Update `apps/web/src/content/cases.ts`.
- Update case verification tests.
- Demote or remove filler cases from player selector. If retained in repo, move them to an internal fixture/experimental path and document why.
- Keep final player-facing ladder at 8-10 meaningful cases.

PASS note:

- The selector must not present mirror variants or opening-trivial cases as normal player-facing puzzles.

### Round 12 - Web Runtime And Player Secrecy Hardening

Goal:

- Run focused web runtime tests on the final ladder.
- Confirm player hints, wrong submissions, summaries, and selector metadata do not leak target layouts or generator internals.
- Update player-facing case names/difficulty ordering where needed.

Validation:

- Focused web tests.
- Boundary scans.
- Local smoke if UI/content selector changed significantly.

### Round 13 - Buffer Fixes

Use this only for:

- quality gate false positives/false negatives;
- content validation failures;
- proof explanation gaps;
- selector/runtime regressions;
- P0/P1 player-facing copy or secrecy defects;
- one additional replacement candidate if a promoted candidate fails late.

Do not use this round for:

- theme/VN implementation;
- new DSL/proof semantics;
- broad UI redesign;
- public editor or backend.

### Round 14 - Final Validation And Report

Goal:

- Run full validation.
- Run focused authoring/generator/web tests.
- Run local smoke and online HTTP checks.
- Check GitHub Pages deploy health after final push.
- Produce `docs/phase-19-high-quality-puzzle-ladder-generator-quality-gates-final-report.md`.

Required final evidence:

- Final ladder list and difficulty order.
- Demoted/replaced case list.
- Quality gate PASS table for every shipped player-facing case.
- Generator/authoring attempt and rejection breakdown.
- Proof technique coverage summary.
- Runtime performance and player-secrecy evidence.

## 7. PASS Criteria

Phase 19 passes only when all are true:

- Final report exists at `docs/phase-19-high-quality-puzzle-ladder-generator-quality-gates-final-report.md`.
- `docs/phase-19/` contains current-case audit, quality gate evidence, generation reports, promotion decision, and final ladder evidence.
- The player-facing selector presents an 8-10 case difficulty ladder.
- `case-004`, `case-011`, and `case-012` are preserved/reskinned or replaced only with documented superior non-isomorphic cases.
- Current trivial cases are demoted, replaced, or clearly excluded from normal player-facing ladder.
- No normal shipped player-facing case has `initialGuestLayouts = 1`, `proofWaveCount = 0`, or `deductionCount = 0`, except an explicitly labeled onboarding case that still has at least 2 opening candidate layouts.
- No normal shipped player-facing case is merely a mirror/rotation duplicate of another shipped case.
- Every promoted case passes:
  - Puzzle Schema v1 parse;
  - target rule satisfaction;
  - initial satisfiability;
  - final target layout uniqueness;
  - proof/no-guess verification;
  - quality gates;
  - focused web runtime verification.
- Required technique cases retain their required technique after reveal minimization.
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
- Working tree is clean and final commit is pushed.

## 8. Debug Self-Check Template

Use this every round:

```text
Debug self-check:
- Smallest content/tooling fixture tested:
- Trivial opening-state failure covered:
- Rule contribution covered:
- Duplicate/isomorphism covered:
- Required technique retention covered:
- Proof/no-guess path covered:
- Runtime/player secrecy checked:
- Rejected candidate evidence recorded:
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
- Quality gates consume public APIs rather than duplicating solver/proof semantics:
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
# Phase 19 High-Quality Puzzle Ladder And Generator Quality Gates Final Report

Status: READY_FOR_CHECK
Guide: `docs/phase-19-high-quality-puzzle-ladder-generator-quality-gates-goal-mode-execution-guide.md`
Phase: Phase 19 - High-Quality Puzzle Ladder And Generator Quality Gates

## Summary
## Files Changed By Category
## Current Case Audit
## Quality Gates
## Generator And Authoring Evidence
## Promoted Difficulty Ladder
## Demoted Or Replaced Cases
## Proof Technique Coverage
## Validation
## Smoke And Pages Evidence
## Boundary Scans
## Commits
## PASS Criteria
## Blockers Or Follow-Up Notes
```
