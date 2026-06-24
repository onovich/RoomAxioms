# Phase 16 Case-012 QA Checklist

Status: Round 1 baseline

## Content And Selector

- `case-012` exists in `content/cases/case-012.json`: PASS.
- `case-012` is imported from `content/cases`, not from `content/experimental`: PASS.
- `case-012` appears after `case-011` in `contentCases`: PASS.
- `case-004` remains `DEFAULT_CASE_ID`: PASS.
- Selector summaries expose only `id`, `title`, `caseName`, `difficulty`, `tags`, and `board`: pending Round 3 recheck.
- Experimental Phase 15 IDs remain absent from shipped content: pending Round 3 boundary scan.

## Authoring And Proof

- Authoring `report content/cases/case-012.json`: PASS.
- Authoring `score content/cases/case-012.json`: PASS, score `12.15`, provisional band `3`.
- `calibratedWithRealPlaytest`: `false`.
- Authoring `minimize content/cases/case-012.json --require-technique LOCAL_SCOPE_DIFFERENCE`: PASS.
- `TECHNIQUE_RETENTION_PASS`: PASS.
- Initial guest-layout count: `2`.
- Final guest cells: `B3`, `C3`.
- Proof techniques: `LOCAL_COUNT_SATURATED`, `LOCAL_SCOPE_DIFFERENCE`.
- Solver truncation: `false`.

## Copy Review

- Title and case name plain Chinese: PASS after Round 2 copy fix from `走廊差集` to `走廊缺口`.
- Rule titles plain Chinese: PASS.
- Rule flavor text plain Chinese and mechanically neutral: PASS.
- Existing web copy remains consistent with established wording: PASS.

## Runtime, Hint, And Player Secrecy

- Player-mode runtime for case-012: PASS.
- Developer-mode verification for case-012: PASS.
- Hint behavior from case-012 initial observations: PASS.
- Wrong or incomplete submission secrecy: PASS for all shipped cases.
- Developer-only gating: PASS.

## Responsive, Keyboard, And Smoke

- Local smoke: pending Round 4.
- Online HTTP smoke: pending final round.
- Desktop viewport smoke: pending Round 4 if feasible.
- Mobile viewport smoke: pending Round 4 if feasible.
- Keyboard navigation smoke: pending Round 4 if feasible.
- Console-error status: pending Round 4 if feasible.

## Playtest Calibration

- Case-012 playtest protocol prepared: pending Round 5.
- Case-012 feedback log created or updated: pending Round 5.
- Real feedback recorded only if real participant evidence exists: pending Round 5.
- Difficulty remains uncalibrated without real feedback: pending Round 5.
