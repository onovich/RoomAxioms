# Phase 9 Generator And Expansion Spike Goal Mode Execution Guide

Date: 2026-06-24
Status: execution guide for the executor
Phase: Phase 9 - Generator And Expansion Spike
Round budget: 8 exploratory executor rounds; rounds 1-6 are spike implementation and evidence, round 7 is authoring/roadmap synthesis, round 8 is final validation and recommendation.

## 0. Direct Goal Prompt For Executor

You are executing Phase 9 of Room Axioms: Generator And Expansion Spike.

Read this guide, `README.md`, `Role.md`, `docs/development-plan.md`, `docs/phase-8-release-qa-playtest-loop-final-report.md`, `docs/phase-8-playtest-protocol.md`, `docs/phase-8-playtest-feedback-log.md`, `docs/phase-8-performance-stability-report.md`, `docs/room-axioms-handoff/docs/01_PRODUCT_DESIGN.md`, `docs/room-axioms-handoff/docs/03_TECHNICAL_DESIGN.md`, `docs/room-axioms-handoff/docs/04_ARCHITECTURE.md`, `docs/room-axioms-handoff/docs/06_RULE_DSL_SPEC.md`, `docs/room-axioms-handoff/docs/07_BACKLOG_AND_DECISIONS.md`, and the current `packages`, `apps/web`, and `content` structure.

Within 8 executor rounds:

- Explore generator v1 using the existing Puzzle Schema v1, domain model, solver, and proof verifier.
- Build or document a narrow internal generate-verify-filter loop for small boards and existing rule semantics only.
- Prototype initial reveal minimization by removing redundant observations while preserving no-guess proof completion and final guest-layout uniqueness.
- Produce difficulty and pacing evidence from solver/proof/runtime metrics, without claiming calibration from real players unless real Phase 8/9 feedback exists.
- Explore technique/content expansion candidates and internal authoring/editor workflow needs, but keep production commitments as recommendations unless a small validated prototype is clearly in scope.
- Keep the 10 MVP cases and default `case-004` stable unless a narrow bug fix is required.
- Produce a final spike report with concrete recommendations for the next production phase, including what to build, what to defer, and which risks remain unknown.
- Validate, commit, and push each successful round before moving on.

Use `$donextgoal` to execute this guide. When complete, report back to planner thread `019ef0df-a626-7181-9ca6-1cc75c1f4c47`.

## 1. Required Context

- `README.md`
- `AGENTS.md`
- `Role.md`
- `docs/development-plan.md`
- `docs/phase-8-release-qa-playtest-loop-final-report.md`
- `docs/phase-8-release-qa-playtest-loop-goal-mode-execution-guide.md`
- `docs/phase-8-browser-smoke-report.md`
- `docs/phase-8-browser-e2e-posture.md`
- `docs/phase-8-performance-stability-report.md`
- `docs/phase-8-playtest-protocol.md`
- `docs/phase-8-playtest-feedback-log.md`
- `docs/room-axioms-handoff/README.md`
- `docs/room-axioms-handoff/docs/01_PRODUCT_DESIGN.md`
- `docs/room-axioms-handoff/docs/03_TECHNICAL_DESIGN.md`
- `docs/room-axioms-handoff/docs/04_ARCHITECTURE.md`
- `docs/room-axioms-handoff/docs/06_RULE_DSL_SPEC.md`
- `docs/room-axioms-handoff/docs/07_BACKLOG_AND_DECISIONS.md`
- `packages/domain`
- `packages/schema`
- `packages/solver`
- `packages/proof`
- `content/cases`
- `apps/web/src/content`
- `.codex/project-ops-workflow.json`

Phase 8 is accepted as a release-candidate QA gate. Treat the existing MVP as stable baseline and treat Phase 9 as an expansion spike, not a release-blocking hotfix phase.

## 2. Scope

Phase 9 explores RA-021 through RA-028 enough to decide the next production path.

Required deliverables:

- A final spike report at `docs/phase-9-generator-expansion-spike-final-report.md`.
- A generator design note or README documenting:
  - input contract;
  - output contract;
  - seed/determinism policy;
  - validation pipeline;
  - failure modes;
  - known search limits.
- A narrow internal generator prototype when feasible, preferably as a package such as `packages/generator` if that matches the existing monorepo structure.
- Generated examples must stay experimental unless explicitly promoted:
  - keep them out of the default web case selector;
  - prefer an experimental docs/report artifact or `content/experimental` with clear gating;
  - do not replace the 10 MVP cases.
- Initial reveal minimization evidence:
  - start from a target layout and candidate observations;
  - remove redundant reveals only when schema, solver, proof/no-guess, and final guest-layout uniqueness still pass;
  - record before/after observation counts and proof impact.
