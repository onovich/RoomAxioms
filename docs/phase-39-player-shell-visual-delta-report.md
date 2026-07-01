# Phase 39 - Player Shell Visual Delta Report

Status: Round 4 VN overlay fix draft
Date: 2026-07-02
Routes:

- Production player: `http://127.0.0.1:5173/RoomAxioms/`
- Prototype reference: `http://127.0.0.1:5173/RoomAxioms/?prototype=figma-puzzle`

## Purpose

This report records the current production player route against the Phase 38
Figma-inspired prototype and the Unregistered Scene visual requirements. It is a
visual QA baseline for small UI fixes and final art asset intake readiness.

The production route remains the source of truth for game data and behavior. The
prototype route is used only as a visual reference.

## Screenshot Evidence

Production screenshots:

- `tmp/phase39-r1-production-1920x1080.png`
- `tmp/phase39-r1-production-1366x768.png`
- `tmp/phase39-r1-production-2560x1080.png`
- `tmp/phase39-r1-production-1920x1440.png`
- `tmp/phase39-r1-production-390x844.png`

Prototype reference screenshots:

- `tmp/phase39-r1-prototype-1920x1080.png`
- `tmp/phase39-r1-prototype-1366x768.png`
- `tmp/phase39-r1-prototype-2560x1080.png`
- `tmp/phase39-r1-prototype-1920x1440.png`
- `tmp/phase39-r1-prototype-390x844.png`

The screenshots are local evidence artifacts and are intentionally not committed
as product assets.

## Viewport Measurements

| Viewport | Production canvas | Scale | Aspect | Margin behavior | Result |
| --- | ---: | ---: | ---: | --- | --- |
| 1920x1080 | 1920x1080 | 1.000000 | 1.777778 | none | PASS |
| 1366x768 | 1365.333x768 | 0.711111 | 1.777778 | subpixel horizontal centering | PASS |
| 2560x1080 | 1920x1080 | 1.000000 | 1.777778 | 320px pillarbox left/right | PASS |
| 1920x1440 | 1920x1080 | 1.000000 | 1.777778 | 180px letterbox top/bottom | PASS |
| 390x844 | 390x219.375 | 0.203125 | 1.777778 | 312.313px letterbox top/bottom | PASS |

Production route checks:

- `data-design-width="1920"` and `data-design-height="1080"` are present.
- `data-player-scale` is present for repeatable smoke checks.
- Body text replacement character count is `0`.
- Player grid cells: `16`.
- Ordinary Hint / `搭档复核` button: absent.
- Dev inspector: absent.
- Target spoiler classes: absent.
- Production DOM overflow samples outside the 1920x1080 canvas: none.

## Round 2 Focused Board Measurements

Round 2 added focused browser checks for representative 3x3, 4x4, and 5x5
production cases after the non-art layout adjustments.

Evidence screenshots:

- `tmp/phase39-r2-board-contained-case-004-1920x1080.png`
- `tmp/phase39-r2-board-contained-case-011-1920x1080.png`
- `tmp/phase39-r2-board-contained-case-021-1920x1080.png`

Measured results at 1920x1080:

| Case | Board | Grid size | Cell size | Grid inside stage | Caption inside stage | Clipped cells |
| --- | --- | ---: | ---: | --- | --- | --- |
| `case-004` | 4x4 | 326x326 | 68x68 | PASS | PASS | none |
| `case-011` | 3x3 | 312x312 | 88x88 | PASS | PASS | none |
| `case-021` | 5x5 | 330x330 | 54x54 | PASS | PASS | none |

The evidence column production width is now `306px`, widened from the Round 1
`260px` baseline.

## Round 3 Panel Interaction Measurements

Round 3 focused on rule and record panel density, internal scrolling, and focus
visibility without changing player data or puzzle behavior.

Evidence screenshots:

- `tmp/phase39-r3-panel-scroll-focus-1920x1080.png`
- `tmp/phase39-r3-evidence-scroll-stress-1920x1080.png`

Measured results at 1920x1080:

| Check | Result |
| --- | --- |
| Canvas aspect | `1920x1080`, aspect `1.777778` |
| Rule list | `512px` client height, `672px` scroll height, internal scroll PASS |
| Record log stress | `18` entries, `187px` client height, `955px` scroll height, internal scroll PASS |
| Record log before marks section | PASS |
| Submit frame after marks section | PASS |
| Replacement character count | `0` |

## Round 4 VN Overlay Measurements

Round 4 focused on the persistent VN overlay as a frozen player-shell layer,
without changing dialogue content or game state.

Evidence screenshots:

- `tmp/phase39-r4-vn-before-1920x1080.png`
- `tmp/phase39-r4-vn-active-after-1920x1080.png`
- `tmp/phase39-r4-vn-left-line-1920x1080.png`
- `tmp/phase39-r4-vn-idle-pointer-1920x1080.png`

Measured results at 1920x1080:

