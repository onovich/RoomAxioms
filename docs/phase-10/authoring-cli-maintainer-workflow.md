# Phase 10 Authoring CLI Maintainer Workflow

Status: private offline maintainer workflow
Scope: experimental candidates only

## Purpose

The Phase 10 authoring CLI is a private report-only tool for checking hand-authored or generated candidate cases before planner/checker review. It is not a public editor, UGC surface, backend service, analytics path, daily challenge system, or player-facing diagnostic feature.

The CLI consumes public package APIs from schema, solver, proof, and generator. It must not be imported by the web app or shipped content.

## Build And Invocation

Build the package before running the Node CLI entry:

```powershell
pnpm --filter @room-axioms/authoring build
```

From the repository root:

```powershell
pnpm authoring -- validate content/experimental/phase-10/phase-10-local-scope-intersection-001.json
pnpm authoring -- report content/experimental/phase-10/phase-10-local-scope-intersection-001.json
pnpm authoring -- score content/experimental/phase-10/phase-10-local-scope-intersection-001.json
pnpm authoring -- minimize content/experimental/phase-10/phase-10-local-scope-intersection-001.json
pnpm authoring -- sample --seed 7 --template content/experimental/phase-10/phase-10-sample-template.json
```

All commands currently write structured JSON to stdout. `--output <path>` is parsed and echoed in reports as an explicit destination field, but Phase 10 commands do not write files by default.

## Commands

`validate <case.json>`:

- parses Puzzle Schema v1;
- checks target rule satisfaction;
- checks initial satisfiability;
- counts initial guest layouts with caps;
- runs proof/no-guess verification;
- reports final guest-layout uniqueness from the proof verifier;
- records solver caps, truncation, proof technique ids, and a recommendation.

`report <case.json>`:

- uses the same validation core as `validate`;
- emits the same structured evidence with status `reported`.

`score <case.json>`:

- runs validation first;
- appends provisional generator difficulty metrics;
- always preserves `calibratedWithRealPlaytest: false`.

`minimize <case.json>`:

- runs validation first;
- reports a proposed reveal minimization using generator public APIs;
- never overwrites `initialReveals` or the source JSON by default.

`sample --seed <seed> --template <template.json>`:

- builds a deterministic generator input from the template and explicit seed;
- reports accepted candidates, rejected candidates, caps, stats, and artifact policy;
- does not write generated cases to shipped content.

## Output Notes

Every command returns a top-level JSON object with:

- `version`;
- `ok`;
- `command`;
- `inputPath` and `resolvedInputPath`;
- `status`;
- `diagnostics`.

Case-based commands may include:

- `validation`;
- `score`;
- `minimization`.

Sample commands include:

- `sample.input.seed`;
- `sample.accepted`;
- `sample.rejected`;
- `sample.stats`;
- `sample.artifactPolicy`.

Caps and truncation are part of the report. A candidate with cap pressure or truncation should not be promoted until caps are raised or the candidate is simplified and rerun.

## Experimental Storage

Experimental Phase 10 inputs live under:

```text
content/experimental/phase-10/
```

They must not be imported by:

- `content/cases`;
- `apps/web/src/content/cases.ts`;
- `caseSummaries`;
- `getDefaultCase()`;
- player-facing selectors or runtime bundles.

## Promotion Checklist

A candidate can be proposed to planner/checker only after:

- `validate` or `report` returns `ok: true`;
- target rules satisfy without truncation;
- initial state is satisfiable without truncation;
- proof/no-guess passes;
- final guest layout is unique;
- difficulty score remains explicitly uncalibrated;
- generated/minimized output is reviewed as evidence, not automatically applied;
- no default web selector or shipped content import points to the experimental path;
- planner/checker explicitly accepts promotion.

Before public difficulty labels are used, real playtest evidence must be collected. Phase 10 scores are authoring diagnostics, not player-calibrated claims.

## Current Phase 10 Fixtures

- `content/experimental/phase-10/phase-10-local-scope-intersection-001.json`: hand-authored fixture requiring `LOCAL_SCOPE_INTERSECTION`.
- `content/experimental/phase-10/phase-10-sample-template.json`: deterministic private sampling template for CLI smoke and report workflow.
