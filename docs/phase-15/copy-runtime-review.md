# Phase 15 Copy And Runtime Review

Status: Round 5 evidence

## Player-Facing Copy

`case-012` uses reviewed Chinese copy:

- title: `客房 12：走廊差集`;
- case name: `案卷 12 · 走廊差集`;
- rule titles: `酒瓶十字线`, `镜面静区`, `空房静线`, `住客总数`;
- rule flavor is written for players and does not mention solver internals, targets, authoring, generator, or proof technique IDs.

## Runtime Wiring

`apps/web/src/content/cases.ts` imports `content/cases/case-012.json` directly. It does not import `content/experimental/phase-15`.

`DEFAULT_CASE_ID` remains `case-004`.

The selector summary exposes only:

- `id`;
- `title`;
- `caseName`;
- `difficulty`;
- `tags`;
- `board`.

## Verification

Commands:

```powershell
cmd /c pnpm.cmd --filter @room-axioms/web test -- src/content/caseVerification.test.ts
cmd /c pnpm.cmd authoring -- report content/cases/case-012.json
cmd /c pnpm.cmd authoring -- score content/cases/case-012.json
cmd /c pnpm.cmd authoring -- minimize content/cases/case-012.json --require-technique LOCAL_SCOPE_DIFFERENCE
```

Results:

- web content verification: PASS;
- shipped cases load in stable order through `case-012`;
- experimental Phase 15 IDs are absent from `contentCases` and `caseSummaries`;
- `case-012` report: PASS, `ok: true`;
- `case-012` score: PASS, provisional band `3`, uncalibrated;
- `case-012` retention minimization: PASS, `TECHNIQUE_RETENTION_PASS`.
