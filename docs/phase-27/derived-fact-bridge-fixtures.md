# Phase 27 Derived-Fact Bridge Fixtures

Round 3 added focused proof fixtures for blocker class B01/F01 from the Phase 27 taxonomy.

## Covered bridge

- A derived non-guest object can now become the subject of a later `forEachCount` rule in the same human-reasoning wave.
- A derived non-guest object can now become the subject of a later `anchorCount` rule in the same human-reasoning wave.
- Derived guest/object/safe facts can now be reused by Phase 24 grammar count summaries without converting them into target data or observations.
- A derived guest fact can now saturate a later `scopeOverlapCount` over a non-singleton overlap scope.
- A derived safe fact can now make all remaining cells in a later `scopeOverlapCount` forced guests.
- The proof graph preserves the parent dependency from the object deduction to the later safe-cell deduction.

## Fixtures

- `packages/proof/src/reasoner.test.ts`: `uses a derived object as an anchor subject with proof dependencies`
- `packages/proof/src/reasoner.test.ts`: `uses a derived object as a local subject with proof dependencies`
- `packages/proof/src/reasoner.test.ts`: `uses a derived guest fact to saturate a non-singleton overlap scope`
- `packages/proof/src/reasoner.test.ts`: `uses a derived safe fact to force all remaining overlap cells`

The local/anchor fixtures use a tiny center-cell bin deduction from a region count, then reuse that derived bin as the visible subject for a zero-guest orthogonal scope. The assertions verify:

- the initial object deduction is `REGION_COUNT_ALL_REMAINING`;
- the later deductions are `ANCHOR_COUNT_SATURATED` or `LOCAL_COUNT_SATURATED`;
- the later proof premises include the derived-object premise;
- the proof graph contains the object deduction node as a parent of the later safe deduction node.

The scope-overlap fixtures use non-singleton overlap scopes and verify both directions of guest-count bridge material:

- `REGION_COUNT_ALL_REMAINING` derives a guest, then `SCOPE_OVERLAP_COUNT_SATURATED` reuses it to mark the rest of the overlap safe.
- `REGION_COUNT_SATURATED` derives a safe cell, then `SCOPE_OVERLAP_COUNT_ALL_REMAINING` reuses it as known non-guest material to force the remaining overlap guests.
- Both resulting proof nodes have the earlier derived-fact node as a parent.

## Scope Notes

This round deliberately keeps the bridge single-wave and dependency-preserving. The derived-fact count overlay is limited to grammar count rules (`scopeOverlapCount`, `conditionalCount`, and `comparativeCount`) so existing local-scope difference/intersection retention is not pre-consumed by earlier local count summaries. It does not add broad proof search, new rule grammar, solver changes, or multi-step derived-fact cascading beyond the existing `deriveHumanDeductions` pass structure.
