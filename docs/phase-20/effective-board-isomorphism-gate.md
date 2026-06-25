# Phase 20 Effective-Board Isomorphism Gate

Round: 3

The existing non-isomorphism gate compares raw puzzle JSON after board transforms. That is still useful for exact structural duplicates, but it cannot catch a clone that changes the original board size by adding revealed safe padding.

Phase 20 adds a second authoring API:

- `canonicalEffectivePuzzleIsomorphismSignature(puzzle)`
- `findEffectiveIsomorphicPuzzleGroups(puzzles)`

These functions first run `reduceEffectiveBoard`, then canonicalize only the effective footprint under the same rotation and mirror transforms used by the original gate.

## Signature Contents

The effective signature includes:

- schema version
- reduced board size
- allowed kind set
- sorted rule signatures
- initial reveals that survive effective-board reduction
- transformed target values for effective cells only

It intentionally excludes irrelevant original-board padding cells. This makes `case-004` and `content/experimental/phase-20/padded-case004-right-edge.json` collide as expected:

- `case-004`: 4x4 original board, 4x4 effective board
- padded fixture: 5x4 original board, 4x4 effective board
- padded fixture irrelevant cells: `E1`, `E2`, `E3`, `E4`

## Release Meaning

An effective-isomorphism collision is not automatically a content deletion command, but it is a hard blocker for promotion unless a reviewer records written evidence that the cases remain meaningfully distinct despite the shared effective structure.
