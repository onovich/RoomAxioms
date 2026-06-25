# Phase 21 Experimental Candidate Area

This folder is private maintainer evidence for Phase 21. Files here are not player-facing unless a later promotion round copies a validated candidate into `content/cases`, updates `content/novelty-claims.json`, and wires it through `apps/web/src/content/cases.ts`.

## Source Of Candidate Truth

- Skeleton catalog: `docs/phase-21/proof-skeleton-catalog.md`
- Baseline acceptance contract: `docs/phase-21/baseline-acceptance-contract.md`
- Anti-clone gate: `pnpm authoring -- anti-clone ... --novelty-manifest content/novelty-claims.json`

## Directories

- `templates/`: report-only generator/authoring templates tied to proof skeletons.
- `candidates/`: hand-authored or sampled candidate JSONs that are still experimental until all gates pass.

## Phase 21 Candidate Source Rules

1. Start from a proof skeleton, not from an accepted case coordinate map.
2. Keep rejected Phase 19 cases out of this folder unless the file is explicit negative evidence.
3. Do not promote a candidate from this folder without report, score, minimize, anti-clone, novelty, and focused web evidence.
4. Do not use padding, coordinate transforms, label swaps, or copied proof traces as novelty.
