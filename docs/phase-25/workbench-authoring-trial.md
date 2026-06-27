# Phase 25 Workbench Authoring Trial

Status: Round 23 evidence.
Guide: `docs/phase-25-authoring-editor-live-diagnostics-goal-mode-execution-guide.md`

This trial uses the private workbench model path to repair one draft enough to
show the authoring loop, without promoting it as player-facing content.

Executable coverage lives in `apps/web/src/workbench/authoringTrial.test.ts`.

## Trial Input

Input fixture:
`content/experimental/phase-25/phase-25-singleton-region-giveaway.json`

Why this fixture:

- it has highlight-dependent/internal scope copy;
- it has a direct safe-cell giveaway;
- it is mechanically valid but degenerate;
- it is small enough for a focused workbench edit/export/diagnostics loop.

Initial workbench diagnostics:

- status: `valid-degenerate`;
- copy warnings include `COPY_INTERNAL_TERM`,
  `COPY_SCOPE_NEEDS_EXPLICIT_TEXT`, and `COPY_DIRECT_SAFE_GIVEAWAY`;
- quality degeneracy remains a hard fail.

## Workbench Edits Attempted

The trial uses the same browser-safe workbench draft model that the private
screen uses:

- scope collection edit: region title changed from internal/high-difficulty
  wording to explicit membership wording, `A1 and B1`;
- rule presentation edit: `ZR1` gets explicit text,
  `A1 and B1 contain exactly one no-guest cell.`;
- metadata edit: title/case name/difficulty/tags/notes are changed through the
  schema-validated draft patch path;
- export check: draft exports as
  `phase-25-singleton-region-giveaway-workbench-draft.json`.

The exported draft is not checked into `content/cases` and is not added to the
player selector.

## Result

The workbench made these issues easier to fix:

- scope membership no longer depends on a hidden highlight;
- the abstract/internal region label is removed;
- the rule has explicit player-readable text;
- metadata can mark the draft as a low-difficulty private trial rather than a
  target-4 candidate.

The workbench still correctly refuses to bless the draft:

- status remains `valid-degenerate`;
- quality degeneracy remains `fail`;
- `COPY_DIRECT_SAFE_GIVEAWAY` remains, because the rule still directly gives a
  safe/no-guest cell through a tiny scope;
- the draft is useful evidence for authoring workflow, not a promotion
  candidate.

## Limitation Exposed

This trial confirms that copy repair and metadata correction are cheap inside
the workbench, but it also shows the boundary of automated repair: once the
mechanical clue itself is degenerate, the workbench can make the problem visible
but cannot turn it into a good puzzle without a human-authored rule/target
redesign.

That limitation is acceptable Phase 25 behavior. The workbench should make weak
content obvious instead of smoothing it into a false pass.
