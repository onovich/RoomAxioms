# Phase 5 Human Reasoning And Proofs Goal Mode Execution Guide

Date: 2026-06-23
Status: execution guide for the executor
Phase: Phase 5 - Human Reasoning And Proofs
Round budget: 10 executor rounds; rounds 1-8 are main implementation, round 9 is renderer/buffer hardening, round 10 is final validation.

## 0. Direct Goal Prompt For Executor

You are executing Phase 5 of Room Axioms: Human Reasoning And Proofs.

Read this guide, `README.md`, `Role.md`, `docs/development-plan.md`, `docs/phase-4-solver-core-final-report.md`, `docs/room-axioms-handoff/docs/03_TECHNICAL_DESIGN.md`, `docs/room-axioms-handoff/docs/04_ARCHITECTURE.md`, `docs/room-axioms-handoff/docs/05_CODEX_HANDOFF.md`, `docs/room-axioms-handoff/docs/06_RULE_DSL_SPEC.md`, and `content/cases/case-004.json`.

Within 10 executor rounds:

- Create `packages/proof` as `@room-axioms/proof`.
- Implement HumanReasoner v1 as approved human-readable deduction templates, not a text wrapper around solver search.
- Implement structured proof DAG types and stable proof-node ordering.
- Implement proof rendering as package-level structured/text output for tests and later UI use.
- Implement a no-guess verifier API that uses the Phase 4 solver public queries to validate deductions, detect guess points, detect explanation gaps, and confirm final guest-layout uniqueness.
- Reproduce the `case-004` explainable chain from schema-loaded content:
  - initial observations from `initialReveals`;
  - human deductions cover the exact forced set `A1`, `C1`, `B2`, `D2`, `A3`, `B3`, `C3`;
  - the verifier reaches the unique guest layout `D1`, `B4`;
  - every emitted human deduction is cross-checked against solver facts.
- Preserve package boundaries: domain remains pure; solver remains exact backend; proof may use solver public APIs for verification but must not import solver internals or search traces.
- Validate, commit, and push each successful round before moving on.

Use `$donextgoal` to execute this guide. When complete, report back to planner thread `019ef0df-a626-7181-9ca6-1cc75c1f4c47`.

## 1. Required Context

- `README.md`
- `AGENTS.md`
- `Role.md`
- `docs/development-plan.md`
- `docs/phase-4-solver-core-final-report.md`
- `docs/phase-4-solver-core-goal-mode-execution-guide.md`
- `docs/room-axioms-handoff/README.md`
- `docs/room-axioms-handoff/docs/03_TECHNICAL_DESIGN.md`
- `docs/room-axioms-handoff/docs/04_ARCHITECTURE.md`
- `docs/room-axioms-handoff/docs/05_CODEX_HANDOFF.md`
- `docs/room-axioms-handoff/docs/06_RULE_DSL_SPEC.md`
- `docs/room-axioms-handoff/docs/07_BACKLOG_AND_DECISIONS.md`
- `packages/domain/src`
- `packages/schema/src`
- `packages/solver/src`
- `content/cases/case-004.json`

Phase 4 is accepted. Treat `@room-axioms/solver` as the exact fact backend and `@room-axioms/oracle` as a test-only small-fixture reference. Do not use solver search trees or exhaustive model listings as player-facing explanations.

## 2. Scope

Phase 5 completes the engineering version of RA-007, RA-008, and the proof side of RA-010.

Required deliverables:

- `packages/proof/package.json`
- `packages/proof/tsconfig.json`
- `packages/proof/tsconfig.build.json`
- `packages/proof/src/index.ts`
- Proof model types for knowledge states, deductions, proof nodes, proof graphs, verifier reports, verifier waves, issues, and metrics.
- HumanReasoner v1 with stable technique ids.
- Deduction validators that cross-check conclusions with solver public APIs.
- A no-guess verifier that simulates knowledge growth, reveals target values only after a safe deduction, confirms guests as deductions, and stops on contradictions, guess points, explanation gaps, non-progress loops, or uniqueness.
- Case-004 proof regression using schema-loaded content.
- Package README documenting boundaries, technique coverage, verifier semantics, and Phase 6 handoff.
- Final report at `docs/phase-5-human-reasoning-proofs-final-report.md`.

Suggested public API shape:

