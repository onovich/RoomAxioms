# Phase 24 Comparative Proof Round 07

Status: implemented conservative proof-backed support for `comparativeCount`.

## Scope

This round closes the main proof gap left after Round 05. `comparativeCount` is now
recognized by human reasoning for the narrow, readable case where:

- the comparison operator is `eq`;
- offset is allowed;
- one side's target count is already fixed by public observations;
- the other side can be reduced to a normal saturated or all-remaining count step.

Other comparative operators remain solver-backed only until a separate human-readable
template is designed.

## Implemented

- Added proof techniques:
  - `COMPARATIVE_COUNT_SATURATED`
  - `COMPARATIVE_COUNT_ALL_REMAINING`
- Added authoring CLI technique-id recognition for retention checks.
- Added web hint titles so runtime hints remain exhaustive.
- Added proof summaries for left and right `CountScopeRef` values.
- Added conservative deductions that never narrate solver search:
  - fixed right side derives an exact required left-side count;
  - fixed left side derives an exact required right-side count;
  - the exact required side then uses the same saturated/all-remaining pattern as
    other public count rules.

## Deliberate Limits

- `gt`, `gte`, `lt`, `lte`, and `neq` comparisons do not produce human deductions yet.
- Comparisons where neither side is fixed by public observations remain explanation
  gaps rather than speculative hints.

## Validation

Focused checks:

- `pnpm --filter @room-axioms/proof typecheck`: PASS
- `pnpm --filter @room-axioms/web typecheck`: PASS
- `pnpm --filter @room-axioms/authoring typecheck`: PASS
- `pnpm --filter @room-axioms/proof test -- src/reasoner.test.ts`: PASS,
  9 files / 54 tests

Full validation is recorded in the round commit evidence.
