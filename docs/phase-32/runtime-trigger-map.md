# Phase 32 Runtime Trigger Map

Status: implementation contract for the Theme VN runtime foundation.

This phase adds a presentation-only VN layer around the existing Room Axioms
player runtime. The puzzle state, solver/proof state, target data, marks,
observations, and conclusion checks remain owned by the current game hook and
package APIs.

## Current Player Runtime Surface

The normal player route is:

- `apps/web/src/view/screens/RoomAxiomsScreen.tsx`
- `apps/web/src/hooks/useRoomAxiomsGame.ts`
- `apps/web/src/view/components/TopBar.tsx`
- `apps/web/src/view/components/RulePanel.tsx`
- `apps/web/src/view/components/BoardPanel.tsx`
- `apps/web/src/view/components/EvidencePanel.tsx`
- `apps/web/src/view/components/Dialogs.tsx`

`RoomAxiomsScreen` remounts `RoomAxiomsCaseView` with `key={puzzle.id}` when
the selected case changes. `useRoomAxiomsGame` owns the active puzzle state and
already exposes the existing interaction actions used by the UI.

Relevant existing trigger points:

- Case load: `RoomAxiomsCaseView` receives a new `puzzle`.
- Rule selection: `game.selectRule(ruleId)`.
- Cell investigation: `game.handleCell(cellId)` delegates to inspection when
  the active tool is `inspect`.
- Player marking: `game.handleCell(cellId)` and `game.cycleMark(cellId)` may
  produce a player mark.
- Hint request: `game.requestHint()` creates a `Hint` from the current runtime
  proof-backed analysis result.
- Result: `game.result` becomes `success` or `failure`.
- Reset: `game.reset()` clears revealed state, marks, selected rule, hint,
  result, failure state, and status text.
- Keyboard: existing shortcuts include `h` for hint and `Escape` for closing
  hint/result/selection.

## Allowed VN Triggers

The VN layer may open or queue a scene for these categories:

- `caseIntro`: once per case load, if the dialogue setting is enabled.
- `firstRuleSelect`: once after the first rule selection in the current case.
- `firstSafeInspect`: once after a safe player inspection has completed.
- `firstAnomalyMark`: once after the player first marks a cell as a suspected
  visitor/anomaly.
- `hint`: only after the existing proof-backed hint payload exists.
- `failure`: only after the existing failure result payload exists.
- `success`: only after the existing success result payload exists.

The first-interaction triggers are tutorial wrappers. They must never become
required puzzle information. A player who closes or disables dialogue must have
the same puzzle facts available from rules, board state, evidence, and hints.

## Reset And Case-Switch Behavior

Dialogue state must reset when:

- the selected case changes;
- `game.reset()` runs;
- the user closes/skips the active dialogue;
- the existing result dialog is closed or the case is restarted.

Per-case "already shown" trigger state must not leak across cases. A case
switch can show the new case intro but must not replay prior case tutorial
state.

## Interaction Rules

Dialogue presentation may:

- pause visual focus while it is open;
- advance through lines by button, click, Enter, or Space;
- close or skip without mutating puzzle facts;
- wrap existing hint/result copy with additional neutral scene flavor.

Dialogue presentation must not:

- inspect a cell;
- set or clear a player mark;
- select a rule as a hidden side effect;
- read hidden target facts outside existing allowed boundaries;
- run solver/proof queries directly;
- infer new clue text from candidates, forced cells, no-guess traces, or target
  answer facts.

## Implementation Notes

The narrow implementation target is a browser-safe VN module under
`apps/web/src/vn` plus a browser-safe theme module under `apps/web/src/theme`.
The game hook can expose dialogue state/actions only if those additions remain
presentation-only and the existing puzzle actions continue to be the only way
to change player-visible puzzle state.