```ts
import type { CellId, CellKind, Observation, PuzzleDefinition } from '@room-axioms/domain';

export type TechniqueId =
  | 'GLOBAL_COUNT_SATURATED'
  | 'GLOBAL_COUNT_ALL_REMAINING'
  | 'LOCAL_COUNT_SATURATED'
  | 'LOCAL_COUNT_ALL_REMAINING'
  | 'UNIQUE_TARGET_NEIGHBOR_INTERSECTION'
  | 'LOCAL_SCOPE_INTERSECTION'
  | 'LOCAL_SCOPE_DIFFERENCE'
  | 'KNOWN_SAFE_FROM_NON_GUEST_OBJECT';

export interface KnowledgeState {
  readonly puzzle: PuzzleDefinition;
  readonly observations: readonly Observation[];
}

export type DeductionConclusion =
  | { readonly kind: 'safe'; readonly cellId: CellId }
  | { readonly kind: 'guest'; readonly cellId: CellId }
  | { readonly kind: 'object'; readonly cellId: CellId; readonly object: CellKind };

export interface Deduction {
  readonly id: string;
  readonly conclusion: DeductionConclusion;
  readonly ruleIds: readonly string[];
  readonly premises: readonly ProofPremise[];
  readonly technique: TechniqueId;
  readonly proofNodeIds: readonly string[];
}

export interface ProofPremise {
  readonly kind: 'observation' | 'rule' | 'count' | 'scope' | 'derived';
  readonly label: string;
  readonly cellIds?: readonly CellId[];
  readonly ruleIds?: readonly string[];
}

export interface ProofNode {
  readonly id: string;
  readonly kind: 'fact' | 'rule' | 'derived';
  readonly label: string;
  readonly parents: readonly string[];
}

export interface ProofGraph {
  readonly nodes: readonly ProofNode[];
  readonly rootIds: readonly string[];
}

export interface VerificationReport {
  readonly satisfiable: boolean;
  readonly targetSatisfiesRules: boolean;
  readonly guestLayoutUniqueAtEnd: boolean;
  readonly noGuess: boolean;
  readonly humanExplainable: boolean;
  readonly waves: readonly VerificationWave[];
  readonly issues: readonly VerificationIssue[];
  readonly metrics: VerificationMetrics;
}

export function deriveHumanDeductions(state: KnowledgeState): readonly Deduction[];
export function buildProofGraph(state: KnowledgeState, deductions: readonly Deduction[]): ProofGraph;
export function renderProofText(graph: ProofGraph): readonly string[];
export function verifyDeduction(state: KnowledgeState, deduction: Deduction): DeductionValidationResult;
export function verifyNoGuess(puzzle: PuzzleDefinition, options?: VerificationOptions): VerificationReport;
```

Exact names may vary if a local pattern is clearer, but the API must expose human deductions, proof DAG construction, text/structured rendering, solver-backed deduction validation, and no-guess verification reports.

## 3. Non-Scope

Do not implement these in Phase 5:

- React UI integration, hint buttons, developer inspector, app state wiring, or visual redesign.
- Web Worker protocol, cancellation, stale-response handling, async browser analysis, or performance UI.
- Formal CLI commands such as `pnpm puzzle validate`; package APIs and tests are enough for this phase.
- Generator, editor, 10-level content expansion, new DSL semantics, or schema migration.
- A complete natural-language copywriting system; proof text may be concise deterministic test output.
- Solver internals, solver heuristics, or solver optimization.
- Any player-facing explanation that says only "the exact solver searched all models."
- Treating player marks as facts.
- Using `target` inside HumanReasoner. Only the verifier may reveal target values after a safe deduction has already been proved.

## 4. Fixed Per-Round Workflow

At the start of every round:

1. Read this guide and `Role.md`.
2. Run `git status --short --branch`.
3. Choose one narrow round goal from the plan below.
4. Check for unrelated user changes and leave them alone.

During implementation:

1. Build package-level logic first, then schema-loaded `case-004` regression.
2. Keep deduction ids, proof node ids, wave ordering, and report ordering deterministic.
3. Every public API must be covered by direct tests or higher-level verifier tests.
4. Every deduction that can become a hint must have premises and a proof graph path.
5. Every verifier conclusion must be solver-checked unless it is a static schema/target satisfaction check.
6. Do not hard-code `case-004` coordinates in generic technique code. Case-specific expected outputs belong only in tests.

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

Do not stage unrelated files, `apps/web/dist`, `node_modules`, coverage output, caches, or local port logs.

## 6. Round Plan

### Round 1 - Proof Package Boundary

Goal:

