# Phase 19 Current Case Audit

Status: Round 1 audit complete
Phase: Phase 19 - High-Quality Puzzle Ladder And Generator Quality Gates
Observed: 2026-06-25

## Summary

The current shipped set is mechanically valid, but only three cases should remain player-facing puzzle sources without replacement work:

- `case-004`: keep/reskin as a mixed 4x4 baseline.
- `case-011`: keep/reskin as a local-scope-intersection intro.
- `case-012`: keep/reskin as a retained local-scope-difference intro.

The remaining shipped cases are valid fixtures but weak player-facing puzzles:

- `case-001` to `case-003` and `case-008` to `case-010`: opening-state trivial. Each has `initialGuestLayouts = 1`, `proofWaveCount = 0`, and `deductionCount = 0`.
- `case-005` to `case-007`: mirror/rotation variants of `case-004`. They have the same rules, initial ambiguity, deduction count, and proof techniques as `case-004`, and their metadata already identifies them as `mirror-variant`, `vertical-variant`, and `rotated-variant`.

## Commands Run

For every shipped case in `content/cases/case-001.json` through `content/cases/case-012.json`:

- `pnpm authoring -- report <case-path>`
- `pnpm authoring -- score <case-path>`

All commands completed successfully. The authoring recommendation for every case is `ready-for-experimental-review`, which means the cases are schema-valid, solver-valid, proof-valid, and unique; it does not mean they pass Phase 19 player-quality gates.

## Shipped Case Metrics

| Case | Board | Rules | Reveals | Initial guest layouts | Proof waves | Deductions | Techniques | Score | Band | Decision |
| --- | --- | ---: | ---: | ---: | ---: | ---: | --- | ---: | ---: | --- |
| `case-001` | 3x3 | 1 | 8 | 1 | 0 | 0 | none | 2.40 | 1 | Replace; demote old file to internal trivial/global-count fixture. |
| `case-002` | 3x3 | 2 | 8 | 1 | 0 | 0 | none | 2.40 | 1 | Replace; demote old file to internal opening-trivial fixture. |
| `case-003` | 3x3 | 2 | 8 | 1 | 0 | 0 | none | 2.40 | 1 | Replace; demote old file to internal opening-trivial fixture. |
| `case-004` | 4x4 | 6 | 3 | 15 | 1 | 13 | `KNOWN_SAFE_FROM_NON_GUEST_OBJECT`, `LOCAL_COUNT_SATURATED`, `UNIQUE_TARGET_NEIGHBOR_INTERSECTION` | 23.00 | 5 | Keep/reskin as mixed 4x4 baseline. |
| `case-005` | 4x4 | 6 | 3 | 15 | 1 | 13 | same as `case-004` | 23.03 | 5 | Demote; mirror variant of `case-004`. |
| `case-006` | 4x4 | 6 | 3 | 15 | 1 | 13 | same as `case-004` | 22.72 | 5 | Demote; vertical/rotation variant of `case-004`. |
| `case-007` | 4x4 | 6 | 3 | 15 | 1 | 13 | same as `case-004` | 22.73 | 5 | Demote; rotated variant of `case-004`. |
| `case-008` | 3x3 | 1 | 7 | 1 | 0 | 0 | none | 2.80 | 1 | Replace; demote old file to internal trivial/global-count fixture. |
| `case-009` | 3x3 | 2 | 7 | 1 | 0 | 0 | none | 2.80 | 1 | Replace; demote old file to internal opening-trivial fixture. |
| `case-010` | 3x3 | 2 | 7 | 1 | 0 | 0 | none | 2.80 | 1 | Replace; demote old file to internal opening-trivial fixture. |
| `case-011` | 3x3 | 3 | 2 | 2 | 1 | 5 | `LOCAL_SCOPE_INTERSECTION` | 10.36 | 3 | Keep/reskin as intersection intro. |
| `case-012` | 4x3 | 4 | 5 | 2 | 1 | 7 | `LOCAL_COUNT_SATURATED`, `LOCAL_SCOPE_DIFFERENCE` | 12.15 | 3 | Keep/reskin as difference intro. |

