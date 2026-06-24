# Phase 12 Fixture Candidates

Status: Round 1 baseline

## Smallest Positive Proof Fixture

Planned unit-test id: `local-scope-difference-positive`

Shape:

- board: 3x3;
- allowed kinds: `empty`, `bottle`, `mirror`, `guest`;
- observations: `A1 empty`, `B1 mirror`, `C1 empty`, `B2 bottle`;
- rule `R1`: each `bottle` has exactly two orthogonal `guest` cells;
- rule `R2`: each `mirror` has exactly one adjacent `guest` cell.

Expected public deduction:

- `LOCAL_SCOPE_DIFFERENCE` proves `B3` is a guest.

Why it is difference:

- `B1`'s remaining unknown cells are `A2`, `C2`.
- `B2`'s remaining unknown cells are `A2`, `C2`, `B3`.
- The inner scope can contain at most one guest.
- The outer scope requires two guests.
- The one-cell difference `B3` must contain the extra guest.

## Negative Fixture Candidates

Reverse implication:

- observe only a guest near a possible subject;
- do not reveal the subject itself;
- expected: no difference deduction.

Unsupported overlap:

- two local scopes overlap but neither remaining unknown set contains the other;
- expected: no difference deduction.

Hidden target dependence:

- target data would make a difference cell a guest, but public observations/rules do not force it;
- expected: no difference deduction.

Intersection-only:

- reuse the accepted Phase 10 local-scope intersection positive shape;
- expected: `LOCAL_SCOPE_INTERSECTION` may emit, but `LOCAL_SCOPE_DIFFERENCE` must not.

## Experimental Content Candidate

Planned path:

```text
content/experimental/phase-12/phase-12-local-scope-difference-001.json
```

Initial design goal:

- require at least one `LOCAL_SCOPE_DIFFERENCE` guest deduction;
- keep the fixture small enough for authoring caps;
- preserve Chinese player-facing copy if later promoted;
- remain private until copied into `content/cases` through the full promotion gate.

