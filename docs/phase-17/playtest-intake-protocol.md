# Phase 17 MVP Playtest Intake Protocol

Status: prepared
Scope: future real participant intake for the 12-case MVP release candidate

## Session Setup

- Use the shipped web app, not local authoring or generator tools.
- Start on the default case and confirm it is `case-004`.
- Ask the participant to choose cases through the visible selector.
- Keep developer mode, target overlays, authoring reports, generator output, forced-cell lists, candidate diagnostics, and proof internals hidden from the participant.
- Record only what a participant actually does or says.
- Use anonymized participant labels such as `P1`, `P2`, and `P3`.

## Suggested Case Flow

1. Confirm the app opens and `case-004` is the default case.
2. Ask the participant to solve `case-004` as the baseline.
3. Ask the participant to try one earlier tutorial-style case if they need orientation.
4. Ask the participant to try `case-011` or `case-012` as a mid-band case.
5. Ask the participant to submit a final guest layout.
6. Ask whether they used a hint and whether the hint felt like a human reasoning step.

## Observation Checklist

- Was the case selector understandable?
- Did the player understand that rules are fixed public axioms?
- Did any rule copy feel too technical or ambiguous?
- Did board investigation, notes, and answer submission feel clear?
- Did the player encounter any keyboard, mobile, or layout blocker?
- Did any normal player path reveal target cells, forced cells, candidate counts, generator data, authoring diagnostics, or proof internals?
- Which case felt too easy, too hard, or unclear?
- Which moment caused the most hesitation?

## Feedback Triage

- P0: hidden answer/internal data exposed, release cannot load, or a shipped case is invalid.
- P1: core player path blocked, final answer path broken, local/online smoke fails, or a shipped case cannot be completed.
- P2: wording, difficulty, onboarding, hint clarity, accessibility polish, or content pacing issue that does not block release.

## Recording Rules

- Record only real participant feedback.
- Do not infer participant results from maintainers, automated authoring scores, solver metrics, or proof metrics.
- Keep public difficulty calibration deferred until multiple real sessions are recorded and reviewed.
- If no participant session occurs, record that explicitly.
- If a participant reports a P0/P1 issue, preserve the exact reproduction notes and route it before claiming release readiness.
