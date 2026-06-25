# Phase 20 Proof-Trace Clone Gate

Round: 5

`findProofTraceCloneGroups(puzzles)` turns proof-trace fingerprints into promotion-blocking evidence.

## Match Classes

- `exact` + `hard-fail`: canonical normalized trace signatures are identical.
- `kind-agnostic` + `reviewer-blocking`: exact signatures differ, but the deduction skeleton still matches after collapsing all object labels to `object`.

The exact class catches padded or coordinate-renamed copies, including the Phase 20 padded case-004 fixture. The kind-agnostic class catches cases that swap object labels while preserving the same proof movement.

## Conservative Thresholds

The gate does not try to compute a fuzzy percentage yet. Exact trace collision is enough to block promotion. Kind-agnostic collision requires written reviewer evidence before any candidate could be accepted.

This is intentionally stricter than the Phase 19 process: a case that is mechanically valid can still fail Phase 20 if the player would experience it as the same proof in a costume.
