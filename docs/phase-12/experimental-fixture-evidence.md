# Phase 12 Experimental Fixture Evidence

Status: Round 7 evidence

## Fixture

Path:

```text
content/experimental/phase-12/phase-12-local-scope-difference-001.json
```

Purpose:

- exercise `LOCAL_SCOPE_DIFFERENCE` in a complete authoring candidate;
- keep the fixture private and out of shipped content;
- preserve current Puzzle Schema v1 and DSL v1.

## Mechanical Shape

Initial reveals:

- `A1 empty`
- `B1 mirror`
- `C1 empty`
- `B2 bottle`

Difference step:

- `B2` bottle's orthogonal scope requires two guests.
- `B1` mirror's adjacent scope can account for only one guest inside the nested `A2/C2` unknown scope.
- The one-cell difference `B3` must be a guest.

The fixture also exercises `LOCAL_SCOPE_INTERSECTION` so that the full candidate reaches final uniqueness in one verifier wave.

## Round 7 Authoring Result

Command:

```powershell
pnpm authoring -- report content/experimental/phase-12/phase-12-local-scope-difference-001.json
```

Expected result:

- `ok: true`;
- schema issues: `0`;
- target rules satisfy;
- initial state satisfiable;
- initial guest layouts: `2`;
- no solver truncation;
- proof/no-guess: pass;
- final guest cells: `C2`, `B3`;
- technique ids include `LOCAL_SCOPE_DIFFERENCE`.

This file remains experimental and is not imported by the default web selector.

