# Phase 17 Known Limitations

Status: release-candidate caveats

## Calibration

- Difficulty is not playtest-calibrated.
- Authoring scores and proof metrics are internal diagnostics only.
- No Phase 17 real participant feedback has been recorded.

## Product Scope

- No public editor or user-generated content.
- No backend, account system, analytics, leaderboard, or daily challenge.
- No PWA/offline release scope beyond the current static Pages build.
- No broad accessibility hardening beyond the existing keyboard, screen-reader, responsive, smoke, and regression coverage.

## Content Scope

- The shipped MVP contains 12 cases: `case-001` through `case-012`.
- Experimental content remains private and should not appear in the player selector.
- `case-004` remains the default case.

## Runtime Scope

- Hints are proof-backed but intentionally compact.
- Developer verification output is maintainer-facing and must remain gated away from normal player mode.
- Target layouts, forced cells, candidate counts, generator data, authoring diagnostics, and proof internals must not be surfaced as normal player information.

## Follow-Up Candidates

- Real playtest intake and difficulty calibration.
- Release-copy polish after participant feedback.
- Additional accessibility and cross-browser hardening after the MVP release candidate is accepted.
- Future content expansion only through the established authoring and validation gates.
