# Phase 39 - Player Shell Visual QA And Asset Intake Readiness Final Report

Status: READY_FOR_CHECK
Implementation commit: `f285e64df221c2cadd45c606bdc0a2789cfb0654`
Final report commit: pending
Push: `origin/main`
Pages: latest observed final-report predecessor run pending at report creation; previous run `28551401847` PASS

## Summary

- Completed visual QA for the production player shell while preserving the fixed
  1920x1080 design canvas and 16:9 proportional scaling.
- Kept the production route wired to real `useRoomAxiomsGame` data and existing
  player components.
- Fixed non-final-art-dependent player shell issues in board containment,
  evidence density, panel scrolling/focus, and VN persistent overlay geometry.
- Produced the visual delta report and final art asset intake checklist.
- Preserved ordinary Hint removal, dev gating, and player secrecy boundaries.

## Visual Delta

- P0: none remaining.
- P1 fixed: 3x3/4x4/5x5 board containment, evidence column width, rule/record
  internal scrolling, panel focus visibility, VN zero-width stage collapse,
  detached dialogue-card geometry, and idle VN click-through.
- P1 waiting for final art: final portrait/dialogue composition polish after
  approved busts and dialogue frame art are available.
- P2 waiting for final art: paper texture, nine-slice frames, rule icons,
  object/cell artwork, dialogue frame, portrait/expression variants, optional
  background/scene-map texture, and future sound slots.

## Implemented Fixes

- `apps/web/src/view/components/BoardPanel.tsx`: added bounded per-board cell
  sizing so current 3x3 through 5x5 cases remain inside the map stage.
- `apps/web/src/App.css`: widened the evidence panel, stabilized rule/record
  scrolling, added local focus treatment, anchored the VN slot stage, made the
  active VN dialogue a grounded bottom band, and made idle VN body click-through.
- `apps/web/src/theme/assetManifest.ts`: completed source/license/dimension
  metadata for current Figma shell `userProvided` assets without marking them
  final approved.
- `apps/web/src/theme/assetReview.test.ts`: added a default manifest intake gate.

## Asset Intake Readiness

- Visual delta report: `docs/phase-39-player-shell-visual-delta-report.md`
- Final art checklist:
  `docs/phase-39-final-art-asset-intake-checklist.md`
- Manifest approved asset count: `0`
- Current temporary/userProvided assets remain non-final.
- Final art replacement must pass source/license/dimension/player-safety review
  before any manifest entry becomes `approved`.

## Validation

- `pnpm --filter @room-axioms/web test -- assetReview assetManifest`: PASS
- `pnpm --filter @room-axioms/web lint`: PASS
- `pnpm --filter @room-axioms/web typecheck`: PASS
- `pnpm --filter @room-axioms/web test`: PASS, 30 files / 185 tests
- `pnpm --filter @room-axioms/web build`: PASS
- `git diff --check`: PASS
- `CommitAndPush.cmd`: PASS on every committed round
- `Validate.cmd`: PASS
- `Smoke.cmd`: PASS, local HTTP 200 at `http://127.0.0.1:5173/RoomAxioms/`

## Browser Evidence

Final viewport smoke screenshots:

- `tmp/phase39-final-1920x1080.png`
- `tmp/phase39-final-1366x768.png`
- `tmp/phase39-final-2560x1080.png`
- `tmp/phase39-final-1920x1440.png`
- `tmp/phase39-final-390x844.png`

Final viewport measurements:

| Viewport | Canvas box | Aspect | Margin behavior | Secrecy/dev hits |
| --- | ---: | ---: | --- | --- |
| 1920x1080 | 1920x1080 | 1.777778 | none | none |
| 1366x768 | 1365.333x768 | 1.777778 | subpixel horizontal centering | none |
| 2560x1080 | 1920x1080 | 1.777778 | 320px pillarbox left/right | none |
| 1920x1440 | 1920x1080 | 1.777778 | 180px letterbox top/bottom | none |
| 390x844 | 390x219.375 | 1.777778 | 312.313px letterbox top/bottom | none |

Additional browser checks:

- Replacement character count: `0`
- Developer panel count on ordinary player route: `0`
- Target/dev spoiler class count: `0`
- Ordinary Hint / partner review product entry hits: none
- Board gridcells on default case: `16`
- VN dialogue width at baseline: `1081px`
- Idle VN body click-through: PASS
- Keyboard ArrowRight from `A1` to `B1`: PASS

## Boundary Scans

- Editor/workbench untouched.
- No solver/proof/schema/domain semantic changes.
- No case promotion or content production.
- No ordinary Hint product entry restored.
- No static Figma prototype data used as production game data.
- No final-art approval claims made for temporary assets.

## Caveats

- Current artwork remains temporary or placeholder. The checklist is ready for
  final art intake, but no current asset is final approved.
- The fixed 1920x1080 player shell scales proportionally on small screens; it
  remains inspectable by zooming but is not a separate mobile-native layout.
- Pages status should be rechecked after the final report commit completes its
  GitHub Pages run.

## Next

- Planner/checker should review this final report, the visual delta report, and
  the asset intake checklist.
- After final art is provided, replace manifest slots in small batches and rerun
  the listed validation and browser smoke.
