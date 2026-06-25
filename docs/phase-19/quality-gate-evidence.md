# Phase 19 Quality Gate Evidence

Status: Rounds 7-10 evidence recorded

## Implemented Gate Surfaces

### Core Opening Gates

Implemented in `packages/authoring/src/qualityGates.ts`:

- `opening-ambiguity`: fails when a candidate starts with fewer than 2 possible guest layouts.
- `proof-wave`: fails when the no-guess proof has 0 human deduction waves.
- `deduction-count`: fails when the no-guess proof has 0 deductions.
- `non-onboarding-trivial-closure`: fails normal player-facing cases that close at the opening state without deductions; internal fixtures may record this as a warning.

Coverage in `packages/authoring/src/qualityGates.test.ts`:

- opening unique layout rejection;
- zero proof-wave rejection;
- zero deduction rejection;
- non-onboarding trivial closure rejection;
- onboarding still requiring at least 2 opening candidate layouts;
- `case-011` passing the initial gate set.

### Rule Contribution Gate

Implemented in `packages/authoring/src/qualityGates.ts`:

- For each rule, construct a report-only puzzle with that rule removed.
- Re-run public schema, solver, proof, and layout-count APIs.
- A rule contributes when removing it changes at least one player-quality outcome:
  - target rejected without the rule;
  - opening guest-layout count increases;
  - proof/no-guess path fails;
  - final guest-layout uniqueness fails;
  - a required technique disappears.
- A rule is redundant when removal causes no material change.

Coverage in `packages/authoring/src/qualityGates.test.ts`:

- useful rule detection using `case-011`;
- redundant duplicate rule detection;
- decorative non-guest rule detection.

### Non-Isomorphism Gate

Implemented in `packages/authoring/src/qualityGates.ts`:

- `canonicalPuzzleIsomorphismSignature` computes a canonical structure signature across board symmetries.
- `findIsomorphicPuzzleGroups` groups cases that share a canonical signature.
- The signature includes board dimensions, allowed kinds, normalized rule constraints, initial reveal cells, and target layout.
- The signature ignores id, title, case name, rule presentation copy, and metadata.

Coverage in `packages/authoring/src/qualityGates.test.ts`:

- `case-005`, `case-006`, and `case-007` match `case-004` under canonical signatures;
- full shipped-case scan reports the `case-004` through `case-007` duplicate class;
- `case-011` is not grouped with that duplicate class.

Report: `docs/phase-19/non-isomorphism-report.md`.

### Technique Retention Gate

Implemented in `packages/authoring/src/qualityGates.ts` and enforced by `packages/authoring/src/caseCommands.ts`:

- `evaluateTechniqueRetentionGate` checks required proof techniques after reveal minimization.
- `minimize --require-technique <TECHNIQUE_ID>` now returns `ok: false` when required techniques are lost after minimization.
- Cases with no required technique list remain reportable, but promoted candidate checks should provide the expected technique list.

Coverage in `packages/authoring/src/qualityGates.test.ts` and `packages/authoring/src/parser.test.ts`:

- `case-011` retains `LOCAL_SCOPE_INTERSECTION`;
- `case-012` retains mixed `LOCAL_COUNT_SATURATED` and `LOCAL_SCOPE_DIFFERENCE`;
- `case-004` fails the gate when minimization drops required `UNIQUE_TARGET_NEIGHBOR_INTERSECTION`;
- existing experimental difference fixture now reports `ok: false` when required difference retention fails.

### Private Template Sampling

Recorded in `docs/phase-19/sampling-evidence.md`:

- four private Phase 19 templates under `content/experimental/phase-19`;
- report-only sampling for local-count/exclusion, intersection, difference, and mixed 4x4 families;
- zero generated candidates promoted;
- capped sampling had no solver truncation but accepted no candidates for the recorded seeds.

### Experimental Candidate Pool

Recorded in `docs/phase-19/candidate-pool-evidence.md`:

- two local-count first-deduction candidates;
- one non-isomorphic local-scope-intersection candidate;
- one non-isomorphic mixed 5x4 candidate;
- all accepted candidates pass authoring report and score with no truncation;
- `phase-19-intersection-wide-001` passes required `LOCAL_SCOPE_INTERSECTION` minimization retention.

## Architecture Notes

- Gates consume authoring/generator/proof/solver/schema public APIs.
- Gates do not duplicate CSP solving, proof deduction, or schema parsing semantics.
- Rule contribution is report-only during discovery; final promoted cases should not carry multiple redundant rules.
- Non-isomorphism detection is an offline authoring gate and is not wired into player runtime UI.
- Technique retention is evaluated from proof metrics and does not introduce new proof techniques or solver behavior.

## Round 3 Validation

- Focused authoring tests: PASS, `2` files and `23` tests.
- `git diff --check`: PASS, with normal CRLF working-copy warnings only.
- `Validate.cmd`: PASS.
  - `pnpm lint`: PASS.
  - `pnpm typecheck`: PASS.
  - `pnpm test`: PASS.
  - `pnpm build`: PASS.

## Round 4 Validation

- Focused authoring tests: PASS, `2` files and `26` tests.
- `git diff --check`: PASS, with normal CRLF working-copy warnings only.
- `Validate.cmd`: PASS.
  - `pnpm lint`: PASS.
  - `pnpm typecheck`: PASS.
  - `pnpm test`: PASS.
  - `pnpm build`: PASS.

## Round 5 Validation

- Focused authoring tests: PASS, `2` files and `29` tests.
- Focused authoring typecheck: PASS.
- Focused minimize command for `case-011 --require-technique LOCAL_SCOPE_INTERSECTION`: PASS, `ok: true`, `TECHNIQUE_RETENTION_PASS`.
- Focused minimize command for `case-012 --require-technique LOCAL_SCOPE_DIFFERENCE`: PASS, `ok: true`, `TECHNIQUE_RETENTION_PASS`.
- `git diff --check`: PASS, with normal CRLF working-copy warnings only.
- `Validate.cmd`: PASS.
  - `pnpm lint`: PASS.
  - `pnpm typecheck`: PASS.
  - `pnpm test`: PASS.
  - `pnpm build`: PASS.

## Round 6 Validation

- Template sampling commands: PASS for four report-only templates, with zero accepted candidates and no solver truncation.
- `git diff --check`: PASS, with normal CRLF working-copy warnings only.
- `Validate.cmd`: PASS.
  - `pnpm lint`: PASS.
  - `pnpm typecheck`: PASS.
  - `pnpm test`: PASS.
  - `pnpm build`: PASS.

## Rounds 7-10 Candidate Validation

- `phase-19-local-count-compact-001`: report PASS, score PASS, no truncation.
- `phase-19-local-count-wide-001`: report PASS, score PASS, no truncation.
- `phase-19-intersection-wide-001`: report PASS, score PASS, minimize `--require-technique LOCAL_SCOPE_INTERSECTION` PASS.
- `phase-19-mixed-wide-001`: report PASS, score PASS, no truncation.
- `git diff --check`: PASS, with normal CRLF working-copy warnings only.
- `Validate.cmd`: PASS.
  - `pnpm lint`: PASS.
  - `pnpm typecheck`: PASS.
  - `pnpm test`: PASS.
  - `pnpm build`: PASS.
