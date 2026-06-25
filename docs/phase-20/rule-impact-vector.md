# Phase 20 Rule-Impact Vector

Round: 7

Phase 20 extends the Phase 19 rule-contribution check into a vector report.

`evaluateRuleImpactVector(puzzle)` removes each rule in turn and records:

- opening guest-layout count delta;
- proof wave delta;
- proof deduction delta;
- final guest-layout uniqueness change;
- target satisfaction and initial satisfiability changes;
- lost and gained proof techniques.

`ruleImpactVectorSignature(puzzle)` normalizes those entries by rule shape so cases can be compared without depending on local rule IDs. `findRuleImpactCloneGroups(puzzles)` groups identical vectors as `reviewer-blocking`.

## Redundant Rules

A decorative non-guest rule that does not affect candidate layouts, proof movement, or final uniqueness is reported as `redundant` and turns the vector report status to `warning`.

## Clone Evidence

`case-004` and the Phase 20 padded fixture have identical rule-impact vectors. Combined with the effective-board, proof-trace, and candidate-shrink collisions, this confirms the padded fixture is not a meaningful new puzzle.
