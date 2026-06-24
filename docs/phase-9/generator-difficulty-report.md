# Phase 9 Provisional Difficulty Report

Status: Round 5 prototype
Package: `@room-axioms/generator`

## Scope

Round 5 added provisional difficulty scoring derived from existing solver and proof evidence. These scores are internal diagnostics only. They are not calibrated with real playtest results because the Phase 8 feedback log still records zero real participant sessions.

## Prototype API

- `scorePuzzleDifficulty(puzzle, options?)`

The scoring helper consumes:

- initial guest-layout count from `@room-axioms/solver`;
- no-guess proof metrics from `@room-axioms/proof`;
- board size and reveal count from the domain puzzle definition;
- aggregate solver stats from the existing APIs.

It does not duplicate rule semantics and does not alter puzzle correctness.

## Calibration Caveat

Every score has:

```text
calibratedWithRealPlaytest: false
```

The score is useful for comparing generated or hand-authored candidates during authoring, but not for claiming player-facing difficulty until real playtest data exists.

## Automated Evidence

`packages/generator/src/mvpDifficulty.test.ts` scores all ten MVP cases and verifies:

- stable case order `case-001` through `case-010`;
- no solver truncation;
- all scores explicitly uncalibrated;
- `case-004` initial candidate guest-layout count remains 15.

`packages/generator/src/difficulty.test.ts` also scores an experimental accepted candidate produced by the generator filter without promoting it to shipped content.

## MVP Case Scores

| Case | Score | Band | Reveals | Unknown | Initial guest layouts | Proof waves | Deductions | Techniques |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| `case-001` | 2.40 | 1 | 8 | 1 | 1 | 0 | 0 | none |
| `case-002` | 2.40 | 1 | 8 | 1 | 1 | 0 | 0 | none |
| `case-003` | 2.40 | 1 | 8 | 1 | 1 | 0 | 0 | none |
| `case-004` | 23.00 | 5 | 3 | 13 | 15 | 1 | 13 | `KNOWN_SAFE_FROM_NON_GUEST_OBJECT`, `LOCAL_COUNT_SATURATED`, `UNIQUE_TARGET_NEIGHBOR_INTERSECTION` |
| `case-005` | 23.03 | 5 | 3 | 13 | 15 | 1 | 13 | `KNOWN_SAFE_FROM_NON_GUEST_OBJECT`, `LOCAL_COUNT_SATURATED`, `UNIQUE_TARGET_NEIGHBOR_INTERSECTION` |
| `case-006` | 22.72 | 5 | 3 | 13 | 15 | 1 | 13 | `KNOWN_SAFE_FROM_NON_GUEST_OBJECT`, `LOCAL_COUNT_SATURATED`, `UNIQUE_TARGET_NEIGHBOR_INTERSECTION` |
| `case-007` | 22.73 | 5 | 3 | 13 | 15 | 1 | 13 | `KNOWN_SAFE_FROM_NON_GUEST_OBJECT`, `LOCAL_COUNT_SATURATED`, `UNIQUE_TARGET_NEIGHBOR_INTERSECTION` |
| `case-008` | 2.80 | 1 | 7 | 2 | 1 | 0 | 0 | none |
| `case-009` | 2.80 | 1 | 7 | 2 | 1 | 0 | 0 | none |
| `case-010` | 2.80 | 1 | 7 | 2 | 1 | 0 | 0 | none |

## Current Metric Formula

The provisional score combines:

- board cell count;
- unknown cell count after initial reveals;
- proof wave count;
- deduction count;
- unique technique count;
- log-scaled initial guest-layout count;
- capped solver node count.

Bands are intentionally coarse:

| Band | Provisional Score |
| ---: | --- |
| 1 | `< 6` |
| 2 | `>= 6 and < 10` |
| 3 | `>= 10 and < 14` |
| 4 | `>= 14 and < 18` |
| 5 | `>= 18` |

## Notes

The current metric favors authoring diagnostics over player truth. Round 7 should recommend whether future production work should invest in real playtest collection before using these scores for public difficulty labels.
