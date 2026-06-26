# Phase 25 Authoring Workbench Design

Status: Round 1 baseline and architecture plan.
Guide: `docs/phase-25-authoring-editor-live-diagnostics-goal-mode-execution-guide.md`

## Purpose

Phase 25 turns the Phase 24 blocker into a maintainer workflow. The project now has
stronger grammar and quality gates, but authors need a private place to edit drafts
and immediately see whether a puzzle is valid, explainable, degenerate, clone-like,
or merely machine-valid but weak.

This workbench is private maintainer tooling. It is not public UGC, not a backend,
not a daily challenge system, and not a player-facing editor.

## Current Baseline

### Authoring package

`@room-axioms/authoring` already owns the private CLI surface:

- `report` / `validate`: schema, target-rules, initial satisfiability,
  guest-layout count, no-guess proof, record-set checks, difficulty review.
- `score`: uncalibrated generator difficulty score.
- `minimize`: report-only reveal minimization and required proof-technique
  retention.
- `sample`: internal generator sampling.
- `anti-clone`: effective-board, proof-trace, candidate-shrink, rule-impact,
  degeneracy, rule-family diversity, and novelty-manifest evidence.

Important limitation: `packages/authoring/src/validation.ts` currently combines
filesystem loading with puzzle evaluation. Phase 25 should split a browser-safe,
in-memory diagnostics API from Node-only file loading.

### Web app

The normal web app currently mounts `RoomAxiomsScreen` from `App.tsx`. It has:

- data-driven shipped case loading in `apps/web/src/content/cases.ts`;
- runtime analysis and facade code in `apps/web/src/runtime`;
- player UI in `apps/web/src/view`;
- developer diagnostics gated by `game.devMode`.

The web package does not currently depend on `@room-axioms/authoring`. Adding that
dependency is acceptable only if the imported surface is browser-safe and does not
pull in Node `fs`, path resolution, generator internals, or CLI code.

## Architecture

### Source of truth

`packages/authoring` owns all workbench diagnostics. The web workbench renders
diagnostic results and manages draft state, but it must not duplicate solver, proof,
schema, anti-clone, or difficulty logic.

The intended layering is:

```text
packages/domain
  Puzzle/rule/board types and helpers

packages/schema
  parsePuzzleDefinition and static semantic diagnostics

packages/solver + packages/proof
  exact model queries and no-guess proof verification

packages/authoring
  in-memory draft diagnostics, quality gates, clone/copy/difficulty reports

apps/web
  private route/mode, editor state, rendering, import/export UI
```

### Browser-safe authoring entry

Add a new module in `packages/authoring/src`, for example:

- `diagnostics.ts`
- `drafts.ts`
- `copyWarnings.ts`

The first browser-safe API should look like:

```ts
export interface AuthoringDraftDiagnosticsInput {
  readonly draft: unknown
  readonly comparisonPuzzles?: readonly PuzzleDefinition[]
  readonly noveltyManifest?: NoveltyClaimManifest
  readonly caps?: Partial<AuthoringSolverCapsReport>
}

export interface AuthoringDraftDiagnosticsReport {
  readonly ok: boolean
  readonly status:
    | 'invalid-draft'
    | 'valid-unsatisfiable'
    | 'valid-not-unique'
    | 'valid-not-human-explainable'
    | 'valid-degenerate'
    | 'valid-review-needed'
    | 'valid-ready-for-private-review'
  readonly puzzleId?: string
  readonly schema: AuthoringCaseValidationReport['schema']
  readonly validation?: AuthoringCaseValidationReport
  readonly cloneRisk?: AntiCloneReport
  readonly copyWarnings: readonly AuthoringCopyWarning[]
  readonly performance: {
    readonly truncated: boolean
    readonly capWarnings: readonly string[]
  }
}

export function evaluateDraftDiagnostics(
  input: AuthoringDraftDiagnosticsInput,
): AuthoringDraftDiagnosticsReport
```

The function must accept JSON-like draft input directly. Node-only file reading stays
inside CLI helpers such as `loadAuthoringCase`.

### Draft state

The workbench draft model should stay serializable and testable without the DOM:

```ts
export interface WorkbenchDraftState {
  readonly jsonText: string
  readonly selectedRuleId?: string
  readonly selectedCellId?: string
  readonly lastValidPuzzle?: PuzzleDefinition
  readonly dirty: boolean
}
```

Round 6-8 should add conversion helpers for:

- import `PuzzleDefinition` or JSON text into draft state;
- patch board dimensions and cell facts;
- patch initial reveals;
- patch target guest layout and object kinds;
- patch rules and presentation copy;
- patch regions, anchors, records, and metadata;
- export deterministic JSON text.

The first implementation can use structured helpers plus raw JSON fallback. Perfect
WYSIWYG rule editing is not required in Phase 25.

## Private Web Entry

Use a route or flag that keeps normal play clean. Preferred:

- normal app: `/RoomAxioms/`
- private workbench: `/RoomAxioms/#authoring`

`App.tsx` can choose between `RoomAxiomsScreen` and a new
`AuthoringWorkbenchScreen` by reading `window.location.hash`. The normal player
screen remains the default, and no case selector item should link to the workbench.

The workbench may show technical details because it is maintainer-facing, but public
player surfaces must remain unchanged.

## Workbench Surface

