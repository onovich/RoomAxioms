# Phase 20 Proof-Trace Fingerprint

Round: 4

The proof-trace fingerprint summarizes public proof output so authoring can spot puzzles that ask the player to repeat the same deduction sequence on renamed coordinates or padded boards.

## Fingerprint Fields

`proofTraceFingerprint(puzzle)` records:

- technique sequence by proof wave and deduction order;
- conclusion kind and canonical effective-board coordinate;
- target kind for the conclusion, plus a kind-agnostic role where all non-empty/non-guest objects collapse to `object`;
- rule dependency shape, using rule type, scope, comparator, and target/subject kind;
- premise shape, using premise kind, dependent rule shape, and relative cell offsets from the conclusion.

The function computes signatures under every valid transform of the reduced effective board and chooses a canonical signature, matching the effective-board isomorphism gate's coordinate normalization.

## Count Premise Handling

Count premises keep their rule dependency shape but do not expand their cell list into the trace. This avoids treating every cell in a global count as a meaningful proof dependency.

## Clone Evidence

The padded Phase 20 fixture produces the same proof-trace signature as `case-004` after effective-coordinate normalization. This is the intended result: changing raw board size without changing proof movement is clone evidence.

Exact normalized trace matches are hard-fail evidence for promotion. Kind-agnostic matches are reviewer-blocking evidence when object labels appear swapped but the deduction skeleton is otherwise the same.
