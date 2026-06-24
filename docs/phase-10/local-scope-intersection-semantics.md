# LOCAL_SCOPE_INTERSECTION Semantics

Status: Round 2 semantics contract
Scope: `@room-axioms/proof`

## Technique Goal

`LOCAL_SCOPE_INTERSECTION` explains safe-cell deductions caused by overlapping local `forEachCount` scopes under current Puzzle Schema v1 and DSL v1.

The first production version is intentionally narrow:

- target kind: `guest`;
- subject facts: known from public observations or prior object deductions;
- rules: existing `forEachCount` rules only;
- conclusion kind: `safe`;
- no target layout access;
- no new schema or solver semantics.

## Core Pattern

For two known subject scopes `A` and `B` that constrain the same target kind:

- `A` has a remaining guest capacity inside scope `A`;
- `B` has a remaining guest requirement inside scope `B`;
- some currently unknown cells are shared by both scopes;
- some unknown cells belong only to `A`, and some belong only to `B`.

If rule `B` forces enough remaining guests into the shared cells to consume all remaining guest capacity in scope `A`, then every unknown `A`-only cell is safe.

The same reasoning applies in the opposite direction.

## Formal Conditions

For a candidate ordered pair `(consumer, provider)`:

1. Both summaries use the same target kind `guest`.
2. Both subjects are known from public observations or prior proof deductions.
3. The provider has a positive remaining lower-bound requirement:

   ```text
   providerRemainingRequired = provider.lowerBound - provider.knownTargetCount
   ```

4. The consumer has a finite remaining upper-bound capacity:

   ```text
   consumerRemainingCapacity = consumer.upperBound - consumer.knownTargetCount
   ```

5. Let:

   ```text
   sharedUnknown = unknownConsumerCells intersection unknownProviderCells
   providerOnlyUnknown = unknownProviderCells minus unknownConsumerCells
   consumerOnlyUnknown = unknownConsumerCells minus unknownProviderCells
   ```

6. The provider must place at least this many guests into the shared unknown cells:

   ```text
   providerForcedSharedGuests =
     max(0, providerRemainingRequired - providerOnlyUnknown.length)
   ```

7. If:

   ```text
   providerForcedSharedGuests >= consumerRemainingCapacity
   ```

   then every `consumerOnlyUnknown` cell is safe.

## Positive Fixture Shape

The smallest positive fixture is a 3x3 board:

- `B2` is known `bottle`;
- `B1` is known `mirror`;
- `A1` is known `empty`;
- rule `R1`: each `bottle` has exactly one orthogonal `guest`;
- rule `R2`: each `mirror` has exactly two adjacent `guest` cells.

Reasoning:

- `B2`'s orthogonal guest scope has unknown cells `A2`, `C2`, and `B3`, and capacity one.
- `B1`'s adjacent guest scope has unknown cells `C1`, `A2`, and `C2`, and requires two guests.
- `B1` can place at most one guest in provider-only cell `C1`, so at least one guest must be in shared cells `A2` or `C2`.
- Because `B2` only allows one guest in its scope, that shared guest consumes `B2`'s capacity.
- Therefore `B3` is safe.

This deduction is not a global singleton intersection, not local saturation, and not all-remaining.

## Negative Cases

The proof package must not emit `LOCAL_SCOPE_INTERSECTION` when:

- the provider does not force any target into the shared cells;
- the result depends on reverse implication, such as inferring a mirror subject merely because a guest is nearby;
- the conclusion requires target layout knowledge;
- the valid human pattern is really the deferred `LOCAL_SCOPE_DIFFERENCE` technique.

## Rendering Requirement

Stable proof rendering should name:

- both local rules;
- both known subject cells;
- both scopes;
- the shared cells;
- the provider-only capacity limit;
- the safe conclusion.

The rendered text must not mention solver search, candidate counts, hidden targets, or forced-cell diagnostics.
