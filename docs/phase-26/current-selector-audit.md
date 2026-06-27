# Phase 26 Current Selector Audit

Status: Round 2 evidence.
Guide: `docs/phase-26-workbench-guided-puzzle-ladder-production-goal-mode-execution-guide.md`

## Purpose

This audit records the current player-facing selector before Phase 26 candidate
authoring begins. It is not a promotion decision. It separates mechanically valid
baseline content from cases that should be treated as replacement candidates or
quality caveats while building a smaller stronger ladder.

## Commands

Per selected case:

```powershell
pnpm authoring -- report content\cases\<case-id>.json
pnpm authoring -- score content\cases\<case-id>.json
```

Selector-level anti-clone and degeneracy scan:

```powershell
pnpm authoring -- anti-clone content\cases\case-004.json content\cases\case-011.json content\cases\case-013.json content\cases\case-015.json content\cases\case-012.json content\cases\case-014.json content\cases\case-017.json content\cases\case-018.json content\cases\case-020.json content\cases\case-021.json --novelty-manifest content\novelty-claims.json --include-degeneracy
```

All report and score commands completed with `ok: true`. The selector-level
anti-clone command intentionally returned `ok: false` because the current selector
contains known quality caveats; those caveats are evidence for Phase 26 replacement
targets, not a build failure.

## Report And Score Summary

| Case | Report ok | Initial guest layouts | Proof waves | Deductions | Material rule families | Degeneracy | Redundant rules | Target-4 heuristic | Score | Band | Target-4 missing criteria |
| --- | --- | ---: | ---: | ---: | ---: | --- | ---: | --- | ---: | ---: | --- |
| `case-004` | true | 15 | 1 | 13 | 2 | pass | 0 | false | 23 | 5 | proof-wave-count, material-rule-family-count, frontier-unlock-count |
| `case-011` | true | 2 | 1 | 5 | 1 | pass | 0 | false | 10.36 | 3 | effective-unknown-cell-count, proof-wave-count, deduction-count, material-rule-family-count, frontier-unlock-count |
| `case-013` | true | 2 | 1 | 3 | 1 | pass | 0 | false | 9.73 | 2 | effective-unknown-cell-count, proof-wave-count, deduction-count, material-rule-family-count, frontier-unlock-count |
| `case-015` | true | 4 | 1 | 2 | 4 | fail | 0 | false | 10.55 | 3 | effective-unknown-cell-count, proof-wave-count, deduction-count, frontier-unlock-count, shared-variable-overlap-count, degeneracy-status |
| `case-012` | true | 2 | 1 | 7 | 2 | pass | 0 | false | 12.15 | 3 | effective-unknown-cell-count, proof-wave-count, deduction-count, material-rule-family-count, frontier-unlock-count |
| `case-014` | true | 4 | 1 | 8 | 1 | pass | 0 | false | 15.54 | 4 | effective-unknown-cell-count, proof-wave-count, material-rule-family-count, frontier-unlock-count |
| `case-017` | true | 7 | 1 | 2 | 4 | fail | 0 | false | 16.7 | 4 | effective-unknown-cell-count, proof-wave-count, deduction-count, frontier-unlock-count, shared-variable-overlap-count, degeneracy-status |
| `case-018` | true | 3 | 1 | 2 | 3 | fail | 0 | false | 9.76 | 2 | effective-unknown-cell-count, proof-wave-count, deduction-count, frontier-unlock-count, shared-variable-overlap-count, degeneracy-status |
| `case-020` | true | 6 | 1 | 2 | 4 | fail | 0 | false | 16.09 | 4 | effective-unknown-cell-count, proof-wave-count, deduction-count, frontier-unlock-count, shared-variable-overlap-count, degeneracy-status |
| `case-021` | true | 56 | 4 | 13 | 3 | pass | 0 | true | 33.87 | 5 | none |

Important interpretation:

- Every selected case remains mechanically valid through schema, target-rules,
  initial satisfiability, no-guess proof, and final uniqueness.
- Only `case-021` passes the target-4 heuristic, but it has already been
  downgraded by user review to player-facing difficulty 3. Its machine score must
  not be used as a claim of calibrated difficulty.
