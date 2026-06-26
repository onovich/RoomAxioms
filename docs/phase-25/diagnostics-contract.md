# Phase 25 Authoring Diagnostics Contract

Status: Round 4 grouped diagnostics contract.
Guide: `docs/phase-25-authoring-editor-live-diagnostics-goal-mode-execution-guide.md`

`@room-axioms/authoring` now exposes `evaluateDraftDiagnostics(input)` as the
source-of-truth API for private workbench diagnostics. The web workbench should
render this report rather than reimplementing schema, solver, proof, degeneracy,
clone-risk, copy, or difficulty logic.

Browser-facing code should import the diagnostics entrypoint explicitly:

```ts
import { evaluateDraftDiagnostics } from '@room-axioms/authoring/diagnostics'
```

The package root remains available for the private CLI and maintainer workflows,
but it also exports Node/file/generator-facing commands. The `./diagnostics`
subpath is the intended workbench import surface.

## Report Shape

The report keeps raw diagnostic detail for maintainer drill-down:

- `validation`: schema, target-rules, initial satisfiability, layout count,
  proof/no-guess, record-set, difficulty review, and recommendation.
- `quality`: effective board, degeneracy gates, rule contribution, rule-family
  diversity, and explicit uncalibrated difficulty warning.
- `cloneRisk`: optional anti-clone report when comparison puzzles are provided.
- `copyWarnings`: conservative player-facing copy warnings.
- `performance`: cap and truncation warnings.

It also includes `groups`, a presentation-neutral summary layer for the workbench:

| Group | Purpose |
| --- | --- |
| `blocking-errors` | Schema and semantic blockers. |
| `correctness` | Target-rule, initial satisfiability, layout count, and record-set status. |
| `human-proof` | No-guess, human explainability, final uniqueness, and proof metrics. |
| `quality` | Degeneracy, rule contribution, rule-family diversity, and effective board. |
| `clone-risk` | Anti-clone summary, or explicit not-run info when no comparisons are supplied. |
| `difficulty` | Uncalibrated difficulty bucket and threshold hints. |
| `copy` | Internal terms, highlight-dependent scope wording, and direct safe-cell giveaway warnings. |
| `performance` | Solver cap and truncation warnings. |

Group statuses are `fail`, `warning`, `pass`, `info`, or `skipped`. `fail` and
`warning` should be visually prominent in the private workbench; `skipped` means a
prior blocker prevented downstream diagnostics from running.

## Boundary

This contract is maintainer-facing. Normal player UI must not show target layouts,
forced cells, clone fingerprints, proof internals, or authoring scores.

The difficulty fields remain authoring heuristics. They are not playtest
calibration and must be labeled as uncalibrated in the workbench.
