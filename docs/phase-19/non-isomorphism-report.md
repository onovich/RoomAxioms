# Phase 19 Non-Isomorphism Report

Status: Round 11 promotion update recorded

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

## Pre-Promotion Duplicate Class

The Round 4 shipped-case scan identified this duplicate class before content replacement:

- representative to keep or reskin: `case-004`;
- duplicate/mirror variants to demote or replace: `case-005`, `case-006`, `case-007`.

These cases share the same 4x4 structure, rules, reveal pattern, and target layout up to board symmetry. They should not all remain normal player-facing ladder entries.

## Post-Promotion Shipped Scan

Round 11 replaces `case-005` and `case-006`, removes `case-007` through `case-010` from the shipped content directory, and updates the web selector to load 8 ladder cases:

- `case-001`
- `case-002`
- `case-003`
- `case-011`
- `case-012`
- `case-004`
- `case-005`
- `case-006`

`findIsomorphicPuzzleGroups(shippedCasePaths.map(loadCase))` now returns no duplicate groups in `packages/authoring/src/qualityGates.test.ts`.

## Regression Coverage

Covered in `packages/authoring/src/qualityGates.test.ts`:

- exact duplicate structures share canonical signatures even when id/copy/metadata differ;
- promoted replacement cases are not grouped with retained `case-004`;
- scanning all shipped `content/cases/case-*.json` files returns no duplicate groups after promotion.

## Architecture Notes

- This is an offline authoring gate only.
- The web runtime and player mode are not wired to this signature API.
- Target layout appears only in authoring validation/reporting context, not in player-facing UI.
- The gate does not add Puzzle Schema v1 semantics and does not change solver or proof behavior.
