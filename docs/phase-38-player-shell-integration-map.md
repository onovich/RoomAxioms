# Phase 38 - Figma Player Shell Integration Map

Status: Round 1 inventory
Date: 2026-07-02
Owner thread: frontend_developer / 019f1d5a-6fb8-7911-9400-87b59922c00a

## Goal

Convert the temporary Figma puzzle prototype into production player-shell components while preserving the existing game runtime:

- `useRoomAxiomsGame` remains the source of player state, VN state, marks, revealed cells, selection, submit flow, and reset behavior.
- `game.puzzle` remains the source of case name, board size, rules, and board contents.
- The Figma prototype remains a visual reference route only: `/RoomAxioms/?prototype=figma-puzzle`.
- The production player route must use a 1920x1080 design canvas that scales proportionally with letterbox or pillarbox space.
- The authoring workbench/editor route is out of scope.

## Figma To Production Mapping

| Figma area | Production owner | Current source | Phase 38 target |
| --- | --- | --- | --- |
| Full paper workstation | `RoomAxiomsScreen` plus shell primitives | `.room-axioms-app`, `.app-shell`, `.scene-workstation` | Add a production 16:9 scaled player shell around the existing real components. |
| Title and case header | `TopBar` | `game.puzzle.caseName`, case selector, `game.marks`, `game.revealed`, `game.cells` | Restyle as file header with case number/name, progress stats, reset/settings, and no ordinary Hint product entry. |
| Left "scene rules" panel | `RulePanel` | `game.puzzle.rules`, `game.selectedRule`, `game.selectRule`, `rulePlainText(rule)` | Restyle with Figma paper panel, rule numbers, icon slots, and selected state while preserving rule selection/highlight behavior. |
| Center floor plan | `BoardPanel` | `game.puzzle.board`, `game.handleCell`, `game.cycleMark`, `game.highlightedCells`, keyboard navigation | Keep the real interactive grid and tools, restyled into the Figma map area with stable board geometry and accessible cells. |
| Right record/marks panel | `EvidencePanel` | `game.actionLog`, `game.marks`, `game.targetGuestCount`, `game.submitConclusion`, dev inspector gated by `game.devMode` | Restyle as registration log and player marks. Keep submit flow real and keep developer-only details hidden unless dev mode is enabled. |
| VN portraits/dialogue | `Dialogs` and `VNDialogueDock` | `game.dialogue`, `game.vnPreferences`, VN scenes from `apps/web/src/vn/` | Replace modal presentation with a persistent overlay dock that freezes/semi-transparently idles on the player shell and does not block board input outside its own controls. |
| Result feedback | `Dialogs` plus VN scenes/result state | `game.result`, success/failure dialogue scenes | Preserve success/failure scenes. Result controls may stay available, but the primary VN treatment should remain an overlay rather than a separate window. |
| Nine-slice frames | New production shell primitive | `apps/web/public/figma-puzzle-prototype/box-001-*`, `box-002-*` | Register as placeholder/user-provided theme assets and expose reusable CSS/component primitives for normal and submit panels. |
| Rule icons/dividers | Theme assets and rule icon primitive | Prototype SVGs under `apps/web/public/figma-puzzle-prototype/` | Register as non-final slots. Use rule type/scope to select icons without encoding puzzle answers. |
| Character busts | Theme asset manifest | Phase 35 portraits and Figma prototype portraits | Use manifest-resolved assets with normal/thinking/sensing/success/failure fallback states. Do not hardcode scattered paths in components. |

## Runtime Boundaries

- Do not modify solver, proof, oracle, schema, or domain semantics.
- Do not promote new cases or create production content from static Figma copy.
- Do not migrate arbitrary object rule semantics.
- Do not restore the ordinary Hint button or generic Hint product entry.
- Partner sense-rule VN may present safe, public, proof-backed reasoning already exposed through the existing VN flow, but must not leak target cells, candidate layouts, forced-cell fields, solver internals, or proof internals.
- Do not edit `apps/web/src/workbench` or authoring-only routes during this phase.

## Existing Production Anchors

- `RoomAxiomsScreen.tsx` is the route-level composition point and already holds the real `useRoomAxiomsGame(puzzle)` boundary.
- `TopBar.tsx` owns case selection, progress display, VN controls, reset, and the current ordinary hint button.
- `RulePanel.tsx` already maps real rule definitions and selected-rule behavior.
- `BoardPanel.tsx` already owns real board interactions, marks, reveal state, coordinate labels, rule highlights, and keyboard navigation.
- `EvidencePanel.tsx` already owns action log, player marks, submit flow, and developer-only inspector content.
- `Dialogs.tsx` currently renders `VNDialogueOverlay` as modal-style output and result modal output.
- `VNDialogueDock.tsx` already exists as a non-modal dock candidate and should be adapted before introducing a new VN layer from scratch.
- `theme/assetManifest.ts` already defines placeholder/user-provided/approved asset statuses and a secrecy leak scanner.

## Round Plan From This Inventory

1. Extract nine-slice, paper, divider, and rule-icon primitives while keeping the prototype route as a comparison target.
2. Wrap the production player route in a 1920x1080 scaled shell with letterbox/pillarbox behavior.
3. Move `TopBar`, `RulePanel`, `BoardPanel`, and `EvidencePanel` into the shell areas without changing their real data sources.
4. Replace modal VN rendering with a persistent overlay layer based on `VNDialogueDock`.
5. Register temporary assets through the theme manifest and keep their status non-final.
6. Run viewport, accessibility, secrecy, and workbench-boundary scans before the final report.

## Round 1 Validation Notes

- This round is documentation and boundary mapping only.
- Expected focused validation: `git diff --check`.
- No production runtime code is changed in this round.
