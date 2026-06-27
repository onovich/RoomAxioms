# Phase 30 Minimal Non-Singleton Overlap Bridge Fixture

Status: Round 1 bridge fixture and initial trial recheck.

## Problem Isolated

Phase 29's `p29-overlap-frontier-ledger-trial` had material solver pressure but
no human deduction. The first forced cells were A2 and B3:

- R2: A2, B2, C2, B3, C3 contain exactly 1 guest.
- R4: B2, C2, C3 contain exactly 1 guest through a non-singleton
  `scopeOverlapCount`.

Because the R4 overlap scope is contained inside R2 and already consumes R2's
entire remaining guest capacity, the difference cells A2 and B3 are safe. This
is a human-readable scope-difference deduction involving an overlap rule, not a
singleton or near-count giveaway.

## Minimal Fixture

Added proof fixture:

- `packages/proof/src/reasoner.test.ts`
  - `uses a non-singleton overlap count to clear the outer scope difference`

Fixture shape:

- outer region: A1, B1, C1, D1, E1 has exactly 1 guest;
- non-singleton overlap: B1, C1, D1 has exactly 1 guest;
- expected deductions: A1 and E1 are safe by
  `SCOPE_OVERLAP_SCOPE_DIFFERENCE`.

The proof premises record:

- the outer count rule;
- the overlap count rule;
- the contained overlap scope;
- the outer/inner difference cells;
- the count relation explaining that the contained overlap consumes the outer
  capacity.

## Bridge Implemented

Added proof technique:

- `SCOPE_OVERLAP_SCOPE_DIFFERENCE`

Soundness condition:

1. Both rules count guests.
2. At least one rule is `scopeOverlapCount`.
3. The inner scope is contained in the outer scope.
4. The inner unknown cells are contained in the outer unknown cells.
5. The inner rule's remaining required guest count is greater than or equal to
   the outer rule's remaining guest capacity.
6. The outer-only unknown difference is non-empty.

Conclusion:

- every outer-only difference cell is safe.

The bridge runs after direct grammar count deductions and before local/anchor
deductions, so any safe cells it proves can feed later proof steps without
exposing solver search traces.

## Phase 29 Trial Initial Recheck

Focused command after rebuilding the authoring CLI:

```text
pnpm authoring -- report content\experimental\phase-29\p29-overlap-frontier-ledger-trial.json
```

Result summary after the bridge:

- schema: pass;
- target satisfies rules: true;
- initial guest layouts: 42;
- proof: still `noGuess=false` and `humanExplainable=false`;
- issue codes changed from two `EXPLANATION_GAP` findings to `GUESS_POINT`;
- wave count changed from 1 to 2;
- deduction count changed from 0 to 2;
- technique IDs: `SCOPE_OVERLAP_SCOPE_DIFFERENCE`;
- target-4 still fails because proof-wave count, deduction count, and frontier
  unlock count remain too low.

Interpretation: the Phase 29 overlap blocker is partially resolved. The first
overlap-frontier deduction is now human-visible, but the experimental trial is
still not a no-guess or target-4 candidate.

## Boundaries

- No shipped `content/cases` file changed.
- No player selector/default case changed.
- The bridge is proof-source-of-truth logic in `packages/proof`.
- `packages/authoring` only learns the new technique ID for CLI retention flags.
- The web hint layer only receives a title for the new public technique ID; it
  does not duplicate proof logic.
