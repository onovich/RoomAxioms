# Phase 18 Public Tester Instructions

Status: ready for real public playtest intake

## Build Links

- Primary URL: `http://blog.onovich.com/RoomAxioms/`
- GitHub Pages URL: `https://onovich.github.io/RoomAxioms/`

Use the hosted build. Do not use local authoring tools, generator output, developer overlays, target data, or internal reports during a participant session.

## Before You Start

- This is an MVP release candidate for playtesting.
- Difficulty labels are provisional and not playtest-calibrated.
- The build currently ships 12 cases, `case-001` through `case-012`.
- The default first case should be `case-004`.
- Please report exact confusing moments rather than trying to give a polished review.

## Suggested Play Flow

1. Open the hosted build and confirm the first case is `case-004`.
2. Try solving `case-004` without developer tools or target overlays.
3. If the basic flow is unclear, try an earlier tutorial-style case from the selector.
4. Try either `case-011` or `case-012` after learning the basics.
5. Use at most one hint when stuck, then note whether the hint felt readable.
6. Submit your final guest layout and note whether the result felt fair.

## What To Report

- Rule wording that felt unclear, overly technical, or contradictory.
- Board, notes, hint, selector, or submit interactions that caused hesitation.
- Any keyboard, screen-reader, mobile, or responsive layout blocker.
- Any case that felt too easy, too hard, or unclear.
- Any moment that appeared to reveal hidden target cells, forced cells, candidate counts, proof internals, generator data, or authoring diagnostics.
- Browser, device, screen size, and rough reproduction steps for bugs.

## What Is Intentionally Out Of Scope

- Public editor or user-generated content.
- Backend, accounts, analytics, leaderboard, daily challenge, or cloud save.
- New cases, new rule semantics, solver changes, or broad visual redesign.
- Public difficulty calibration claims before real participant evidence exists.

## Reporting Severity

- P0: hidden answer/internal data is exposed, the release cannot load, or a shipped case is invalid.
- P1: a core player path is blocked, final submission is broken, local/online smoke fails, or a shipped case cannot be completed.
- P2: wording, difficulty, onboarding, hint clarity, accessibility polish, or pacing feedback that does not block play.

Use [`feedback-template.md`](feedback-template.md) for session notes.
