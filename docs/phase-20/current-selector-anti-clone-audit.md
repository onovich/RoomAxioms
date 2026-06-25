# Phase 20 Current Selector Anti-Clone Audit

Round: 10

Command:

```powershell
pnpm authoring anti-clone content/cases/case-001.json content/cases/case-002.json content/cases/case-003.json content/cases/case-011.json content/cases/case-012.json content/cases/case-004.json content/cases/case-005.json content/cases/case-006.json --novelty-manifest content/novelty-claims.json
```

Result:

- status: `fail`
- hard failures: 9
- reviewer-blocking groups: 3

## Hard Failures

- `case-004` / `case-006`: effective-board isomorphism.
- `case-001` / `case-005`: exact proof-trace collision.
- `case-003` / `case-011`: exact proof-trace collision.
- `case-004` / `case-006`: exact proof-trace collision.
- Novelty manifest marks `case-001`, `case-002`, `case-003`, `case-005`, and `case-006` as rejected.

## Reviewer-Blocking Evidence

- `case-003` / `case-011`: identical candidate-shrink signature.
- `case-004` / `case-006`: identical candidate-shrink signature.
- `case-004` / `case-006`: identical rule-impact vector.

## Selector Decision

The current 8-case selector cannot remain player-facing under Phase 20 gates. The honest selector should preserve the accepted useful baselines:

- `case-004`
- `case-011`
- `case-012`

Cases to demote from the normal selector unless a later reviewer note and replacement evidence explicitly accept them:

- `case-001`
- `case-002`
- `case-003`
- `case-005`
- `case-006`

A smaller 3-case selector is preferable to padding the ladder with clone content.
