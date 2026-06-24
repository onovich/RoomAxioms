# Phase 17 MVP Release Notes Draft

Status: draft for planner/checker review
Release candidate: current 12-case browser build

## What This MVP Includes

- A browser-first Room Axioms deduction game built with React, TypeScript, and Vite.
- Twelve checked-in shipped cases: `case-001` through `case-012`.
- Data-driven content loading with `case-004` preserved as the default case.
- Public rule panels, board investigation, player notes, evidence log, proof-backed hints, and final answer checking.
- Developer-only verification surfaces for maintainers.
- GitHub Pages deployment for the hosted build.

## Player Contract

- Rules are public before play.
- The room layout is fixed before the first investigation.
- Investigating a cell reveals only an objective fact.
- Player marks are notes and are not treated as solver/proof facts.
- The final guest layout must be unique for accepted shipped cases.

## Release-Candidate Caveats

- Difficulty values are internal authoring scores and rough bands, not calibrated public difficulty ratings.
- No real participant playtest feedback has been recorded for Phase 17.
- The MVP has no public editor, user-generated content, backend, analytics, daily challenge, account system, leaderboard, or persistent cloud save.
- Developer verification tools exist for maintainers but are not part of the normal player contract.

## Current Release Posture

This build is suitable as an MVP release candidate for planner/checker acceptance and future real playtest intake. It should not be described as playtest-calibrated until real participant evidence is recorded and accepted.
