# Phase 8 Browser Smoke Report

Status: PASS
Phase: Phase 8 - Release QA And Playtest Loop
Date: 2026-06-24
Local URL: `http://127.0.0.1:5173/RoomAxioms/`

## Scope

This report records focused browser QA for the release-candidate MVP:

- default case loading,
- 10-case selector behavior,
- keyboard navigation,
- player-mode secrecy,
- responsive containment,
- developer gating,
- console error scan.

The browser smoke used the in-app browser against the local Vite dev server started by `StartDevServer.cmd`; the server was stopped by `StopDevServer.cmd` after the run.

## Desktop Smoke

Viewport target: `1280x800`.
Observed browser viewport: `1280x720`.

| Check | Result |
| --- | --- |
| Page title | `房间公理 · Room Axioms` |
| URL | `http://127.0.0.1:5173/RoomAxioms/` |
| Default case | `case-004` |
| Default case label | `案卷 04 · 客房清扫记录` |
| Case selector options | 10 |
| Board role | `grid` |
| Default board | 4 rows x 4 columns, 16 cells |
| Player leak selectors | `.dev-safe: 0`, `.dev-guest: 0`, `.target-spoiler: 0` |
| Player forced/target copy | absent |
| Console errors | 0 |

Switching the selector to `case-001` loaded `Case 01 - Last Door` with a 3 x 3 board and 9 cells.

Keyboard smoke:

- Focus path: `A1` + `ArrowRight`.
- Result: focus moved to `B1`.
- Active label: `B1，已揭示，空地`.

## Responsive Smoke

| Viewport | Result |
| --- | --- |
| 768x1024 | PASS: no horizontal overflow, 10 case options, 4x4 board, mobile tabs visible, player leak selectors all 0. |
| 390x844 board tab | PASS: no horizontal overflow, 10 case options, 4x4 board, mobile tabs visible, player leak selectors all 0. |
| 390x844 evidence tab | PASS: no horizontal overflow, submit button visible and contained, player leak selectors all 0. |

Mobile evidence-tab submit button bounds at 390 px viewport:

- width: 332 px
- x: 29 px

## Developer Gating

| State | Developer panel | Runtime inspector | Dev forced-safe markers | Target spoilers |
| --- | ---: | ---: | ---: | ---: |
| Player mode | 0 | 0 | 0 | 0 |
| Dev mode enabled | 1 | 1 | 7 | 0 |
| Dev mode + explicit target overlay | 1 | 1 | 7 | 13 |

Result: PASS.

Developer diagnostics are absent in player mode. Forced-cell diagnostics appear only after enabling developer mode. Target spoilers remain hidden until the explicit target overlay toggle is enabled.

## Findings

No P0 or P1 browser release defect was found in this round.

The long-term multi-browser Playwright gate remains deferred according to `docs/phase-8-browser-e2e-posture.md`.
