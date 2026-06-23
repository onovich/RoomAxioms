# Phase 6 Web Runtime Integration Goal Mode Execution Guide

Date: 2026-06-23
Status: execution guide for the executor
Phase: Phase 6 - Web Runtime Integration
Round budget: 8 executor rounds; rounds 1-6 are main implementation, round 7 is UI/runtime hardening, round 8 is final validation.

## 0. Direct Goal Prompt For Executor

You are executing Phase 6 of Room Axioms: Web Runtime Integration.

Read this guide, `README.md`, `Role.md`, `docs/development-plan.md`, `docs/phase-5-human-reasoning-proofs-final-report.md`, `docs/phase-4-solver-core-final-report.md`, `docs/room-axioms-handoff/docs/03_TECHNICAL_DESIGN.md`, `docs/room-axioms-handoff/docs/04_ARCHITECTURE.md`, `docs/room-axioms-handoff/docs/05_CODEX_HANDOFF.md`, `docs/room-axioms-handoff/docs/06_RULE_DSL_SPEC.md`, and the current `apps/web/src` implementation.

Within 8 executor rounds:

- Replace the app-local prototype analysis and hard-coded hint logic with a runtime analysis boundary backed by `@room-axioms/solver` and `@room-axioms/proof`.
- Add a browser Worker protocol or Worker-compatible facade for state analysis, hint generation, proof rendering, stale-response handling, cancellation, progress, and structured errors.
- Keep the UI workflow stable while adding analysis status and proof-backed hints.
- Add a developer inspector that can show candidate counts, forced cells, proof/no-guess report data, and performance stats only in explicit developer mode.
- Keep player mode from automatically showing forced cells, target cells, solver internals, or proof validation internals.
- Narrow target access so ordinary UI state and selectors consume observations and analysis reports, while target reads remain limited to inspection settlement, conclusion checking, verifier simulation, and explicit developer target overlay.
- Preserve package boundaries: `domain` remains pure; `solver` and `proof` stay shared logic packages; web runtime imports public APIs only.
- Validate, commit, and push each successful round before moving on.

Use `$donextgoal` to execute this guide. When complete, report back to planner thread `019ef0df-a626-7181-9ca6-1cc75c1f4c47`.

## 1. Required Context

- `README.md`
- `AGENTS.md`
- `Role.md`
- `docs/development-plan.md`
- `docs/phase-5-human-reasoning-proofs-final-report.md`
- `docs/phase-5-human-reasoning-proofs-goal-mode-execution-guide.md`
- `docs/phase-4-solver-core-final-report.md`
- `docs/room-axioms-handoff/README.md`
- `docs/room-axioms-handoff/docs/03_TECHNICAL_DESIGN.md`
- `docs/room-axioms-handoff/docs/04_ARCHITECTURE.md`
- `docs/room-axioms-handoff/docs/05_CODEX_HANDOFF.md`
- `docs/room-axioms-handoff/docs/06_RULE_DSL_SPEC.md`
- `docs/room-axioms-handoff/docs/07_BACKLOG_AND_DECISIONS.md`
- `apps/web/src`
- `packages/domain/src`
- `packages/schema/src`
- `packages/solver/src`
- `packages/proof/src`
- `content/cases/case-004.json`

Phase 5 is accepted. Treat `@room-axioms/proof` as the only source of human explanations and no-guess verification. Treat `@room-axioms/solver` as the exact analysis backend. Do not keep app-local logic that duplicates solver/proof semantics.

## 2. Scope

Phase 6 completes the runtime integration slice of RA-009, RA-010, RA-012, and RA-016.

Required deliverables:

- Web runtime analysis contracts for observations, request ids, status, result data, errors, and stats.
- A Worker or Worker-compatible facade that supports:
  - `ANALYZE_STATE`
  - `GET_HINT`
  - `VERIFY_CASE` or equivalent full proof/no-guess report request
  - request versioning and stale response discard
  - cancellation or superseding in-flight requests
  - structured success/error/truncated states
- A pure analyzer function that is testable without a real browser Worker.
- Integration of `@room-axioms/solver` public APIs for satisfiability, forced cells, candidate guest-layout counts, and uniqueness.
- Integration of `@room-axioms/proof` public APIs for hint deductions, proof graphs, proof text, explanation gaps, and no-guess verification.
- Replacement of app-local `logic/analysis.ts` and `logic/hints.ts` semantics, either by deletion or by turning them into thin adapters over runtime/proof data.
- UI state for analysis loading/ready/error/stale/truncated.
- Hint dialog content derived from proof deductions and rendered proof text.
- Developer inspector or existing developer panel extension showing exact analysis/proof data only in developer mode.
- Tests covering runtime contracts, analyzer outputs, stale-response handling, hint generation, truncation/error behavior, and case-004 integration.
- Manual or automated smoke proving the local app still loads and case-004 remains playable.
- Final report at `docs/phase-6-web-runtime-integration-final-report.md`.

Suggested runtime result shape:

