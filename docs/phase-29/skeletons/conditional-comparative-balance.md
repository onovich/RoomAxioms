# Phase 29 Skeleton Brief - Conditional Comparative Balance

Status: pre-JSON skeleton; design probe.

Inspired by: comparative/conditional Phase 26 and Phase 27 blockers, not a
specific Phase 28 JSON candidate.

This skeleton tests whether a comparative count can preserve opening ambiguity
while setting up a later conditional turn. It is intentionally not a production
batch seed; it exists to review the skeleton before JSON.

## Player-Facing Intent

The player should compare two visible room groups, realize the groups cannot be
balanced in both guest and object counts, and later use that imbalance to open a
small conditional clue. The experience should feel like balancing two ledgers,
not chasing an isolated count.

## Board / Space Hypothesis

- Rough board: 6x5.
- Effective unknown cells: 15-18.
- Initial reveals: symmetric-looking but not actually mirror-symmetric.
- Active areas:
  - left exhibit group with five or six unknowns;
  - right exhibit group with five or six unknowns;
  - center junction with three uncertain cells shared by both later rules;
  - one anchor object whose neighborhood intersects only part of the center.

The larger board is justified only if both sides remain active. If one side is
only a visual foil and disappears from the proof trace, the skeleton fails.

## Opening Ambiguity Target

Expected opening guest layouts: 12-30.

The comparative rule may narrow the opening, but it must not decide a guest or
safe cell by itself. It should create pressure that later rules can use.

## Wave Plan

Wave 1:

- A comparative count between left and right groups rules out one broad theory
  but leaves both sides with multiple placements.
- A small region count in the center junction derives one non-guest object or
  one safe cell.

Wave 2:

- The derived center fact lets an anchor/local rule identify which side has the
  surplus object pressure.
- The comparative rule becomes useful again because the two sides no longer
  have symmetric possibilities.

Wave 3:

- A conditional rule keyed to the side imbalance constrains a non-singleton
  center scope.
- This wave should produce at least two deductions, preferably one safe and one
  object.

Wave 4:

- A final region or local count places the last guest pair.
- The final pair must use both the comparative imbalance and the conditional
  center scope.

## Fact Dependency Table

| Fact | Intended wave | Dependency |
| --- | ---: | --- |
| Center non-guest or object | 1 | Center region count plus comparative pressure |
| Side surplus fact | 2 | Anchor/local rule after center fact |
| Conditional center safe/object | 3 | Derived side surplus activates conditional count |
| First final guest | 4 | Comparative count after Wave 3 removes one side theory |
| Second final guest | 4 | Local or region closure after first final guest |

## Rule Family Plan

- `comparativeCount`: left group compared with right group.
- `regionCount`: center junction.
- `anchorCount` or `forEachCount`: object/local side-pressure.
- `conditionalCount`: late non-singleton center scope.

## Shared-Variable Claim

The shared variables are the center junction cells plus the side surplus count.
The center cells are touched by the center region, the anchor/local rule, and
the conditional consequence. The side groups are touched by the comparative
rule and the final region/local closure.

## Anti-Degeneracy Claim

- Comparative scopes must each have at least four effective unknown cells.
- The comparison cannot be equivalent to the same scope with offset zero.
- The conditional condition must not be publicly true at opening.
- The center junction must have at least three effective unknown cells before
  Wave 3.
- No mirrored clone is acceptable; the two sides need different rule roles.

## Minimize Expectation

Reveal minimization must preserve:

- the comparative rule;
- the conditional rule;
- one anchor/local rule tying the center to a side group;
- four waves or a documented reason why one wave merged without making the case
  easier.

If minimization removes either the comparative or conditional rule, the skeleton
is not a survivor.

## Expected Skeleton Review Helper Input

```text
effectiveUnknownCells: 16
initialGuestLayouts: 16
proofWaveCount: 4
deductionCount: 8
materialRuleFamilyCount: 4
sharedVariableGroupCount: 2
lateFrontierUnlockCount: 1
redundantRuleCount: 0
hardDegeneracyRiskCount: 0
expected status: pass
```

## Feasibility Review

Current grammar mapping: feasible on paper with existing `comparativeCount`,
`conditionalCount`, `regionCount`, and local/anchor rules.

Proof technique mapping: highest risk among the three skeletons. Comparative
proof support exists, but previous comparative candidates often opened one
turn and then left solver-only closure. A concrete translation must prove that
the comparative rule is used again after Wave 2 or Wave 3.

Expected authoring diagnostics:

- degeneracy should reject trivial same-scope comparison;
- rule contribution should catch decorative comparative or conditional rules;
- no-guess diagnostics should identify whether late closure is solver-only;
- anti-clone should flag any mirror-style proof trace.

Known risk: the skeleton may prove that current grammar can describe the idea
but current proof support cannot naturally explain the late comparative reuse.
If so, the recommended next extension should be a targeted comparative
derived-fact bridge, not another JSON mutation sprint.