The first complete workbench should use a dense, utilitarian layout:

- import panel:
  - shipped case selector;
  - experimental case selector or JSON paste area;
  - reset-to-import button.
- draft editor:
  - board dimensions;
  - cell kind grid;
  - target guest toggles;
  - initial reveal toggles;
  - metadata fields;
  - regions, anchors, records, and rule list;
  - raw JSON fallback.
- diagnostics panel:
  - blocking errors;
  - correctness;
  - human proof;
  - degeneracy;
  - clone risk;
  - rule contribution;
  - difficulty;
  - copy warnings;
  - caps/truncation.
- export panel:
  - formatted JSON text;
  - copy/download affordance;
  - "report this exported draft" instruction for maintainers.

## Diagnostics Groups

### Blocking errors

Show schema parsing errors and semantic diagnostics first. An invalid draft should not
attempt downstream solver/proof/clone analysis.

### Correctness

Show:

- target satisfies rules;
- initial satisfiability;
- initial guest-layout count and cap/truncation;
- final guest-layout uniqueness;
- record-set possible assignments when relevant.

### Human proof

Show:

- no-guess status;
- human explainability;
- wave count;
- deduction count;
- technique IDs in a technical subpanel;
- explanation-gap issue codes.

### Degeneracy and contribution

Show:

- singleton effective scopes;
- direct and near giveaways;
- trivial same-scope comparisons;
- rule-family diversity;
- material rule IDs;
- redundant-rule suspects;
- effective board and irrelevant cells.

### Clone risk

Compare the draft against the current shipped selector by default. The report should
reuse `evaluateAntiCloneReport` and novelty claims where available. The UI summary
should say "hard fail", "review needed", or "clear" instead of exposing raw
fingerprints as primary text.

### Copy warnings

Add a Phase 25 copy-warning pass in authoring. Initial warning classes:

- internal terms in visible titles/flavor, such as `anchor`, `target-4`,
  `scopeOverlapCount`, or raw technique IDs;
- labels that require highlight membership to understand the scope;
- names that state a conclusion, such as "safe area" or "empty zone";
- fixed safe-cell giveaway wording that hides direct `guest = 0` or `empty = all`;
- player-visible copy containing English terms unless intentionally part of a name.

The checker can be conservative. Warnings do not need to be perfect; they must make
uncertainty visible.

### Difficulty

Display the existing difficulty review as uncalibrated:

- recommended bucket;
- target-4 and super-hard missing criteria;
- proof waves and deductions;
- effective unknowns;
- material families;
- frontier unlocks.

Do not present authoring score as real playtest calibration.

## Bad-Case Corpus

Add private fixtures or docs under `docs/phase-25/` or
`content/experimental/phase-25/` that demonstrate these failures:

- mirror or padding clone;
- one-rule solution;
- singleton sightline or edge giveaway;
- fixed region rule that directly grants safe cells;
- highlight-dependent region label;
- player-perceived R3/R4 redundancy where automated metrics are weak.

These fixtures should be workbench evidence only. They must not enter
`content/cases` or the normal selector.

## Import / Export Policy

Imports:

- shipped cases from `content/cases`;
- selected experimental cases when explicitly chosen;
- raw JSON paste.

Exports:

- formatted JSON text;
- optional browser download;
- no automatic write into `content/cases`;
- no automatic selector update;
- no remote upload.

Promotion remains a later deliberate repo edit with report, score, anti-clone,
novelty, web tests, and full validation.

## Responsiveness

Start with synchronous diagnostics and modest caps. Add a stale-result guard in web
state:

- increment request id on every draft change;
- only render diagnostics from the latest request id;
- show "analyzing", "invalid", "truncated", and "stale" states explicitly.

If diagnostics become too slow, add debouncing or a Worker-compatible facade. Do not
hide truncation.

## Round Plan Mapping

- Rounds 3-5: split in-memory diagnostics out of file-based validation and add tests.
- Rounds 6-8: draft state, JSON import/export, deterministic formatting.
- Rounds 9-11: private `#authoring` workbench shell.
- Rounds 12-13: board, target, and reveal editing.
- Rounds 14-16: rule, region, anchor, record, metadata, and copy editing.
- Rounds 17-20: live diagnostics panel, stale handling, cap/truncation states.
- Rounds 21-22: bad-case corpus and real-case QA.
- Rounds 23-24: authoring trial; record a draft or blocker, no forced promotion.
- Round 28: final validation and report.

## Debug Self-Check

- Smallest useful slice: in-memory diagnostics over a JSON draft, before any UI.
- Failure layers are separable: parse/schema, correctness, proof, degeneracy,
  clone-risk, copy, UI state, import/export.
- Empty/invalid/stale/truncated states are named and visible.
- UI work is private and can be smoke-tested without changing player selector.
- Export does not mutate repository content.

## Architecture Self-Check

- `packages/authoring` remains the diagnostics source of truth.
- `apps/web` renders diagnostics and owns editor interaction only.
- `packages/domain` remains framework-free and dependency-clean.
- Node-only CLI file loading stays out of browser-safe diagnostics.
- Existing cases and selector remain stable.
- Experimental/bad-case fixtures stay private.
- Public UGC, backend, accounts, analytics, daily challenge, broad VN/theme work,
  and bulk content production remain out of scope.

