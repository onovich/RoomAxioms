# Phase 18 Public Playtest Issue Triage Rules

Status: baseline

## Severity Levels

- P0: hidden answer, target layout, forced-cell data, candidate counts, generator output, authoring diagnostics, or proof internals are exposed to normal players; hosted build cannot load; shipped content is invalid.
- P1: a core player path is blocked; a shipped case cannot be solved/submitted; local or online smoke fails; metadata cleanup changes puzzle behavior.
- P2: wording, onboarding, hint clarity, difficulty perception, accessibility polish, release-copy clarity, or non-player-facing metadata cleanup that does not block the release candidate.

## Routing Rules

- P0/P1 findings must block release readiness until repaired and revalidated.
- P2 findings should be logged without expanding Phase 18 scope.
- Real participant feedback must be recorded as reported, with anonymized labels.
- Automated validation, authoring scores, proof metrics, and maintainer impressions are not participant feedback.

## Required Evidence For P0/P1

- URL or local environment used.
- Case id.
- Browser/device if known.
- Reproduction steps.
- Expected behavior.
- Actual behavior.
- Whether the issue exposes hidden/internal data.

## Non-Scope Guard

Do not route requests for editor, UGC, backend, analytics, daily challenge, new rules, new cases, broad redesign, GitHub Release creation, or version tagging as Phase 18 implementation unless the planner/user explicitly expands scope.