```ts
export type AnalysisStatus = 'idle' | 'loading' | 'ready' | 'error' | 'stale';

export interface AnalysisRequest {
  readonly requestId: number;
  readonly puzzleId: string;
  readonly observations: readonly Observation[];
  readonly mode: 'player' | 'developer';
}

export interface RuntimeAnalysis {
  readonly requestId: number;
  readonly satisfiable: boolean;
  readonly candidateGuestLayouts: number;
  readonly candidateGuestLayoutsGreaterThan?: number;
  readonly guestLayoutUnique: boolean;
  readonly forcedSafe: readonly CellId[];
  readonly forcedGuests: readonly CellId[];
  readonly hint: RuntimeHint | null;
  readonly proofLines: readonly string[];
  readonly noGuess?: Pick<VerificationReport, 'noGuess' | 'humanExplainable' | 'guestLayoutUniqueAtEnd' | 'finalGuestCells' | 'issues' | 'metrics'>;
  readonly stats: RuntimeAnalysisStats;
  readonly warnings: readonly RuntimeAnalysisWarning[];
}
```

Exact names may vary if local patterns are clearer, but the runtime must expose the same concepts without leaking solver/proof internals to ordinary UI components.

## 3. Non-Scope

Do not implement these in Phase 6:

- First 10 cases or content expansion.
- Generator, editor, internal authoring tools, or new DSL semantics.
- Large visual redesign, landing page, new art direction, or unrelated UI composition changes.
- Formal Node CLI commands. Package APIs and web runtime tests are enough for this phase.
- Persistence/save repository beyond the minimal state already present.
- Accessibility and cross-browser E2E hardening beyond smoke required to prove the integration works; those are Phase 7.
- Rewriting solver/proof internals.
- Showing forced cells to player mode by default.
- Letting player marks become solver/proof facts.
- Letting ordinary UI selectors read full target data.

## 4. Fixed Per-Round Workflow

At the start of every round:

1. Read this guide and `Role.md`.
2. Run `git status --short --branch`.
3. Choose one narrow round goal from the plan below.
4. Check for unrelated user changes and leave them alone.

During implementation:

1. Prefer pure, testable runtime functions before UI wiring.
2. Keep Worker message contracts serializable and versioned.
3. Use solver/proof public APIs only.
4. Treat marks as notes, not analysis facts.
5. Keep target access behind a small, explicit app-layer boundary.
6. Preserve existing playable case-004 flow unless a change is required by proof-backed hints or runtime state.
7. In player mode, do not render forced-cell or target overlays except through a requested proof-backed hint.
8. In developer mode, label exact/target data clearly as developer-only.

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

For web-facing rounds, also run the project smoke workflow when feasible:

```powershell
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StartDevServer.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Smoke.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StopDevServer.cmd
```

Do not stage unrelated files, `apps/web/dist`, `node_modules`, coverage output, caches, or local port logs.

## 6. Round Plan

### Round 1 - Runtime Contracts And Analyzer Core

Goal:

- Add web runtime contract types for analysis requests, responses, statuses, warnings, stats, and hints.
- Add a pure analyzer function that takes a puzzle and observations and returns solver/proof-backed analysis data.
- Add web package dependencies on `@room-axioms/schema`, `@room-axioms/solver`, and `@room-axioms/proof` only where needed.
- Cover case-004 initial analysis with tests.

Architecture self-check:

- Runtime contracts are serializable and do not expose solver/proof internals.
- App-local prototype analysis semantics begin moving behind the new analyzer.

### Round 2 - Worker Or Worker-Compatible Facade

Goal:

- Implement a browser Worker or Worker-compatible facade for runtime analysis.
- Support request ids, stale response discard, cancellation/superseding, loading/ready/error states, and structured errors.
- Keep a pure fallback path for Vitest and non-Worker test environments.
- Add tests for out-of-order/stale responses and cancellation.

Architecture self-check:

- UI talks to a facade, not directly to heavy solver/proof calls.
- Worker messages carry observations and public puzzle data, not player marks as facts.

### Round 3 - Replace Candidate And Forced-Cell Analysis

Goal:

- Replace `apps/web/src/logic/analysis.ts` behavior with solver-backed `countGuestLayouts`, `findForcedCells`, `isGuestLayoutUnique`, and satisfiability results.
- Preserve existing case-004 candidate shrink expectations where still relevant.
- Surface truncation and greater-than counts honestly.
- Add tests for initial, mid-chain, unique, unsat, and truncated states.

Architecture self-check:

- No app-local exhaustive or hand-rolled rule engine remains for product analysis.
- Solver caps are visible in runtime warnings/status.

### Round 4 - Proof-Backed Hints

Goal:

- Replace hard-coded hint branches with `@room-axioms/proof` deductions, proof graphs, and rendered proof text.
- Select a deterministic next useful deduction for case-004.
- Show hint content through existing dialog shape or a minimally extended shape.
- Ensure hints do not use exact solver-only explanations.

Architecture self-check:

- Hint copy comes from proof data, not from app-local coordinate special cases.
- Player marks do not change proof facts.

### Round 5 - UI State Integration And Target Boundary

Goal:

