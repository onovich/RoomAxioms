# Phase 18 Shipped Metadata Inventory

Status: cleanup completed in Round 2

## Shipped Case Baseline

- Shipped case count: 12.
- Shipped case ids: `case-001` through `case-012`.
- Default case: `case-004`.
- Player-facing selector source: `apps/web/src/content/cases.ts`.

## Internal Phase Metadata Cleanup

| File | Case id | Field | Baseline value | Round 2 value |
| --- | --- | --- | --- | --- |
| `content/cases/case-011.json` | `case-011` | `metadata.author` | `internal-phase-11` | `room-axioms-maintainers` |
| `content/cases/case-011.json` | `case-011` | `metadata.notes` | `Promoted from the Phase 10 local-scope-intersection experimental fixture. Difficulty remains provisional until real playtest calibration.` | `Maintainer-authored mid-band local-scope-intersection case. Difficulty remains provisional until real playtest calibration.` |
| `content/cases/case-012.json` | `case-012` | `metadata.author` | `internal-phase-15` | `room-axioms-maintainers` |
| `content/cases/case-012.json` | `case-012` | `metadata.notes` | `Promoted from Phase 15 retained-difference candidate 003. Difficulty remains provisional until real playtest calibration.` | `Maintainer-authored mid-band local-scope-difference case. Difficulty remains provisional until real playtest calibration.` |

## Non-Cleanup Metadata

The remaining shipped cases use `metadata.author: internal`. That value is maintainer-facing and does not contain phase labels; it is not part of the Phase 18 cleanup target.

## Behavior-Preservation Requirement

Round 2 cleanup must not change:

- case ids;
- titles or case names unless explicitly needed for copy clarity;
- board dimensions;
- targets;
- rules;
- initial observations;
- shipped case count;
- default case;
- selector entries;
- solver/proof outcomes.
