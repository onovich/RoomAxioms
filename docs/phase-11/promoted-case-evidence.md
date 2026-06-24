# Phase 11 Promoted Case Evidence

Status: Round 3 evidence

## `case-011`

Source:

- `content/experimental/phase-10/phase-10-local-scope-intersection-001.json`

Promoted file:

- `content/cases/case-011.json`

Selector wiring:

- Imported by `apps/web/src/content/cases.ts`.
- Appended after `case-010`.
- `DEFAULT_CASE_ID` remains `case-004`.

## Authoring Report Evidence

Command:

```powershell
pnpm authoring -- report content/cases/case-011.json
```

Result:

- `ok: true`
- recommendation: `ready-for-experimental-review`
- schema: pass, zero issues
- target rules: pass
- initial satisfiability: pass
- initial guest layouts: `2`
- proof/no-guess: pass
- final guest cells: `A1`
- proof wave count: `1`
- deduction count: `5`
- technique ids: `LOCAL_SCOPE_INTERSECTION`
- solver truncation: false

## Authoring Score Evidence

Command:

```powershell
pnpm authoring -- score content/cases/case-011.json
```

Result:

- `ok: true`
- score: `10.36`
- provisional band: `3`
- `calibratedWithRealPlaytest: false`
- candidate guest layouts: `2`
- proof wave count: `1`
- deduction count: `5`
- solver truncated: false

## Web Content Verification Evidence

Command:

```powershell
pnpm --filter @room-axioms/web test -- src/content/caseVerification.test.ts src/content/runtimeSmoke.test.ts
```

Result:

- PASS
- `case-011` loads from shipped content.
- `case-011` passes schema, target rules, initial satisfiability, final uniqueness, no-guess, runtime readiness, and no-truncation checks.
- Player-mode smoke keeps no-guess details, forced cells, and candidate internals hidden.

## Runtime Hint Compatibility Evidence

Command:

```powershell
pnpm --filter @room-axioms/web test -- src/runtime/analyzer.test.ts
```

Result:

- PASS
- `case-011` player-mode `GET_HINT` returns a `LOCAL_SCOPE_INTERSECTION` hint.
- The first highlighted safe cell is `A2`.
- Player-mode analysis keeps `binCandidates`, `forcedSafe`, and `forcedGuests` empty.
- Player-mode analysis does not include the explicit `noGuess` verification summary.
- Developer `VERIFY_CASE` with `includeNoGuessReport: true` returns final guest cells `A1` and technique ids `LOCAL_SCOPE_INTERSECTION`.

## Copy Evidence

Case title:

- `客房 11：交汇视线`

Case name:

- `案卷 11 · 交汇视线`

Rule titles:

- `镜面登记`
- `酒瓶静区`
- `空房登记`

Rule text uses `上下左右邻格` and `周围一圈` without exposing solver, target, candidate, forced-cell, generator, or authoring internals.

Round 6 copy review:

- PASS, promoted copy remains Chinese and plain-language.
- PASS, no promoted rule copy contains abstract scope terms such as `正交` or `邻接域`.
