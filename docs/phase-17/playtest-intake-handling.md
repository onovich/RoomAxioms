# Phase 17 Playtest Intake Handling

Status: prepared

## Empty Log Handling

If no real participant feedback exists, the feedback log must remain explicitly empty and calibration must remain deferred.

## Filled Log Handling

When real feedback exists:

1. Add an anonymized entry to `docs/phase-17/playtest-feedback-log.md`.
2. Preserve the participant's reported issue or observed behavior without embellishment.
3. Classify the issue as P0, P1, or P2 using `docs/phase-17/playtest-intake-protocol.md`.
4. Add or update the matching issue in `docs/phase-17/issue-register.md`.
5. Route P0/P1 findings before release readiness claims.
6. Keep difficulty calibration provisional until enough real sessions exist for planner/checker review.

## Prohibited Substitutes

- Do not treat automated scores as participant difficulty calibration.
- Do not treat solver/proof metrics as participant feedback.
- Do not invent participant reactions from maintainer expectations.
- Do not use screenshots, smoke tests, or CI results as playtest evidence.