- Most selected cases have exactly one proof wave. Phase 26 candidates should aim
  for changing frontiers, not merely a larger opening candidate count.

## Technique Summary

| Case | Final guest cells | Proof techniques |
| --- | --- | --- |
| `case-004` | D1, B4 | `KNOWN_SAFE_FROM_NON_GUEST_OBJECT`, `LOCAL_COUNT_SATURATED`, `UNIQUE_TARGET_NEIGHBOR_INTERSECTION` |
| `case-011` | A1 | `LOCAL_SCOPE_INTERSECTION` |
| `case-013` | C2, B3 | `LOCAL_SCOPE_DIFFERENCE`, `LOCAL_SCOPE_INTERSECTION` |
| `case-015` | A2, C3 | `LINE_COUNT_ALL_REMAINING`, `REGION_COUNT_SATURATED` |
| `case-012` | B3, C3 | `LOCAL_COUNT_SATURATED`, `LOCAL_SCOPE_DIFFERENCE` |
| `case-014` | B4, C4 | `LOCAL_COUNT_SATURATED`, `LOCAL_SCOPE_DIFFERENCE` |
| `case-017` | A2, B2 | `LINE_COUNT_ALL_REMAINING`, `REGION_COUNT_SATURATED` |
| `case-018` | C2, A3 | `REGION_COUNT_ALL_REMAINING`, `REGION_COUNT_SATURATED` |
| `case-020` | A2, B2 | `LINE_COUNT_ALL_REMAINING`, `REGION_COUNT_SATURATED` |
| `case-021` | A4, A5, E5 | `ANCHOR_COUNT_SATURATED`, `KNOWN_SAFE_FROM_NON_GUEST_OBJECT`, `LOCAL_COUNT_SATURATED`, `UNIQUE_TARGET_NEIGHBOR_INTERSECTION` |

No current selector case materially uses the Phase 24 grammar families
`scopeOverlapCount`, `comparativeCount`, or `conditionalCount`. Phase 26 therefore
needs at least one promoted grammar-and-classic hybrid, or a documented blocker
explaining why such candidates still fail proof, copy, degeneracy, or novelty
review.

## Selector Anti-Clone / Degeneracy Result

Result: `fail`.

Hard failure count: 11.

Hard failure groups:

| Failure kind | Cases | Evidence |
| --- | --- | --- |
| Degeneracy: singleton region scope | `case-015`, `case-017`, `case-018`, `case-020` | Rules `R2` have one effective unknown cell after opening reveals. |
| Degeneracy: direct count giveaway | `case-015`, `case-017`, `case-020` | Line rule `R3` requires 1 guest from 1 effective unknown cell. |
| Degeneracy: direct count giveaway | `case-018` | Region rule `R3` requires 1 guest from 1 effective unknown cell. |
| Rule-family diversity | `case-011`, `case-013`, `case-014` | Only one material rule family is detected. |

Novelty manifest coverage itself passed for the currently selected cases.

## Replacement And Preservation Notes

Preserve by default:

- `case-004`: default baseline with the strongest accepted mixed proof chain.
- `case-011`: local-scope intersection baseline, but not a Phase 26 quality target.
- `case-012`: retained local-scope difference baseline.
- `case-021`: released difficulty-3 case; useful as a machine-strong cautionary
  example, not as calibrated high-tier evidence.

Replacement candidates:

- `case-015`, `case-017`, `case-018`, and `case-020` because the current gates
  identify singleton/direct-giveaway degeneracy.
- `case-013` and `case-014` if Phase 26 finds stronger non-clone cases, because
  they are single-family and low-wave baselines.

Review before relying on as a reference:

- `case-021` because user review overrode the target-4 heuristic and documented
  R3/R4 redundancy caveats.
- `case-004` because it is valuable but still one proof wave and not a target-4
  proof-frontier model by the current rubric.

## Phase 26 Implications

- Promotion claims should be made against the strict Phase 26 gate, not against
  the current selector's weaker baseline.
- The candidate ledger should record which existing caveat a candidate avoids:
  singleton giveaway, one-family closure, clone signature, highlight-dependent
  wording, or uncalibrated score overclaim.
- A smaller final selector is acceptable if strict gates reject weak replacements.
  Do not keep weak cases merely to preserve a larger count.
