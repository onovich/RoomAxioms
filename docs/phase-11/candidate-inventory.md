# Phase 11 Candidate Inventory

Status: Round 1 baseline
Generated or experimental content remains report-only until explicitly promoted.

## Authoring Commands

Commands run from `D:\WebProjects\RoomAxioms`:

- `pnpm authoring -- report content/experimental/phase-10/phase-10-local-scope-intersection-001.json`
- `pnpm authoring -- score content/experimental/phase-10/phase-10-local-scope-intersection-001.json`
- `pnpm authoring -- sample --seed 7 --template content/experimental/phase-10/phase-10-sample-template.json`

## Inventory

| Candidate | Source | Result | Promotion Decision |
| --- | --- | --- | --- |
| `phase-10-local-scope-intersection-001` | `content/experimental/phase-10/phase-10-local-scope-intersection-001.json` | Eligible. Authoring `report` returned `ok: true`; schema passed; target rules passed; initial satisfiable; initial guest layouts `2`; proof/no-guess passed; final guest cells `A1`; technique ids `LOCAL_SCOPE_INTERSECTION`; no truncation. Authoring `score` returned `score: 10.36`, `band: 3`, `calibratedWithRealPlaytest: false`. | Select for Round 2 copy planning and Round 3 promotion attempt. |
| `phase-10-sample-001` | `sample --seed 7` report-only output from `phase-10-sample-template.json` | Mechanically accepted by generator, but it is a one-guest global-count sample with eight initial reveals, zero proof waves, zero deductions, and no mid-band technique coverage. No file was written. | Reject for Phase 11 promotion; useful only as CLI smoke evidence. |
| Additional generated candidates | Not generated in Round 1 | No reviewed candidate with mid-band evidence exists yet. | Do not promote. Quality gate beats case count. |

## Selected Promotion Attempt

Primary candidate: `phase-10-local-scope-intersection-001`.

Rationale:

- It is the only available candidate with completed authoring evidence.
- It is mid-band by provisional authoring score.
- It genuinely exercises the accepted `LOCAL_SCOPE_INTERSECTION` proof technique.
- It has no cap pressure or truncation in authoring evidence.

## Non-Promotion Notes

- No experimental file is imported by `apps/web/src/content/cases.ts` in Round 1.
- No generated sample is copied into `content/cases` in Round 1.
- Difficulty remains provisional and uncalibrated.
