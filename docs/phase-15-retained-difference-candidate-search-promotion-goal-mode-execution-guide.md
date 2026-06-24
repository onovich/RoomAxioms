# Phase 15 Retained Difference Candidate Search And Promotion Goal Mode Execution Guide

Date: 2026-06-24
Status: execution guide for the executor
Phase: Phase 15 - Retained Difference Candidate Search And Promotion
Round budget: 12 executor rounds; rounds 1-8 are main implementation/content work, rounds 9-11 are buffer/fix rounds, round 12 is final validation and report.

## 0. Direct Goal Prompt For Executor

You are executing Phase 15 of Room Axioms: Retained Difference Candidate Search And Promotion.

Read this guide, `README.md`, `Role.md`, `docs/development-plan.md`, `docs/phase-14-difference-authoring-heuristics-candidate-repair-final-report.md`, `docs/phase-14/selection-stop-decision.md`, `docs/phase-14/repair-loop.md`, `docs/phase-14/retention-target.md`, `docs/phase-14/failure-taxonomy.md`, `docs/phase-13/proof-minimization-filter.md`, `docs/phase-12/local-scope-difference-semantics.md`, `packages/authoring`, `packages/generator`, `packages/proof`, `packages/schema`, `packages/solver`, `content/cases`, `content/experimental`, and `apps/web/src/content`.

Within 12 executor rounds:

- Use the Phase 14 retention tooling as a hard gate for `LOCAL_SCOPE_DIFFERENCE` candidate work.
- Search for or hand-author a natural candidate where a retained `LOCAL_SCOPE_DIFFERENCE` deduction unlocks later proof progress instead of leaving proof gaps or making the initial guest layout trivially unique.
- Prefer repairing the known Phase 14 failure shape only if evidence improves; otherwise design a small new experimental shape under `content/experimental/phase-15/`.
- Promote at most one shipped case only if every promotion gate passes and the accepted or minimized reveal set retains `LOCAL_SCOPE_DIFFERENCE`.
- If no candidate qualifies, keep shipped content unchanged and produce a clear stop decision that names the remaining blocker.
- Preserve `case-004` as the default case and preserve all existing shipped cases including `case-011`.
- Keep difficulty scores provisional and uncalibrated without real playtest evidence.
- Validate, commit, and push each successful round before moving on.

Use `$donextgoal` to execute this guide. When complete, report back to planner thread `019ef0df-a626-7181-9ca6-1cc75c1f4c47`.

## 1. Required Context

- `README.md`
- `AGENTS.md`
- `Role.md`
- `docs/development-plan.md`
- `docs/phase-14-difference-authoring-heuristics-candidate-repair-final-report.md`
- `docs/phase-14/failure-taxonomy.md`
- `docs/phase-14/retention-target.md`
- `docs/phase-14/candidate-inventory.md`
- `docs/phase-14/repair-loop.md`
- `docs/phase-14/rejection-log.md`
- `docs/phase-14/selection-stop-decision.md`
- `docs/phase-13/proof-minimization-filter.md`
- `docs/phase-12/local-scope-difference-semantics.md`
- `docs/phase-11/promotion-checklist.md`
- `docs/phase-11/promoted-case-evidence.md`
- `packages/authoring`
- `packages/generator`
- `packages/proof`
- `packages/schema`
- `packages/solver`
- `content/cases`
- `content/experimental`
- `apps/web/src/content`
- `apps/web/src/runtime`

Phase 14 is accepted. Treat its retention tooling as available and stable enough for internal authoring gates. Do not relax the gate simply to promote a case.

## 2. Scope

Required deliverables:

- A final report at `docs/phase-15-retained-difference-candidate-search-promotion-final-report.md`.
- A Phase 15 evidence folder under `docs/phase-15/`.
- Candidate search plan based on the Phase 14 blocker: retained difference must unlock later proof progress.
- Experimental Phase 15 candidates under `content/experimental/phase-15/`, not wired into player content by default.
- Authoring CLI `report`, `score`, and `minimize --require-technique LOCAL_SCOPE_DIFFERENCE` evidence for reviewed candidates.
- Candidate inventory, rejection log, and repair notes.
- A promotion or stop decision.
- At most one promoted shipped case under `content/cases`, only if every gate passes.
- Updated `apps/web/src/content/cases.ts`, shipped content tests, copy review, runtime/hint smoke, and Pages smoke only if a case is promoted.
- Boundary scans proving authoring/generator internals and experimental content remain private unless explicitly promoted.

Promotion gates:

