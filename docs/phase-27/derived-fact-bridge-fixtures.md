# Phase 27 Derived-Fact Bridge Fixtures

Round 3 added focused proof fixtures for blocker class B01/F01 from the Phase 27 taxonomy.

## Covered bridge

- A derived non-guest object can now become the subject of a later `forEachCount` rule in the same human-reasoning wave.
- A derived non-guest object can now become the subject of a later `anchorCount` rule in the same human-reasoning wave.
- The proof graph preserves the parent dependency from the object deduction to the later safe-cell deduction.

## Fixtures

- `packages/proof/src/reasoner.test.ts`: `uses a derived object as an anchor subject with proof dependencies`
- `packages/proof/src/reasoner.test.ts`: `uses a derived object as a local subject with proof dependencies`

Both fixtures use a tiny center-cell bin deduction from a region count, then reuse that derived bin as the visible subject for a zero-guest orthogonal scope. The assertions verify:

- the initial object deduction is `REGION_COUNT_ALL_REMAINING`;
- the later deductions are `ANCHOR_COUNT_SATURATED` or `LOCAL_COUNT_SATURATED`;
- the later proof premises include the derived-object premise;
- the proof graph contains the object deduction node as a parent of the later safe deduction node.

## Scope Notes

This round deliberately keeps the bridge single-wave and dependency-preserving. It does not add broad proof search, new rule grammar, solver changes, or multi-step derived-object cascading beyond the existing `deriveHumanDeductions` pass structure.
