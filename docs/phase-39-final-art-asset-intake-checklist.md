# Phase 39 - Final Art Asset Intake Checklist

Status: Draft for final art intake
Date: 2026-07-02

This checklist records the current non-final asset slots for the production
player shell. Current `placeholder` and `userProvided` assets are not final
approved art.

Final art should be placed under `apps/web/public/theme/final/` unless product
chooses a different public asset root. After replacement, update
`apps/web/src/theme/assetManifest.ts` and, for scene shell nine-slice bundles,
`apps/web/src/theme/sceneShellAssets.ts`.

## Current Gate

- Current manifest id: `unregistered-scene-placeholder`
- Current approved asset count: `0`
- Default manifest intake issues after Round 5 metadata update: expected `0`
- Required review before approval: source, license/ownership, dimensions, player
  route safety, secrecy leak scan, browser visual smoke

## Checklist

| Asset key | Current placeholder/userProvided path | Expected final filename | Recommended size or ratio | Nine-slice | Transparent | Leak risk | Replacement validation |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `logoMark:brand-mark` | CSS/text placeholder | `logo-mark.png` | 512x512 or 1:1 | No | Yes | Low; no hidden coordinates/text | `assetManifest`, player topbar smoke |
| `paperTexture:case-paper` | CSS paper color/grid fallback | `case-paper-texture.png` | 1920x1080 tile-safe or 512x512 seamless | No | No | Low; no readable hidden text | player visual smoke all viewports |
| `panelFrame:main-panel-frame` | CSS border fallback plus `nineSliceFrame:figma-panel-box-001` | `panel-frame-*.png` bundle | 903x594 source equivalent, 36/24 CSS slice baseline | Yes | Yes | Low; no puzzle symbols/text | `sceneShellAssets`, visual smoke |
| `topbarFrame:case-topbar-frame` | CSS border fallback | `topbar-frame-*.png` bundle | 1863x84 target or scalable 9-slice | Yes | Yes | Low; no case answer text | topbar visual smoke |
| `ruleCardFrame:rule-card-frame` | CSS card border fallback | `rule-card-frame-*.png` bundle | 350x104 target or scalable 9-slice | Yes | Yes | Low; no rule answer hints | rule panel smoke |
| `boardFrame:scene-board-frame` | CSS border fallback | `board-frame-*.png` bundle | 1110x664 panel target or scalable 9-slice | Yes | Yes | Low; no coordinates beyond decorative grid | board cases 3x3/4x4/5x5 smoke |
| `boardGridTexture:scene-board-grid` | CSS grid fallback | `board-grid-texture.png` | Tile-safe 32x32, 64x64, or 1920x1080 | No | Yes preferred | Medium; no target/candidate/proof markings | board visual and secrecy smoke |
| `cellUnknownTexture:unknown-cell` | CSS unknown cell fallback | `cell-unknown.png` | 1:1, at least 128x128 | No | Yes | Low; no answer-like symbols | board cell smoke |
| `cellMarkedAnomalyOverlay:anomaly-mark-overlay` | CSS/lucide mark fallback | `cell-mark-anomaly-overlay.png` | 1:1, at least 128x128 | No | Yes | Medium; must not imply true target | mark interaction smoke |
| `cellMarkedSafeOverlay:surveyable-mark-overlay` | CSS/lucide mark fallback | `cell-mark-surveyable-overlay.png` | 1:1, at least 128x128 | No | Yes | Medium; must not imply solver certainty | mark interaction smoke |
| `scopeHighlightOverlay:scope-highlight-overlay` | CSS highlight fallback | `scope-highlight-overlay.png` | 1:1 tile or scalable overlay | No | Yes | Medium; must only show public rule scope | rule highlight smoke |
| `objectIcon:bottle-icon` | CSS/lucide bottle fallback | `object-bottle.png` | 1:1, at least 128x128 | No | Yes | Low | board object smoke |
| `objectIcon:bin-icon` | CSS/lucide bin fallback | `object-bin.png` | 1:1, at least 128x128 | No | Yes | Low | board object smoke |
| `objectIcon:mirror-icon` | CSS/lucide mirror fallback | `object-mirror.png` | 1:1, at least 128x128 | No | Yes | Low | board object smoke |
| `portrait:investigator` | `theme/portraits/phase-35/investigator-normal.png` | `portraits/investigator-normal.png` | 1086x1448 or same 543:724 ratio | No | Yes | Low; no hidden case clues in badge/text | VN active/idle smoke |
| `portrait:investigator-thinking` | `theme/portraits/phase-35/investigator-thinking.png` | `portraits/investigator-thinking.png` | 1086x1448 or same 543:724 ratio | No | Yes | Low; no hidden case clues in badge/text | VN tutorial smoke |
| `portrait:dispatcher` | `theme/portraits/phase-35/dispatcher-normal.png` | `portraits/dispatcher-normal.png` | 1086x1448 or same 543:724 ratio | No | Yes | Low; no hidden case clues in badge/text | VN active/idle smoke |
| `portrait:dispatcher-sensing` | `theme/portraits/phase-35/dispatcher-sensing.png` | `portraits/dispatcher-sensing.png` | 1086x1448 or same 543:724 ratio | No | Yes | Medium; sensing art must not expose proof internals | partner sense-rule VN smoke |
| `portrait:figma-protagonist-bust` | `figma-puzzle-prototype/protagonist-portrait.png` | `portraits/protagonist-bust.png` | 1086x1448 or same 543:724 ratio | No | Yes | Low; no hidden case clues | optional shell portrait smoke |
| `portrait:figma-assistant-bust` | `figma-puzzle-prototype/assistant-portrait.png` | `portraits/assistant-bust.png` | 1086x1448 or same 543:724 ratio | No | Yes | Medium; no proof/answer implication | optional shell portrait smoke |
| `expression:neutral` | manifest placeholder only | `expressions/neutral.png` or folded into portrait files | Match portrait pipeline | No | Yes | Low | `assetManifest`, VN smoke |
| `background:field-office` | manifest placeholder only | `backgrounds/field-office.png` | 1920x1080 | No | No | Medium; no readable answer/case spoilers | VN and secrecy smoke |
| `dialogueFrame:dialogue-default` | CSS dialogue frame fallback | `dialogue-frame-*.png` bundle | Current active band 1081x210 target or scalable 9-slice | Yes | Yes | Low; no hidden text | VN active/idle smoke |
| `nineSliceFrame:figma-panel-box-001` | `figma-puzzle-prototype/box-001-*.png` bundle | `frames/panel-box-001-*.png` bundle | 903x594 source equivalent; 36px left/right, 24px top/bottom CSS slice | Yes | Yes | Low | `sceneShellAssets`, panel smoke |
| `nineSliceFrame:figma-submit-box-002` | `figma-puzzle-prototype/box-002-*.png` bundle | `frames/submit-box-002-*.png` bundle | 900x594 source equivalent; 36px left/right, 24px top/bottom CSS slice | Yes | Yes | Low | submit frame smoke |
| `divider:figma-divider-wide` | `figma-puzzle-prototype/divider-wide.svg` | `dividers/divider-wide.svg` | 369x2 viewBox, stretchable | No | Yes | Low | panel heading smoke |
| `divider:figma-divider-side` | `figma-puzzle-prototype/divider-side.svg` | `dividers/divider-side.svg` | 214x2 viewBox, stretchable | No | Yes | Low | record panel smoke |
| `divider:figma-divider-short` | `figma-puzzle-prototype/divider-short.svg` | `dividers/divider-short.svg` | 52x2 viewBox, stretchable | No | Yes | Low | compact divider smoke |
| `ruleIcon:figma-rule-icon-exact` | `figma-puzzle-prototype/rule-exact-icon.svg` | `rule-icons/exact.svg` | 26.5x27 viewBox or 1:1 padded | No | Yes | Medium; icon must not imply hidden solution | rule panel smoke |
| `ruleIcon:figma-rule-icon-exact-alt` | `figma-puzzle-prototype/rule-exact-icon-alt.svg` | `rule-icons/exact-alt.svg` | 26.5x27 viewBox or 1:1 padded | No | Yes | Medium; icon must not imply hidden solution | rule panel smoke |
| `ruleIcon:figma-rule-icon-orthogonal` | `figma-puzzle-prototype/rule-orthogonal-icon.svg` | `rule-icons/orthogonal.svg` | 40x40 viewBox | No | Yes | Medium; public scope only | rule highlight smoke |
| `ruleIcon:figma-rule-icon-adjacent` | `figma-puzzle-prototype/rule-adjacent-icon.svg` | `rule-icons/adjacent.svg` | 40x40 viewBox | No | Yes | Medium; public scope only | rule highlight smoke |
| `buttonFrame:paper-button` | CSS button fallback | `buttons/paper-button-*.png` bundle | scalable 9-slice or 180x48 target | Yes allowed | Yes | Low | topbar/action button smoke |
| `characterPortrait:investigator` | manifest placeholder compatibility slot | `portraits/investigator-normal.png` | Same as `portrait:investigator` | No | Yes | Low | characterPortrait mapping tests |
| `characterPortrait:dispatcher` | manifest placeholder compatibility slot | `portraits/dispatcher-normal.png` | Same as `portrait:dispatcher` | No | Yes | Low | characterPortrait mapping tests |
| `characterExpression:neutral` | manifest placeholder compatibility slot | `expressions/neutral.png` or folded into portraits | Match portrait pipeline | No | Yes | Low | characterPortrait mapping tests |
| `boardTheme:current-board` | CSS board fallback | `board/current-board-theme.json` plus textures | 1920x1080 design-canvas compatible | No | Mixed | Medium; must not include target/candidate/proof terms | board smoke and secrecy scan |
| `cellIcon:current-cell-icons` | CSS/lucide fallback | `cells/current-cell-icons.json` plus icons | 1:1 icon set | No | Yes | Medium; no true-answer implication | board smoke and secrecy scan |
| `sound:*` | silent placeholder, no current entries | `sound/*.wav` or `sound/*.ogg` | Short UI SFX, normalized loudness | No | N/A | Low; no spoken spoilers | audio smoke if enabled later |

