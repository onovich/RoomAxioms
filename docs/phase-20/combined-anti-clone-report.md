# Phase 20 Combined Anti-Clone Report

Round: 9

Phase 20 adds `evaluateAntiCloneReport(puzzles, options)` and the CLI command:

```powershell
pnpm authoring anti-clone content/cases/case-004.json content/experimental/phase-20/padded-case004-right-edge.json
```

The combined report includes:

- compact evidence groups for effective-board isomorphism;
- compact evidence groups for proof-trace clones;
- compact evidence groups for candidate-shrink clones;
- compact evidence groups for rule-impact clones;
- optional novelty-claim validation.

Detailed gate APIs still expose full signatures and member details. The combined CLI report is intentionally compact enough to paste into review docs.

## Status Rules

- `fail`: hard evidence exists, such as effective-board isomorphism, exact proof-trace collision, invalid novelty claims, or a required puzzle marked rejected.
- `reviewer-blocking`: no hard failure, but similarity evidence requires written reviewer acceptance.
- `pass`: no hard failures or reviewer-blocking groups.

## Padded Clone Evidence

For `case-004` and the Phase 20 padded fixture, the CLI report is expected to be blocked:

- status: `fail`
- hard failures: effective-board isomorphism and exact proof-trace collision
- reviewer-blocking evidence: identical candidate-shrink signature and identical rule-impact vector

This report is the authoring surface that later Phase 20 rounds can use when re-auditing the player-facing selector and documenting demotions.
