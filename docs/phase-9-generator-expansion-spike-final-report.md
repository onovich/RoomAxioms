# Phase 9 Generator And Expansion Spike Final Report

Status: READY_FOR_CHECK
Guide: `docs/phase-9-generator-expansion-spike-goal-mode-execution-guide.md`
Phase: Phase 9 - Generator And Expansion Spike
Executor thread: `019ef271-256c-7be2-9663-e658e2378564`
Planner thread: `019ef0df-a626-7181-9ca6-1cc75c1f4c47`

## Summary

Phase 9 completed as an internal expansion spike. It added a private `@room-axioms/generator` workspace package with deterministic sampling, generate-verify-filter, reveal minimization, and provisional difficulty scoring prototypes. It also produced decision docs for generator contracts, technique expansion, authoring workflow, and next-phase recommendations.

No generated or experimental content was promoted into the default player case selector. The existing ten MVP cases and default `case-004` remain stable.

## Files Changed By Category

Package:

- `packages/generator`: private internal spike package, source modules, tests, README, TypeScript configs, and package manifest.
- Workspace package metadata updated so generator lint/typecheck/test/build runs with the rest of the monorepo.

Documentation:

- `docs/phase-9/generator-contract.md`
- `docs/phase-9/generator-risk-register.md`
- `docs/phase-9/generator-sampling-report.md`
- `docs/phase-9/generator-filter-report.md`
- `docs/phase-9/generator-minimization-report.md`
- `docs/phase-9/generator-difficulty-report.md`
- `docs/phase-9/technique-expansion-decision.md`
- `docs/phase-9/authoring-workflow-roadmap.md`
- `docs/phase-9-generator-expansion-spike-final-report.md`
- `README.md`, `docs/development-plan.md`, and `Role.md` updated for Phase 9 status.

Content and web app:

- No MVP case JSON changed.
- No generated JSON was added to `content/cases`.
- No `apps/web/src/content/cases.ts` selector change was made.
- No player-facing UI feature, public editor, UGC flow, backend, analytics, or daily challenge was added.

## Generator Contract

The generator contract is report-only and internal:

- Inputs: deterministic seed, board size, allowed kinds, guest count, current DSL v1 rules, initial reveal range, attempt/model/node caps, and artifact policy.
- Outputs: accepted candidates, structured rejections, aggregate solver stats, reveal minimization reports, and uncalibrated difficulty scores.
- Determinism: `createGeneratorSeed(seed)` records the seed and all sampling uses deterministic pseudo-random ordering from that seed.
- Validation pipeline: schema parse, target rule satisfaction, initial satisfiability, final guest-layout uniqueness, proof/no-guess verification, and future runtime compatibility before promotion.
- Caps: attempt, accepted-candidate, solver model, and node caps are explicit and reported as failure/truncation data.
- Artifact policy: generated content stays in reports or experimental paths only and is never added to the default selector without planner acceptance.

## Prototype Status

Implemented public APIs in `@room-axioms/generator`:

- `createGeneratorSeed(seed)`
- `sampleTargetAndObservationPools(input, template?)`
- `generateVerifiedCandidates(input, template?)`
- `minimizeInitialReveals(puzzle, options?)`
- `scorePuzzleDifficulty(puzzle, options?)`

The package consumes public `@room-axioms/domain`, `@room-axioms/schema`, `@room-axioms/solver`, and `@room-axioms/proof` APIs. It does not alter solver/proof semantics and does not import UI code.

## Generated Candidate Evidence

Round 2 sampling evidence:

- deterministic same-seed behavior;
- different-seed variation;
- non-guest-only initial observation pools;
- target-rule rejection when sampled guest count conflicts with rules;
- explicit cap rejection when solver max nodes are exhausted.

Round 3 filter evidence:

- accepts a tiny 3x3 one-guest candidate only after all validation gates pass;
- rejects target-rule mismatches;
- rejects a solver-valid but human-unprovable no-initial-reveal global-count puzzle as a proof guess point.

No generated candidate was written to shipped content.

## Reveal Minimization Evidence

Round 4 added deterministic greedy reveal minimization:

| Fixture | Before | After | Result |
| --- | ---: | ---: | --- |
| `experimental-minimize-intersection` | 5 | 4 | Removed `B1` while preserving no-guess proof and final guest `B2`. |
| `experimental-minimize-saturated` | 8 | 8 | Kept required safe reveals because removing them breaks proof completion. |

Each accepted removal must preserve schema validity, proof/no-guess completion, and final guest-layout uniqueness.

## Difficulty Metrics

Round 5 added provisional scoring from existing solver/proof/runtime evidence. Scores are internal diagnostics only and every score has `calibratedWithRealPlaytest: false`.

MVP comparison summary:

