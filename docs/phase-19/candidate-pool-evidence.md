# Phase 19 Candidate Pool Evidence

Status: Rounds 7-10 candidate evidence recorded

## Accepted Experimental Candidates

All files are private experimental candidates under `content/experimental/phase-19/candidates`. They are not player-facing until a later promotion step copies selected cases into `content/cases` and updates the web selector.

| Candidate | Family | Initial guest layouts | Proof waves | Deductions | Techniques | Score | Band | Truncated |
| --- | --- | ---: | ---: | ---: | --- | ---: | ---: | --- |
| `phase-19-local-count-compact-001` | local-count / first deduction | 7 | 1 | 6 | `LOCAL_COUNT_SATURATED` | 13.07 | 3 | false |
| `phase-19-local-count-wide-001` | local-count / first deduction | 3 | 1 | 7 | `LOCAL_COUNT_SATURATED` | 12.79 | 3 | false |
| `phase-19-intersection-wide-001` | local-scope intersection | 2 | 1 | 5 | `LOCAL_SCOPE_INTERSECTION` | 10.66 | 3 | false |
| `phase-19-mixed-wide-001` | mixed 5x4 | 15 | 1 | 13 | `KNOWN_SAFE_FROM_NON_GUEST_OBJECT`, `LOCAL_COUNT_SATURATED`, `UNIQUE_TARGET_NEIGHBOR_INTERSECTION` | 23.40 | 5 | false |

## Validation Commands

For each accepted candidate:

```text
pnpm authoring -- report content/experimental/phase-19/candidates/<candidate>.json
pnpm authoring -- score content/experimental/phase-19/candidates/<candidate>.json
```

Additional required-technique retention checks:

```text
pnpm authoring -- minimize content/experimental/phase-19/candidates/phase-19-intersection-wide-001.json --require-technique LOCAL_SCOPE_INTERSECTION
```

Result: PASS, `ok: true`, `TECHNIQUE_RETENTION_PASS`.

## Promotion Notes

- `phase-19-local-count-compact-001` and `phase-19-local-count-wide-001` can replace opening-trivial cases as first-deduction local-count entries.
- `phase-19-intersection-wide-001` can sit near `case-011` as a non-isomorphic intersection entry.
- `phase-19-mixed-wide-001` can sit near `case-004` as a non-isomorphic mixed higher-band entry.
- No experimental candidate is promoted by this document alone; promotion happens in the selector round after final ladder selection.
