# Phase 11 Candidate Promotion And Playtest Calibration Goal Mode Execution Guide

Date: 2026-06-24
Status: execution guide for the executor
Phase: Phase 11 - Candidate Promotion And Playtest Calibration
Round budget: 12 executor rounds; rounds 1-8 are main implementation, rounds 9-11 are buffer/fix rounds, round 12 is final validation and report.

## 0. Direct Goal Prompt For Executor

You are executing Phase 11 of Room Axioms: Candidate Promotion And Playtest Calibration.

Read this guide, `README.md`, `Role.md`, `docs/development-plan.md`, `docs/phase-10-authoring-cli-proof-technique-hardening-final-report.md`, `docs/phase-10/authoring-cli-maintainer-workflow.md`, `docs/phase-10/authoring-cli-artifact-policy.md`, `content/experimental/phase-10`, `content/cases`, `apps/web/src/content`, `apps/web/src/view`, `packages/authoring`, `packages/generator`, `packages/proof`, `packages/schema`, and `packages/solver`.

Within 12 executor rounds:

- Use the private authoring CLI and existing public package APIs to evaluate experimental and hand-authored candidate cases.
- Promote a small set of validated mid-band cases into shipped content only after schema, solver, proof/no-guess, final uniqueness, runtime loading, copy, accessibility, and smoke evidence pass.
- Preserve `case-004` as the default case unless the planner explicitly changes that in a later phase.
- Keep generated candidates report-only until a specific candidate is selected, reviewed, copied into `content/cases`, and wired into `apps/web/src/content/cases.ts`.
- Add or update authoring/playtest evidence under `docs/phase-11/` without fabricating participant feedback.
- Review player-facing case names, rule copy, hint copy, and success/failure copy for promoted cases.
- Keep difficulty labels internal or clearly provisional unless real playtest evidence supports public calibration.
- Validate, commit, and push each successful round before moving on.

Use `$donextgoal` to execute this guide. When complete, report back to planner thread `019ef0df-a626-7181-9ca6-1cc75c1f4c47`.

## 1. Required Context

- `README.md`
- `AGENTS.md`
- `Role.md`
- `docs/development-plan.md`
- `docs/phase-10-authoring-cli-proof-technique-hardening-final-report.md`
- `docs/phase-10-authoring-cli-proof-technique-hardening-goal-mode-execution-guide.md`
- `docs/phase-10/authoring-cli-maintainer-workflow.md`
- `docs/phase-10/authoring-cli-artifact-policy.md`
- `docs/phase-10/local-scope-intersection-semantics.md`
- `docs/phase-9/technique-expansion-decision.md`
- `docs/phase-9/authoring-workflow-roadmap.md`
- `content/experimental/phase-10`
- `content/cases`
- `apps/web/src/content`
- `apps/web/src/runtime`
- `apps/web/src/view`
- `packages/authoring`
- `packages/generator`
- `packages/proof`
- `packages/schema`
- `packages/solver`

Phase 10 is accepted. Treat `LOCAL_SCOPE_INTERSECTION` and the private authoring CLI as available production internals. Treat difficulty scores as uncalibrated diagnostics until real playtest evidence exists.

## 2. Scope

Required deliverables:

- A final report at `docs/phase-11-candidate-promotion-playtest-calibration-final-report.md`.
- A Phase 11 evidence folder under `docs/phase-11/` containing candidate reports, promotion decisions, playtest protocol/logs, and release notes.
- At least one promoted mid-band case, and preferably two to three, if they pass all gates without weakening validation.
- New shipped case files under `content/cases` only for accepted promotions.
- Updated `apps/web/src/content/cases.ts` only for accepted promotions.
- Runtime/content tests proving promoted cases load, validate, remain no-guess explainable, and do not leak target/candidate/forced-cell internals to players.
- Copy review for promoted case names and rules using the current plain-language style.
- Browser or deterministic smoke evidence for the case selector, default `case-004`, promoted cases, mobile layout, keyboard navigation, and player secrecy.
- Playtest protocol and honest feedback log. If no real playtest participants are available, record an empty log and do not fabricate findings.
- Updated docs and development plan for Phase 11 completion state.