- Create `packages/proof` as `@room-axioms/proof`.
- Add TypeScript, Vitest, package exports, workspace coverage, and minimal public types.
- Decide package dependencies conservatively: runtime may depend on `@room-axioms/domain` and `@room-axioms/solver`; tests may use `@room-axioms/schema` and `@room-axioms/oracle` only when useful.
- Add a boundary smoke test and package README skeleton.

Architecture self-check:

- Proof uses solver public APIs only; it does not import solver private modules.
- Domain remains proof-free, solver-free, schema-free, Zod-free, UI-free, and fs-free.

### Round 2 - Knowledge State, Deduction, And Proof DAG Types

Goal:

- Implement `KnowledgeState`, `Deduction`, `ProofPremise`, `ProofNode`, `ProofGraph`, verifier report, issue, wave, and metric types.
- Add deterministic id builders for deductions and proof nodes.
- Add proof graph helpers for facts, rules, derived conclusions, parent references, and stable sorting.
- Test stable ids, parent linking, repeated graph builds, empty graphs, and duplicate premise handling.

Architecture self-check:

- Types express human proof concepts, not solver search frames.
- No UI copy or browser-specific rendering assumptions enter the package.

### Round 3 - Rule And Scope Reasoning Helpers

Goal:

- Build internal helpers that summarize known observations, unknown cells, rule scopes, local neighbor sets, and count bounds in human-readable premise form.
- Reuse domain `allCells` and `neighbors`; do not duplicate board coordinate semantics.
- Support current DSL v1: `globalCount` and `forEachCount` with `eq`, `gte`, and `lte`.
- Test corner, edge, and interior scope premises.

Architecture self-check:

- Domain remains source of truth for coordinates and rule types.
- No new DSL semantics are introduced.

### Round 4 - Global Count Techniques

Goal:

- Implement `GLOBAL_COUNT_SATURATED`: when a global target count is already met, all remaining unknown cells are not that target.
- Implement `GLOBAL_COUNT_ALL_REMAINING`: when all remaining possible target slots are required, those cells are the target.
- Emit structured deductions and proof nodes, including rule premise and observation/count premises.
- Cross-check each deduction with solver public APIs.

Architecture self-check:

- Solver validates conclusions, but the explanation is a count technique.
- Truncated solver validation must not be reported as a valid proof.

### Round 5 - Local Count Techniques And Known Safe Objects

Goal:

- Implement `LOCAL_COUNT_SATURATED` and `LOCAL_COUNT_ALL_REMAINING` for forced subject cells under local scopes.
- Implement `KNOWN_SAFE_FROM_NON_GUEST_OBJECT`: any observed or derived non-guest object is safe.
- Emit deductions for both `safe` and concrete `object` conclusions when appropriate.
- Test bottle/bin/mirror local count examples, including edge scope behavior.

Architecture self-check:

- A derived object conclusion can support a later safe conclusion, but it must have its own proof node path.
- Player marks are still ignored.

### Round 6 - Intersection And Difference Techniques

Goal:

- Implement `UNIQUE_TARGET_NEIGHBOR_INTERSECTION` for cases where a global singleton target plus multiple local requirements force a shared target cell.
- Implement `LOCAL_SCOPE_INTERSECTION` and `LOCAL_SCOPE_DIFFERENCE` only for patterns justified by DSL v1 rules and documented premises.
- Ensure `case-004` initial observations can derive `B2` as `bin`.
- Ensure `case-004` initial human deductions cover exact forced safe cells: `A1`, `C1`, `B2`, `D2`, `A3`, `B3`, `C3`.

Architecture self-check:

- These techniques must be generic rule/scope patterns, not `case-004` coordinate special cases.
- If a proposed technique is ambiguous, leave it out rather than emitting an unsound proof.

### Round 7 - Solver-Backed Deduction Validation And Explanation Gap Detection

Goal:

- Implement `verifyDeduction` using solver public APIs:
  - safe means `cellIs guest` is unsatisfiable;
  - guest means `cellIsNot guest` is unsatisfiable;
  - object means all non-object alternatives are impossible or an equivalent public-query proof exists.
- Compare human deductions to `findForcedCells`.
- Report `EXPLANATION_GAP` when solver finds forced safe/guest cells that the human reasoner cannot explain.
- Report `INVALID_DEDUCTION` when a human deduction is not solver-confirmed.
- Test valid, invalid, truncated, and explanation-gap states.

Architecture self-check:

