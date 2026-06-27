# Phase 29 Skeleton Brief - Overlap Frontier Ledger

Status: pre-JSON skeleton; translation candidate.

Inspired by: C15 overlap/shared-variable lane.

This is not a mutation of the Phase 28 C15 JSON. The opener is deliberately
different: it starts from two broad, partially overlapping frontiers and avoids
the old singleton/near-count region that made C15 collapse.

## Player-Facing Intent

The player should feel that two public ledgers describe the same uncertain
middle hallway from different angles. Neither ledger tells the answer alone.
The turn should happen when a later object fact changes how the overlapping
cells can be counted.

The puzzle should not read like a larger copy of case-004, case-012, or the
rejected C15 drafts. Its identity is the shared middle frontier: two rules keep
talking about the same unresolved cells until the final wave.

## Board / Space Hypothesis

- Rough board: 5x5.
- Effective unknown cells: 14-16.
- Initial reveals: four or five edge facts, none of which identify a singleton
  count scope.
- Active areas:
  - west hall: three or four unknown cells;
  - east hall: three or four unknown cells;
  - middle overlap: four unknown cells touched by both ledgers;
  - lower object pocket: two or three unknown cells used only after Wave 2.

Every area must contribute to either the overlap count, an object-local rule, or
the final guest placement. No outer strip is allowed to be decorative padding.

## Opening Ambiguity Target

Expected opening guest layouts: 10-24.

Hard stop if opening count is 1, if a single region has exactly one effective
unknown and count 1, or if one count rule leaves only one possible guest cell.

## Wave Plan

Wave 1:

- A broad west/east region pair establishes that one guest is in the combined
  outer halls, but neither side is individually solved.
- A non-singleton overlap rule says the shared middle cells account for a fixed
  part of both ledgers.
- First deductions should identify one safe cell and one object candidate, not a
  guest singleton.

Wave 2:

- The object candidate becomes known through a local or anchor rule.
- That derived object fact removes one interpretation of the middle overlap.
- At least two middle cells remain uncertain after this wave.

Wave 3:

- The overlap count becomes saturated only after the derived object fact.
- The proof derives one guest in the middle frontier and one safe cell in the
  lower pocket.

Wave 4:

- A final local count around the derived object closes the second guest.
- The last guest placement must depend on the Wave 3 safe/guest pair, not on an
  opening region count alone.

## Fact Dependency Table

| Fact | Intended wave | Dependency |
| --- | ---: | --- |
| First lower-pocket object | 1 or 2 | Broad region pressure plus non-guest object rule |
| First middle safe cell | 1 | West/east region counts disagree unless one middle cell is safe |
| Middle guest | 3 | Derived object fact feeds `scopeOverlapCount` |
| Lower-pocket safe cell | 3 | Same overlap saturation removes the alternate guest layout |
| Final guest | 4 | Local count around the derived object after Wave 3 |

## Rule Family Plan

- `regionCount`: west hall and east hall pressure.
- `scopeOverlapCount`: shared middle frontier, non-singleton.
- `forEachCount` or `anchorCount`: object-local late closure.
- Optional `comparativeCount`: only if needed to keep west/east ambiguity
  balanced without direct count giveaway.

## Shared-Variable Claim

The shared variables are the middle frontier cells. A valid translation must
have at least two material rules that both constrain those cells, and neither
rule can be redundant after minimization.

## Anti-Degeneracy Claim

- No count scope may have fewer than three effective unknown cells at opening.
- The overlap scope must include at least three effective unknown cells.
- No rule may be equivalent to "these listed cells have no guest" as a public
  safe dump.
- The lower pocket must be used by the late object-local rule, not just left as
  decorative board area.

## Minimize Expectation

Reveal minimization must preserve:

- the overlap rule;
- one broad region rule on each side, or an equivalent non-redundant pair;
- the object-local late rule;
- at least four proof waves.

If minimization removes the overlap rule or reduces the proof to one or two
waves, the skeleton is not a survivor.

## Expected Skeleton Review Helper Input

```text
effectiveUnknownCells: 15
initialGuestLayouts: 12
proofWaveCount: 4
deductionCount: 9
materialRuleFamilyCount: 4
sharedVariableGroupCount: 1
lateFrontierUnlockCount: 1
redundantRuleCount: 0
hardDegeneracyRiskCount: 0
expected status: pass
```

## Feasibility Review

Current grammar mapping: feasible with existing `regionCount`,
`scopeOverlapCount`, and object-local count rules.

Proof technique mapping: requires derived facts to feed
`SCOPE_OVERLAP_COUNT_SATURATED` or `SCOPE_OVERLAP_COUNT_ALL_REMAINING`, then a
local/anchor closing technique.

Expected authoring diagnostics:

- pass or warning on rule-family diversity;
- pass on degeneracy if all opening scopes remain non-singleton;
- hard fail if the old C15 singleton/near-count opener returns;
- hard fail if proof gaps remain after the overlap wave.

Known risk: the current grammar can express the skeleton, but a concrete board
may still collapse if one side region overdetermines the middle cells. The first
translation should therefore tune opening ambiguity before tuning final closure.
