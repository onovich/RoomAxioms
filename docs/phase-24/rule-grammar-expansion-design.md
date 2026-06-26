# Phase 24 Rule Grammar Expansion Design

Status: Round 1 design baseline.

This phase addresses the Phase 23 blocker: the current rule grammar can build honest
medium puzzles, but it cannot reliably create deeper 4+ or super-hard chains without
padding, clone-like traces, singleton scopes, or direct count giveaways. Phase 24 is an
additive grammar phase, not a bulk content phase.

## Scope

Implement three end-to-end conservative grammar additions:

- `scopeOverlapCount`: count a target kind over the intersection, union, left-only, or
  right-only area of two public scopes.
- `comparativeCount`: compare the target-kind counts of two public scopes with
  `eq`, `neq`, `gt`, `gte`, `lt`, or `lte`, plus an optional right-side offset.
- `conditionalCount`: if a public count condition is satisfied, apply a public count
  consequence.

Keep `recordContamination` as design and internal verifier evidence unless the three
priority families land early with validation headroom. The existing `recordSet` grammar
remains the shipped contamination mechanism during this phase.

## Non-Scope

Do not start Phase 25 editor or workbench work. Do not add a public editor, UGC,
backend, analytics, daily challenge, broad theme or VN work, fabricated playtest
calibration, or a breaking schema migration. Do not promote Phase 24 cases to the
player selector unless they pass Phase 23 degeneracy, anti-clone, novelty, no-guess,
copy, and runtime gates.

## Shared Types

The current `Comparator` supports only `eq`, `gte`, and `lte`. Phase 24 extends the
domain comparator type to:

```ts
type Comparator =
  | { op: 'eq'; value: number }
  | { op: 'neq'; value: number }
  | { op: 'gt'; value: number }
  | { op: 'gte'; value: number }
  | { op: 'lt'; value: number }
  | { op: 'lte'; value: number }
```

Existing content keeps parsing unchanged because the old three operators remain valid.
New operators require synchronized updates in schema diagnostics, solver bounds,
proof count bounds, authoring degeneracy checks, web copy, and tests.

New rule families use a limited public scope reference instead of arbitrary dynamic
local anchors:

```ts
type CountScopeRef =
  | { kind: 'global' }
  | { kind: 'region'; regionId: string }
  | { kind: 'line'; scope: StaticLineScope | RayScope; origin?: CellId }
```

`CountScopeRef` deliberately excludes `forEachCount` and `anchorCount` dynamic
per-object scopes. That keeps Phase 24 solver/proof semantics exact and player-facing
copy explainable. Ray scopes follow existing line-count behavior: a ray needs `origin`;
`stopAtKinds` makes the scope observation-dependent and conservative until blockers
are known.

## Rule Shapes

### scopeOverlapCount

```ts
interface ScopeOverlapCountRule {
  id: string
  type: 'scopeOverlapCount'
  left: CountScopeRef
  right: CountScopeRef
  mode: 'intersection' | 'union' | 'leftOnly' | 'rightOnly'
  target: CellKind
  count: Comparator
  presentation: RulePresentation
}
```

Semantics:

- Resolve `left` and `right` scope cell sets against the board and current
  observation-dependent ray visibility.
- Derive the material cell set from `mode`.
- Apply `count` to the number of `target` cells in that derived set.

This family is the first proof target because it can reuse normal count techniques:
when the derived set is saturated, safe cells follow; when every unknown must be the
target, target-object deductions follow.

### comparativeCount

```ts
interface ComparativeCountRule {
  id: string
  type: 'comparativeCount'
  left: CountScopeRef
  right: CountScopeRef
  target: CellKind
  comparison: {
    op: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte'
    offset?: number
  }
  presentation: RulePresentation
}
```

Semantics:

- Let `L` be the target count in `left`.
- Let `R` be the target count in `right`.
- The rule holds when `L op (R + offset)`. Missing offset means `0`.

The offset is signed in the domain type but schema should bound it to a small safe
integer range in Phase 24 fixtures. This supports statements like "the west wing has
one more guest than the east wing" without introducing a separate difference rule.

Proof support is conservative: validate and solve exactly, then emit human deductions
only for simple forced cases where one side is fixed and the other side becomes a
normal lower/upper bounded count. Harder comparative reasoning may surface as an
explanation gap, which is acceptable for experimental cases that are not promoted.

### conditionalCount

```ts
interface ConditionalCountClause {
  scope: CountScopeRef
  target: CellKind
  count: Comparator
}

interface ConditionalCountRule {
  id: string
  type: 'conditionalCount'
  condition: ConditionalCountClause
  then: ConditionalCountClause
  presentation: RulePresentation
}
```

Semantics:

- If `condition` is true, `then` must be true.
- If `condition` is false, the rule is satisfied.

Solver support should use interval feasibility:

- impossible condition means the implication is already satisfiable;
- forced condition means the consequence must be feasible;
- undecided condition with feasible consequence remains possible;
- on complete assignments both clauses are evaluated exactly.

Proof support is conservative: apply the consequence as a normal count only when the
condition is already proven true from current observations. The rule should not invent
hidden branching narration.

## Solver Plan

Add compiled constraint variants for the three implemented families. Shared helpers
should resolve `CountScopeRef` into static or dynamic scope cells and compute count
bounds using the existing bitmask domain state.

Comparator feasibility changes:

- `eq`: interval contains value.
- `neq`: interval contains any value other than value.
- `gt`: interval maximum is greater than value.
- `gte`: interval maximum is at least value.
- `lt`: interval minimum is less than value.
- `lte`: interval minimum is at most value.

Comparative feasibility should test whether any integer pair in the two intervals can
satisfy `L op (R + offset)`. On complete singleton domains, this becomes exact.

Conditional feasibility should be implication-aware as described above. It may be weak
for propagation but must never reject a valid model or accept an invalid complete
model.

## Proof Plan

Extend `TechniqueId` with:

- `SCOPE_OVERLAP_COUNT_SATURATED`
- `SCOPE_OVERLAP_COUNT_ALL_REMAINING`
- `CONDITIONAL_COUNT_SATURATED`
- `CONDITIONAL_COUNT_ALL_REMAINING`
- optional `COMPARATIVE_COUNT_BOUND` if a narrow comparative deduction lands cleanly.

The first proof milestone is overlap count, because it reuses existing count-summary
logic after the derived cell set is resolved. Conditional deductions can reuse the same
summary only after a condition summary is already conclusively satisfied. Comparative
rules are solver-backed first and proof-backed only for narrow fixed-side cases.

Explanation-gap detection must remain honest: a solver-forced cell is not considered
explained unless a rule-backed human deduction exists.

## Schema And Diagnostics Plan

Schema v1 remains additive. Existing cases remain valid. New schemas validate:

- scope references point inside the board;
- region scopes reference known regions;
- line/ray scopes stay in board and rays include origins;
- count target kinds and blocker kinds are allowed;
- comparative offsets are bounded;
- overlap mode is known;
- conditional condition and consequence are structurally valid.

Diagnostics should reuse existing issue style where possible:

- unknown region -> `RULE_REGION_UNKNOWN`
- ray origin missing/out of board -> existing line ray codes or clear Phase 24 variants
- unknown kind -> `RULE_KIND_NOT_ALLOWED`
- malformed comparison/count -> `COMPARATOR_INVALID`

## Authoring And Degeneracy Plan

Authoring reports must expose the new families as material rule families:

- `scope-overlap`
- `comparative`
- `conditional`

Degeneracy checks should inspect derived public scopes for `scopeOverlapCount` and
the condition/consequence scopes for `conditionalCount`. At minimum they must catch:

- singleton derived overlap scopes;
- direct or near guest giveaways from derived overlap scopes;
- redundant new-family rules in rule impact vectors;
- repeated clone-like rule signatures.

Comparative rules are harder to reduce to a single derived scope, so Phase 24 should
flag trivial same-scope comparisons and include them in rule-impact, proof-trace, and
family-diversity signatures.

Difficulty review should count new families in material family diversity and keep the
Phase 23 target-4/super-hard rubric unchanged.

## Runtime And Copy Plan

The web runtime should parse, analyze, and render the new rules without exposing
target, forced cells, candidates, generator internals, or solver internals to players.
Rule copy must be Chinese-only for visible player text. Developer-only inspector
surfaces may show raw rule types and ids.

The selector should keep Phase 24 experimental cases out of normal player-facing
content unless all promotion gates pass and a later planner explicitly accepts them.

## Experimental Evidence Plan

Create at least three Phase 24 experimental cases under
`content/experimental/phase-24/`:

- `phase-24-overlap-cross-001.json`: proves `scopeOverlapCount` with a non-singleton
  derived scope and a proof-backed deduction.
- `phase-24-comparative-balance-001.json`: proves `comparativeCount` solver/search
  semantics and authoring reporting.
- `phase-24-conditional-frontier-001.json`: proves `conditionalCount` solver/search
  semantics and a conditional proof only after the condition is known.

Add at least one hardness probe attempting to exceed `case-021` proof depth. A failed
probe is acceptable if the report records exact blockers and why the new grammar still
needs later authoring work.

## Validation Plan

Each successful round must validate, commit, and push. Minimum final validation:

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- project `Validate.cmd`
- smoke when runtime copy or content loading changes
- boundary scans showing domain remains UI/Zod/oracle-free and no player-facing
  target/generator/authoring internals leak into normal UI.

Round 1 architecture self-check:

- The plan is additive and schema v1-compatible.
- The three priority families are scoped before contamination expansion.
- Solver/proof/authoring/runtime boundaries are explicit.
- Experimental content is kept out of player selector by default.
