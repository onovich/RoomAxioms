# Phase 16 Issue Register

Status: Round 1 baseline

## Active Issues

### P16-001 Case-012 Release QA Must Stay Narrow

Phase 16 is a release QA and calibration-prep phase for the already promoted `case-012`.

Gate:

- no new cases;
- no new proof techniques;
- no new DSL/schema semantics;
- no solver rewrite;
- no broad UI redesign.

Disposition:

- open as a scope guard.

### P16-002 Case-012 Difficulty Is Not Playtest-Calibrated

Authoring score is internal only. Public difficulty calibration must remain deferred unless real participant evidence is recorded.

Gate:

- keep `calibratedWithRealPlaytest: false`;
- record no participant data unless a real session occurs;
- do not infer player difficulty from authoring score alone.

Disposition:

- open as a playtest honesty guard.

### P16-003 Player Secrecy Must Hold For Case-012

Case-012 has a proof-backed retained-difference solution, but player mode must not expose target cells, candidate counts, forced cells, generator internals, authoring diagnostics, or developer-only proof data.

Gate:

- selector summaries expose only safe summary fields;
- player runtime omits forced/candidate/developer diagnostics;
- wrong or incomplete submission feedback does not reveal target guests;
- target reads stay behind the established targetAccess, verification, tests, conclusion checking, and developer overlay boundaries.

Disposition:

- runtime, hint, and submission secrecy evidence recorded in Round 3;
- smoke evidence recorded in Round 4.

## P0/P1 Defects

None found in Round 1.

## P2 Follow-Ups

### P16-004 Case Title Used Internal Technique Language

Severity: P2 copy readability.

Round 2 finding:

- `走廊差集` was accurate to the retained proof technique but too close to internal reasoning terminology for player-facing copy.

Action:

- changed `case-012` title and case name to `走廊缺口`;
- left all mechanics, rules, target cells, and initial observations unchanged.

Status: resolved in Round 2.
