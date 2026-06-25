# Phase 19 Quality Gate Evidence

Status: Round 3 evidence recorded

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

## Architecture Notes

- Gates consume authoring/generator/proof/solver/schema public APIs.
- Gates do not duplicate CSP solving, proof deduction, or schema parsing semantics.
- Rule contribution is report-only during discovery; final promoted cases should not carry multiple redundant rules.

## Round 3 Validation

- Focused authoring tests: PASS, `2` files and `23` tests.
- `git diff --check`: PASS, with normal CRLF working-copy warnings only.
- `Validate.cmd`: PASS.
  - `pnpm lint`: PASS.
  - `pnpm typecheck`: PASS.
  - `pnpm test`: PASS.
  - `pnpm build`: PASS.
