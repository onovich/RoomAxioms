# LOCAL_SCOPE_DIFFERENCE Semantics

Status: Round 1 semantics contract
Scope: `@room-axioms/proof`

## Technique Goal

`LOCAL_SCOPE_DIFFERENCE` explains guest deductions caused by subtracting one known local `forEachCount` guest scope from another known local `forEachCount` guest scope under current Puzzle Schema v1 and DSL v1.

The first production version is intentionally narrow:

- target kind: `guest`;
- subject facts: known from public observations or prior object deductions;
- rules: existing `forEachCount` rules only;
- conclusion kind: `guest`;
- no target layout access;
- no new schema, solver, rule, or UI semantics.

Safe conclusions from equal local-scope differences are deferred because Phase 10 `LOCAL_SCOPE_INTERSECTION` already covers the accepted safe-cell overlap pattern. This keeps the first difference implementation focused on a distinct human move: a larger known scope must contain one or more extra guests outside a nested known scope.

## Core Pattern

For two known subject scopes `A` and `B` that constrain the same target kind:

- `A` is the larger remaining unknown scope;
- `B` is the contained remaining unknown scope;
- both scopes have finite remaining guest counts from their public rules and current public facts;
- the unknown cells in `B` are a subset of the unknown cells in `A`;
- the unknown cells in `A - B` are the difference cells.

If the lower bound on the extra guests required by `A` after satisfying all possible `B` guests equals the number of difference cells, then every difference cell is a guest.

## Formal Conditions

For a candidate ordered pair `(outer, inner)`:

1. Both summaries use the same target kind `guest`.
2. Both subjects are known from public observations or prior proof deductions.
3. Both summaries have finite remaining upper-bound capacity:

   ```text
   outerRemainingCapacity = outer.upperBound - outer.knownTargetCount
   innerRemainingCapacity = inner.upperBound - inner.knownTargetCount
   ```

4. Both summaries have remaining lower-bound requirements:

   ```text
   outerRemainingRequired = outer.lowerBound - outer.knownTargetCount
   innerRemainingRequired = inner.lowerBound - inner.knownTargetCount
   ```

5. The inner unknown cells must be contained in the outer unknown cells:

   ```text
   innerUnknown subset outerUnknown
   ```

6. The difference cells must be non-empty:

   ```text
   differenceUnknown = outerUnknown minus innerUnknown
   ```

7. The outer scope must require extra guests beyond the maximum possible inner guest count:

   ```text
   differenceRequired = outerRemainingRequired - innerRemainingCapacity
   ```

8. If:

   ```text
   differenceRequired > 0
   differenceRequired == differenceUnknown.length
   ```

   then every `differenceUnknown` cell is a guest.

The first version does not emit safe deductions from:

```text
outerRemainingCapacity - innerRemainingRequired == 0
```

because that safe form overlaps the already accepted local-scope intersection safe pattern.

## Positive Fixture Shape

The smallest positive fixture is a 3x3 board:

- `B2` is known `bottle`;
- `B1` is known `mirror`;
- `A1` and `C1` are known `empty`;
- rule `R1`: each `bottle` has exactly two orthogonal `guest` cells;
- rule `R2`: each `mirror` has exactly one adjacent `guest` cell.

Reasoning:

- `B2`'s orthogonal guest scope has unknown cells `A2`, `C2`, and `B3`, and requires two guests.
- `B1`'s adjacent guest scope has unknown cells `A2` and `C2`, and allows at most one guest.
- Therefore at least one extra guest must be outside the `B1` scope but inside the `B2` scope.
- The only such difference cell is `B3`.
- Therefore `B3` is a guest.

This deduction is not global all-remaining, not local all-remaining, not local saturation, and not the Phase 10 local-scope intersection safe-cell pattern.

## Negative Cases

The proof package must not emit `LOCAL_SCOPE_DIFFERENCE` when:

- the inner unknown cells are not contained in the outer unknown cells;
- the extra required guests can be placed in more difference cells than are forced;
- the conclusion would depend on reverse implication, such as inferring a subject merely because a guest is nearby;
- the conclusion requires reading the hidden target layout;
- the valid human pattern is only `LOCAL_SCOPE_INTERSECTION`;
- the target kind is not `guest`.

## Rendering Requirement

Stable proof rendering should name:

- both local rules;
- both known subject cells;
- both public scopes;
- the contained inner unknown cells;
- the difference cells;
- the lower-bound extra guest requirement;
- the guest conclusion.

Rendered text must not mention solver search, candidate counts, hidden targets, forced-cell diagnostics, generator data, or authoring diagnostics.

