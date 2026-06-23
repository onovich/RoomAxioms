# Phase 8 Playtest Protocol

Status: ready for real participants
Phase: Phase 8 - Release QA And Playtest Loop
Created: 2026-06-24

## Purpose

Run a first MVP release-candidate playtest with 5 to 10 target players. The goal is to evaluate comprehension, flow, and friction, not to prove solver correctness. Solver correctness is already covered by automated schema, solver, proof, no-guess, uniqueness, runtime, smoke, and performance checks.

## Participants

Target 5 to 10 players who:

- can read the current UI language well enough to parse rules and feedback,
- have some patience for logic puzzles or deduction games,
- are not maintainers of the implementation,
- can spend 15 to 25 minutes on a browser session.

Avoid coaching participants through the intended proof chain. Assistance should be limited to explaining the controls if they cannot find a button.

## Test Build

Use the current GitHub Pages release URL after Phase 8 final deployment is green:

```text
https://onovich.github.io/RoomAxioms/
```

Record the exact commit hash and Pages workflow run id in the feedback log before each session.

## Session Script

1. Ask the participant to open the release URL.
2. Ask them to solve at least one 3x3 case and then `case-004`.
3. Ask them to think aloud when a rule, label, control, or hint is confusing.
4. Do not reveal target cells, proof internals, forced cells, or developer mode.
5. If they get stuck for more than 2 minutes, ask what they believe the next useful action is before suggesting the hint button.
6. After completion or abandonment, ask the post-session questions below.

## Required Observations

Record these without interpretation:

- browser and device class,
- selected cases and order,
- whether the participant completed each case,
- time to first intentional investigation,
- time to first mark,
- time to first hint, if any,
- wrong submission count,
- investigation of a guest cell, if any,
- visible confusion points,
- exact participant quotes when useful and consented.

## Post-Session Questions

Ask these questions in plain language:

1. What did you think the goal was?
2. Which rule or UI label was hardest to understand?
3. Did you understand that local rules are one-way constraints?
4. Did the edge/corner neighborhood behavior make sense?
5. Did hints feel useful, too revealing, or too vague?
6. Did marking guest/safe cells feel different from revealing facts?
7. Was anything visually cramped or hard to click?
8. Would you play another room after this one?

## Severity Rubric

Use the following release triage:

| Severity | Definition | Expected action |
| --- | --- | --- |
| P0 | Prevents loading, playing, or completing a validated case for multiple participants. | Stop release and fix before public sharing. |
| P1 | Causes repeated misunderstanding of core mechanics, secrecy, controls, or completion. | Fix before broad release, or explicitly accept with planner approval. |
| P2 | Minor copy, pacing, visual, or preference issue that does not block completion. | Log for follow-up. |
| P3 | Nice-to-have or future content/generator/editor request. | Defer. |

## Guardrails

- Do not fabricate participant results.
- Do not infer success from automated tests alone.
- Do not change cases, rules, or DSL during the session.
- Do not enable developer mode for participants.
- Do not treat player marks as facts when interpreting feedback.
- Preserve screenshots or recordings only with participant consent.
