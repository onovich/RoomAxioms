# Phase 14 Search Template Smoke

Status: Round 4 evidence

## Template

`content/experimental/phase-14/phase-14-nested-difference-sample-template.json`

## Intent

The template keeps sampling private and report-only while biasing toward a known nested local-scope difference shape:

- bottle orthogonal count provides the outer scope;
- mirror adjacent count provides the inner cap;
- global guest count keeps the room small enough for bounded checks.

The template does not promote content and does not add new DSL, schema, solver, or proof semantics.

## Seed And Caps

- seed: `1401`
- max attempts: `96`
- max nodes: `20000`
- max models: `20000`
- max guest layouts: `100`
- max accepted: `3`

## Expected Use

Run:

```powershell
cmd /c pnpm.cmd authoring -- sample --seed 1401 --template content/experimental/phase-14/phase-14-nested-difference-sample-template.json
```

Any accepted candidate remains a report-only candidate until copied deliberately into `content/experimental/phase-14/` or rejected with evidence.

## Smoke Result

Command:

```powershell
cmd /c pnpm.cmd authoring -- sample --seed 1401 --template content/experimental/phase-14/phase-14-nested-difference-sample-template.json
```

Result:

- command PASS;
- authoring report `ok: false`;
- diagnostic code: `SAMPLE_REJECTED`;
- accepted candidates: `0`;
- attempts: `96`;
- rejection pattern: all sampled targets failed `TARGET_VIOLATES_RULES`, followed by `NO_CANDIDATE_ACCEPTED`;
- solver stats: `nodeCount 96`, `propagationCount 109`, `truncated false`;
- artifact policy: `report-only`;
- no files were written by the CLI.

## Round 4 Decision

Keep this template as a smokeable report-only comparison point. Candidate production should prioritize hand-authored repair around nested scopes because broad random target sampling still spends nearly all attempts before proof and retention gates.