- Validation can use exact solver facts; explanation content remains technique-based.
- No solver private import or search trace is exposed.

### Round 8 - No-Guess Verifier And Case-004 Chain

Goal:

- Implement `verifyNoGuess`.
- Simulate knowledge waves:
  - start from `initialReveals`;
  - derive human deductions;
  - validate every deduction;
  - add guest confirmations directly;
  - reveal safe cells from `target` only after they are proved safe;
  - stop on contradiction, guess point, explanation gap, invalid deduction, repeated state, or final guest-layout uniqueness.
- Load `case-004` through schema in tests.
- Assert `case-004` passes with `noGuess: true`, `humanExplainable: true`, and final unique guest cells `D1`, `B4`.

Architecture self-check:

- HumanReasoner never reads target.
- The verifier is allowed to read target only as a simulation of safe cell reveals.

### Round 9 - Proof Rendering, Documentation, And Buffer Hardening

Goal:

- Implement deterministic proof rendering as text or structured lines suitable for tests and later UI.
- Document technique coverage, verifier issue codes, and Phase 6 handoff.
- Strengthen tests around report snapshots, rendering order, cap/truncation behavior, and package boundaries.
- Use this round as the single planned buffer for fixes discovered in rounds 1-8.

Not allowed:

- UI integration, Worker protocol, formal CLI, generator, editor, or new content expansion.

### Round 10 - Final Validation And Handoff Report

Goal:

- Run full validation.
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

Final report must include:

- files changed by category
- public API created
- human technique coverage
- proof DAG and renderer summary
- solver validation coverage
- no-guess verifier semantics
- case-004 explainable chain results
- tests added
- validation results
- boundary scans
- commit hashes
- push status
- PASS criteria status
- blockers or notes for Phase 6 Web Runtime Integration

## 7. PASS Criteria

Phase 5 passes only when all are true:

- `packages/proof` exists and builds as `@room-axioms/proof`.
- Proof package exposes human deductions, proof DAG construction, proof rendering, deduction validation, and no-guess verification APIs.
- HumanReasoner v1 uses approved technique ids and emits structured premises.
- Proof explanations are not solver-search summaries.
- Every emitted deduction can be validated against solver public APIs or is rejected with a clear issue.
- Explanation gaps are detected when solver-forced facts are not human-explainable.
- `case-004` is loaded through schema and passes the no-guess verifier.
- `case-004` initial human deductions cover `A1`, `C1`, `B2`, `D2`, `A3`, `B3`, `C3`.
- Final `case-004` guest layout is unique as `D1`, `B4`.
- Domain remains proof-free, solver-free, schema-free, Zod-free, UI-free, and fs-free.
- Proof runtime has no React, Vite UI, browser API, Worker, DOM, or Node fs dependency.
- Solver internals are not imported by proof runtime or tests.
- No UI/Worker/CLI/generator/editor/10-level content scope entered this phase.
- Current web app still passes lint/typecheck/test/build.
- GitHub Pages workflow remains green after final push.
- Working tree is clean.

## 8. Debug Self-Check Template

Use this every round:

```text
Debug self-check:
- Smallest fixture used:
- Success path covered:
- Failure/invalid/empty/truncated state covered:
- Deduction validation checked:
- Explanation gap checked:
- Case-004 impact:
- UI smoke needed this round: yes/no, why:
- Regression risk:
```

## 9. Architecture Self-Check Template

Use this every round:

```text
Architecture self-check:
- Domain remains the source of truth for puzzle/rule/board types:
- Solver remains exact backend and proof uses only public solver APIs:
- Proof remains human-reasoning, not solver search narration:
- HumanReasoner did not read target:
- Verifier target access is limited to post-proof safe reveals:
- Player marks stayed out of solver/proof facts:
- Deferred UI/Worker/CLI/generator/editor scope avoided:
- Unrelated files left untouched:
```

## 10. Final Report Template

```markdown
# Phase 5 Human Reasoning And Proofs Final Report

Status: READY_FOR_CHECK
Guide: `docs/phase-5-human-reasoning-proofs-goal-mode-execution-guide.md`
Phase: Phase 5 - Human Reasoning And Proofs

## Summary
## Files Changed By Category
## Public API Created
## Human Technique Coverage
## Proof DAG And Renderer
## Solver Validation Coverage
## No-Guess Verifier
## Case-004 Explainable Chain
## Tests Added
## Validation
## Boundary Scans
## Commits
## PASS Criteria
## Phase 6 Notes
```
