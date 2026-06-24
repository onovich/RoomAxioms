# Phase 10 Authoring CLI And Proof Technique Hardening Goal Mode Execution Guide

Date: 2026-06-24
Status: execution guide for the executor
Phase: Phase 10 - Authoring CLI And Proof Technique Hardening
Round budget: 16 executor rounds; rounds 1-12 are main implementation, rounds 13-15 are buffer/fix rounds, round 16 is final validation and report.

## 0. Direct Goal Prompt For Executor

You are executing Phase 10 of Room Axioms: Authoring CLI And Proof Technique Hardening.

Read this guide, `README.md`, `Role.md`, `docs/development-plan.md`, `docs/phase-9-generator-expansion-spike-final-report.md`, `docs/phase-9/technique-expansion-decision.md`, `docs/phase-9/authoring-workflow-roadmap.md`, `docs/phase-9/generator-contract.md`, `packages/proof`, `packages/generator`, `packages/schema`, `packages/solver`, `content/cases`, and `apps/web/src/runtime`.

Within 16 executor rounds:

- Implement and validate proof-side `LOCAL_SCOPE_INTERSECTION` as the first production proof technique expansion.
- Add stable rendering, verifier coverage, solver-backed deduction validation, negative fixtures, and no-guess regressions for the new technique.
- Create one or two experimental mid-band fixtures that genuinely need the new technique, without promoting them into the default player selector.
- Build a private offline authoring CLI that consumes existing package APIs for `validate`, `score`, `minimize`, `sample`, and `report` workflows.
- Keep generated and experimental content out of shipped MVP content until planner/checker acceptance.
- Preserve player secrecy, target-access boundaries, Puzzle Schema v1 compatibility, and the accepted 10-case MVP baseline.
- Validate, commit, and push each successful round before moving on.

Use `$donextgoal` to execute this guide. When complete, report back to planner thread `019ef0df-a626-7181-9ca6-1cc75c1f4c47`.

## 1. Required Context

- `README.md`
- `AGENTS.md`
- `Role.md`
- `docs/development-plan.md`
- `docs/phase-9-generator-expansion-spike-final-report.md`
- `docs/phase-9-generator-expansion-spike-goal-mode-execution-guide.md`
- `docs/phase-9/technique-expansion-decision.md`
- `docs/phase-9/authoring-workflow-roadmap.md`
- `docs/phase-9/generator-contract.md`
- `docs/phase-9/generator-difficulty-report.md`
- `docs/room-axioms-handoff/docs/03_TECHNICAL_DESIGN.md`
- `docs/room-axioms-handoff/docs/04_ARCHITECTURE.md`
- `docs/room-axioms-handoff/docs/06_RULE_DSL_SPEC.md`
- `docs/room-axioms-handoff/docs/07_BACKLOG_AND_DECISIONS.md`
- `packages/domain`
- `packages/schema`
- `packages/solver`
- `packages/proof`
- `packages/generator`
- `apps/web/src/runtime`
- `apps/web/src/content`
- `content/cases`

Phase 9 is accepted as an internal generator/expansion spike. Treat Phase 10 as the first production hardening phase after that spike: it may add proof capability and private maintainer tooling, but it must not ship public authoring or new rule semantics.

## 2. Scope

Required deliverables:

- A final report at `docs/phase-10-authoring-cli-proof-technique-hardening-final-report.md`.
- `LOCAL_SCOPE_INTERSECTION` emitted by `@room-axioms/proof` when current DSL v1 local scopes justify a human-readable deduction from overlapping local-count scopes.
- Solver-backed validation and no-guess verifier coverage proving every emitted deduction is entailed by public observations and rules.
- Negative fixtures proving the technique does not infer from reverse implications, target access, hidden layout knowledge, or unsupported scope differences.
- Stable proof rendering for the new technique.
- Runtime or web tests only where needed to confirm proof-backed hints can display the new technique without exposing target/candidate/forced-cell internals.
- Experimental mid-band fixtures that demonstrate the new technique and remain outside `content/cases` and the default selector unless planner accepts promotion later.
- A private offline authoring CLI, package, or tool entrypoint with these maintainer commands:
  - `validate <case.json>`
  - `score <case.json>`
  - `minimize <case.json>`
  - `sample --seed <seed> --template <template.json>`
  - `report <case.json>`
- Machine-readable and human-readable report outputs for planner/checker review.
- Documentation explaining CLI usage, artifact policy, and promotion gate.

Recommended package/tooling shape:

- Prefer a private workspace package such as `packages/authoring` if it fits the monorepo.
- The authoring tool may depend on `@room-axioms/domain`, `@room-axioms/schema`, `@room-axioms/solver`, `@room-axioms/proof`, and `@room-axioms/generator`.
- It must not be imported by `apps/web`, shipped content, `@room-axioms/domain`, `@room-axioms/schema`, `@room-axioms/solver`, or `@room-axioms/proof`.

