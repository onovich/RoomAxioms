# Phase 29 Skeleton Brief - Late Closure Bottle Frontier

Status: pre-JSON skeleton; translation candidate with caution.

Inspired by: C10/C06 late-closure lane.

This skeleton keeps the useful "frontier closes late" idea from C10/C06, but it
does not use a singleton conditional trigger and does not dump a public group of
safe cells.

## Player-Facing Intent

The player should first learn where an object must be, then use that object to
make a second, previously ambiguous corridor rule meaningful. The final guest
should feel earned because the late trigger was not visible at the opening.

The case should read as a delayed room-clearing puzzle, not as "one hidden rule
now says these cells are safe."

## Board / Space Hypothesis

- Rough board: 5x5 or 5x6.
- Effective unknown cells: 12-15.
- Initial reveals: enough to show two corridors, but not enough to activate the
  late rule.
- Active areas:
  - north corridor with three or four candidate cells;
  - central bottle/bin pocket with two possible object cells;
  - south corridor that holds the final guest ambiguity;
  - one cross-frontier cell touched by both local and conditional pressure.

The north and south corridors must both be part of the proof. If the south
corridor is only closed by final solver uniqueness, the skeleton fails.

## Opening Ambiguity Target

Expected opening guest layouts: 8-18.

The opening must not already force the condition that activates the late rule.
If the condition is true using only initial reveals, the skeleton repeats the
Phase 28 C10 failure.

## Wave Plan

Wave 1:

- A north corridor count derives one safe or object fact without identifying all
  guest positions.
- The central object pocket remains two-cell ambiguous.

Wave 2:

- A local count around the newly known safe/object fact resolves which central
  pocket cell is the bottle/bin.
- The south corridor still has at least two guest layouts.

Wave 3:

- A multi-cell condition becomes true because of the Wave 2 object fact.
- The conditional consequence is a count over a three-or-four-cell corridor,
  not a direct assertion that all those cells are safe.

Wave 4:

- The conditional count plus the object-local rule identifies one final safe
  cell and one final guest.
- The last guest depends on Wave 3, not on a public region total.

## Fact Dependency Table

| Fact | Intended wave | Dependency |
| --- | ---: | --- |
| North safe/object | 1 | Non-singleton corridor count |
| Central bottle/bin | 2 | Local count using Wave 1 fact |
| Conditional activation | 3 | Two-cell or three-cell condition after derived object fact |
| South safe cell | 3 | Conditional consequence, not direct safe dump |
| Final guest | 4 | South safe cell plus object-local closure |

## Rule Family Plan

- `regionCount` or `lineCount`: north corridor.
- `forEachCount` or `anchorCount`: central object-local pressure.
- `conditionalCount`: late rule with multi-cell condition and multi-cell then
  scope.
- Optional `comparativeCount`: only if it keeps north/south ambiguity balanced.

## Shared-Variable Claim

The central object pocket is the shared variable. It appears in an object-local
rule and in the condition that activates the late corridor count. A valid
translation must make that pocket unresolved at opening and resolved only after
Wave 1.

## Anti-Degeneracy Claim

- The condition scope must have at least two effective unknown cells at opening.
- The consequence scope must have at least three effective unknown cells.
- The consequence may not require zero guests over a visibly named fixed region.
- The late rule must not be redundant when removed from the puzzle.

## Minimize Expectation

Reveal minimization must preserve:

- the central object ambiguity;
- the conditional rule;
- the local/anchor rule that resolves the object;
- a late proof wave after the condition becomes available.

If minimization reduces the reveal set to a single central object reveal, the
skeleton is not a survivor.

## Expected Skeleton Review Helper Input

```text
effectiveUnknownCells: 13
initialGuestLayouts: 9
proofWaveCount: 4
deductionCount: 8
materialRuleFamilyCount: 3
sharedVariableGroupCount: 1
lateFrontierUnlockCount: 1
redundantRuleCount: 0
hardDegeneracyRiskCount: 0
expected status: pass
```

## Feasibility Review

Current grammar mapping: feasible if `conditionalCount` can express the delayed
condition and then-scope without singleton degeneration.

Proof technique mapping: depends on derived conditional activation. If the proof
engine only treats public/opening facts as condition inputs in a concrete
translation, the skeleton should be blocked as a proof/grammar bridge issue
rather than repaired through singleton reveals.

Expected authoring diagnostics:

- opening uniqueness must pass;
- degeneracy must reject singleton conditions and safe dumps;
- rule contribution must show the conditional rule is material;
- no-guess must show a Wave 3 or Wave 4 deduction after activation.

Known risk: Phase 28 showed that C10 repairs can either become zero-wave unique
or singleton direct giveaways. The first translation must tune the condition
scope before adding any final closure rule.
