# Phase 11 Copy Review

Status: Round 6 evidence

## Scope

Reviewed shipped content under `content/cases` and canonical web fixture copy for `case-004`.

Mechanics were not changed:

- no rule ids changed;
- no rule types changed;
- no rule scopes changed;
- no rule counts changed;
- no target layouts changed;
- no initial reveals changed.

## Changes

- Localized remaining English rule presentation titles and flavor text in `case-001`, `case-002`, `case-003`, and `case-005` through `case-010`.
- Updated `case-004` presentation flavor text to use `上下左右邻格` and `周围一圈` instead of abstract scope wording.
- Kept promoted `case-011` copy in the same plain-language style.
- Synced `apps/web/src/data/case004.ts` with the canonical `case-004` JSON copy.

## Scan Evidence

Command:

```powershell
Select-String -Path content\cases\*.json -Pattern '\"title\": \"[A-Za-z]|\"flavor\": \"[A-Za-z]|\"caseName\": \"[A-Za-z]'
```

Result:

- PASS, no matches.

## Test Evidence

Command:

```powershell
pnpm --filter @room-axioms/web test -- src/content/runtimeSmoke.test.ts src/content/caseVerification.test.ts src/data/case004.fixture.test.ts
```

Result:

- PASS.
- Added coverage that shipped case/rule presentation copy has no ASCII English letters.
- Added coverage that presentation copy avoids `正交` and `邻接域`.
- Added coverage that copy includes `上下左右邻格` and `周围一圈`.

## Residual Notes

Difficulty labels remain internal metadata and are not player-calibrated.
