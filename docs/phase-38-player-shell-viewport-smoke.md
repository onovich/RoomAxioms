# Phase 38 Player Shell Viewport Smoke

Date: 2026-07-02
Route: `http://127.0.0.1:5173/RoomAxioms/`
Shell selector: `[data-player-shell="fixed-16-9"]`

## Purpose

Round 11 verifies that the production player route keeps the Figma baseline as a
fixed 1920x1080 design canvas. Browser responsiveness is proportional scaling of
that canvas, not a free-flow three-column relayout.

## Browser Measurements

Measured with headless Chrome through Playwright after the local Vite dev server
reported healthy.

| Viewport | Canvas box | Scale | Aspect | Empty margin | Result |
| --- | ---: | ---: | ---: | --- | --- |
| 1920x1080 | 1920x1080 | 1.000000 | 1.777778 | none | PASS |
| 1366x768 | 1365.333x768 | 0.711111 | 1.777778 | 0.333px horizontal rounding | PASS |
| 2560x1080 | 1920x1080 | 1.000000 | 1.777778 | 320px left/right pillarbox | PASS |
| 1920x1440 | 1920x1080 | 1.000000 | 1.777778 | 180px top/bottom letterbox | PASS |
| 390x844 | 390x219.375 | 0.203125 | 1.777778 | 312.313px top/bottom letterbox | PASS |

Local screenshot evidence was captured under `tmp/`:

- `tmp/phase38-round11-1920x1080.png`
- `tmp/phase38-round11-1366x768.png`
- `tmp/phase38-round11-2560x1080.png`
- `tmp/phase38-round11-1920x1440.png`
- `tmp/phase38-round11-390x844.png`

The screenshots are local validation artifacts and are intentionally not part of
the committed product surface.

## Boundary Checks

- The route exposes `data-design-width="1920"` and `data-design-height="1080"`.
- The player shell exposes `data-player-scale` for repeatable smoke assertions.
- Non-16:9 viewports center the fixed canvas and leave empty margins instead of
  stretching the shell.
- The core shell keeps one fixed 1920x1080 workstation layout; mobile fallback is
  proportional shrinkage, not a separate responsive layout.
- The ordinary Hint product entry remained absent in all measured button text.
- The measured document size matched each viewport, so the shell did not create
  accidental page-level overflow at the required smoke sizes.
