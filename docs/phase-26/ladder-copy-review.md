# Phase 26 Ladder And Copy Review

Status: Round 21 evidence.
Guide: `docs/phase-26-workbench-guided-puzzle-ladder-production-goal-mode-execution-guide.md`

## Purpose

Rounds 17-20 attempted promotion repairs after the first 12 Phase 26 candidates.
The repairs increased the serious attempt count to 15, but no Phase 26 candidate
passed the strict promotion gate. This document records the Round 21 ladder and
copy review decision: keep the current player-facing ladder unchanged for now,
do not pad the selector with weak experimental content, and prepare blocker
evidence unless a later round finds a genuinely promotable case.

## Current Player-Facing Ladder

Source of truth: `apps/web/src/content/cases.ts`.

Current stable order:

| Order | Case | Status | Round 21 interpretation |
| ---: | --- | --- | --- |
| 1 | `case-004` | retained default | Strongest accepted mixed-proof baseline; `DEFAULT_CASE_ID` remains `case-004`. |
| 2 | `case-011` | retained baseline | Local-scope intersection reference; useful but small and one-wave. |
| 3 | `case-013` | retained baseline | Crossing-ledger local difference/intersection case; accepted pre-Phase 26. |
| 4 | `case-015` | retained with caveat | Mechanically valid, but Round 2 selector audit records degeneracy. |
| 5 | `case-012` | retained baseline | Local-scope difference reference; accepted pre-Phase 26. |
| 6 | `case-014` | retained baseline | Hidden-bottle difference case; accepted pre-Phase 26. |
| 7 | `case-017` | retained with caveat | Mechanically valid, but Round 2 selector audit records degeneracy. |
| 8 | `case-018` | retained with caveat | Mechanically valid, but Round 2 selector audit records degeneracy. |
| 9 | `case-020` | retained with caveat | Mechanically valid, but Round 2 selector audit records degeneracy. |
| 10 | `case-021` | retained difficulty-3 case | Released after copy/quality repair and user downgrade; not target-4/high-tier. |

Round 21 does not reorder or shrink this list because the phase has not yet
produced a superior replacement. The guide allows a smaller honest selector, but
removing existing mechanically valid cases without accepted replacements would
make the public ladder poorer while adding no new quality evidence.

## Excluded Content Boundary

The repository still contains historical or quarantined JSON files under
`content/cases`, including `case-001`, `case-002`, `case-003`, `case-005`,
`case-006`, and `case-019`. They are not imported by `apps/web/src/content/cases.ts`.

The current web content tests assert:

- selected case order remains stable;
- `DEFAULT_CASE_ID` is `case-004`;
- downgraded cases are not presented as `target-4` or `super-hard`;
- rejected early cases are not present in `contentCases`;
- shipped case summaries expose only public summary fields;
- shipped metadata is free of internal phase labels.

Round 21 search:

```powershell
rg "p26-c|phase-26" content\cases apps\web\src\content apps\web\src -n
```

No Phase 26 experimental candidate is wired into the player-facing content
selector. Phase 26 candidates remain under `content/experimental/phase-26`.

## Phase 26 Promotion Result So Far

Source of truth:

- `docs/phase-26/candidate-review-log.md`
- `docs/phase-26/promotion-gate-audit.md`

Attempt count: 15 serious candidates.

Promotion count: 0.

This is intentional. The failed promotion count is not a workflow failure; it is
evidence that the strict gate is doing its job. The repeated blockers are:

- proof gaps or final non-uniqueness after an otherwise promising first wave;
- opening-unique or zero-wave over-closure when a repair tries to force closure;
- singleton/direct-count degeneracy;
- decorative or redundant follow-on rules;
- exact proof-trace reuse;
- Phase 24 grammar techniques firing only in weak forms;
- derived deductions not feeding later grammar summaries in the current proof
  model.

## Phase 24 Grammar Copy And Mechanics Review

Phase 26 did produce useful grammar evidence, but not promotable content.

| Grammar family | Evidence | Round 21 copy/mechanics decision |
| --- | --- | --- |
| `scopeOverlapCount` | C08 retains `SCOPE_OVERLAP_COUNT_ALL_REMAINING`; C15 keeps a non-degenerate material overlap but never emits `SCOPE_OVERLAP_*`. | Do not promote. Copy can identify scopes by coordinates, but current proof support either needs opening-observation giveaway or misses the intended derived-guest bridge. |
| `comparativeCount` | C02, C07, C09, C12 fire comparative techniques; C14 makes object rules material only by opening-unique over-closure. | Do not promote. Use explicit coordinate copy only; avoid singleton effective sides and zero-wave repairs. |
| `conditionalCount` | C03 shows delayed conditions do not activate from safe-cell deductions; public-condition repair collapses to opening unique. | Do not promote. Avoid player copy that implies conditional logic is useful until a proof-backed delayed trigger exists. |

Visible experimental copy generally uses explicit coordinates or plain object
terms. That avoids the case-021-style problem where a region label or highlight
carried hidden meaning. Copy quality alone is not enough for promotion.

## Shipped Copy Caveats

No shipped copy was edited in Round 21.

Known caveats remain:

- `case-021` is kept at difficulty 3, not target-4/high-tier, because user review
  overrode the machine score.
- `case-015`, `case-017`, `case-018`, and `case-020` remain mechanically valid
  but carry degeneracy caveats from `docs/phase-26/current-selector-audit.md`.
- Historical rejected cases stay in `content/cases` for audit/history purposes
  but are not player-facing.

These caveats should be represented honestly in the final Phase 26 report. They
should not be hidden by adding weak Phase 26 candidates.

## Round 21 Decision

No Phase 26 candidate is promoted in this round.

No `content/cases`, `apps/web/src/content/cases.ts`, default-case setting, or
novelty manifest change is made.

The honest ladder remains the current 10-case selector, with explicit caveats.
If Round 22 does not find a credible copy-only or ordering-only improvement that
does not overclaim quality, the phase should proceed toward
`READY_FOR_CHECK_WITH_BLOCKER` preparation: the current rejection corpus is
already strong enough to explain why the minimum four-promotion target has not
been met under the strict gates.

## Round 22 Follow-up

Round 22 found no credible copy-only or ordering-only improvement that would make
the public selector more honest. The current order remains encoded in
`apps/web/src/content/cases.ts`, `DEFAULT_CASE_ID` remains `case-004`, and no
Phase 26 experimental case is promoted.

The blocker-readiness plan is recorded in
`docs/phase-26/blocker-readiness-plan.md`. It converts the 15-candidate
rejection corpus into the remaining QA/final-report path: verify runtime and
selector boundaries, repair only concrete QA failures, and report
`READY_FOR_CHECK_WITH_BLOCKER` if strict gates still prevent four honest
promotions.
