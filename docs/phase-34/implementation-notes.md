# Phase 34 Implementation Notes

Date: 2026-06-28
Status: active executor notes

## Required Context Read

- `docs/phase-34-unregistered-scene-frontend-adaptation-goal-mode-execution-guide.md`
- `docs/ui-art-sample-frontend-adaptation-requirements.md`
- `docs/unregistered-scene-ui-requirements.md`
- `docs/未登记现场_项目设定与玩法对接文档.md`
- `docs/phase-31/theme-packaging-workflow.md`
- `docs/phase-32/asset-manifest-contract.md`
- `docs/phase-32/presentation-secrecy-rules.md`
- `docs/phase-33/vn-ux-contract.md`
- `docs/phase-33/asset-review-checklist.md`
- `images/samples/main-sample.png`
- `images/samples/30083e07-bdf2-4a00-9168-320b18109a96 (1).png`
- `images/samples/93d91dda-c153-438e-8916-6c90653a26a7.png`

The sample images are local working context only. Do not stage or commit raw
sample assets.

## Visual Direction From Samples

- Primary direction: paper survey workstation, dark navy ink linework, restrained
  red anomaly accents, thin panel frames, CAD/fire-escape scene map, left rules,
  center map, right record log/marks/submit, bottom partner-review VN dock.
- Chinese/localization sample: use for final player-facing terms, button labels,
  shortcut hints, and record/log wording.
- Secondary sample: heavier archive texture and darker VN band are useful only
  as optional detail; do not override the main sample's bright paper surface.

## Current Web Structure Inventory

- `RoomAxiomsScreen.tsx`: selects case and renders topbar, rules, board,
  evidence, mobile tabs, dialogs.
- `TopBar.tsx`: brand, case picker, progress, VN preferences, hint, reset.
- `RulePanel.tsx`: rule list and selection using generated `rulePlainText`.
- `BoardPanel.tsx`: coordinate grid, cell buttons, tool row, status strip,
  developer-only overlays gated by `game.devMode`.
- `EvidencePanel.tsx`: revealed facts, player marks, developer inspector, submit.
- `Dialogs.tsx`: full VN overlay plus hint/result dialogs.
- `VNDialogueOverlay.tsx`: full modal VN scene renderer with preferences.
- `theme/assetManifest.ts`: browser-safe asset manifest and secrecy scan.
- `theme/assetReview.ts`: private maintainer review report.

## Implementation Strategy

1. Add a player-facing presentation vocabulary layer. Keep domain values stable;
   map internal `guest` to anomaly wording in normal gameplay.
2. Add scene-ready class names without rewriting the entire app shell at once:
   `scene-shell`, `scene-topbar`, `scene-brand`, `scene-case-file`,
   `scene-progress`, `scene-actions`, `scene-rules-panel`, `scene-map-panel`,
   `scene-record-panel`, `scene-vn-dock`.
3. Centralize paper/ink/red/green theme values in CSS tokens and update existing
   components to consume them.
4. Refactor board markup into explicit map layers while keeping click targets,
   keyboard navigation, and developer overlay gating intact.
5. Add rule-card mini diagram slots that visualize only public rule structure.
6. Rework record log and submit panel labels around scene survey terminology.
7. Add a docked partner-review surface for hint/tutorial dialogue while keeping
   full overlay support for blocking scenes.
8. Extend asset manifest slot kinds for future sliced art, preserving placeholder
   fallback and leak scanning.

## Guardrails

- No final art import, no AI art, no hard-pasted sample screenshot.
- No schema/domain/solver/proof/oracle/content semantic changes.
- No new rule-bearing `CellKind` values.
- No developer forced/candidate/target/proof internals in normal player route.
- Rule text stays generated from public rule semantics; highlights and mini
  diagrams are visualizations, not hidden scope definitions.

## Round 1 Self-Check

- Debug: source samples and current component layers are identified; changes can
  be localized to player presentation, theme, VN, and tests.
- Architecture: source-of-truth puzzle logic remains unchanged; sample images
  are read-only context; unrelated untracked docs and raw images remain
  unstaged.
