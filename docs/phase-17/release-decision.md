# Phase 17 Release Decision

Status: release-candidate
Decision date: 2026-06-24

## Decision

The current 12-case build is a release candidate, not a fully calibrated public release.

## Rationale

- Phase 16 accepted `case-012` release QA with authoring retention, focused web/proof/authoring tests, local smoke, online HTTP checks, and boundary scans.
- Phase 17 baseline confirms 12 shipped cases and `case-004` as the default case.
- No P0/P1 release blocker is known at this point in closure.
- Difficulty remains uncalibrated because no real participant playtest feedback exists.

## Required Before Final Public Release Claim

- Planner/checker acceptance of Phase 17.
- Final validation and smoke evidence from this phase.
- Continued player-secrecy and package-boundary checks.
- Real playtest feedback before making any public difficulty-calibration claim.

## Hold Conditions

Hold the release candidate if any final validation, smoke, Pages, player secrecy, shipped-case validity, or boundary scan exposes a P0/P1 issue.

## Non-Claims

- This decision does not claim playtest-calibrated difficulty.
- This decision does not add or promise public editor, UGC, backend, analytics, daily challenge, new DSL semantics, or new cases.
