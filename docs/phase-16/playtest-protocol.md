# Phase 16 Case-012 Playtest Protocol

Status: prepared
Scope: case-012 release QA and calibration prep

## Cases

- Default baseline: `case-004`
- Existing promoted reference: `case-011`
- Phase 16 focus: `case-012`

## Session Setup

- Use the shipped web app.
- Start on default `case-004`.
- Ask the participant to use the selector to choose `case-012`.
- Do not show developer mode, target overlay, authoring reports, generator output, forced cells, candidate diagnostics, or proof internals.
- The facilitator may record timestamps and observations, but must not reveal hidden target cells or solver/proof internals.
- If a participant asks for help, prefer asking what rule they are considering before giving any hint.

## Tasks

1. Open the app and confirm `case-004` is the default case.
2. Use the selector to choose `case-012`.
3. Read the visible rules.
4. Investigate cells until enough public facts are visible.
5. Ask for at most one hint if blocked.
6. Mark the final guest cells.
7. Submit the answer.
8. Report where wording, hint, board interaction, keyboard flow, or mobile layout felt unclear.

## Questions

- Was the case selector understandable?
- Did `客房 12：走廊缺口` feel like a readable case title?
- Did the rule copy explain the constraints without sounding technical?
- Did the hint explain a human step without feeling like a solver trace?
- Did any UI reveal target cells, forced cells, candidate counts, generator data, authoring diagnostics, or proof internals?
- Was keyboard or mobile navigation blocked anywhere?
- Did `case-012` feel easier, similar, or harder than `case-004` and `case-011`?
- Which rule or moment caused the most hesitation?

## Recording Rules

- Record only real participant feedback.
- Do not infer difficulty calibration from maintainers, automated scores, or solver/proof metrics.
- Keep `calibratedWithRealPlaytest: false` until real playtest evidence is recorded and accepted.
- Use anonymized participant labels such as `P1`, `P2`.
- If no participant session occurs, record that explicitly instead of inventing results.
