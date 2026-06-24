# Phase 11 Playtest Protocol

Status: prepared
Scope: promoted Phase 11 content

## Cases

- Default baseline: `case-004`
- Promoted case: `case-011`

## Session Setup

- Use the shipped web app.
- Start on default `case-004`; then select `case-011`.
- Do not show developer mode, target overlay, authoring reports, generator output, forced cells, or candidate diagnostics to participants.
- The facilitator may record timestamps and observations, but must not reveal hidden target cells or solver/proof internals.

## Tasks

1. Open the app and confirm `case-004` is the default case.
2. Use the selector to choose `case-011`.
3. Read the visible rules.
4. Investigate cells until enough public facts are visible.
5. Ask for at most one hint if blocked.
6. Mark the final guest cell or cells.
7. Submit the answer.
8. Report where wording, hint, or board interaction felt unclear.

## Questions

- Was the case selector understandable?
- Did the rules use player-readable language?
- Did the hint explain a human step without feeling like a solver trace?
- Did any UI reveal target cells, forced cells, candidate counts, generator data, or authoring diagnostics?
- Was keyboard or mobile navigation blocked anywhere?
- Was `case-011` easier, similar, or harder than `case-004`?

## Recording Rules

- Record only real participant feedback.
- Do not infer difficulty calibration from maintainers or automated scores.
- Keep `calibratedWithRealPlaytest: false` until real playtest evidence is recorded and accepted.
- Use anonymized participant labels such as `P1`, `P2`.
