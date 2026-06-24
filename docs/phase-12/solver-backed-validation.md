# Phase 12 Solver-Backed Validation Evidence

Status: Round 4 evidence

## Difference Deduction Validation

Focused tests added under `packages/proof/src/validation.test.ts`:

- `confirms a local scope difference guest deduction with the public solver API`;
- `does not accept a local scope difference deduction when solver validation truncates`.

The positive validation test uses the smallest nested local-scope fixture from `docs/phase-12/local-scope-difference-semantics.md`:

- `B2` bottle orthogonal scope requires two guests;
- `B1` mirror adjacent scope can contain at most one guest;
- `B1`'s unknown cells `A2`, `C2` are contained inside `B2`'s unknown cells `A2`, `C2`, `B3`;
- the one difference cell `B3` is solver-proved as a guest.

`verifyDeduction` validates the emitted `LOCAL_SCOPE_DIFFERENCE` deduction by contradiction:

```text
cellIsNot(B3, guest) is unsatisfiable
```

`findExplanationGaps` confirms `B3` is both solver-forced and explained by the valid human deduction.

## Cap And Truncation Check

The truncation regression runs the same emitted deduction with `maxNodes: 0`.

Expected result:

- validation returns `valid: false`;
- issue code is `SOLVER_TRUNCATED`;
- solver stats report `truncated: true`.

This keeps solver validation strict without exposing solver search as proof text.

