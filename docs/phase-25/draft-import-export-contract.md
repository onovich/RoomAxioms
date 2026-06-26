# Phase 25 Draft Import / Export Contract

Status: Round 6 draft-model evidence.
Guide: `docs/phase-25-authoring-editor-live-diagnostics-goal-mode-execution-guide.md`

`@room-axioms/authoring/drafts` provides the browser-safe draft-state helpers for
the private workbench. The API is deliberately in-memory and side-effect free.

## Import

Supported inputs:

- a parsed `PuzzleDefinition` via `importPuzzleToDraftState`;
- raw JSON text via `importJsonTextToDraftState`;
- an empty state via `createEmptyWorkbenchDraftState`.

Valid imports are formatted with two-space JSON and keep `lastValidPuzzle` for
diagnostics and recovery. Invalid raw JSON remains editable as raw text and does
not invent a puzzle.

## Editing State

The current first slice supports:

- replacing raw JSON text with `updateDraftJsonText`;
- selecting or clearing a cell id with `selectDraftCell`;
- selecting or clearing a rule id with `selectDraftRule`.
- resizing the board with `patchDraftBoardSize`;
- changing target cell facts with `patchDraftTargetCell`;
- toggling initial reveals with `toggleDraftInitialReveal`;
- changing title, case name, difficulty metadata, tags, author, status, and notes
  with `patchDraftMetadata`;
- changing rule title/flavor copy with `patchDraftRulePresentation`;
- replacing `allowedKinds` with `patchDraftAllowedKinds`;
- replacing named regions/scopes with `patchDraftRegions`;
- replacing anchors with `patchDraftAnchors`;
- replacing contaminated-record definitions with `patchDraftRecords`;
- replacing the rule list with `patchDraftRules`.

These helpers are immutable and DOM-free. Patch helpers validate the candidate
through Puzzle Schema v1 before returning an updated state; invalid edits return
issues and preserve the previous state. Collection helpers intentionally replace
whole collections so the first web workbench can use simple structured forms
plus raw JSON fallback without duplicating schema semantics in React.

## Export

`exportDraftJson` parses the current draft text. If valid, it returns formatted
JSON text plus the parsed puzzle. If invalid, it returns the raw text and schema
issues.

Export never writes to `content/cases`, never updates the web selector, and never
promotes experimental content. Promotion remains a deliberate repository change
with the existing schema, solver/proof, authoring, anti-clone, novelty, web, and
full-validation gates.