- Schema parse passes.
- Target satisfies rules.
- Initial observations are satisfiable.
- Initial guest-layout count is bounded, greater than one, and not truncated.
- Final guest layout is unique after human proof progress.
- Proof/no-guess passes.
- The accepted or minimized reveal set includes `LOCAL_SCOPE_DIFFERENCE`.
- `minimize --require-technique LOCAL_SCOPE_DIFFERENCE` reports `TECHNIQUE_RETENTION_PASS`.
- The proof has at least one deduction wave; zero-wave initially unique puzzles do not qualify.
- The difference move helps unlock later proof progress or final uniqueness, not merely a decorative one-off deduction.
- Authoring `report` returns `ok: true`.
- Authoring `score` remains `calibratedWithRealPlaytest: false`.
- Web runtime/player path stays secret and stable.
- Rule/case copy is Chinese and player-readable if promoted.

## 3. Non-Scope

Do not implement these in Phase 15:

- New proof techniques, including safe-cell difference semantics.
- Breaking Puzzle Schema v1 changes.
- New shipped DSL rule kinds such as row/column `lineCount`, Manhattan distance, visibility, blocker rules, path rules, or object-specific hidden actions.
- Solver architecture rewrite, SAT/WASM backend, or oracle expansion.
- Public editor, visual editor, UGC upload/share, backend, accounts, analytics, leaderboard, daily challenge, PWA/offline mode, or server-signed content.
- Broad visual redesign, landing page redesign, art direction work, or unrelated UI theming.
- Public player exposure of generator output, target layout, forced cells, candidate counts, proof internals, or authoring diagnostics.
- Automatic promotion from generated output into shipped content.
- More than one promoted case unless planner explicitly expands scope.

## 4. Fixed Per-Round Workflow

At the start of every round:

1. Read this guide and `Role.md`.
2. Run `git status --short --branch`.
3. Choose one narrow round goal from the plan below.
4. Check for unrelated user or executor changes and leave them alone.

During implementation:

1. Use `pnpm authoring -- minimize <candidate> --require-technique LOCAL_SCOPE_DIFFERENCE` as the retention gate.
2. Prefer existing authoring/generator/proof APIs over ad hoc JSON/string parsing.
3. Keep experimental candidates outside shipped content until a specific promotion decision is accepted.
4. Do not weaken caps, proof requirements, no-guess requirements, or minimization evidence to pass a candidate.
5. Keep `case-004` as default.
6. Keep player-facing copy plain Chinese if shipped content changes.
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

When candidate evidence changes, run:

```powershell
pnpm authoring -- report <candidate>
pnpm authoring -- score <candidate>
pnpm authoring -- minimize <candidate> --require-technique LOCAL_SCOPE_DIFFERENCE
```

When shipped content or web selector files change, run local smoke through the project ops wrapper.

Do not stage unrelated files, `apps/web/dist`, `node_modules`, coverage output, local smoke logs, generated bulk datasets, cache files, or unaccepted generated cases.

## 6. Round Plan

### Round 1 - Search Target And Failure Carryover

Goal:

- Create `docs/phase-15/` with issue register, search target, and carryover blockers from Phase 14.
- Define what counts as "retained difference unlocks later proof progress".

Architecture self-check:

- Retention tooling remains the gate.
- No shipped content changes.

### Round 2 - Candidate Geometry Plan

Goal:

- Define two or three candidate geometry patterns that might avoid zero-wave uniqueness and proof gaps.
- Decide whether any Phase 14 candidate is worth repairing.

Architecture self-check:

- Plans use existing DSL and proof techniques only.

### Round 3 - Experimental Candidate Set

Goal:

- Add a small Phase 15 candidate set under `content/experimental/phase-15/`.
- Run schema/target/report evidence for each candidate.

Architecture self-check:

- Experimental content stays out of player selector.

### Round 4 - Retention And Proof Filtering

Goal:

- Run `report`, `score`, and `minimize --require-technique LOCAL_SCOPE_DIFFERENCE`.
- Separate retained-difference failures from zero-wave/ordinary failures.

Architecture self-check:

- Quality gate beats promotion pressure.

### Round 5 - Candidate Repair

Goal:

- Repair one promising retained-difference candidate if it has proof gaps or non-unique final layout.
- Stop repairing if fixes erase the difference technique or make the initial layout unique.

Architecture self-check:

- Do not add new proof techniques or DSL semantics to rescue a candidate.

### Round 6 - Promotion Selection Or Stop

Goal:

- Select one candidate for possible shipped promotion, or write a stop decision if none qualifies.
- Record rejection reasons for all reviewed candidates.

Architecture self-check:

