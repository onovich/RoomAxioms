# Phase 20 Effective-Board Reduction

Round: 2

Purpose: prevent padded-board clones from passing as new player-facing cases. A case may be valid, explainable, and scored in the desired band while still adding only revealed safe cells or unused board area around a known puzzle. The effective-board reduction records which cells actually participate in guest uncertainty, proof movement, or the final unique layout.

## Relevance Model

A cell is retained in the effective board when at least one of these evidence sources marks it:

- `candidate-guest-layout`: under the initial observations, the solver can still place a guest in the cell.
- `proof-premise`: the cell appears in a non-count proof premise such as an observed subject, local scope, derived object, or scope relation.
- `proof-conclusion`: a human deduction concludes something about the cell.
- `proof-revealed`: a verification wave reveals the cell as safe.
- `proof-confirmed-guest`: a verification wave confirms the cell as a guest.
- `final-guest`: the final unique guest layout contains the cell.

Count premises are intentionally not expanded into per-cell relevance. In particular, a global count rule references the whole board, but that does not make every revealed safe padding cell part of the effective puzzle. Local scope premises still preserve cells that are actually in the local reasoning surface.

## Padded Fixture

`content/experimental/phase-20/padded-case004-right-edge.json` intentionally copies the case-004 structure onto a 5x4 board and reveals the entire `E` column as safe padding. The new `reduceEffectiveBoard` helper reduces that fixture back to a 4x4 footprint:

- original board: 5x4
- effective board: 4x4
- irrelevant cells: `E1`, `E2`, `E3`, `E4`

This proves the gate can distinguish mechanical validity from meaningful board novelty before any replacement content is accepted.

## Current Limit

Round 2 only creates the reduction primitive and padded-clone fixture. Later Phase 20 rounds will use this primitive for effective-board isomorphism, proof-trace fingerprints, candidate-shrink signatures, rule-impact vectors, and written novelty claims.
