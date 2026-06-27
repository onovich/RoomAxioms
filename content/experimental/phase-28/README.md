# Phase 28 Experimental Rewrite Area

This folder is private maintainer evidence for Phase 28. It is not
player-facing content.

Nothing in this folder may enter the normal player selector unless a later
round deliberately copies a validated case into `content/cases`, updates
`content/novelty-claims.json`, wires it through `apps/web/src/content/cases.ts`,
and records focused web/runtime validation.

## Sprint Scope

Phase 28 is a narrow rewrite sprint:

1. Attempt C15 overlap-skeleton rewrites first.
2. Attempt one C06/C10/C09 late-closure rewrite only if the C15 path is
   exhausted or finished.
3. Promote at most two cases, and promote none if strict gates fail.

## Candidate Rules

Every serious candidate in this folder must have matching evidence in
`docs/phase-28/candidate-ledger.md`.

Minimum evidence:

- intended proof skeleton before editing;
- `pnpm authoring -- report <candidate>`;
- `pnpm authoring -- score <candidate>`;
- `pnpm authoring -- minimize <candidate> --require-technique <technique>`;
- anti-clone/degeneracy evidence before promotion review;
- copy review confirming explicit scope text and no internal labels;
- rejection or promotion decision with exact gate failure or pass evidence.

Fast rejection patterns:

- opening guest layout is already unique;
- proof has zero waves;
- a singleton, near-count, or direct no-guest/safe giveaway drives the puzzle;
- minimization collapses the intended design to a few opening observations;
- grammar material is only decorative or copied from an accepted proof trace;
- hidden region membership is required to understand visible rule text.

## Current Seeds

- C15 seed:
  `content/experimental/phase-26/candidates/p26-c15-overlap-chain-repair.json`
- Backup late-closure seed:
  `content/experimental/phase-26/candidates/p26-c10-frontier-repair.json`

Rejected or weak Phase 28 drafts should remain here or be moved under a local
`rejected/` subfolder, but they must never be imported by the web player case
selector.