- Stop is acceptable and should be explicit when gates fail.

### Round 7 - Optional Shipped Promotion

Goal:

- If a candidate qualifies, copy it into `content/cases` and wire it into `apps/web/src/content/cases.ts`.
- Add content/runtime tests and keep `case-004` default.

Architecture self-check:

- No experimental path is imported directly by the app.

### Round 8 - Copy, Hint, And Runtime Review

Goal:

- Review promoted or selected candidate copy.
- Confirm hints remain public-knowledge-only and developer diagnostics stay gated.
- Run focused runtime tests if shipped content changed.

Architecture self-check:

- Copy changes do not alter mechanics.

### Rounds 9-11 - Buffer Fixes

Use these only for:

- candidate validation failures;
- proof/minimization/retention evidence gaps;
- runtime/hint/selector regressions caused by promoted content;
- copy review issues;
- docs evidence gaps.

Do not use buffer rounds for editor, UGC, new proof technique scope, new DSL, solver rewrite, or broad UI redesign.

### Round 12 - Final Validation And Report

Goal:

- Run full validation.
- Run focused authoring/proof/web tests.
- Run authoring evidence for reviewed candidates.
- Run smoke if shipped content or web selector files changed.
- Produce `docs/phase-15-retained-difference-candidate-search-promotion-final-report.md`.
- Confirm working tree is clean, final commit is pushed, and Pages deploy health is checked if web-visible files changed.

Required commands:

```powershell
pnpm lint
pnpm typecheck
pnpm test
pnpm build
git diff --check
git status --short --branch
```

If shipped content or selector files changed, also run:

```powershell
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StartDevServer.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Smoke.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StopDevServer.cmd
```

## 7. PASS Criteria

Phase 15 passes only when all are true:

- Final report exists at `docs/phase-15-retained-difference-candidate-search-promotion-final-report.md`.
- Full validation passes: lint, typecheck, tests, build, and `git diff --check`.
- Candidate search target and Phase 14 carryover blockers are documented.
- Candidate inventory and rejection log exist.
- Authoring report/score/minimize/retention evidence exists for reviewed candidates.
- If a case is promoted, it passes all promotion gates and keeps `LOCAL_SCOPE_DIFFERENCE` in the accepted or minimized reveal proof.
- If no case is promoted, the stop decision explains the remaining blocker and shipped content remains unchanged.
- Existing shipped cases, including `case-011`, remain valid.
- `case-004` remains default.
- Experimental Phase 15 content remains out of default shipped content unless explicitly promoted.
- Difficulty scoring remains explicitly uncalibrated unless real playtest evidence is recorded.
- Domain remains schema/solver/proof/oracle/generator/authoring/Zod/UI/fs-free.
- Solver, proof, generator, and authoring packages remain independent of React/Vite/browser UI code.
- Authoring tooling is not imported by player-facing web code or shipped content.
- Target reads remain limited to existing targetAccess, verification, tests, and explicit developer-only surfaces.
- No public editor, UGC, backend, analytics, daily challenge, broad redesign, breaking schema migration, new proof technique, or new shipped DSL rule enters this phase.
- Working tree is clean and final commit is pushed.

## 8. Debug Self-Check Template

Use this every round:

```text
Debug self-check:
- Smallest retained-difference candidate workflow tested:
- Success path covered:
- Failure/rejection path covered:
- Empty/no-candidate path covered:
- Cap/truncation status checked:
- Difference technique retention checked:
- Later proof progress checked:
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
- Retention checks consume proof output rather than reimplementing proof rules:
- Experimental content stayed out of default shipped content unless explicitly copied and promoted:
- Default case-004 stayed stable:
- Target access stayed behind the narrow app boundary:
- Player marks stayed out of solver/proof facts:
- Developer-only data stayed gated:
- Public editor/UGC/backend/new DSL/new proof technique scope avoided:
- Unrelated files left untouched:
```

## 10. Final Report Template

```markdown
# Phase 15 Retained Difference Candidate Search And Promotion Final Report

Status: READY_FOR_CHECK
Guide: `docs/phase-15-retained-difference-candidate-search-promotion-goal-mode-execution-guide.md`
Phase: Phase 15 - Retained Difference Candidate Search And Promotion

## Summary
## Files Changed By Category
## Search Target And Carryover Blockers
## Candidate Inventory
## Authoring Evidence
## Minimization And Technique Retention
## Promotion Or Stop Decision
## Runtime And UI Evidence
## Copy Review
## Validation
## Boundary Scans
## Commits
## PASS Criteria
## Blockers Or Follow-Up Notes
```
