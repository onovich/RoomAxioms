# Phase 12 No-Guess Regression Evidence

Status: Round 5 evidence

## Regression Fixture

Focused test added under `packages/proof/src/verifier.test.ts`:

- `uses local scope difference to cover a forced guest while preserving the later guess point`.

The fixture uses the smallest nested difference shape:

- `B2` bottle has exactly two orthogonal guests;
- `B1` mirror has exactly one adjacent guest;
- `A1`, `B1`, `C1`, and `B2` are initial reveals;
- `B1`'s unknown guest scope is contained inside `B2`'s unknown guest scope;
- `B3` is the one difference cell and is forced as a guest.

## Expected Verifier Behavior

The first verification wave must:

- emit `LOCAL_SCOPE_DIFFERENCE`;
- validate the deduction through solver-backed `findExplanationGaps`;
- confirm `B3` as a guest;
- avoid an `EXPLANATION_GAP` for `B3`.

The second wave intentionally reaches `GUESS_POINT` because the tiny fixture still leaves an ambiguous guest choice elsewhere. That preserves the verifier's stricter-than-satisfiability behavior: adding the technique closes the specific forced-guest explanation gap without pretending that the whole puzzle is no-guess complete.

## Scope Note

This Round 5 regression proves the Phase 12 technique participates in the no-guess verifier loop and removes a real explanation gap. Full shipped promotion still requires a candidate whose complete proof/no-guess report passes the authoring gate.

