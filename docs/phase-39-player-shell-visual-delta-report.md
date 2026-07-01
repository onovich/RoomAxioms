# Phase 39 - Player Shell Visual Delta Report

Status: Round 1 baseline draft
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

## Visual Delta

### P0

No P0 visual blockers found in Round 1.

The formal player route is playable, keeps the fixed 1920x1080 design canvas,
preserves 16:9 scaling, renders normal Chinese copy in Chrome, and does not show
developer-only information on the normal player route.

### P1

1. VN bottom layer has a large empty framed area behind the active dialogue box.
   The prototype reads as one grounded bottom dialogue band; production currently
   shows an unused rectangular frame plus a dialogue card shifted far to the
   right. This is fixable without final art.

2. Active VN composition lacks the balanced two-character stance from the
   prototype. The initial scene shows only the right portrait; when only one
   actor is active this can be acceptable, but the layout should still leave a
   cleaner portrait/dialogue relationship and avoid the dialogue box feeling
   detached from the main bottom band.

3. The central scene map has excess empty grid acreage while the playable 4x4
   interaction grid remains compact. This is not a data issue, but the map should
   make better use of the available panel for current 3x3 through 5x5 cases
   without changing cell ids or puzzle semantics.

4. The evidence column is visually dense and narrow. It is functionally correct,
   but the record list, marks block, and submit frame need a little more breathing
   room or better internal hierarchy.

5. Some panel interior spacing and divider rhythm differ from the prototype.
   The current production shell is consistent and readable, but rule/record panel
   whitespace can be tightened after the P1 board and VN fixes.

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

## Next

Round 2 should address P1 layout issues that do not depend on final art,
especially central board use of space, panel breathing room, and any clipping or
overflow found during the next focused browser smoke.
