# Solver Semantics Round 04

Status: implemented exact solver and oracle semantics for the three priority Phase 24 grammar families.

## Implemented

- `scopeOverlapCount`
  - Compiles left and right `CountScopeRef` values.
  - Resolves `intersection`, `union`, `leftOnly`, and `rightOnly` cell sets.
  - Applies normal count-comparator feasibility to the derived cell set.
- `comparativeCount`
  - Computes independent count bounds for left and right scopes.
  - Tests whether any integer pair can satisfy `left op (right + offset)`.
  - Evaluates complete oracle assignments exactly.
- `conditionalCount`
  - Computes condition and consequence count bounds.
  - Treats implication conservatively during search: if the condition is forced true, the consequence must be feasible; otherwise the rule remains possible.
  - Evaluates complete oracle assignments exactly as `!condition || then`.

## Deliberate Limits

- Propagation is conservative for the new rule families in this round. It checks impossibility through `evaluateConstraintBounds`, but it does not yet force cell domains from new-rule deductions.
- Human proof support is not complete yet. New rules can constrain solver search, but no-guess explanation support will be added in later proof rounds.
- Dynamic ray scopes remain conservative until blocker cells are singleton-known; complete assignments are exact.

## Tests

Focused validation:

- `pnpm --filter @room-axioms/solver typecheck`: PASS
- `pnpm --filter @room-axioms/oracle typecheck`: PASS
- `pnpm --filter @room-axioms/solver test`: PASS, 7 files / 53 tests
- `pnpm --filter @room-axioms/oracle test`: PASS, 5 files / 19 tests

Covered fixtures:

- scope-overlap count bounds over an intersection cell.
- comparative count feasibility between two regions.
- conditional count rejection when the condition is forced true and the consequence is impossible.
- solver search accepting a tiny puzzle constrained by all three new grammar families.
- solver search rejecting a complete assignment that violates a comparative rule.
- oracle exact evaluation for all three new grammar families.
