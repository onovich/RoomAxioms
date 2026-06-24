# Phase 11 Promotion Checklist

Status: active Phase 11 evidence
Scope: candidate promotion only

## Promotion Gate

Every candidate copied into `content/cases` must pass all checks below before it is wired into `apps/web/src/content/cases.ts`.

- Puzzle Schema v1 parse passes with zero issues.
- Target layout satisfies every public rule.
- Initial observations are satisfiable.
- Initial guest-layout count finishes without cap pressure or solver truncation.
- Final guest layout is unique after the proof/no-guess chain.
- `verifyNoGuess` passes with `noGuess: true`, `humanExplainable: true`, and no proof issues.
- Authoring `report` or `validate` returns `ok: true`.
- Authoring `score` records `calibratedWithRealPlaytest: false` unless real playtest evidence exists.
- Web runtime analyzes the initial player state without warnings or errors.
- Player mode does not expose target cells, forced cells, candidate cells, no-guess internals, generator internals, or authoring diagnostics.
- Case title, case name, rule titles, and rule flavor are Chinese and player-readable.
- The case is deliberately imported from `content/cases`, not from `content/experimental`.
- `case-004` remains `DEFAULT_CASE_ID`.

## Evidence Required Per Promoted Case

- Source candidate path and promotion decision.
- Authoring `report` result.
- Authoring `score` result.
- Runtime/content verification result.
- Copy-review note.
- Playtest status: real feedback recorded, or explicit empty log.

## Rejection Reasons

Reject or defer a candidate when any of these are true:

- Validation fails or requires relaxed caps.
- The proof chain has an explanation gap or guess point.
- The puzzle is low-band or already solved by initial reveals when Phase 11 needs mid-band content.
- The puzzle depends on a deferred proof technique such as `LOCAL_SCOPE_DIFFERENCE`.
- The candidate is generated output that has not been reviewed and copied into shipped content deliberately.
- Player-facing copy is still abstract, English-only, or developer-facing.
