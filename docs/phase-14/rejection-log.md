# Phase 14 Rejection Log

Status: Round 6 log

## Rejected For Shipped Promotion

### `phase-14-local-scope-difference-001`

Reason:

- `LOCAL_SCOPE_DIFFERENCE` is retained after minimization;
- proof/no-guess fails with explanation gaps;
- final guest-layout uniqueness is not reached;
- provisional score is band `2`;
- promotion would require either new proof semantics or accepting a proof-gap case.

### `phase-14-local-scope-difference-002`

Reason:

- initial guest-layout count is `1`;
- proof wave count is `0`;
- no technique is used;
- `LOCAL_SCOPE_DIFFERENCE` retention fails;
- provisional score is band `1`.

### `phase-14-local-scope-difference-003`

Reason:

- initial guest-layout count is `1`;
- proof wave count is `0`;
- no technique is used;
- `LOCAL_SCOPE_DIFFERENCE` retention fails;
- provisional score is band `1`.

### `phase-14-nested-difference-sample-template` seed `1401`

Reason:

- report-only sample accepted no candidates;
- all sampled targets failed target-rule validation;
- no truncation and no files written.

## Current Selection State

No Phase 14 candidate is selected for shipped promotion.

Candidate 001 remains the most useful future repair base because it demonstrates real retained difference evidence. Candidates 002 and 003 are regression examples for over-repair: they pass ordinary validation while failing the Phase 14 technique-retention purpose.

