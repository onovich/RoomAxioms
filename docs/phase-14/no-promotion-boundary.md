# Phase 14 No-Promotion Boundary

Status: Round 8 evidence

## Decision

No Phase 14 candidate is promoted into shipped content.

## Code Boundary

`apps/web/src/content/caseVerification.test.ts` now checks that:

- `contentCases` contains no IDs starting with `phase-14-`;
- `caseSummaries` contains no IDs starting with `phase-14-`;
- shipped case count remains `11`;
- `DEFAULT_CASE_ID` remains `case-004`.

## Validation

Focused command:

```powershell
cmd /c pnpm.cmd --filter @room-axioms/web test -- src/content/caseVerification.test.ts
```

Expected result:

- PASS.

## Boundary Result

Phase 14 experimental content remains under `content/experimental/phase-14/` only.

No experimental Phase 14 path is imported by `apps/web/src/content/cases.ts`.

