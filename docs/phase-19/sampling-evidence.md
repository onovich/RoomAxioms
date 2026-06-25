# Phase 19 Template Sampling Evidence

Status: Round 6 evidence recorded

## Private Templates

Added under `content/experimental/phase-19`:

- `phase-19-local-count-exclusion-template.json`
- `phase-19-intersection-template.json`
- `phase-19-difference-template.json`
- `phase-19-mixed-4x4-template.json`

All templates use `artifactPolicy: "report-only"` and capped attempts. They are private authoring inputs only; no generated output was written to `content/cases`, and no candidate was added to the player selector.

## Sampling Run

Command shape:

```text
pnpm authoring -- sample --seed <seed> --template content/experimental/phase-19/<template>.json
```

| Template | Seed | Attempts | Accepted | Rejected | Truncated | Rejection breakdown |
| --- | ---: | ---: | ---: | ---: | --- | --- |
| `phase-19-local-count-exclusion-template.json` | 1901 | 64 | 0 | 65 | false | `TARGET_VIOLATES_RULES=64`, `NO_CANDIDATE_ACCEPTED=1` |
| `phase-19-intersection-template.json` | 1902 | 96 | 0 | 97 | false | `TARGET_VIOLATES_RULES=90`, `PROOF_GUESS_POINT=6`, `NO_CANDIDATE_ACCEPTED=1` |
| `phase-19-difference-template.json` | 1903 | 96 | 0 | 97 | false | `TARGET_VIOLATES_RULES=96`, `NO_CANDIDATE_ACCEPTED=1` |
| `phase-19-mixed-4x4-template.json` | 1904 | 128 | 0 | 129 | false | `TARGET_VIOLATES_RULES=128`, `NO_CANDIDATE_ACCEPTED=1` |

## Interpretation

- The strict template rules are useful as private search shapes but this seed pass did not produce promotable candidates.
- No generated or rejected candidate should be promoted from this run.
- Rounds 7 through 10 should use these templates as starting points, but accepted ladder candidates still require manual review and the Phase 19 gates: opening ambiguity, proof waves, rule contribution, non-isomorphism, and required technique retention.
