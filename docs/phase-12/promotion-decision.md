# Phase 12 Promotion Decision

Status: Round 9 decision

## Candidate Reviewed

Candidate:

```text
content/experimental/phase-12/phase-12-local-scope-difference-001.json
```

Mechanical evidence:

- Authoring `report`: `ok: true`.
- Authoring `score`: `ok: true`, score `9.73`, provisional band `2`.
- Authoring `minimize`: `ok: true`, report-only.
- Schema issues: `0`.
- Target rules: pass.
- Initial satisfiable: pass.
- Initial guest layouts: `2`, no truncation.
- Proof/no-guess: pass.
- Final guest cells: `C2`, `B3`.
- Technique ids: `LOCAL_SCOPE_DIFFERENCE`, `LOCAL_SCOPE_INTERSECTION`.

## Decision

Do not promote a Phase 12 shipped case in Round 9.

Reasons:

- The candidate is mechanically valid but scores as provisional band `2`, below the prior mid-band promotion target used for shipped expansion.
- The authoring minimizer proposes a two-reveal version that stays no-guess but drops `LOCAL_SCOPE_DIFFERENCE`, so the fixture's current reveal set is intentionally technique-preserving rather than naturally minimal.
- No real playtest evidence exists for public difficulty calibration.
- The existing 11 shipped cases and default `case-004` remain stable.
- Experimental evidence is sufficient for Phase 12 proof validation without adding a low-band case to the player selector.

## Boundary Result

- `content/cases` remains unchanged in Round 9.
- `apps/web/src/content/cases.ts` remains unchanged in Round 9.
- `case-004` remains default.
- `phase-12-local-scope-difference-001` remains private experimental content until planner/checker explicitly accepts promotion later.

