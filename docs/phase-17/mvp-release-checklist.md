# Phase 17 MVP Release Checklist

Status: baseline
Release candidate: current 12-case shipped build

## Shipped Content

- Shipped case files: PASS, `content/cases/case-001.json` through `content/cases/case-012.json` are present.
- Shipped case count: PASS, 12 cases.
- Web content index: PASS, `apps/web/src/content/cases.ts` imports exactly the shipped cases in order.
- Default case: PASS, `DEFAULT_CASE_ID` remains `case-004`.
- `case-011`: PASS, remains shipped content.
- `case-012`: PASS, remains shipped content.
- Experimental content: pending Round 4 boundary scan; expected to remain outside the player-facing selector.

## Release Scope

- New cases in Phase 17: PASS, none planned or added.
- New mechanics or DSL rules in Phase 17: PASS, none planned or added.
- Solver/proof/domain/schema rewrite in Phase 17: PASS, none planned or added.
- Public editor, UGC, backend, analytics, daily challenge, or broad redesign: PASS, out of scope and not planned.

## Validation Gates

- Full local validation: pending Round 4 and Round 6.
- Focused shipped-case validation: pending Round 4 and Round 6.
- Local smoke: pending Round 4 and Round 6.
- Online HTTP smoke: pending Round 4 and Round 6.
- GitHub Pages final run: pending final push.

## Player Secrecy

- Target layout is not player-facing: pending Round 4 boundary scan.
- Forced cells, candidate counts, authoring diagnostics, generator data, and proof internals remain developer-only or private: pending Round 4 boundary scan.
- Player marks remain notes, not solver/proof facts: pending Round 4 evidence.

## Release Communication

- Release notes: PASS, `docs/phase-17/release-notes.md`.
- Known limitations: PASS, `docs/phase-17/known-limitations.md`.
- Release decision: PASS, `docs/phase-17/release-decision.md` marks the build as a release candidate with caveats.
- Playtest intake protocol: PASS, `docs/phase-17/playtest-intake-protocol.md`.
- Feedback log handling: PASS, `docs/phase-17/playtest-feedback-log.md` and `docs/phase-17/playtest-intake-handling.md`.

## Playtest Calibration

- Real participant feedback available: no.
- Public difficulty calibration: deferred.
- Internal authoring scores: allowed only as internal diagnostics, not public calibration claims.
- Fabricated feedback: prohibited.

## Baseline Evidence

Round 1 inspected shipped content and `apps/web/src/content/cases.ts`:

- files: `case-001.json` through `case-012.json`;
- count: 12;
- default: `case-004`;
- latest shipped cases: `case-011`, `case-012`.
