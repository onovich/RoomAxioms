# Phase 22 Contaminated Record Verifier Evidence

Status: internal verifier slice implemented; no player-facing contaminated case promoted yet.

## Semantics Implemented

- `records` are public record cards that own one or more ordinary rule ids.
- `recordSet` is a high-tier rule stating that exactly one or at most one listed record is false.
- Solver queries expand allowed false-record assignments into ordinary rule subsets, then merge satisfiability, forced-cell, model, and guest-layout results across those assignments.
- Authoring reports expose possible false-record assignments for maintainer review.
- Player-facing rule copy labels polluted records without dumping internal assignment lists.

## Internal Fixture

Fixture: `content/experimental/phase-22/fixtures/contaminated-record-cross-check.json`

The fixture has two record cards:

- `card-one` owns `R1`, which says there is exactly one guest.
- `card-two` owns `R2`, which says there are exactly two guests.
- `CR1` says exactly one of those records is false.

The initial observations reveal eight empty cells on a 3x3 board. That cross-check leaves only `card-two` possible as the false record and leaves `C3` as the unique guest cell.

## Focused Validation

- `pnpm --filter @room-axioms/domain test`: PASS
- `pnpm --filter @room-axioms/schema test`: PASS
- `pnpm --filter @room-axioms/solver test`: PASS
- `pnpm --filter @room-axioms/authoring test`: PASS
- `pnpm --filter @room-axioms/web test -- src/logic/scopeText.test.ts`: PASS
- `pnpm typecheck`: PASS

## Promotion Decision

This slice is verifier and tooling evidence only. It is not promoted to the player selector because the fixture is intentionally tiny and begins after record cross-checking is already decisive. Phase 22 content production should only promote contaminated cases if a later high-tier case has readable player copy, meaningful uncertainty, and verifier-backed final uniqueness.
