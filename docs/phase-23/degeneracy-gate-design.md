# Phase 23 Degeneracy Gate Design

Status: Round 5 authoring API plus opt-in anti-clone enforcement

## Purpose

Phase 23 treats mechanically valid but trivially revealing rules as product defects. The first degeneracy gate detects scope-count rules whose opening effective unknown area is too small to support a real deduction.

## Implemented In Round 3

Authoring API:

- `evaluateDegeneracyGates(puzzle)`

Covered rule families:

- `regionCount`
- static row/column `lineCount`
- ray/sightline `lineCount` using only blockers already revealed in the opening state

Detected failure modes:

- singleton effective scopes, where a region or sightline has zero or one unrevealed cell after opening reveals;
- direct guest-count giveaways, where the remaining required guest count is equal to or greater than the remaining unknown cell count;
- near giveaways, where a line or region is only one unknown cell above the required guest count.

The API remains report-only by default. Round 4 wires it into anti-clone through an explicit opt-in:

```powershell
pnpm authoring -- anti-clone <case-a.json> <case-b.json> --include-degeneracy
```

With the flag enabled, degeneracy `fail` results count as anti-clone hard failures and `warning` results count as reviewer-blocking evidence. Without the flag, historical anti-clone reports are unchanged, because existing tutorial/baseline cases may stay available while being excluded from the Phase 23 4+ quota.

## Test Fixtures

Added in-memory authoring tests for:

- singleton `regionCount` fail;
- blocker-aware singleton ray/sightline fail;
- near line-count giveaway warning;
- healthy region scope pass.
- single-family material-rule fail;
- mixed-family material-rule pass;
- decorative/redundant rule warning.

## Follow-Up

Round 5 added `evaluateRuleFamilyDiversityGate(puzzle)`. It uses the existing rule-impact vector to count only material rule families and warn on redundant rules. `anti-clone --include-degeneracy` now also includes this evidence, so Phase 23 candidate checks reject one-family closures before they can be dressed up as hard cases.

Rounds 6-8 should integrate these signals into richer authoring reports and the difficulty rubric v2.