- Difficulty scoring evidence:
  - derive provisional metrics from proof length, technique mix, branching/candidate shrink, reveal count, board size, and runtime;
  - explicitly mark the score as uncalibrated until real playtest data exists;
  - compare the ten MVP cases and any experimental generated cases.
- Technique expansion analysis:
  - identify which proof rules or rule DSL extensions would unlock better content;
  - implement only small low-risk additions when they can be fully validated and do not destabilize MVP behavior;
  - otherwise document the candidate for a future phase.
- Internal editor/authoring workflow analysis:
  - identify the smallest tool support needed by maintainers;
  - prototype only a private/offline authoring aid if it is cheap and well bounded;
  - no public UGC platform.
- A recommendation for the next production phase: generator hardening, authoring tools, new proof techniques, more content, playtest-driven UX, or a pause for real playtest.

## 3. Non-Scope

Do not implement these in Phase 9:

- Public level editor, UGC upload/share, remote backend, accounts, leaderboard, analytics, daily challenge, monetization, PWA/offline release, or server-signed content.
- Breaking Puzzle Schema v1 changes without an explicit migration plan and planner approval.
- New shipped MVP cases in the default selector unless the planner explicitly accepts promotion after validation.
- Broad UI redesign, new art direction, sound, story campaign, or release QA churn unrelated to generator/expansion evidence.
- Fabricated playtest feedback or difficulty calibration claims.
- Player-facing solver internals, target overlays, forced-cell diagnostics, candidate counts, or generator debug data.
- Replacing the solver/proof/oracle architecture or adding a SAT/WASM backend.
- Pulling generator internals into `@room-axioms/domain`.

## 4. Fixed Per-Round Workflow

At the start of every round:

1. Read this guide and `Role.md`.
2. Run `git status --short --branch`.
3. Choose one narrow round goal from the plan below.
4. Check for unrelated user changes and leave them alone.

During implementation:

1. Keep all generated artifacts deterministic or clearly labeled as sampled with seed.
2. Validate generated or minimized cases through schema, solver, proof/no-guess, and uniqueness before treating them as successful.
3. Keep experimental content out of the player-facing default bundle unless the round goal explicitly adds a private/developer gate.
4. Record negative results. A spike can PASS by proving an approach is too costly or not ready.
5. Do not loosen tests, caps, or proof rules merely to make a generated case pass.
6. Keep player-mode secrecy and target-access boundaries intact.
7. Keep performance measurements honest and cap-aware.

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

When generated content or generator logic changes, also run focused package/content tests that cover schema parsing, target rule satisfaction, solver satisfiability, final guest-layout uniqueness, proof/no-guess verification, and bounded runtime/cap behavior.

Do not stage unrelated files, `apps/web/dist`, `node_modules`, coverage output, local smoke logs, generated bulk datasets, cache files, or large generated reports.

## 6. Round Plan

### Round 1 - Spike Baseline And Generator Contract

Goal:

- Create the Phase 9 spike baseline and generator issue/risk register.
- Decide the internal generator location and public/private package boundary.
- Define generator inputs, outputs, seed policy, validation stages, and experimental artifact policy.

Architecture self-check:

- Generator depends on domain/schema/solver/proof public APIs as needed.
- Domain remains free of generator/schema/solver/proof/runtime dependencies.
- Experimental artifacts are isolated from shipped MVP content.

### Round 2 - Target And Observation Sampling Prototype

Goal:

- Prototype deterministic target/model sampling for small existing-DSL boards.
- Generate candidate target layouts and observation pools without inventing new rule semantics.
- Record failure modes: unsatisfiable target, ambiguous final guest layout, proof failure, or search cap.

Architecture self-check:

- Sampling is deterministic for a seed.
- Search caps are explicit and reported honestly.
- No generated candidate is treated as validated until it passes the full pipeline.

### Round 3 - Generate-Verify-Filter Loop

Goal:

- Build a generate-verify-filter loop that keeps only puzzles passing schema, solver, proof/no-guess, and final guest-layout uniqueness.
- Add small fixtures/tests that prove the loop rejects invalid or unprovable candidates.
- Record throughput and bottlenecks on representative small boards.

Architecture self-check:

- Solver/proof remain the source of truth for acceptance.
- Oracle is used only for small test cross-checks if helpful, not product runtime.
- Generated outputs do not enter the default web selector.

### Round 4 - Initial Reveal Minimization

Goal:

- Prototype observation minimization for a validated candidate.
- Remove redundant initial reveals while preserving no-guess proof completion and final uniqueness.
- Compare before/after reveal count, proof length, and runtime.

Architecture self-check:

- Minimization never uses hidden target data as a player-facing hint.
- Player marks remain notes and are not solver/proof facts.
- Failure to minimize is recorded as data, not hidden.

