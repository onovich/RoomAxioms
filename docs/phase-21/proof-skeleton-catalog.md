# Phase 21 Proof Skeleton Catalog

Round: 2
Phase: Phase 21 - Distinct Puzzle Ladder Production

This catalog defines candidate proof skeletons before any Phase 21 case JSON is authored. A skeleton is accepted for exploration only when it describes proof movement, candidate narrowing, and closest-case difference. Board size, theme copy, coordinate layout, or label swaps are not sufficient novelty.

## Accepted Baseline Skeletons To Preserve

### `case-011` Baseline

- Technique family: `LOCAL_SCOPE_INTERSECTION`.
- Proof movement: two local guest scopes overlap; the provider scope must place enough guests in the shared cells to consume the consumer scope's remaining guest capacity; cells only in the consumer scope become safe.
- Final shape: compact one-guest conclusion.
- Phase 21 avoidance rule: an intersection candidate cannot simply repeat one consumer/provider overlap that concludes the same single-cell answer after one wave.

### `case-012` Baseline

- Technique family: `LOCAL_COUNT_SATURATED` plus `LOCAL_SCOPE_DIFFERENCE`.
- Proof movement: local safe deductions reduce nested scopes until the outer scope's remaining guest requirement must occupy the difference cells.
- Final shape: retained two-guest conclusion unlocked by difference reasoning.
- Phase 21 avoidance rule: a difference candidate cannot reuse the same B3/C3 answer pattern or a one-wave difference proof with the same shrink signature.

### `case-004` Baseline

- Technique family: `KNOWN_SAFE_FROM_NON_GUEST_OBJECT`, `LOCAL_COUNT_SATURATED`, and `UNIQUE_TARGET_NEIGHBOR_INTERSECTION`.
- Proof movement: object placement forces safe cells, local exclusions remove guest options, and a singleton object count intersects local object scopes before final guest uniqueness.
- Final shape: mixed proof with more deductions and a two-guest final layout.
- Phase 21 avoidance rule: a mixed candidate cannot be a padded effective-board clone, nor share the same rule-impact vector and proof trace.

## Candidate Skeletons

### S1 - Split Local Count Closure

Intent: local-count intro with a different final-cell topology from `case-012`.

- Opening state: at least three guest layouts, with the final guest cells separated by a revealed safe corridor rather than adjacent in a bottom row.
- Proof movement: one local subject saturates a zero-guest or one-guest scope to mark a band of safe cells; a second local subject, using a different scope kind, then forces all remaining cells in its scope to be guests.
- Expected techniques: `LOCAL_COUNT_SATURATED`, optionally `LOCAL_COUNT_ALL_REMAINING`.
- Candidate narrowing: opening candidate count should shrink in at least two conceptual regions, not only around the same paired answer cells.
- Closest-case comparison: differs from `case-012` by avoiding nested difference and B3/C3 adjacency; differs from rejected local-count cases by requiring two local subjects with different scope geometry.
- Rejection trigger: if proof trace is one-wave local-count saturation to the same adjacent pair shape, reject.

### S2 - Crossing Intersection With Delayed Capacity

Intent: intersection case with a different dependency graph from `case-011`.

- Opening state: at least two overlapping local scopes, where a third observed non-guest or safe deduction changes the consumer capacity before the intersection fires.
- Proof movement: an initial local-count deduction removes one candidate from the consumer scope; then the provider scope's required shared guests consume the reduced capacity and make the consumer-only cells safe.
- Expected techniques: `LOCAL_COUNT_SATURATED` followed by `LOCAL_SCOPE_INTERSECTION`.
- Candidate narrowing: first shrink removes safe cells outside the overlap; second shrink uses intersection to remove consumer-only cells.
- Closest-case comparison: differs from `case-011` because intersection is not the first and only meaningful move.
- Rejection trigger: if minimization removes the delayed-capacity step and leaves a one-technique `LOCAL_SCOPE_INTERSECTION` proof, reject.

### S3 - Offset Difference Pair

Intent: difference case with a different dependency graph from `case-012`.

- Opening state: nested local scopes exist, but the difference cells are not an adjacent horizontal pair and the inner scope's capacity is established by an earlier object or safe deduction.
- Proof movement: a local or object deduction proves a bound for the inner scope; the outer scope still needs extra guests; the entire outer-minus-inner set becomes guest.
- Expected techniques: `KNOWN_SAFE_FROM_NON_GUEST_OBJECT` or `LOCAL_COUNT_SATURATED`, then `LOCAL_SCOPE_DIFFERENCE`.
- Candidate narrowing: first shrink proves the inner capacity, second shrink confirms all difference cells as guests.
- Closest-case comparison: differs from `case-012` because difference does not directly follow only from the initial reveals.
- Rejection trigger: if `minimize --require-technique LOCAL_SCOPE_DIFFERENCE` drops the setup step or reverts to the old two-cell answer pattern, reject.

### S4 - Object Intersection Then Guest Exclusion

Intent: mixed case that cannot collapse to `case-004`.