## Opening-Trivial Findings

`case-001`, `case-002`, `case-003`, `case-008`, `case-009`, and `case-010` all fail the intended Phase 19 opening-ambiguity gate:

- `initialGuestLayouts = 1`;
- `proofWaveCount = 0`;
- `deductionCount = 0`;
- no proof technique is needed.

These cases are useful as internal fixtures for validating schema, global count closure, and authoring diagnostics. They should not be presented as normal player-facing puzzles in the final ladder.

## Mirror/Variant Findings

`case-005`, `case-006`, and `case-007` should be demoted rather than sold as separate player-facing content. Round 1 evidence:

- all three have the same board size, rule count, reveal count, initial ambiguity, proof wave count, deduction count, and proof technique list as `case-004`;
- their metadata tags already classify them as `mirror-variant`, `vertical-variant`, and `rotated-variant`;
- the user playtest reported them as mirrors of `case-004`.

Round 4 will replace this preliminary audit evidence with an automated non-isomorphism gate and duplicate signature report.

## Demotion Policy

Demoted cases should remain available only as internal fixtures or experimental evidence. They must not appear in the normal player-facing selector after the final ladder promotion.

Suggested demotion targets:

- `case-001` to `case-003`: `content/experimental/phase-19/demoted/opening-trivial/`.
- `case-005` to `case-007`: `content/experimental/phase-19/demoted/mirror-variants/`.
- `case-008` to `case-010`: `content/experimental/phase-19/demoted/global-count-closure/`.

Do not move or rename shipped content until the replacement ladder is ready, because `apps/web/src/content/cases.ts` and current verification tests still expect the 12-case baseline.

## Target Ladder Direction

The final player-facing selector should become an 8-10 case ladder:

1. one non-trivial onboarding case;
2. two first-deduction cases;
3. `case-011` or a reskin as intersection intro;
4. one additional non-isomorphic intersection case;
5. `case-012` or a reskin as difference intro;
6. one additional non-isomorphic difference case;
7. `case-004` or a reskin as mixed 4x4 baseline;
8. one mixed mid-band case;
9. optionally one showcase case if it remains human-explainable, non-tedious, and untruncated.

## Round 1 Self-Check

Debug self-check:

- Smallest content/tooling fixture tested: all shipped case JSON files through authoring `report` and `score`.
- Trivial opening-state failure covered: yes, six cases recorded with `initialGuestLayouts = 1`, `proofWaveCount = 0`, `deductionCount = 0`.
- Rule contribution covered: deferred to Round 3.
- Duplicate/isomorphism covered: preliminary mirror/variant evidence recorded; automated gate deferred to Round 4.
- Required technique retention covered: evidence noted for `case-011` and `case-012`; formal gate deferred to Round 5.
- Proof/no-guess path covered: existing authoring reports passed for all shipped cases.
- Runtime/player secrecy checked: deferred to later web runtime rounds.
- Rejected candidate evidence recorded: not applicable until sampling/generation rounds.
- Regression risk: docs-only audit.

Architecture self-check:

- Domain remains the source of truth for puzzle/rule/board types: yes.
- Schema remains the content contract: yes.
- Solver remains exact backend: yes.
- Proof remains human explanation backend: yes.
- Generator/authoring remain private maintainer tooling: yes.
- Quality gates consume public APIs rather than duplicating solver/proof semantics: audit uses authoring CLI outputs.
- Shipped content is intentionally promoted: no promotion yet.
- Experimental/rejected candidates remain private: no candidate files added.
- Target access stayed behind the narrow app boundary: no app changes.
- Player marks stayed out of solver/proof facts: no app changes.
- Developer-only data stayed gated: no app changes.
- Theme/VN/editor/backend/new DSL/new proof technique scope avoided: yes.
- Unrelated files left untouched: yes.
