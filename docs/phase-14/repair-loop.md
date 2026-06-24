# Phase 14 Candidate Repair Loop

Status: Round 6 evidence

## Repair Inputs

- `phase-14-local-scope-difference-001`: retained difference, proof gap.
- `phase-14-local-scope-difference-002`: initially unique, no proof technique.
- `phase-14-local-scope-difference-003`: initially unique, no proof technique.

## Candidate 001 Repair Assessment

The good part:

- initial guest-layout count is `2`;
- proof emits `LOCAL_SCOPE_DIFFERENCE`;
- minimization retains `LOCAL_SCOPE_DIFFERENCE`;
- no solver truncation.

The blocking part:

- proof/no-guess fails;
- final guest-layout uniqueness fails;
- explanation gaps remain for safe cells outside the approved human deduction templates.

Repair attempts considered:

- adding an initial reveal to close the ambiguity;
- adding a helper local count around the ambiguity;
- relying on the retained non-minimized reveal set.

Outcome:

- adding a direct reveal collapses the puzzle into an initially unique low-band state;
- adding helper constraints risks making the solver know the final guest layout before human deductions;
- keeping the current candidate is useful for tooling evidence, but not for shipped promotion.

Decision:

- keep candidate 001 experimental;
- do not promote in its current form.

## Candidate 002 Repair Assessment

The good part:

- schema, target rules, no-guess, and final uniqueness pass.

The blocking part:

- initial guest-layout count is already `1`;
- proof wave count is `0`;
- no proof technique appears before or after minimization;
- retention fails for `LOCAL_SCOPE_DIFFERENCE`.

Decision:

- reject for Phase 14 promotion;
- do not repair by hiding or re-labeling the same over-revealed state.

## Candidate 003 Repair Assessment

The good part:

- schema, target rules, no-guess, and final uniqueness pass.

The blocking part:

- helper constraints make the initial guest layout unique;
- proof wave count is `0`;
- no proof technique appears before or after minimization;
- retention fails for `LOCAL_SCOPE_DIFFERENCE`.

Decision:

- reject for Phase 14 promotion;
- do not promote helper-closed content unless a future candidate keeps ambiguity until human deductions begin.

## Round 6 Decision

No candidate was repaired into a promotion-ready state.

The new retention check successfully distinguishes:

- retained technique but incomplete proof (`phase-14-local-scope-difference-001`);
- valid puzzle but no technique needed (`phase-14-local-scope-difference-002`, `phase-14-local-scope-difference-003`).

