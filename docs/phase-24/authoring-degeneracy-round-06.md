# Phase 24 Authoring Degeneracy Round 06

Status: implemented authoring-side degeneracy gates for the first Phase 24 grammar families.

## Scope

This round closes the clean-tree blocker reported after `cebf733`. The pending
`packages/authoring/src/qualityGates.ts` changes are intentional Phase 24 authoring
work, not a hotfix residue.

## Implemented

- Extended degeneracy reporting to recognize:
  - `scopeOverlapCount`
  - `conditionalCount`
  - `comparativeCount`
- Checks `scopeOverlapCount` over the derived overlap scope, including intersection,
  union, left-only, and right-only scopes.
- Checks `conditionalCount` in two parts:
  - the public condition scope
  - the public consequence scope
- Checks `comparativeCount` sides for singleton effective scopes.
- Adds a hard failure for same-scope comparative rules with zero offset, because they
  do not add meaningful puzzle information.

## Covered Degenerate Fixtures

- Singleton scope overlap that directly gives away a guest cell.
- Conditional consequence scope that directly gives away a guest cell.
- Comparative count that compares the same scope against itself with no offset.

## Validation

Focused checks:

- `pnpm --filter @room-axioms/authoring typecheck`: PASS
- `pnpm --filter @room-axioms/authoring test -- src/qualityGates.test.ts`: PASS,
  5 files / 63 tests

Full validation is recorded in the round commit evidence.
