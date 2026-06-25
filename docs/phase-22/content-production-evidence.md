# Phase 22 Content Production Evidence

Status: selector expanded to 10 player-facing cases.

## Promoted Cases

| Case | Mechanics | Opening layouts | Final guests | Proof techniques | Notes |
| --- | --- | ---: | --- | --- | --- |
| `case-015` | region, line count, anchor frontier | 4 | `A2`, `C3` | `REGION_COUNT_SATURATED`, `LINE_COUNT_ALL_REMAINING` | Mixed north-edge and east-column case. |
| `case-017` | sightline blocker, region, anchor frontier | 7 | `A2`, `B2` | `REGION_COUNT_SATURATED`, `LINE_COUNT_ALL_REMAINING` | Horizontal blocker ray uses an observed mirror. |
| `case-018` | anchor frontier, region | 3 | `C2`, `A3` | `REGION_COUNT_SATURATED`, `REGION_COUNT_ALL_REMAINING` | Hidden north-corner bottle closes the anchor frontier. |
| `case-019` | anchor frontier, line count, region | 5 | `C2`, `A3` | `REGION_COUNT_SATURATED`, `LINE_COUNT_ALL_REMAINING` | Wider 4x3 east-shelf variant. |
| `case-020` | vertical sightline blocker, anchor frontier, region | 6 | `A2`, `B2` | `REGION_COUNT_SATURATED`, `LINE_COUNT_ALL_REMAINING` | Vertical blocker ray uses an observed mirror and an extra cleared corner. |

Existing accepted cases retained in selector:

- `case-004`
- `case-011`
- `case-012`
- `case-013`
- `case-014`

Final selector order:

1. `case-004`
2. `case-011`
3. `case-013`
4. `case-015`
5. `case-012`
6. `case-014`
7. `case-017`
8. `case-018`
9. `case-019`
10. `case-020`

Mechanic coverage:

- Region/zone cases: `case-015`, `case-017`, `case-018`, `case-019`, `case-020`
- Sightline/blocker cases: `case-017`, `case-020`
- Anchor-frontier cases: `case-015`, `case-017`, `case-018`, `case-019`, `case-020`
- Contaminated-record cases: none promoted; verifier evidence remains internal.

## Rejected Candidate

| Candidate | Location | Reason |
| --- | --- | --- |
| `case-016` | `content/experimental/phase-22/rejected/case-016-proof-trace-clone.json` | Rejected after anti-clone reported an exact proof-trace collision with `case-018`. |

## Validation Evidence

- `pnpm authoring -- anti-clone <10 selector cases> --novelty-manifest content/novelty-claims.json`: PASS
- `pnpm --filter @room-axioms/web test -- src/content/caseVerification.test.ts src/content/runtimeSmoke.test.ts`: PASS
- `pnpm --filter @room-axioms/authoring test -- src/noveltyClaims.test.ts`: PASS
- `pnpm authoring -- report content/cases/case-020.json`: PASS after case-020 opening reveal adjustment

## Notes

The promoted cases satisfy the minimum 10-case selector target without forcing a 20-case ladder. Difficulty remains provisional until real playtest evidence exists.