## 3. Non-Scope

Do not implement these in Phase 10:

- Public editor, visual editor, UGC upload/share, remote backend, accounts, analytics, leaderboard, daily challenge, PWA/offline mode, or server-signed content.
- Breaking Puzzle Schema v1 changes or new shipped DSL rule kinds such as row/column `lineCount`, Manhattan distance, visibility, or blocker rules.
- `LOCAL_SCOPE_DIFFERENCE` unless `LOCAL_SCOPE_INTERSECTION` is complete early and planner explicitly accepts using a buffer round for a small follow-up.
- Promotion of generated or experimental cases into `content/cases` or `apps/web/src/content/cases.ts`.
- Public difficulty labels or claims calibrated from real players unless actual playtest data is available and cited.
- Player-facing generator/debug/target/forced/candidate internals.
- Replacing the solver/proof/oracle architecture or adding a SAT/WASM backend.

## 4. Fixed Per-Round Workflow

At the start of every round:

1. Read this guide and `Role.md`.
2. Run `git status --short --branch`.
3. Choose one narrow round goal from the plan below.
4. Check for unrelated user changes and leave them alone.

During implementation:

1. Keep proof deductions explainable from public rules, observations, and prior deductions only.
2. Validate any new deduction with solver-backed assumptions.
3. Keep authoring CLI output report-only by default; do not overwrite source cases unless a command explicitly requests it and tests cover it.
4. Keep experimental content out of the shipped selector.
5. Keep difficulty scores uncalibrated unless real playtest data exists.
6. Do not loosen caps, proof checks, or validation to make a fixture pass.
7. Keep every new command deterministic or seed-recorded.

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

When proof logic changes, run focused proof tests. When authoring CLI changes, run focused authoring/generator/schema/solver/proof tests and at least one CLI smoke command against a fixture.

Do not stage unrelated files, `apps/web/dist`, `node_modules`, coverage output, local smoke logs, generated bulk datasets, cache files, or large generated reports.

## 6. Round Plan

### Round 1 - Phase 10 Baseline And Acceptance Harness

Goal:

- Create Phase 10 issue/risk register and acceptance checklist.
- Identify the smallest local-scope intersection fixture and the authoring CLI package/tool boundary.
- Add docs describing the intended CLI artifact policy and experimental fixture policy.

Architecture self-check:

- The proof package remains the source of truth for human explanation.
- Authoring tooling remains private and report-only.

### Round 2 - Local Scope Intersection Semantics

Goal:

- Define exact `LOCAL_SCOPE_INTERSECTION` semantics in proof documentation and tests before implementation.
- Add tiny fixtures that express positive and negative overlap cases under current DSL v1.

Architecture self-check:

- Semantics use only current `forEachCount` local scopes and public knowledge.
- No schema or solver contract changes are required.

### Round 3 - Proof Emission

Goal:

- Implement proof emission for `LOCAL_SCOPE_INTERSECTION`.
- Keep ordering deterministic and premises readable.
- Ensure existing proof tests and MVP cases remain stable unless a proof ordering change is intentionally documented.

Architecture self-check:

- The new technique consumes reasoning summaries rather than duplicating solver search traces.
- It does not read puzzle target layouts.

### Round 4 - Solver-Backed Deduction Validation

Goal:

- Add validation tests proving emitted intersection deductions are entailed under assumptions.
- Add negative tests for reverse implication and unsupported overlap.

Architecture self-check:

- Solver validates deductions, but proof rendering does not narrate solver internals to players.

### Round 5 - No-Guess Verifier Regression

Goal:

- Add at least one fixture where `LOCAL_SCOPE_INTERSECTION` closes an explanation gap or prevents a guess point.
- Preserve detection for cases that remain unexplainable.

Architecture self-check:

- The verifier remains stricter than solver satisfiability.

### Round 6 - Proof Rendering And Hint Compatibility

Goal:

- Add stable renderer output for the new technique.
- Add runtime/web tests only if needed to confirm hints can display it without leaking candidate counts, target, or forced-cell diagnostics.

Architecture self-check:

- Player-facing language stays human-readable and public-knowledge-only.

### Round 7 - Experimental Mid-Band Fixtures

Goal:

- Create one or two experimental fixtures that require `LOCAL_SCOPE_INTERSECTION`.
- Validate them through schema, solver, proof/no-guess, uniqueness, and provisional difficulty scoring.
- Keep them out of default web content.

Architecture self-check:

- Experimental fixtures are clearly gated and not promoted.

### Round 8 - Authoring CLI Package Boundary

Goal:

- Establish the private authoring CLI package/tool structure.
- Wire workspace scripts and tests.
- Add CLI command parser and structured output foundations.

Architecture self-check:

