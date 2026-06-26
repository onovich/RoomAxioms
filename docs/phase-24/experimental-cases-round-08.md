# Phase 24 Experimental Cases Round 08

Status: added three private Phase 24 experimental cases for the implemented grammar
families.

## Scope

The cases are private fixtures under `content/experimental/phase-24/`. They are not
wired into the player selector and are not promoted as calibrated content.

## Cases

| Case | Grammar family | Report status | Notes |
| --- | --- | --- | --- |
| `phase-24-overlap-cross-001.json` | `scopeOverlapCount` | PASS | Uses an overlap intersection plus a bottle count. Degeneracy is a warning, not a failure, because the overlap count is close to a direct giveaway. |
| `phase-24-comparative-balance-001.json` | `comparativeCount` | PASS | Uses a fixed public right side plus offset to require all remaining left-side cells as guests. Degeneracy passes after the fixed-side false-positive repair. |
| `phase-24-conditional-frontier-001.json` | `conditionalCount` | PASS | Uses a fully public empty condition to activate a no-guest consequence. Degeneracy passes after the fixed-condition false-positive repair. |

## Authoring Evidence

Focused commands:

- `pnpm authoring -- report content\experimental\phase-24\phase-24-overlap-cross-001.json`: PASS
- `pnpm authoring -- report content\experimental\phase-24\phase-24-comparative-balance-001.json`: PASS
- `pnpm authoring -- report content\experimental\phase-24\phase-24-conditional-frontier-001.json`: PASS
- `pnpm --filter @room-axioms/authoring test -- src/qualityGates.test.ts`: PASS,
  5 files / 65 tests

All three cases parse, satisfy target rules, are initially satisfiable, pass no-guess
verification, and are ready for experimental planner review.

## Caveat

These are compact grammar fixtures, not difficulty candidates. In all three reports,
the opening guest layout is already unique, so authoring verification emits zero proof
waves. The proof-backed deduction templates for these grammar families are covered by
package tests from Rounds 05 and 07. A later hardness-probe round still needs to test
whether these mechanics can create deeper non-degenerate proof chains beyond
`case-021`.

## Gate Repair Included

This round also repairs an authoring false positive: a fully observed public side of
a `comparativeCount`, or a fully observed public condition of a `conditionalCount`, is
now allowed as a readable anchor. A single unknown cell in those scopes still fails as
a singleton giveaway.