- `case-001` through `case-003`: score `2.40`, band `1`.
- `case-004`: score `23.00`, band `5`, initial guest layouts `15`.
- `case-005`: score `23.03`, band `5`.
- `case-006`: score `22.72`, band `5`.
- `case-007`: score `22.73`, band `5`.
- `case-008` through `case-010`: score `2.80`, band `1`.

This exposes a pacing gap between pre-solved low-band cases and dense one-wave high-band cases. It is not a real-player difficulty calibration.

## Technique Expansion Findings

Round 6 intentionally did not implement new DSL or proof semantics. The recommended next production technique is proof-side `LOCAL_SCOPE_INTERSECTION`, followed later by `LOCAL_SCOPE_DIFFERENCE`.

Deferred items:

- `lineCount` row/column rules;
- Manhattan distance rules;
- visibility or blocker rules;
- breaking Puzzle Schema v1 changes;
- editor/UGC mechanics.

These need their own production guide, fixtures, proof rendering, runtime tests, and copy review.

## Authoring Workflow Findings

Round 7 recommends documentation now and a private offline authoring CLI next. The next production phase should favor:

- JSON templates;
- `validate <case.json>`;
- `score <case.json>`;
- `minimize <case.json>`;
- `sample --seed <seed> --template <template.json>`;
- `report <case.json>`.

The CLI should consume existing package APIs and should not promote content automatically. Promotion remains a planner/checker decision.

## Validation

Final validation commands:

- `cmd /c pnpm.cmd lint`: PASS
- `cmd /c pnpm.cmd typecheck`: PASS
- `cmd /c pnpm.cmd test`: PASS
- `cmd /c pnpm.cmd --filter @room-axioms/generator test`: PASS
- `cmd /c pnpm.cmd build`: PASS
- `git diff --check`: PASS
- `git status --short --branch`: clean after final push

Round-level validation also passed before every pushed commit.

Smoke note:

- No web-visible runtime files or content selector files changed in Phase 9, so the guide's conditional local dev smoke was not required for the final round.

## Boundary Scans

Final boundary scans:

- `@room-axioms/domain` has no imports of schema, solver, proof, oracle, generator, Zod, React, browser APIs, or Node filesystem APIs.
- `@room-axioms/solver` and `@room-axioms/proof` remain independent of React, Vite, and browser UI code.
- `@room-axioms/generator` is not imported by `apps/web/src`, `content/cases`, `packages/domain`, `packages/schema`, `packages/solver`, or `packages/proof`.
- No experimental/generated content appears in `content/cases` or the default web selector.
- Target access boundaries in `apps/web/src` were not expanded by Phase 9.

## Recommendations

Recommended next phase: Phase 10 - Authoring CLI And Proof Technique Hardening.

Build order:

1. Add `LOCAL_SCOPE_INTERSECTION` proof support with solver-backed deduction validation.
2. Add private offline authoring CLI reports for validation, scoring, minimization, and deterministic sampling.
3. Create experimental mid-band fixtures that require the new proof technique.
4. Keep generated cases out of default content until planner/checker acceptance.
5. Collect real playtest data before public difficulty labels or calibration claims.

## Commits

- `15ff49e` - `chore: add Phase 9 generator spike baseline`
- `e966dd6` - `feat: add Phase 9 target sampler`
- `09bc6dc` - `feat: add Phase 9 generator filter`
- `6505bc3` - `feat: add Phase 9 reveal minimization`
- `49d10ef` - `feat: add Phase 9 difficulty scoring`
- `e2dbc97` - `docs: record Phase 9 technique expansion decision`
- `fac1afb` - `docs: record Phase 9 authoring roadmap`
- Final report commit: this report commit; exact hash is reported in the executor notification after push.

## PASS Criteria

- Final report exists: PASS
- Full validation passes: PASS
- New generator package has focused tests and workspace integration: PASS
- Generator contract documents inputs, outputs, seed policy, validation pipeline, caps, and failure modes: PASS
- Claimed generated/minimized success paths pass schema, solver, proof/no-guess, and final uniqueness: PASS
- Difficulty scoring is explicitly provisional and uncalibrated: PASS
- Existing 10 MVP cases and default `case-004` remain stable: PASS
- Player app does not expose generator/debug/target/forced/candidate internals: PASS
- Domain remains schema/solver/proof/oracle/generator/Zod/UI/fs-free: PASS
- Solver/proof remain independent of React/Vite/browser UI code: PASS
- Target reads remain limited to existing boundaries: PASS
- No public editor, UGC, backend, analytics, daily challenge, broad redesign, or breaking schema migration entered Phase 9: PASS
- Working tree clean and final commit pushed: PASS after final push

## Blockers Or Follow-Up Notes

No blockers.

Follow-up notes:

- The generator is useful for evidence and small experiments, not yet a production content pipeline.
- Real playtest data is still required before difficulty labels can become public product claims.
- Mid-band content likely needs proof technique hardening before generator throughput is the main bottleneck.
