# Phase 10 Authoring CLI Artifact Policy

Status: Round 1 baseline
Scope: private offline maintainer tooling

## CLI Purpose

The authoring CLI is a private offline tool for maintainers. It produces evidence for planner/checker review and CI-like validation. It is not a public editor, UGC feature, backend service, or player-facing diagnostic panel.

## Required Commands

The Phase 10 target command set is:

- `validate <case.json>`
- `score <case.json>`
- `minimize <case.json>`
- `sample --seed <seed> --template <template.json>`
- `report <case.json>`

Each command should consume public package APIs rather than copying schema, solver, proof, or generator semantics.

## Output Modes

Every command should support machine-readable JSON output internally. Human-readable text or markdown output may wrap the same structured report.

Report fields should include:

- puzzle id and source path;
- schema parse status and diagnostics;
- target rule satisfaction status;
- initial satisfiability status;
- final guest-layout uniqueness status;
- proof/no-guess status;
- solver cap and truncation status;
- proof metrics and technique ids;
- provisional difficulty metrics with `calibratedWithRealPlaytest: false`;
- recommendation for planner/checker review.

## Report-Only Default

Commands must not mutate source case JSON by default.

Allowed default destinations:

- stdout;
- an explicit output path supplied by the maintainer;
- an experimental report folder that is not imported by the web app.

Forbidden default destinations:

- `content/cases`;
- `apps/web/src/content/cases.ts`;
- `apps/web/dist`;
- any generated file that is automatically bundled into the player selector.

## Experimental Fixture Policy

Experimental Phase 10 fixtures should live outside shipped content, preferably under:

```text
content/experimental/phase-10/
```

They must be labeled as experimental and must not appear in:

- `content/cases`;
- `apps/web/src/content/cases.ts`;
- `caseSummaries`;
- `getDefaultCase()`;
- any player-facing selector.

Promotion requires a later planner/checker decision after validation, runtime loading checks, accessibility smoke where applicable, and release posture review.

## Command-Specific Notes

`validate`:

- returns pass/fail without modifying the input file;
- reports schema, solver, proof, uniqueness, and cap status.

`report`:

- combines validation, proof, and difficulty evidence into one planner-readable bundle.

`score`:

- preserves the uncalibrated difficulty caveat;
- does not write public difficulty labels.

`minimize`:

- reports a proposed reveal set and per-cell reasons;
- does not overwrite `initialReveals` unless a future explicit option is scoped and tested.

`sample`:

- requires an explicit seed;
- records accepted candidates and rejection reasons;
- keeps generated candidates experimental and unpromoted.

## Boundary Scans

Final Phase 10 validation should include scans proving:

- `@room-axioms/authoring` is not imported by `apps/web`, `content/cases`, domain, schema, solver, proof, or generator;
- `@room-axioms/generator` and experimental fixture paths are not imported by the default web selector;
- no command output is checked into shipped content accidentally.
