# Phase 14 Authoring Evidence

Status: Round 5 evidence

## Commands

```powershell
cmd /c pnpm.cmd authoring -- report content/experimental/phase-14/phase-14-local-scope-difference-001.json
cmd /c pnpm.cmd authoring -- score content/experimental/phase-14/phase-14-local-scope-difference-001.json
cmd /c pnpm.cmd authoring -- minimize content/experimental/phase-14/phase-14-local-scope-difference-001.json --require-technique LOCAL_SCOPE_DIFFERENCE
cmd /c pnpm.cmd authoring -- report content/experimental/phase-14/phase-14-local-scope-difference-002.json
cmd /c pnpm.cmd authoring -- score content/experimental/phase-14/phase-14-local-scope-difference-002.json
cmd /c pnpm.cmd authoring -- minimize content/experimental/phase-14/phase-14-local-scope-difference-002.json --require-technique LOCAL_SCOPE_DIFFERENCE
cmd /c pnpm.cmd authoring -- report content/experimental/phase-14/phase-14-local-scope-difference-003.json
cmd /c pnpm.cmd authoring -- score content/experimental/phase-14/phase-14-local-scope-difference-003.json
cmd /c pnpm.cmd authoring -- minimize content/experimental/phase-14/phase-14-local-scope-difference-003.json --require-technique LOCAL_SCOPE_DIFFERENCE
```

## Summary

- Candidate 001: retained `LOCAL_SCOPE_DIFFERENCE`, but proof/no-guess failed with two explanation gaps and no final guest-layout uniqueness.
- Candidate 002: validation passed, but initial guest layout count was `1`, proof wave count was `0`, and retention failed.
- Candidate 003: validation passed, but initial guest layout count was `1`, proof wave count was `0`, and retention failed.

## Truncation

No reviewed candidate hit solver truncation.

## Real Playtest Calibration

All scores remain uncalibrated:

```text
calibratedWithRealPlaytest: false
```

