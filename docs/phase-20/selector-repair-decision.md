# Phase 20 Selector Repair Decision

Round: 11

The player-facing selector has been reduced from 8 cases to 3 accepted baselines:

1. `case-011`
2. `case-012`
3. `case-004`

`case-004` remains the default case.

## Demoted From Player Selector

- `case-001`: rejected by user; exact proof-trace clone evidence with `case-005`.
- `case-002`: rejected by user; no accepted novelty claim.
- `case-003`: exact proof-trace and candidate-shrink clone evidence with `case-011`; no accepted novelty claim.
- `case-005`: rejected by user; exact proof-trace clone evidence with `case-001`.
- `case-006`: rejected by user; effective-board, exact proof-trace, candidate-shrink, and rule-impact clone evidence with `case-004`.

The JSON files remain in `content/cases` as historical content for auditability, but they are no longer imported by `apps/web/src/content/cases.ts`.

## Repaired Selector Evidence

Command:

```powershell
pnpm authoring anti-clone content/cases/case-011.json content/cases/case-012.json content/cases/case-004.json --novelty-manifest content/novelty-claims.json
```

Result:

- status: `pass`
- hard failures: 0
- reviewer-blocking groups: 0
- required novelty claims: `case-004`, `case-011`, `case-012` all accepted

This smaller selector is intentionally honest. Phase 20 does not force an 8-case ladder when the available candidates do not pass novelty gates.
