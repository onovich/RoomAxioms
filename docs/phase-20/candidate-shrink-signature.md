# Phase 20 Candidate-Shrink Signature

Round: 6

`candidateShrinkSignature(puzzle)` records how the guest-layout candidate set shrinks during a no-guess proof.

## Checkpoints

The signature includes:

- `opening`: bounded guest-layout count under initial observations;
- one `wave` checkpoint after each proof wave's revealed safe cells and confirmed guests are applied;
- `final`: bounded guest-layout count after all proof waves in the verifier report.

Each checkpoint records the count, optional cap overflow, and whether the guest layout is unique. The signature also includes the proof technique sequence, because the same numeric curve is not enough by itself to prove a clone.

## Clone Evidence

`findCandidateShrinkCloneGroups(puzzles)` groups identical shrink curves plus identical technique order as `reviewer-blocking`.

For `case-004` and the Phase 20 padded fixture, the curve is:

- opening: 15 guest layouts;
- wave: 1 guest layout;
- final: 1 guest layout.

This is intentionally not a standalone hard failure, but combined with effective-board and proof-trace collisions it blocks promotion.