- Wire the runtime facade into `useRoomAxiomsGame`.
- Add UI states for analysis loading, ready, stale, truncated, and error.
- Move target reads into a narrow app-layer target access boundary for:
  - initial reveal construction;
  - inspection settlement;
  - conclusion checking;
  - verifier simulation;
  - explicit developer target overlay.
- Ensure ordinary UI rendering consumes observations, marks, and runtime analysis reports.

Architecture self-check:

- Ordinary UI selectors do not casually read `puzzle.target`.
- Target overlay remains off unless developer mode explicitly enables it.

### Round 6 - Developer Inspector And Verification Surface

Goal:

- Add or extend a developer-only inspector/panel with:
  - satisfiable status;
  - candidate guest-layout count and cap/greater-than;
  - forced safe/guest cells;
  - proof/no-guess report summary;
  - solver/proof stats and warnings;
  - request id/status/stale/error information.
- Keep player mode from showing forced cells or target data automatically.
- Add tests for developer-mode visibility gating.

Architecture self-check:

- Developer data is explicit, labeled, and gated.
- UI does not duplicate proof validation or solver semantics.

### Round 7 - Web Runtime Hardening And Smoke

Goal:

- Harden error handling, empty states, incompatible content states, and truncated results.
- Run local dev smoke and, if feasible, browser smoke for:
  - app loads;
  - case-004 initial state analyzes;
  - hint opens with proof-backed content;
  - dev inspector displays analysis;
  - normal play flow still allows safe investigations and final submission.
- Fix layout regressions caused by new runtime states.

Not allowed:

- Broad UI redesign, new content, generator/editor, or persistence expansion.

### Round 8 - Final Validation And Handoff Report

Goal:

- Run full validation.
- Run smoke workflow and record the result.
- Confirm branch clean after push.
- Produce final executor report back to planner.

Required commands:

```powershell
pnpm lint
pnpm typecheck
pnpm test
pnpm build
git diff --check
git status --short --branch
```

Run web smoke when feasible:

```powershell
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StartDevServer.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Smoke.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StopDevServer.cmd
```

Final report must include:

- files changed by category
- runtime contract summary
- Worker/facade behavior
- solver/proof integration summary
- target boundary summary
- hint and developer inspector behavior
- tests added
- smoke results
- validation results
- boundary scans
- commit hashes
- push status
- PASS criteria status
- blockers or notes for Phase 7 MVP Content And UX Hardening

## 7. PASS Criteria

Phase 6 passes only when all are true:

- Web runtime analysis uses `@room-axioms/solver` and `@room-axioms/proof` public APIs.
- App-local prototype analysis/hint semantics are removed or reduced to thin adapters over runtime/proof data.
- Runtime facade supports request ids, stale-response discard, cancellation/superseding, structured errors, and analysis statuses.
- Analysis reports include satisfiable status, candidate guest-layout count, forced cells, uniqueness, proof-backed hint data, stats, and warnings.
- Proof-backed hints derive from HumanReasoner/proof graph/rendered proof text.
- Developer inspector is gated behind developer mode and can show exact/proof diagnostics.
- Player mode does not automatically show forced cells, target overlay, solver internals, or target data.
- Target reads are limited to a narrow app-layer boundary.
- Player marks are not sent as solver/proof facts.
- Case-004 remains playable and can reach the correct final guest layout.
- Current app passes lint/typecheck/test/build.
- Local or online smoke passes, or any skipped smoke has a concrete environment reason.
- Domain remains schema/solver/proof/Zod/UI/fs-free.
- Solver/proof packages remain independent of React/Vite/browser UI code.
- No new content expansion, generator, editor, formal CLI, or UI redesign scope entered this phase.
- GitHub Pages workflow remains green after final push.
- Working tree is clean.

## 8. Debug Self-Check Template

Use this every round:

```text
Debug self-check:
- Smallest runtime state tested:
- Success path covered:
- Failure/error/stale/truncated state covered:
- Worker/facade behavior checked:
- Hint/proof behavior checked:
- Target boundary checked:
- UI smoke needed this round: yes/no, why:
- Regression risk:
```

## 9. Architecture Self-Check Template

Use this every round:

```text
Architecture self-check:
- Domain remains the source of truth for puzzle/rule/board types:
- Solver remains exact backend:
- Proof remains human explanation backend:
- Web runtime consumes public solver/proof APIs only:
- UI did not duplicate solver/proof semantics:
- Target access stayed behind the narrow app boundary:
- Player marks stayed out of solver/proof facts:
- Developer-only data stayed gated:
- Deferred content/generator/editor/CLI scope avoided:
- Unrelated files left untouched:
```

## 10. Final Report Template

```markdown
# Phase 6 Web Runtime Integration Final Report

Status: READY_FOR_CHECK
Guide: `docs/phase-6-web-runtime-integration-goal-mode-execution-guide.md`
Phase: Phase 6 - Web Runtime Integration

## Summary
## Files Changed By Category
## Runtime Contracts
## Worker Or Facade Behavior
## Solver And Proof Integration
## Target Boundary
## Hints And Developer Inspector
## Tests Added
## Smoke Results
## Validation
## Boundary Scans
## Commits
## PASS Criteria
## Phase 7 Notes
```
