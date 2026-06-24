# Phase 17 Issue Register

Status: active
Scope: MVP release closure for the current 12-case release candidate

## Severity Policy

- P0: blocks release or exposes hidden answer/target/internal data to players.
- P1: blocks a core player path, shipped case validity, smoke, deployment, or validation.
- P2: release-note, calibration, polish, or follow-up issue that does not block the current MVP release candidate.

## Open Issues

| ID | Severity | Area | Status | Decision |
| --- | --- | --- | --- | --- |
| P17-001 | P2 | Playtest calibration | Open | No real participant feedback is available. Playtest intake docs are prepared; keep public difficulty calibration deferred and do not fabricate feedback. |
| P17-002 | P2 | Release posture | Open | Release decision is `release-candidate`, not fully calibrated public release, until planner/checker acceptance and real playtest evidence. |
| P17-003 | P2 | Internal metadata | Open | `content/cases/case-012.json` still records author metadata `internal-phase-15`. Non-blocking because no experimental content is imported by player code and the metadata is not a player-facing selector id. |

## Resolved Issues

| ID | Severity | Area | Status | Decision |
| --- | --- | --- | --- | --- |
| P16-004 | P2 | Case-012 copy | Resolved before Phase 17 | Phase 16 changed the public title/case name from internal difference wording to player-facing wording without changing mechanics. |

## Release Blocker Decision

No P0/P1 issue is known after Round 4 validation, smoke, online HTTP checks, and boundary scans. The current release candidate can proceed to final validation unless Round 6 exposes a blocker.