| Check | Before | After |
| --- | ---: | ---: |
| VN stage width | `0px` | `1081px` |
| Active dialogue x / width | `900.5px / 760px` | `360px / 1081px` |
| Right portrait x / width | `1590.5px / 290px` | `1591px / 290px` |
| Left portrait x / width | not active in first line | `60px / 290px` |
| Idle dialogue pointer events | blocking box | `none` |
| Idle close button pointer events | available | `auto` |
| Element at idle dialogue center | dialogue box | `scene-player-canvas` |
| Canvas aspect | `1.777778` | `1.777778` |

## Visual Delta

### P0

No P0 visual blockers found in Round 1.

The formal player route is playable, keeps the fixed 1920x1080 design canvas,
preserves 16:9 scaling, renders normal Chinese copy in Chrome, and does not show
developer-only information on the normal player route.

### P1

1. VN bottom layer has a large empty framed area behind the active dialogue box.
   Round 4 resolved this by removing the focused outer-shell outline and giving
   the nested VN stage its real player-shell slot width.

2. Active VN composition lacks the balanced two-character stance from the
   prototype. Round 4 improved this by turning the dialogue card into a grounded
   bottom band and keeping left/right portraits outside the band edges. Final
   composition should still be reviewed when final bust art arrives.

3. Round 2 resolved the central board containment issue for current 3x3 through
   5x5 cases. The board now uses bounded per-board cell sizing so rows no longer
   clip into the action row, while preserving real cell ids and puzzle semantics.

4. Round 2 improved the evidence column breathing room by widening the panel.
   The record list, marks block, and submit frame still need final-art review,
   but the immediate density issue is reduced without changing production data.

5. Some panel interior spacing and divider rhythm differ from the prototype.
   Round 3 tightened the rule/record panel scroll tracks, focus visibility, and
   fixed submit-frame relationship. Remaining rhythm review should happen after
   final art replaces the temporary paper/frame assets.

### P2

1. Portraits, rule icons, frame edges, paper texture, and submit frame still use
   temporary placeholder/user-provided assets. These should wait for final cut
   art.

2. The production top bar includes real case selection and VN controls, so it is
   denser than the static prototype. Further visual simplification should wait
   until final product decisions on which controls remain visible by default.

3. The 390x844 fallback preserves the required fixed 1920x1080 canvas by
   proportional shrinkage. It is technically valid but inspection/readability is
   limited at that physical viewport size. A separate mobile presentation remains
   out of scope unless product changes the fixed-canvas requirement.

## Waiting For Final Art

- Final paper texture.
- Final normal and red nine-slice frames.
- Final rule icons and any per-rule visual glyphs.
- Final character busts and expression variants.
- Final dialogue frame/nameplate treatment.
- Final submit/action frame.
- Optional background or scene-map texture overlays.

## Round 1 Debug Self-Check

- The baseline is repeatable through Playwright screenshot and DOM measurement.
- The report separates current fixable UI issues from final-art-dependent gaps.
- No static prototype data is used as production data.

## Round 1 Architecture Self-Check

- No production code changed in this round.
- The real player route remains driven by `useRoomAxiomsGame`.
- The prototype remains a visual reference only.
- Editor/workbench and solver/proof/schema/domain surfaces were not touched.

## Round 2 Debug Self-Check

- Focused browser checks covered representative 3x3, 4x4, and 5x5 production
  cases.
- No board cells clipped or overlapped the action row after the adjustment.
- The fixed 1920x1080 canvas and 16:9 proportional scaling contract remains
  unchanged.

## Round 2 Architecture Self-Check

- Board sizing remains a view-layer adjustment in the production player shell.
- The real player route remains driven by `useRoomAxiomsGame`.
- No solver/proof/schema/domain semantics changed.
- Editor/workbench surfaces were not touched.

## Round 3 Debug Self-Check

- Focused browser checks covered normal and stressed record-log states.
- Rule and record lists now have stable internal scroll gutters and bottom
  padding so content does not disappear beneath neighboring fixed sections.
- The submit frame remains fixed after the marks section under a long record log.

## Round 3 Architecture Self-Check

- The change is CSS-only and affects the production player shell view layer.
- No component data, game state, puzzle semantics, or VN dialogue content changed.
- Editor/workbench and solver/proof/schema/domain surfaces were not touched.

## Round 4 Debug Self-Check

- Focused browser checks covered active first-line, active second-line, and idle
  VN states.
- The nested VN stage now occupies the full player-shell slot instead of
  collapsing to zero width.
- The active dialogue layer is a full-width bottom band inside the VN slot.
- Idle dialogue body now allows click-through; the close button remains
  clickable.

## Round 4 Architecture Self-Check

- The change is CSS-only and preserves the existing `VNDialogueOverlay` API.
- Onboarding/tutorial, partner sense-rule, success/failure, and protagonist
  dialogue data remain untouched.
- The real player route remains driven by `useRoomAxiomsGame`.
- Editor/workbench and solver/proof/schema/domain surfaces were not touched.

## Next

Round 5 should audit theme asset slots and manifest readiness for final art
intake without marking current temporary assets as final approved.