### Round 5 - Difficulty Metrics And Case Comparison

Goal:

- Define provisional difficulty metrics from existing solver/proof/runtime evidence.
- Score the ten MVP cases and any experimental generated cases.
- Mark every score as uncalibrated unless real playtest feedback exists.

Architecture self-check:

- Difficulty metrics consume reports from existing packages instead of duplicating solving semantics.
- Metrics are explanatory and internal; they do not alter puzzle correctness.

### Round 6 - Technique And Content Expansion Experiments

Goal:

- Identify the smallest proof-rule or DSL-scope additions that would materially improve generated content.
- Implement only a tiny validated experiment if low risk; otherwise produce a decision memo with examples and tests that would be required later.
- Keep current shipped rules and cases stable.

Architecture self-check:

- No breaking schema change lands without migration and planner approval.
- New ideas do not leak into player UI or default content by accident.

### Round 7 - Internal Authoring Workflow And Roadmap Synthesis

Goal:

- Evaluate whether maintainers need CLI, JSON templates, visual editor, validation reports, or web-only developer affordances next.
- Prototype the smallest private/offline authoring aid only if it is cheaper than documenting the workflow.
- Produce a roadmap recommendation for the next production phase.

Architecture self-check:

- No public editor or UGC platform is created.
- Authoring tools consume existing validation APIs rather than bypassing them.

### Round 8 - Final Validation And Spike Recommendation

Goal:

- Run full validation.
- Run focused generator/content validation.
- Produce `docs/phase-9-generator-expansion-spike-final-report.md`.
- Confirm the working tree is clean, push is complete, and Pages remains healthy if web-visible files changed.

Required commands:

```powershell
pnpm lint
pnpm typecheck
pnpm test
pnpm build
git diff --check
git status --short --branch
```

If web-visible files changed, also run:

```powershell
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StartDevServer.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Smoke.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StopDevServer.cmd
```

Final report must include files changed by category, generator contract and prototype status, generation throughput and rejection reasons, reveal minimization evidence, difficulty scoring evidence and calibration caveat, technique/editor/roadmap recommendations, validation results, boundary scans, commits, push status, PASS criteria status, and blockers or notes for the next phase.

## 7. PASS Criteria

Phase 9 passes only when all are true:

- Final report exists at `docs/phase-9-generator-expansion-spike-final-report.md`.
- Full validation passes: lint, typecheck, tests, build, and `git diff --check`.
- Any new package/tool has focused tests and is included in workspace/package configs.
- Generator prototype or design note clearly documents inputs, outputs, seed policy, validation pipeline, caps, and failure modes.
- Any generated or minimized candidate claimed as successful passes schema, solver, proof/no-guess, and final guest-layout uniqueness.
- Difficulty scoring is explicitly provisional and not falsely calibrated from nonexistent playtest data.
- Existing 10 MVP cases remain valid and default `case-004` remains stable.
- Player-facing app does not expose generator/debug/target/forced/candidate internals.
- Domain remains schema/solver/proof/oracle/generator/Zod/UI/fs-free.
- Solver/proof packages remain independent of React/Vite/browser UI code.
- Target reads remain limited to targetAccess, verification, tests, and explicit developer-only surfaces.
- No public editor, UGC, backend, analytics, daily challenge, broad redesign, or breaking schema migration enters this phase.
- Working tree is clean and final commit is pushed.

## 8. Debug Self-Check Template

Use this every round:

```text
Debug self-check:
- Smallest generator/content fixture tested:
- Success path covered:
- Rejection/failure path covered:
- Empty/cap/truncated path covered:
- Determinism/seed behavior checked:
- Performance checked:
- Generated artifact policy checked:
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
- Generator consumes public APIs rather than duplicating semantics:
- Experimental content stayed out of default shipped content:
- Target access stayed behind the narrow app boundary:
- Player marks stayed out of solver/proof facts:
- Developer-only data stayed gated:
- New DSL/editor/backend/UGC scope avoided unless explicitly documented as future work:
- Unrelated files left untouched:
```

## 10. Final Report Template

```markdown
# Phase 9 Generator And Expansion Spike Final Report

Status: READY_FOR_CHECK
Guide: `docs/phase-9-generator-expansion-spike-goal-mode-execution-guide.md`
Phase: Phase 9 - Generator And Expansion Spike

## Summary
## Files Changed By Category
## Generator Contract
## Prototype Status
## Generated Candidate Evidence
## Reveal Minimization Evidence
## Difficulty Metrics
## Technique Expansion Findings
## Authoring Workflow Findings
## Validation
## Boundary Scans
## Recommendations
## Commits
## PASS Criteria
## Blockers Or Follow-Up Notes
```