## Replacement Procedure

1. Add final files under `apps/web/public/theme/final/`.
2. Update manifest entries from `placeholder` or `userProvided` to `approved`
   only after source, license, dimensions, and player route safety are reviewed.
3. Keep `safeForPlayerRoute: true` only for assets that do not expose hidden
   answers, solver/proof internals, target/candidate states, or answer-like
   coordinates.
4. For nine-slice frames, replace the full 9-file bundle together and preserve
   compatible CSS slice values, or update `sceneShellAssets.ts` slice metadata in
   the same change.
5. Run validation after replacement:
   - `pnpm --filter @room-axioms/web test -- assetManifest assetReview`
   - `pnpm --filter @room-axioms/web lint`
   - `pnpm --filter @room-axioms/web typecheck`
   - `pnpm --filter @room-axioms/web test`
   - `pnpm --filter @room-axioms/web build`
   - Browser smoke for 1920x1080, 1366x768, 2560x1080, 1920x1440, and 390x844

## Intake Notes

- Do not use final asset filenames containing `target`, `candidate`, `forced`,
  `proof`, `solver`, `answer`, or equivalent spoiler terms.
- Do not embed answer-like coordinates or hidden solution markings in texture,
  background, icon, or portrait details.
- Current Phase 35 and Figma assets remain useful alignment references, but they
  are not final approved art.
