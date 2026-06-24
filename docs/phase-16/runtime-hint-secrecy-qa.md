# Phase 16 Runtime, Hint, And Secrecy QA

Status: Round 3 evidence

## Scope

This QA pass covers `case-012` in the shipped web runtime:

- selector/content loading;
- player-mode analysis;
- proof-backed hint behavior;
- developer-only no-guess verification;
- wrong/incomplete submission secrecy.

## Added Regression Evidence

Updated focused tests:

- `apps/web/src/runtime/analyzer.test.ts`
  - verifies `case-012` player mode has candidate guest layouts `2`;
  - verifies player mode keeps `forcedSafe`, `forcedGuests`, bin candidates, unique guest cells, and no-guess summary out of the response;
  - verifies the first player hint is public-observation backed and highlights `D1`;
  - verifies developer verification includes final guests `B3`, `C3` and technique ids `LOCAL_COUNT_SATURATED`, `LOCAL_SCOPE_DIFFERENCE`.
- `apps/web/src/logic/hints.test.ts`
  - verifies `case-012` hint rendering uses player-facing text and public observations only.
- `apps/web/src/content/runtimeSmoke.test.ts`
  - extends wrong/incomplete submission secrecy to every shipped case, including `case-012`.

## Player-Secrecy Decision

No runtime code change was needed.

Player mode still omits target layout, forced-cell arrays, candidate object cells, no-guess summaries, generator data, and authoring diagnostics. Developer mode remains the explicit surface for verification details.
