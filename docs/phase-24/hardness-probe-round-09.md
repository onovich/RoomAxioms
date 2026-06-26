# Phase 24 Hardness Probe Round 09

Status: hardness probe attempted; current Phase 24 grammar fixtures do not yet exceed
the accepted baseline proof depth.

## Probe Goal

Phase 24 requires at least one honest attempt to exceed `case-021` proof depth without
relying on reveal reduction. Because `case-021` was downgraded to difficulty 3 after
manual review, this probe also compares against `case-004`, the stable proof-chain
baseline.

## Baseline Evidence

`pnpm authoring -- report content\cases\case-004.json`:

- initial guest layouts: 15
- proof waves: 1
- deduction count: 13
- technique ids:
  - `KNOWN_SAFE_FROM_NON_GUEST_OBJECT`
  - `LOCAL_COUNT_SATURATED`
  - `UNIQUE_TARGET_NEIGHBOR_INTERSECTION`
- recommendation: PASS / ready for experimental planner review

This remains a stronger proof-chain baseline than the compact Phase 24 fixtures.

## Phase 24 Fixture Probe Results

`pnpm authoring -- report content\experimental\phase-24\phase-24-overlap-cross-001.json`:

- report status: PASS
- grammar family: `scopeOverlapCount`
- material families: `foreach`, `scope-overlap`
- proof waves: 0
- deduction count: 0
- caveat: opening guest layout is already unique; degeneracy warning remains because
  the overlap count is close to a direct giveaway.

`pnpm authoring -- report content\experimental\phase-24\phase-24-comparative-balance-001.json`:

- report status: PASS
- grammar family: `comparativeCount`
- material families: `comparative`
- proof waves: 0
- deduction count: 0
- caveat: opening guest layout is already unique, so this proves grammar correctness
  and authoring integration but not a multi-wave chain.

`pnpm authoring -- report content\experimental\phase-24\phase-24-conditional-frontier-001.json`:

- report status: PASS
- grammar family: `conditionalCount`
- material families: `conditional`
- proof waves: 0
- deduction count: 0
- caveat: opening guest layout is already unique, so this proves conditional rule
  parsing/solving/reporting but not a multi-wave chain.

## Result

The hardness probe did not exceed `case-021` or `case-004` proof depth. The current
grammar implementation is end-to-end usable, but the available experimental cases are
compact grammar fixtures rather than non-degenerate difficulty candidates.

## Blocker For Full Phase 24 PASS

To claim full Phase 24 PASS, a later round must produce at least one Phase 24 case
with:

- opening guest layouts greater than one;
- proof waves greater than zero;
- at least one Phase 24 grammar technique in the proof metrics;
- no degeneracy failure;
- no redundant-rule blocker;
- no selector promotion unless Phase 23 gates also pass.

Until that exists, final status should be `READY_FOR_CHECK_WITH_BLOCKER`, not
`READY_FOR_CHECK`.