- Opening state: global singleton object placement is ambiguous; at least two subject scopes force the singleton object through intersection, but that object is not a bin in the same relationship as `case-004`.
- Proof movement: object intersection proves a non-guest object; `KNOWN_SAFE_FROM_NON_GUEST_OBJECT` marks that cell safe; the object's guest exclusion or guest count rule then removes a different group of guest candidates.
- Expected techniques: `UNIQUE_TARGET_NEIGHBOR_INTERSECTION`, `KNOWN_SAFE_FROM_NON_GUEST_OBJECT`, plus one local guest count technique.
- Candidate narrowing: object uncertainty resolves first, then guest uncertainty resolves from the new object fact.
- Closest-case comparison: differs from `case-004` by using object placement as a setup for a later guest exclusion with a different final guest topology and rule-impact vector.
- Rejection trigger: if effective-board reduction and rule-impact vector match `case-004`, reject.

### S5 - Global Count All-Remaining Probe

Intent: experimental skeleton that probes whether the current DSL can produce a non-trivial global-count finish.

- Opening state: local deductions reveal enough safe cells that the global guest count has exactly as many unknown cells remaining as required guests.
- Proof movement: local scopes first mark safe cells; then `GLOBAL_COUNT_ALL_REMAINING` confirms the final guests.
- Expected techniques: `LOCAL_COUNT_SATURATED`, `GLOBAL_COUNT_ALL_REMAINING`.
- Candidate narrowing: local deductions reduce the board to a global finish; the global finish should not be unique at opening.
- Closest-case comparison: differs from all baselines by making global count the final human deduction rather than a passive rule.
- Rejection trigger: if opening state is already globally forced or if proof/no-guess requires only one trivial global step, reject as onboarding/trivial.

### S6 - Local Object All-Remaining Probe

Intent: experimental skeleton that tests object-first proof progress without adding new rule semantics.

- Opening state: a local object scope has unknown cells exactly equal to the remaining required non-guest object count, but guest ambiguity remains unresolved.
- Proof movement: `LOCAL_COUNT_ALL_REMAINING` derives one or more object facts; `KNOWN_SAFE_FROM_NON_GUEST_OBJECT` converts those object facts into safe cells; later guest-local count resolves the final layout.
- Expected techniques: `LOCAL_COUNT_ALL_REMAINING`, `KNOWN_SAFE_FROM_NON_GUEST_OBJECT`, and one guest-local count technique.
- Candidate narrowing: object facts reduce guest candidates indirectly; final guest uniqueness follows only after object-derived safe cells.
- Closest-case comparison: differs from `case-004` by using local all-remaining object placement rather than singleton-neighbor intersection as the object source.
- Rejection trigger: if object placement is already observed or if no object-derived safe deduction remains after minimization, reject.

### S7 - Intersection-To-Difference Chain

Intent: stretch skeleton for a richer mid-band case if simpler candidates fail.

- Opening state: overlapping scopes first create safe cells; those safe cells make a nested-scope difference exact.
- Proof movement: `LOCAL_SCOPE_INTERSECTION` eliminates consumer-only cells; the resulting smaller inner scope lets `LOCAL_SCOPE_DIFFERENCE` prove one or more guests.
- Expected techniques: `LOCAL_SCOPE_INTERSECTION`, `LOCAL_SCOPE_DIFFERENCE`.
- Candidate narrowing: first wave should include both safe and guest conclusions, or two separate conceptual reductions in a stable deterministic order.
- Closest-case comparison: differs from `case-011` because intersection unlocks later guest proof; differs from `case-012` because difference is not available until intersection fires.
- Rejection trigger: if either required technique disappears during minimization, reject.

## Promotion Preference

The preferred Phase 21 promotion order is:

1. one accepted candidate from S2, S3, S4, or S7, because these are most likely to be distinct from current baselines;
2. one accepted candidate from a different skeleton family;
3. S1 only if it avoids the rejected Phase 19 local-count answer pattern;
4. S5 or S6 only if they are non-trivial and pass anti-clone review.

If no two candidates survive standard validation, minimization, novelty review, and anti-clone review, Phase 21 should report `READY_FOR_CHECK_WITH_BLOCKER` rather than padding the selector.

## Round 2 Self-Checks

Debug self-check:

- Smallest candidate/skeleton tested: seven proof skeletons, no case JSON yet.
- Standard validation covered: deferred until candidate fixtures exist.
- Anti-clone report covered: baseline covered in Round 1; candidate reports deferred.
- Novelty claim covered: every skeleton has closest-case comparison and rejection trigger.
- Proof/no-guess path covered: skeletons use existing proof techniques only.
- Rejected Phase 19 cases stayed out: yes, no selector/content promotion.
- Generator/authoring rejection evidence recorded: not yet applicable.
- Runtime/player secrecy checked: no runtime changes.
- Regression risk: docs-only planning artifact.

Architecture self-check:

- Domain remains the source of truth for puzzle/rule/board types: yes.
- Schema remains the content contract: yes.
- Solver remains exact backend: yes.
- Proof remains human explanation backend: yes, skeletons use existing technique ids only.
- Generator/authoring remain private maintainer tooling: yes.
- Candidate design starts from proof skeletons, not map padding: yes, this file is the source catalog.
- Anti-clone gates consume public APIs rather than duplicating solver/proof semantics: yes.
- Shipped content is intentionally promoted: no promotion this round.
- Experimental/rejected candidates remain private: yes.
- Target access stayed behind the narrow app boundary: yes.
- Player marks stayed out of solver/proof facts: yes.
- Developer-only data stayed gated: yes.
- Theme/VN/editor/backend/new DSL/new proof technique scope avoided: yes.
- Unrelated files left untouched: yes.
