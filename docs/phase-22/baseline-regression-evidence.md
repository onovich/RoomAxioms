# Phase 22 Baseline Regression Evidence

Date: 2026-06-26

Scope: accepted player-facing selector cases before Phase 22 content expansion.

Command pattern:

```powershell
cmd /c pnpm.cmd authoring -- report content/cases/<case-id>.json
```

All reports returned `ok: true`, `VALIDATION_PASS`, schema issue count `0`, target rules satisfied, initial satisfiable, no solver truncation, `proof.noGuess: true`, `proof.humanExplainable: true`, and final guest-layout uniqueness.

| Case | Initial guest layouts | Final guests | Proof waves | Deductions | Techniques |
| --- | ---: | --- | ---: | ---: | --- |
| case-004 | 15 | D1, B4 | 1 | 13 | KNOWN_SAFE_FROM_NON_GUEST_OBJECT, LOCAL_COUNT_SATURATED, UNIQUE_TARGET_NEIGHBOR_INTERSECTION |
| case-011 | 2 | A1 | 1 | 5 | LOCAL_SCOPE_INTERSECTION |
| case-012 | 2 | B3, C3 | 1 | 7 | LOCAL_COUNT_SATURATED, LOCAL_SCOPE_DIFFERENCE |
| case-013 | 2 | C2, B3 | 1 | 3 | LOCAL_SCOPE_DIFFERENCE, LOCAL_SCOPE_INTERSECTION |
| case-014 | 4 | B4, C4 | 1 | 8 | LOCAL_COUNT_SATURATED, LOCAL_SCOPE_DIFFERENCE |

Regression conclusion:

- Existing accepted cases remain valid after adding region, line/sightline, and anchor-frontier rule variants.
- No accepted baseline case was modified in this regression round.
- New mechanics are additive: old `globalCount` and `forEachCount` content continues to parse and verify unchanged.
- The active player selector can keep `case-004`, `case-011`, `case-012`, `case-013`, and `case-014` as the preserved baseline for Phase 22 production.
