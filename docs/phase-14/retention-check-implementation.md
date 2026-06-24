# Phase 14 Retention Check Implementation

Status: Round 3 evidence

## Implementation Summary

The private authoring CLI now supports:

```powershell
cmd /c pnpm.cmd authoring -- minimize <case.json> --require-technique LOCAL_SCOPE_DIFFERENCE
```

The `minimize` report includes `techniqueRetention` with:

- `beforeTechniqueIds`;
- `afterTechniqueIds`;
- `preservedTechniqueIds`;
- `lostTechniqueIds`;
- `requiredTechniqueIds`;
- `missingRequiredTechniqueIds`;
- `requiredTechniquesRetained`.

The check is derived from proof metrics already produced by minimization. It does not reimplement proof, solver, or DSL semantics.

## Regression Tests

Command:

```powershell
cmd /c pnpm.cmd --filter @room-axioms/authoring test
```

Result:

- PASS;
- 1 file passed;
- 13 tests passed.

Coverage added:

- repeated `--require-technique` parse;
- invalid technique parse rejection;
- positive retention path with `LOCAL_SCOPE_INTERSECTION`;
- negative Phase 13 difference retention path with `LOCAL_SCOPE_DIFFERENCE`.

## CLI Evidence

Negative retention fixture:

```powershell
cmd /c pnpm.cmd authoring -- minimize content/experimental/phase-13/phase-13-local-scope-difference-001.json --require-technique LOCAL_SCOPE_DIFFERENCE
```

Result:

- command PASS;
- `ok: true`;
- `TECHNIQUE_RETENTION_FAILED`;
- before techniques: `LOCAL_COUNT_SATURATED`, `LOCAL_SCOPE_DIFFERENCE`;
- after techniques: `LOCAL_COUNT_SATURATED`;
- missing required techniques: `LOCAL_SCOPE_DIFFERENCE`;
- `requiredTechniquesRetained: false`.

Positive retained fixture:

```powershell
cmd /c pnpm.cmd authoring -- minimize content/experimental/phase-10/phase-10-local-scope-intersection-001.json --require-technique LOCAL_SCOPE_INTERSECTION
```

Result:

- command PASS;
- `ok: true`;
- `TECHNIQUE_RETENTION_PASS`;
- before techniques: `LOCAL_SCOPE_INTERSECTION`;
- after techniques: `LOCAL_SCOPE_INTERSECTION`;
- missing required techniques: none;
- `requiredTechniquesRetained: true`.

## Architecture Notes

- The retention report lives in private `@room-axioms/authoring`.
- It consumes public `TechniqueId` and minimization proof metrics.
- It does not import or expose player-facing app code.
- No shipped content was changed.

