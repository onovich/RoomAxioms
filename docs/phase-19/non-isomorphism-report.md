# Phase 19 Non-Isomorphism Report

Status: Round 4 evidence recorded

## Gate Method

Implemented in `packages/authoring/src/qualityGates.ts`:

- `canonicalPuzzleIsomorphismSignature(puzzle)` computes a canonical player-facing structure signature.
- `findIsomorphicPuzzleGroups(puzzles)` groups puzzles with matching canonical signatures.
- Supported board transforms are identity, horizontal mirror, vertical mirror, 180-degree rotation, and square-board rotations/reflections.

The signature includes:

- board dimensions;
- allowed cell kinds;
- normalized rule constraints;
- transformed initial reveal cells;
- transformed full target layout.

The signature intentionally ignores:

- puzzle id;
- title and case name;
- rule presentation copy;
- metadata tags, author, notes, and status.

## Shipped Duplicate Class

The full shipped-case scan identifies this duplicate class:

- representative to keep or reskin: `case-004`;
- duplicate/mirror variants to demote or replace: `case-005`, `case-006`, `case-007`.

These cases share the same 4x4 structure, rules, reveal pattern, and target layout up to board symmetry. They should not all remain normal player-facing ladder entries.

## Regression Coverage

Covered in `packages/authoring/src/qualityGates.test.ts`:

- `case-005`, `case-006`, and `case-007` have the same canonical signature as `case-004`;
- scanning all shipped `content/cases/case-*.json` files includes the `case-004` through `case-007` duplicate group;
- `case-011` is not grouped with the cleaning-case duplicate class.

## Architecture Notes

- This is an offline authoring gate only.
- The web runtime and player mode are not wired to this signature API.
- Target layout appears only in authoring validation/reporting context, not in player-facing UI.
- The gate does not add Puzzle Schema v1 semantics and does not change solver or proof behavior.
