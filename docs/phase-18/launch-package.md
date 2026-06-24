# Phase 18 Public Playtest Launch Package

Status: public tester package drafted
Release posture: MVP release candidate for public playtest sharing

## Hosted Build

- Primary URL: `http://blog.onovich.com/RoomAxioms/`
- GitHub Pages URL: `https://onovich.github.io/RoomAxioms/`

## Short Share Copy

Room Axioms is a browser deduction prototype where the rules are public before play, the room layout is fixed, and each investigation reveals one objective fact. This public playtest build contains 12 shipped cases and is ready for feedback on clarity, reasoning flow, controls, and confusing moments.

Full share copy: [`share-copy.md`](share-copy.md).

## Required Caveat

This is a release candidate for playtesting, not a difficulty-calibrated public release. Difficulty labels and internal scores are provisional until real participant feedback is recorded and reviewed.

## What Testers Should Try

- Open the hosted build.
- Confirm the first loaded case is `case-004`.
- Try one tutorial-style case if needed.
- Try `case-011` or `case-012` after learning the basics.
- Use at most one hint if blocked, then describe whether it felt human-readable.
- Submit the final guest layout and report whether the result felt fair.

Tester-facing instructions: [`public-tester-instructions.md`](public-tester-instructions.md).

## What Feedback To Collect

- Rule wording that felt unclear or too technical.
- Board, note, hint, or submit interactions that felt confusing.
- Keyboard, mobile, or layout blockers.
- Cases that felt too easy, too hard, or unclear.
- Any moment where the UI appeared to reveal hidden target cells, forced cells, candidate counts, proof internals, generator data, or authoring diagnostics.

Feedback template: [`feedback-template.md`](feedback-template.md).
Feedback log: [`playtest-feedback-log.md`](playtest-feedback-log.md).

## What Is Out Of Scope

- Public editor or user-generated content.
- Backend, accounts, analytics, leaderboard, daily challenge, or cloud save.
- New cases, new rule semantics, or broad visual redesign.
- Public difficulty calibration claims before real feedback exists.

## Launch Checklist

- Shipped case count confirmed: 12.
- Shipped case ids confirmed: `case-001` through `case-012`.
- Default case confirmed: `case-004`.
- Metadata cleanup completed: `case-011` and `case-012` now use neutral maintainer metadata.
- Full validation and smoke evidence: recorded in [`launch-smoke-boundary-evidence.md`](launch-smoke-boundary-evidence.md).
- Buffer disposition: recorded in [`buffer-disposition.md`](buffer-disposition.md).

## Package Files

- [`public-tester-instructions.md`](public-tester-instructions.md): tester setup, case flow, and reporting expectations.
- [`feedback-template.md`](feedback-template.md): copyable report form for real sessions.
- [`share-copy.md`](share-copy.md): short and medium public sharing text.
- [`issue-triage-rules.md`](issue-triage-rules.md): maintainer severity routing.
- [`playtest-feedback-log.md`](playtest-feedback-log.md): real-feedback ledger, currently empty.
- [`launch-smoke-boundary-evidence.md`](launch-smoke-boundary-evidence.md): validation, smoke, online HTTP, and boundary scans.
- [`buffer-disposition.md`](buffer-disposition.md): Round 5 no-blocker disposition.
