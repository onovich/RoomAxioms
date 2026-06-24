# Phase 13 Rejection Log

Status: Round 4 log

## Rejected For Promotion

### `phase-12-local-scope-difference-001`

Reason:

- valid experimental proof fixture;
- provisional band `2`;
- minimization drops `LOCAL_SCOPE_DIFFERENCE`;
- inherited from Phase 12 as baseline rejection.

### `phase-13-local-scope-difference-001`

Reason:

- authoring report passes;
- proof uses `LOCAL_SCOPE_DIFFERENCE` before minimization;
- minimization removes `B2`;
- minimized proof drops `LOCAL_SCOPE_DIFFERENCE`;
- provisional band `2`.

### `phase-13-local-scope-difference-002`

Reason:

- schema and target rules pass;
- score lands at provisional band `4`;
- proof/no-guess fails with explanation gaps;
- minimization cannot repair proof or final uniqueness.

### `phase-13-difference-sample-template` seed `1301`

Reason:

- report-only sample run accepted no candidates;
- all sampled targets failed target-rule validation;
- no truncation and no files written.

## Current Selection State

No candidate is selected for shipped promotion after Round 4.

