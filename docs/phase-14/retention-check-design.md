# Phase 14 Retention Check Design

Status: Round 2 design

## Goal

Add a private, deterministic authoring report that makes technique retention explicit during reveal minimization.

The immediate Phase 14 question is:

```text
Did LOCAL_SCOPE_DIFFERENCE survive minimization?
```

The implementation should stay generic enough to check other techniques later without adding proof semantics to authoring glue.

## Proposed CLI Shape

Extend the existing `minimize` command with one or more optional flags:

```powershell
cmd /c pnpm.cmd authoring -- minimize <case.json> --require-technique LOCAL_SCOPE_DIFFERENCE
```

Multiple flags may be supplied if a later private workflow needs more than one required proof technique:

```powershell
cmd /c pnpm.cmd authoring -- minimize <case.json> --require-technique LOCAL_SCOPE_INTERSECTION --require-technique LOCAL_SCOPE_DIFFERENCE
```

Without the flag, `minimize` should remain backwards-compatible and still report before/after technique sets.

## Proposed Report Field

Add `techniqueRetention` to `AuthoringCliReport` for `minimize` output:

```ts
interface AuthoringTechniqueRetentionReport {
  readonly beforeTechniqueIds: readonly TechniqueId[]
  readonly afterTechniqueIds: readonly TechniqueId[]
  readonly preservedTechniqueIds: readonly TechniqueId[]
  readonly lostTechniqueIds: readonly TechniqueId[]
  readonly requiredTechniqueIds: readonly TechniqueId[]
  readonly missingRequiredTechniqueIds: readonly TechniqueId[]
  readonly requiredTechniquesRetained: boolean
}
```

The report is derived only from:

- `minimization.proofBefore.metrics.techniqueIds`
- `minimization.proofAfter.metrics.techniqueIds`
- CLI-provided `requiredTechniqueIds`

## Diagnostics

When required techniques are provided:

- emit `TECHNIQUE_RETENTION_PASS` when all required techniques survive;
- emit `TECHNIQUE_RETENTION_FAILED` when any required technique is missing after minimization.

This diagnostic should not replace existing minimization diagnostics. It is an extra authoring signal.

## Type Safety

`--require-technique` accepts only known `TechniqueId` values from `@room-axioms/proof`.

Invalid values should fail parsing or return a structured parser error before running solver/proof work.

## Architecture Boundary

- `@room-axioms/authoring` may import `TechniqueId` from the public `@room-axioms/proof` API.
- The check must not reimplement deduction rules.
- The check must not inspect solver internals, hidden target data beyond existing validation/minimization workflows, or React/web runtime code.
- No shipped content or player UI imports this authoring report.

## Regression Tests

Add authoring tests for:

- parser accepts repeated `--require-technique` flags;
- invalid technique values produce a structured parse error;
- Phase 13 candidate 001 reports `requiredTechniquesRetained: false` for `LOCAL_SCOPE_DIFFERENCE`;
- Phase 10 intersection fixture reports `requiredTechniquesRetained: true` for `LOCAL_SCOPE_INTERSECTION`.

If no positive retained `LOCAL_SCOPE_DIFFERENCE` fixture exists yet, do not invent one for the test. Use the existing retained intersection fixture as the positive retention path and the Phase 13 difference candidate as the negative Phase 14 path.