- CLI consumes public package APIs; shared logic is not copied from schema/solver/proof/generator.

### Round 9 - CLI Validate And Report

Goal:

- Implement `validate <case.json>` and `report <case.json>`.
- Output schema diagnostics, target-rule status, satisfiability, uniqueness, proof/no-guess, caps, and final recommendation.

Architecture self-check:

- CLI reports facts; it does not modify content or promote cases.

### Round 10 - CLI Score And Minimize

Goal:

- Implement `score <case.json>` and `minimize <case.json>`.
- Preserve the uncalibrated difficulty caveat and report-only minimization behavior.

Architecture self-check:

- Minimization never overwrites author files by default.

### Round 11 - CLI Sample

Goal:

- Implement `sample --seed <seed> --template <template.json>`.
- Record seed, caps, rejection reasons, and accepted experimental candidates.
- Keep output under an explicit experimental/report path or stdout.

Architecture self-check:

- Sampling remains deterministic and does not touch shipped content.

### Round 12 - Authoring Docs And Maintainer Workflow

Goal:

- Document CLI usage, examples, output formats, and promotion checklist.
- Add a maintainer workflow for experimental mid-band candidates.

Architecture self-check:

- Docs reinforce planner/checker promotion and real playtest calibration requirements.

### Rounds 13-15 - Buffer Fixes

Use these only for:

- proof correctness fixes;
- CLI usability or output stability fixes;
- validation/report gaps;
- boundary regressions;
- targeted performance issues caused by Phase 10 changes.

Do not use buffer rounds for public editor, UGC, new DSL semantics, broad UI redesign, or content promotion.

### Round 16 - Final Validation And Report

Goal:

- Run full validation.
- Run focused proof, authoring CLI, generator, and content validation.
- Produce `docs/phase-10-authoring-cli-proof-technique-hardening-final-report.md`.
- Confirm working tree is clean, final commit is pushed, and Pages remains healthy if web-visible files changed.

Required commands:

```powershell
pnpm lint
pnpm typecheck
pnpm test
pnpm build
git diff --check
git status --short --branch
```

If web-visible files or shipped content changed, also run:

```powershell
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StartDevServer.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Smoke.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StopDevServer.cmd
```

## 7. PASS Criteria

Phase 10 passes only when all are true:

- Final report exists at `docs/phase-10-authoring-cli-proof-technique-hardening-final-report.md`.
- Full validation passes: lint, typecheck, tests, build, and `git diff --check`.
- `LOCAL_SCOPE_INTERSECTION` has positive tests, negative tests, solver-backed deduction validation, no-guess regression coverage, and stable rendering.
- Existing ten MVP cases remain valid and default `case-004` remains stable.
- Any experimental mid-band fixtures are validated and remain out of default shipped content.
- Private authoring CLI supports `validate`, `score`, `minimize`, `sample`, and `report`, or documents any intentionally deferred command with a concrete reason and planner-visible follow-up.
- CLI outputs include cap/truncation status and never silently promotes content.
- Difficulty scoring remains explicitly uncalibrated unless real playtest evidence exists.
- Domain remains schema/solver/proof/oracle/generator/authoring/Zod/UI/fs-free.
- Solver/proof/generator packages remain independent of React/Vite/browser UI code.
- Authoring tooling is not imported by player-facing web code or shipped content.
- Target reads remain limited to existing targetAccess, verification, tests, and explicit developer-only surfaces.
- No public editor, UGC, backend, analytics, daily challenge, broad redesign, breaking schema migration, or new shipped DSL rule enters this phase.
- Working tree is clean and final commit is pushed.

## 8. Debug Self-Check Template

Use this every round:

```text
Debug self-check:
- Smallest proof/CLI fixture tested:
- Success path covered:
- Failure/rejection path covered:
- Empty/cap/truncated path covered:
- Determinism/seed behavior checked:
- Report/output stability checked:
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
- Experimental content stayed out of default shipped content:
- Target access stayed behind the narrow app boundary:
- Player marks stayed out of solver/proof facts:
- Developer-only data stayed gated:
- Public editor/UGC/backend/new DSL scope avoided:
- Unrelated files left untouched:
```

## 10. Final Report Template

```markdown
# Phase 10 Authoring CLI And Proof Technique Hardening Final Report

Status: READY_FOR_CHECK
Guide: `docs/phase-10-authoring-cli-proof-technique-hardening-goal-mode-execution-guide.md`
Phase: Phase 10 - Authoring CLI And Proof Technique Hardening

## Summary
## Files Changed By Category
## Proof Technique Implementation
## Solver-Backed Validation
## Experimental Fixture Evidence
## Authoring CLI
## CLI Smoke Evidence
## Documentation
## Validation
## Boundary Scans
## Commits
## PASS Criteria
## Blockers Or Follow-Up Notes
```
