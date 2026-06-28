# Phase 33 VN UX Contract

Date: 2026-06-28

This document records the Phase 33 player-facing VN behavior contract. VN and
theme systems remain presentation-only. They must never store or reveal target
answers, candidates, forced cells, solver internals, proof internals, or hidden
cell facts.

## Current Behavior Audit

- Case intro opens automatically after the player route mounts.
- First-time tutorial scenes open on first rule selection, first safe
  inspection, and first guest mark.
- Hint, failure, and success scenes wrap existing proof-backed or result data.
- The overlay can be advanced, closed, or skipped, but there is no persistent VN
  enable setting, reduced-motion preference, text-speed preference, replay
  action, or explicit focus-return contract.
- Reset currently restores puzzle state and must not make tutorial scenes feel
  like repeated onboarding spam. Explicit replay is the safe path for replaying
  the intro.

## Required Player Controls

- VN enable/disable is a harmless UI preference. When disabled, new VN scenes do
  not open and any active VN scene closes.
- Replay intro is an explicit player action. It may force-open the safe current
  case intro even if it was already shown.
- Skip closes the entire current scene, not only the current line.
- Close closes the current scene and returns focus to the last focused control
  when possible.
- Text speed and reduced-motion preferences affect presentation only. They must
  not alter puzzle state, hints, marks, inspections, or solver requests.

## Reset And Case Switch

- Reset clears stale VN overlays, hint/result overlays, marks, reveals, target
  overlays, and selected rules.
- Reset keeps first-time tutorial categories marked as seen for the current hook
  instance so tutorial scenes do not replay repeatedly after every reset.
- The current case intro is replayed only through the explicit replay action
  after reset.
- Case switch remounts the player screen for the new case and may show that
  case's intro once.

## Focus And Keyboard

- Opening a VN scene records the previously focused element.
- Closing, skipping, or finishing a VN scene tries to restore that element if it
  is still connected.
- Escape closes the active VN scene.
- Enter or Space advances the current line; if animated text is still revealing,
  it first reveals the full line.

## Copy And Secrecy

- Tutorial copy may explain controls and mood, but not answer-bearing puzzle
  facts.
- Hint dialogue may only wrap the existing proof-backed hint payload.
- Failure copy must not reveal the correct answer after a wrong inspection.
- Success copy may celebrate the solved state, but must not add new hidden facts
  beyond the player's submitted solution/result state.
