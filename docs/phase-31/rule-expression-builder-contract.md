# Phase 31 Rule Expression Builder Contract

Status: Round 1 inventory and implementation contract.

## Current Workbench Inventory

Existing private route:

- `apps/web/src/workbench/route.ts` exposes the workbench only through
  `#authoring-workbench` or `?authoring=workbench`.
- `apps/web/src/App.tsx` keeps the normal player route separate from the lazy
  workbench route.

Existing browser-safe model:

- `apps/web/src/workbench/model.ts` imports browser-safe draft and diagnostics
  helpers from `@room-axioms/authoring/drafts` and
  `@room-axioms/authoring/diagnostics`.
- `packages/authoring/src/drafts.ts` owns schema-validated draft patching and
  deterministic JSON formatting.
- `packages/authoring/src/diagnostics.ts` owns diagnostics source of truth.

Existing editing surfaces:

- case import from shipped and selected experimental cases;
- board size and target cell kind edits;
- initial reveal toggles;
- metadata edits;
- region and anchor collection edits through JSON;
- rule presentation title/flavor edits;
- full `rules` array editing through raw JSON;
- full draft JSON import/export.

Current gap:

- rule logic is still edited primarily through raw JSON;
- presentation title/flavor can be changed independently from rule meaning;
- the workbench can show rule summaries, but it does not yet expose a typed
  rule expression model with add/remove/duplicate/reorder controls.

## Source-Of-Truth Contract

Rule logic is the source of truth.

For Phase 31 and later:

1. Authors compose rule logic through typed controls.
2. Generated readable text is derived from the structured rule expression.
3. A maintainer-only label may exist, but it must be visibly marked as a label
   and must not contradict generated rule meaning.
4. Raw JSON remains export, import, storage, fixture, and debug evidence only.
5. Raw JSON must not be the first or only way to edit rule logic.

## Builder Model Shape

The builder model should be a browser-safe authoring layer over domain rules,
not a replacement schema.

Suggested stable shape:

```ts
type RuleBuilderSupport = 'editable' | 'read-only-unsupported'

type RuleBuilderDraft = {
  id: string
  family: RuleDefinition['type']
  support: RuleBuilderSupport
  rule: RuleDefinition
  generatedTitle: string
  generatedFlavor: string
  maintainerLabel?: string
  unsupportedReason?: string
}
```

Rules imported from JSON should become `RuleBuilderDraft` items. Export should
convert `RuleBuilderDraft.rule` back to a normal schema-valid `RuleDefinition`
with deterministic generated presentation.

## Required Rule List Controls

The workbench rule list must eventually support:

- add rule;
- remove rule;
- duplicate rule;
- reorder rule;
- select rule;
- edit the selected rule through controls.

Every control must patch through the same schema-validated draft path used by
the existing workbench. If a patch fails, the previous draft must remain
unchanged and issues must be surfaced.

## Supported Rule Matrix

MVP editable in Phase 31:

| Rule family | Phase 31 support target | Notes |
| --- | --- | --- |
| `globalCount` | editable | object target, comparator, count |
| `forEachCount` | editable | subject, local scope, target, comparator, count |
| `regionCount` | editable | region selector, target, comparator, count |
| `scopeOverlapCount` | editable if time allows, otherwise read-only | left/right scope refs, mode, target, comparator, count |
| `comparativeCount` | editable if time allows, otherwise read-only | left/right scope refs, target, comparison, offset |
| `conditionalCount` | editable if time allows, otherwise read-only | condition clause and then clause |

Non-MVP or read-only unless low risk:

| Rule family | Handling |
| --- | --- |
| `lineCount` | read-only supported text; editable later if line/ray controls fit cleanly |
| `anchorCount` | read-only supported text; editable later with anchor/source controls |
| `recordSet` | read-only unsupported for normal builder editing |

Unsupported handling must be non-lossy:

- import keeps the exact rule object;
- generated text may explain the rule if supported by the text generator;
- controls are disabled with an explicit reason;
- export preserves the rule or rejects the patch before mutation;
- no unsupported rule may be silently downgraded to raw JSON edits.

## Import / Export Contract

Import:

- parse JSON through `parsePuzzleDefinition`;
- convert each rule to a builder draft;
- regenerate text from rule logic;
- flag unsupported rules read-only instead of hiding them.

Export:

- validate every builder draft as a `RuleDefinition`;
- regenerate `presentation.title` and `presentation.flavor` from rule logic
  unless an explicitly marked maintainer label is used only for internal
  display;
- patch the puzzle through `patchDraftRules`;
- run schema validation before committing the draft state.

## Diagnostics Contract

Diagnostics must continue to come from `packages/authoring`.

The workbench may:

- mark diagnostics stale after any rule builder edit;
- rerun existing diagnostics on demand;
- render returned diagnostics groups and items.

The workbench must not:

- duplicate solver, proof, degeneracy, anti-clone, or copy-warning logic;
- use player marks as facts;
- expose target/forced/candidate internals in the normal player route.

## Debug Self-Check For Builder Work

For every builder edit:

- Can the rule be understood without reading JSON?
- Does generated Chinese text match the exported rule object?
- Does import followed by export preserve schema-valid logic?
- Does an unsupported family remain explicit and non-lossy?
- Do diagnostics become stale after edit and current after rerun?

## Architecture Self-Check For Builder Work

- Domain/schema remain the rule data source of truth.
- Authoring owns browser-safe draft conversion, text generation, and
  diagnostics projection.
- Workbench renders and patches through authoring helpers.
- Player route remains unaffected.
- No content promotion is implied by workbench export.
