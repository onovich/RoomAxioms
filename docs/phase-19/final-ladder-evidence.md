# Phase 19 Final Ladder Evidence

Status: Round 11 selector promotion evidence recorded

## Player-Facing Selector

The web selector now loads 8 player-facing cases in this order:

| Selector order | Case | Source | Initial guest layouts | Proof waves | Deductions | Techniques | Score | Band |
| ---: | --- | --- | ---: | ---: | ---: | --- | ---: | ---: |
| 1 | `case-001` | promoted from `phase-19-local-count-compact-001` | 7 | 1 | 6 | `LOCAL_COUNT_SATURATED` | 13.07 | 3 |
| 2 | `case-002` | promoted from `phase-19-local-count-wide-001` | 3 | 1 | 7 | `LOCAL_COUNT_SATURATED` | 12.79 | 3 |
| 3 | `case-003` | promoted from `phase-19-intersection-wide-001` | 2 | 1 | 5 | `LOCAL_SCOPE_INTERSECTION` | 10.66 | 3 |
| 4 | `case-011` | retained from Phase 11 | 2 | 1 | 5 | `LOCAL_SCOPE_INTERSECTION` | 10.36 | 3 |
| 5 | `case-012` | retained from Phase 15 | 2 | 1 | 7 | `LOCAL_COUNT_SATURATED`, `LOCAL_SCOPE_DIFFERENCE` | 12.15 | 3 |
| 6 | `case-004` | retained default mixed baseline | 15 | 1 | 13 | `KNOWN_SAFE_FROM_NON_GUEST_OBJECT`, `LOCAL_COUNT_SATURATED`, `UNIQUE_TARGET_NEIGHBOR_INTERSECTION` | 23.00 | 5 |
| 7 | `case-005` | promoted from `phase-19-local-count-wide-002` | 10 | 1 | 6 | `LOCAL_COUNT_SATURATED` | 17.71 | 4 |
| 8 | `case-006` | promoted from `phase-19-mixed-wide-001` | 15 | 1 | 13 | `KNOWN_SAFE_FROM_NON_GUEST_OBJECT`, `LOCAL_COUNT_SATURATED`, `UNIQUE_TARGET_NEIGHBOR_INTERSECTION` | 23.40 | 5 |

Difficulty bands are uncalibrated authoring scores only. They are not real playtest calibration.

## Replaced Or Demoted Content

- Replaced `case-001`, `case-002`, and `case-003`, which were opening-trivial in the Round 1 audit.
- Replaced `case-005` and `case-006`, which were mirror/rotation variants of `case-004`.
- Removed `case-007`, `case-008`, `case-009`, and `case-010` from the shipped content directory and web selector.
- Preserved `case-004` as the default case.
- Preserved `case-011` and `case-012` as meaningful retained cases.

## Validation Coverage

- `apps/web/src/content/cases.ts` imports only the 8 ladder cases above.
- `apps/web/src/content/caseVerification.test.ts` asserts stable selector order, 8-case count, no internal `phase-*` ids, no demoted `case-007` through `case-010`, opening ambiguity greater than 1, nonzero proof waves, and nonzero deductions for every selector case.
- `apps/web/src/content/runtimeSmoke.test.ts` covers all selector cases for player/developer runtime readiness, target secrecy on incorrect/incomplete submissions, and Chinese/plain rule presentation copy.
- `packages/authoring/src/qualityGates.test.ts` scans all shipped `content/cases/case-*.json` files and expects no isomorphic duplicate groups.

## Boundary Notes

- Generated and rejected experimental candidates remain out of the player selector.
- No Puzzle Schema v1 semantics, solver internals, proof techniques, public editor, backend, analytics, daily challenge, or broad UI/theme work were added.
- The player UI still receives only selector summaries and runtime analysis; authoring candidates and gate internals remain offline artifacts.
