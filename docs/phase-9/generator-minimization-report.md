# Phase 9 Reveal Minimization Report

Status: Round 4 prototype
Package: `@room-axioms/generator`

## Scope

Round 4 added initial reveal minimization for validated experimental candidates. It does not change player-facing hint behavior, does not inspect target data for UI hints, and does not alter shipped MVP cases.

## Prototype API

- `minimizeInitialReveals(puzzle, options?)`

The minimizer:

1. starts from `puzzle.initialReveals`;
2. tries removing one reveal at a time in deterministic order;
3. parses the candidate puzzle through schema;
4. runs proof/no-guess verification;
5. keeps the removal only when proof completion and final guest-layout uniqueness still pass;
6. records before/after reveal counts and per-cell reasons.

## Focused Evidence

`packages/generator/src/minimization.test.ts` covers:

- an intersection-style 3x3 fixture where one extra empty reveal is removed;
- a saturated global-count fixture where removing any required safe reveal would break proof completion.

Fixture evidence:

| Fixture | Before | After | Result |
| --- | ---: | ---: | --- |
| `experimental-minimize-intersection` | 5 | 4 | Removed `B1` while preserving no-guess proof and final guest `B2`. |
| `experimental-minimize-saturated` | 8 | 8 | Kept `A1` because it is required for proof completion. |

## Proof Impact

The accepted removal preserves:

- `proofAfter.noGuess = true`;
- `proofAfter.humanExplainable = true`;
- `proofAfter.guestLayoutUniqueAtEnd = true`;
- final guest cells `B2`.

## Limits

This is greedy one-pass minimization, not a proof-length optimizer. Later hardening should compare multiple removal orders and include pacing metrics before promoting generated content.
