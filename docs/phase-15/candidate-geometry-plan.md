# Phase 15 Candidate Geometry Plan

Status: Round 2 plan

## Repair Decision

Phase 14 candidate 001 remains repair-worthy as a starting shape, but only through existing proof templates. It should not be repaired by adding direct reveals for the ambiguous cells because that repeats the Phase 14 candidate 002/003 failure mode.

Useful base:

- `A1`, `B1`, `C1`, `B2` initial observations;
- `B2` bottle orthogonal guest count;
- `B1` mirror adjacent guest count;
- retained `LOCAL_SCOPE_DIFFERENCE` confirming `B3` as a guest;
- initial guest-layout count greater than `1`.

Current blocker:

- after `B3` is confirmed, the proof needs accepted templates to explain later safe cells and final guest uniqueness.

## Pattern A - Guest-Subject Bridge

Intent:

- Let the retained difference confirm `B3` as a guest in wave 0.
- In wave 1, use `B3` as a known subject for an existing `forEachCount` rule.
- Use that rule to trigger `LOCAL_COUNT_SATURATED`, `LOCAL_COUNT_ALL_REMAINING`, or `LOCAL_SCOPE_INTERSECTION`.

Why this is in scope:

- `verifyNoGuess` merges confirmed guest cells into observations before the next wave.
- `forEachCount` already accepts any allowed kind as subject, including `guest`.
- No new proof technique or DSL rule is required.

Risk:

- a guest-neighborhood rule can accidentally make the initial guest layout unique even before `B3` is proved;
- a too-strong rule can conflict with the Phase 14 base ambiguity around `A2` and `C2`.

Acceptance signal:

- wave 0 includes `LOCAL_SCOPE_DIFFERENCE`;
- wave 1 includes at least one additional existing technique;
- final guest layout becomes unique only after the proof waves.

## Pattern B - Asymmetric Safe Object Bridge

Intent:

- Keep the nested difference geometry from Phase 14.
- Add one safe object kind, such as `bin`, in a position that is not initially revealed.
- Let later safe-object revelation expose that subject, then use an existing local count rule to resolve the remaining guest ambiguity.

Why this is in scope:

- shipped content already uses `bin`;
- `KNOWN_SAFE_FROM_NON_GUEST_OBJECT` and local count rules already support safe object observations;
- the object can remain hidden until a human safe deduction reveals it.

Risk:

- if the object count is global or direct enough, it can become a shortcut that solves the candidate before the difference move matters.

Acceptance signal:

- minimized reveal set still keeps `LOCAL_SCOPE_DIFFERENCE`;
- the added object does not appear as an initial reveal unless removing it breaks proof and retention;
- proof waves after the difference include object/safe progress.

## Pattern C - Offset Two-Scope Difference

Intent:

- Move from the compact 3x3 base to a 4x3 or 3x4 board.
- Keep one contained inner scope and one outer scope with a one-cell difference.
- Place the difference guest so it participates in a second local count that can resolve final uniqueness.

Why this is in scope:

- still uses only existing `forEachCount` and `globalCount` DSL v1 rules;
- avoids relying on the exact Phase 14 A3/C3 safe-cell gap.

Risk:

- larger boards can increase authoring search space and create proof gaps;
- extra helper constraints can collapse into zero-wave uniqueness.

Acceptance signal:

- initial guest-layout count stays bounded and greater than `1`;
- proof wave count is at least `2` or one wave contains multiple existing techniques whose validity depends on the retained difference;
- minimization retention passes.

## Round 2 Selection

Use Pattern A first because it most directly turns the confirmed difference guest into later proof progress without changing proof semantics. Keep Pattern B as the repair fallback if Pattern A still leaves final ambiguity. Use Pattern C only if the compact Phase 14 base repeatedly collapses into zero-wave uniqueness.

Round 3 should create a small experimental set under `content/experimental/phase-15/`:

- one Pattern A repair of Phase 14 candidate 001;
- one Pattern B fallback if the first repair remains ambiguous;
- optionally one Pattern C offset shape if the compact repairs fail the initial ambiguity gate.
