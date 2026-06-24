# Phase 18 Shipped Metadata Inventory

Status: baseline before cleanup

## Shipped Case Baseline

- Shipped case count: 12.
- Shipped case ids: `case-001` through `case-012`.
- Default case: `case-004`.
- Player-facing selector source: `apps/web/src/content/cases.ts`.

## Internal Phase Metadata Found

| File | Case id | Field | Current value | Cleanup decision |
| --- | --- | --- | --- | --- |
| `content/cases/case-011.json` | `case-011` | `metadata.author` | `internal-phase-11` | Replace with neutral maintainer metadata in Round 2. |
| `content/cases/case-011.json` | `case-011` | `metadata.notes` | `Promoted from the Phase 10 local-scope-intersection experimental fixture. Difficulty remains provisional until real playtest calibration.` | Replace source-history phrase with neutral behavior-preserving note in Round 2. |
| `content/cases/case-012.json` | `case-012` | `metadata.author` | `internal-phase-15` | Replace with neutral maintainer metadata in Round 2. |
| `content/cases/case-012.json` | `case-012` | `metadata.notes` | `Promoted from Phase 15 retained-difference candidate 003. Difficulty remains provisional until real playtest calibration.` | Replace source-history phrase with neutral behavior-preserving note in Round 2. |

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