Promotion gates for every shipped case:

- Puzzle Schema v1 parse passes.
- Target satisfies all public rules.
- Initial observations are satisfiable.
- Final guest layout is unique.
- `verifyNoGuess` passes without solver truncation, proof gaps, or guess points.
- Authoring `validate` or `report` returns `ok: true`.
- `score` returns `calibratedWithRealPlaytest: false` unless real playtest evidence is recorded.
- Web runtime can analyze the initial state without errors or player-facing developer leakage.
- Rule/case copy is Chinese and player-readable.
- Case is intentionally wired into `contentCases` and the selector.

## 3. Non-Scope

Do not implement these in Phase 11:

- Public editor, visual editor, UGC upload/share, backend, accounts, analytics, leaderboard, daily challenge, PWA/offline mode, or server-signed content.
- Breaking Puzzle Schema v1 changes.
- New shipped DSL rule kinds such as row/column `lineCount`, Manhattan distance, visibility, or blocker rules.
- `LOCAL_SCOPE_DIFFERENCE`; leave it for a later proof-technique phase.
- SAT/WASM solver replacement or broad solver architecture rewrite.
- Broad visual redesign, landing page redesign, or unrelated UI theming.
- Public player exposure of generator, target layout, forced cells, candidate counts, proof internals, or authoring diagnostics.
- Automatic promotion from generator output into shipped content.
- Public difficulty labels calibrated from non-existent playtest data.

## 4. Fixed Per-Round Workflow

At the start of every round:

1. Read this guide and `Role.md`.
2. Run `git status --short --branch`.
3. Choose one narrow round goal from the plan below.
4. Check for unrelated user or executor changes and leave them alone.

During implementation:

1. Keep `case-004` as the default case.
2. Keep generated and experimental artifacts outside shipped content until a specific promotion is selected.
3. Use `pnpm authoring -- validate|report|score|minimize|sample` for evidence instead of duplicating validation logic.
4. Do not loosen caps or proof checks to make a case pass.
5. Preserve plain Chinese player-facing copy.
6. Keep player marks out of solver/proof facts.
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

When only docs change, focused docs validation plus `git diff --check` is acceptable for that round. When content or web selector files change, run full validation and local smoke. When authoring CLI evidence changes, run the relevant `pnpm authoring -- ...` command and record output or a summarized report under `docs/phase-11/`.

Do not stage unrelated files, `apps/web/dist`, `node_modules`, coverage output, local smoke logs, generated bulk datasets, cache files, or unaccepted generated cases.

## 6. Round Plan

### Round 1 - Promotion Baseline And Candidate Inventory

Goal:

- Create `docs/phase-11/` with promotion checklist, issue register, and candidate inventory.
- Run authoring `report` and `score` for existing Phase 10 experimental fixtures.
- Decide which candidates are eligible for promotion attempts.

Architecture self-check:

- Authoring CLI remains the evidence path.
- Experimental fixtures remain out of shipped content.

### Round 2 - Candidate Selection And Copy Plan

Goal:

- Select one to three candidate cases for promotion.
- Draft Chinese case names, rule titles, and player-facing copy.
- Record rejection reasons for candidates not selected.

Architecture self-check:

- Copy changes do not alter puzzle mechanics.
- Difficulty remains provisional.

### Round 3 - Promote First Mid-Band Case

Goal:

- Add the first accepted candidate to `content/cases`.
- Wire it into `apps/web/src/content/cases.ts`.
- Add content/runtime tests proving it loads and validates.

Architecture self-check:

- Default `case-004` remains unchanged.
- No experimental path is imported directly by the app.

### Round 4 - Promote Additional Candidate Or Stop With Evidence

Goal:

- Promote a second candidate if one passes all gates.
- If no second candidate is ready, record why and do not force content.

Architecture self-check:

- Quality gate beats case count.
- No validation cap is weakened to pass a candidate.

### Round 5 - Runtime And Hint Compatibility

Goal:

- Verify promoted cases through web runtime analysis and proof-backed hints.
- Add or update tests to prevent target/candidate/forced-cell leakage in player mode.

Architecture self-check:

- Solver/proof facts remain behind runtime contracts.
- Player UI shows only public, human-readable explanations.

### Round 6 - Plain-Language Rule And Case Copy Review

Goal:

- Review all shipped case names and promoted rules for current Chinese wording standards.
- Keep "上下左右邻格" and "周围一圈" terminology consistent.
- Remove any redundant developer-style phrasing from promoted content.

Architecture self-check:

- UI copy remains app/content layer work, not domain logic.
- Rules stay semantically equivalent.

### Round 7 - Accessibility, Responsive, And Selector Smoke

Goal:

- Verify promoted cases in the case selector.
- Smoke keyboard navigation, mobile layout, dialogs, and submit flow.
- Record deterministic evidence under `docs/phase-11/`.

Architecture self-check:

- Selector remains static-bundle compatible.
- Mobile and keyboard behavior remains case-agnostic.

### Round 8 - Playtest Protocol And Release Candidate Decision

Goal:

- Prepare or update playtest protocol for the promoted cases.
- Record real feedback if available; otherwise record an explicit empty log.
- Produce a Phase 11 release-candidate decision for promoted content.

Architecture self-check:

- No fabricated feedback.
- Public difficulty calibration remains deferred without real evidence.

### Rounds 9-11 - Buffer Fixes

Use these only for:

- content validation failures;
- proof/hint copy regressions caused by promoted cases;
- selector/runtime smoke failures;
- accessibility or responsive issues caused by promoted cases;
- documentation gaps in the promotion evidence.

Do not use buffer rounds for public editor, UGC, new DSL semantics, broad redesign, or unrelated refactors.

### Round 12 - Final Validation And Report

Goal:

- Run full validation.
- Run authoring reports for promoted cases.
- Run local smoke because shipped content and selector files changed.
- Produce `docs/phase-11-candidate-promotion-playtest-calibration-final-report.md`.
- Confirm working tree is clean, final commit is pushed, and Pages deploy health is checked if the project workflow exposes it.

Required commands:

```powershell
pnpm lint
pnpm typecheck
pnpm test
pnpm build
git diff --check
git status --short --branch
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StartDevServer.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Smoke.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StopDevServer.cmd
```

## 7. PASS Criteria

Phase 11 passes only when all are true:

- Final report exists at `docs/phase-11-candidate-promotion-playtest-calibration-final-report.md`.
- Full validation passes: lint, typecheck, tests, build, and `git diff --check`.
- Local smoke passes for shipped content and selector changes.
- At least one mid-band candidate is promoted, or the final report explains why no candidate met the gate and leaves shipped content unchanged.
- Every promoted case passes schema, target rules, initial satisfiability, final uniqueness, proof/no-guess, authoring report, and runtime loading.
- `case-004` remains the default case.
- All shipped case names are Chinese.
- Promoted rule/case copy uses current plain-language terms and avoids abstract scope labels in player-facing text.
- Experimental fixtures and generator samples are not imported by default web content unless explicitly promoted as copied shipped cases.
- Difficulty scoring remains explicitly uncalibrated unless real playtest evidence is recorded.
- Playtest feedback log is honest, even if empty.
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
- Smallest candidate or player workflow tested:
- Success path covered:
- Failure/rejection path covered:
- Empty/no-participant/no-candidate path covered:
- Cap/truncation status checked:
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
# Phase 11 Candidate Promotion And Playtest Calibration Final Report

Status: READY_FOR_CHECK
Guide: `docs/phase-11-candidate-promotion-playtest-calibration-goal-mode-execution-guide.md`
Phase: Phase 11 - Candidate Promotion And Playtest Calibration

## Summary
## Files Changed By Category
## Candidate Inventory
## Promotion Decisions
## Promoted Case Evidence
## Authoring CLI Evidence
## Runtime And UI Smoke Evidence
## Copy Review
## Playtest Evidence
## Validation
## Boundary Scans
## Commits
## PASS Criteria
## Blockers Or Follow-Up Notes
```
