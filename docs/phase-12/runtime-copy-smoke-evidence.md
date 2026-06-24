# Phase 12 Runtime, Copy, And Smoke Evidence

Status: Round 10 evidence

## Copy Review

Reviewed:

- `content/experimental/phase-12/phase-12-local-scope-difference-001.json`

Result:

- title is Chinese;
- rule titles are Chinese;
- rule flavor copy is Chinese and player-readable;
- copy uses plain neighborhood language such as `上下左右邻格` and `周围一圈`;
- no new DSL wording, rule kind, or schema field was introduced.

## Selector And Runtime Boundary

Round 10 adds a selector regression in `apps/web/src/content/caseVerification.test.ts`:

- shipped content remains 11 cases;
- `case-004` remains the default through the existing stable-order assertion;
- no shipped `contentCases` id starts with `phase-12-`;
- no selector summary id starts with `phase-12-`.

This keeps `content/experimental/phase-12/phase-12-local-scope-difference-001.json` private until a later explicit promotion.

## Deterministic Test Smoke

Commands:

```powershell
pnpm --filter @room-axioms/web test -- src/content/caseVerification.test.ts src/content/runtimeSmoke.test.ts src/logic/hints.test.ts src/runtime/analyzer.test.ts
pnpm --filter @room-axioms/generator test
```

Expected result:

- web content/runtime/hint tests pass;
- generator experimental fixture regression passes.

## Local Dev Smoke Decision

No shipped content file, selector import, default case, or runtime implementation was changed in Round 10. Local dev smoke is deferred to final validation if later rounds touch web-visible files or if the final validation plan chooses to run it anyway.

