# Phase 26 Experimental Candidate Area

This folder is private maintainer evidence for Phase 26. Nothing here is
player-facing unless a later promotion round deliberately copies a validated case
into `content/cases`, updates `content/novelty-claims.json`, wires it through
`apps/web/src/content/cases.ts`, and records web/runtime validation.

## Directories

- `templates/`: report-only proof-skeleton templates used to start authored or
  sampled candidates. These are skeleton scaffolds, not automatically valid
  `pnpm authoring -- sample` inputs until concrete generator rules are filled in.
- `candidates/`: hand-authored or repaired candidate JSON files that are still
  experimental.
- `rejected/`: candidates kept as negative evidence after workbench/CLI review.

## Rules

1. Start from a named proof skeleton, not from a visual map variation.
2. Run `pnpm authoring -- report` and `pnpm authoring -- score` for every
   serious candidate.
3. Run anti-clone and degeneracy checks before any promotion.
4. Keep rejected, weak, clone-like, degenerate, or highlight-dependent content
   out of the player selector.
5. Do not use authoring score as calibrated playtest difficulty.
