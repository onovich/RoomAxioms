# Phase 20 Repaired Selector Anti-Clone Pass

Round: 13

Command:

```powershell
pnpm authoring anti-clone content/cases/case-011.json content/cases/case-012.json content/cases/case-004.json --novelty-manifest content/novelty-claims.json
```

Result:

- status: `pass`
- hard failures: 0
- reviewer-blocking groups: 0
- evidence groups: none
- required accepted novelty claims: `case-004`, `case-011`, `case-012`
- rejected required puzzle ids: none

The player-facing selector now has a smaller but clean ladder:

1. `case-011`
2. `case-012`
3. `case-004`

`case-004` remains the default. No experimental or rejected Phase 19 case is player-facing.
