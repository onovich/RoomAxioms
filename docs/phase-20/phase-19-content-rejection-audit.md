# Phase 20 Phase 19 Content Rejection Audit

Status: Round 1 audit complete
Phase: Phase 20 - Anti-Clone Puzzle Quality And Ladder Repair
Observed: 2026-06-25

## User Rejection Summary

Phase 19 is mechanically valid but product-invalid. The user rejected its newly promoted content because the new cases feel cloned rather than novel:

- `case-006` is effectively `case-004` with four irrelevant right-side cells.
- `case-001`, `case-002`, and `case-005` are clone-like variants of `case-012` or the same B3/C3 deduction answer pattern.
- A smaller honest selector is preferable to padding the ladder with these cases.

This rejection is treated as binding product evidence for Phase 20.

## Focused Commands Run

For every currently shipped selector case:

```text
pnpm authoring -- report content/cases/<case>.json
pnpm authoring -- score content/cases/<case>.json
```

All eight cases returned `ok: true`, `recommendation: ready-for-experimental-review`, and no solver truncation. This is the core failure mode: the Phase 19 gates accepted cases that are valid solver/proof artifacts but weak content.

## Current Selector Metrics

| Case | Initial layouts | Proof waves | Deductions | Techniques | Final guest cells | Score | Band | Round 1 decision |
| --- | ---: | ---: | ---: | --- | --- | ---: | ---: | --- |
| `case-001` | 7 | 1 | 6 | `LOCAL_COUNT_SATURATED` | `B3`, `C3` | 13.07 | 3 | Reject as clone-like until anti-clone gates prove otherwise. |
| `case-002` | 3 | 1 | 7 | `LOCAL_COUNT_SATURATED` | `B3`, `C3` | 12.79 | 3 | Reject as clone-like until anti-clone gates prove otherwise. |
| `case-003` | 2 | 1 | 5 | `LOCAL_SCOPE_INTERSECTION` | `A1` | 10.66 | 3 | Watchlist; likely close to `case-011` and must pass proof/effective-board novelty. |
| `case-011` | 2 | 1 | 5 | `LOCAL_SCOPE_INTERSECTION` | `A1` | 10.36 | 3 | Preserve useful baseline. |
| `case-012` | 2 | 1 | 7 | `LOCAL_COUNT_SATURATED`, `LOCAL_SCOPE_DIFFERENCE` | `B3`, `C3` | 12.15 | 3 | Preserve useful baseline. |
| `case-004` | 15 | 1 | 13 | `KNOWN_SAFE_FROM_NON_GUEST_OBJECT`, `LOCAL_COUNT_SATURATED`, `UNIQUE_TARGET_NEIGHBOR_INTERSECTION` | `D1`, `B4` | 23.00 | 5 | Preserve default useful baseline. |
| `case-005` | 10 | 1 | 6 | `LOCAL_COUNT_SATURATED` | `B3`, `C3` | 17.71 | 4 | Reject as clone-like until anti-clone gates prove otherwise. |
| `case-006` | 15 | 1 | 13 | `KNOWN_SAFE_FROM_NON_GUEST_OBJECT`, `LOCAL_COUNT_SATURATED`, `UNIQUE_TARGET_NEIGHBOR_INTERSECTION` | `D1`, `B4` | 23.40 | 5 | Reject as padded `case-004` clone. |

## `case-006` Versus `case-004`

`case-006` has the same authoring shape as `case-004` except for padded board area:

| Metric | `case-004` | `case-006` |
| --- | ---: | ---: |
| Board cells | 16 | 20 |
| Initial guest layouts | 15 | 15 |
| Proof waves | 1 | 1 |
| Deductions | 13 | 13 |
| Technique count | 3 | 3 |
| Solver node count in score | 2152 | 2152 |
| Solver propagation count in score | 17494 | 17494 |
| Final guest cells | `D1`, `B4` | `D1`, `B4` |

This is the clearest anti-clone fixture for Phase 20: raw dimensions differ, but candidate space, proof shape, final answer, and solver work are identical. The four right-side cells increase board area and reveal count but do not create new reasoning.

Required Phase 20 gate response:

- effective-board reduction should trim or neutralize irrelevant padded cells;
- reduced-board isomorphism should identify the same effective puzzle;
- proof-trace fingerprint and shrink signature should match exactly or nearly exactly;
- novelty-claim review should hard-fail the case unless a meaningful distinction is documented.

## `case-001`, `case-002`, `case-005` Versus `case-012`

These cases share the same final guest answer pattern as `case-012`:

| Case | Final guests | Main proof technique pattern | Initial layouts | Deductions | Notes |
| --- | --- | --- | ---: | ---: | --- |
| `case-001` | `B3`, `C3` | one-wave local count saturation | 7 | 6 | Compact map; same answer pair and same first proof family as the rejected variants. |
| `case-002` | `B3`, `C3` | one-wave local count saturation | 3 | 7 | Wider/revealed variant; same answer pair and same local-count closure feel. |
| `case-005` | `B3`, `C3` | one-wave local count saturation | 10 | 6 | Wider-edge variant; same answer pair with extra irrelevant edge structure. |
| `case-012` | `B3`, `C3` | local count saturation plus local scope difference | 2 | 7 | Preserved baseline because it introduced retained `LOCAL_SCOPE_DIFFERENCE`. |

The Phase 19 gate saw nonzero ambiguity and nonzero proof work, but the player experience remains too similar: the answer pair and local-count deduction route repeat. `case-012` is the useful baseline because its retained difference proof is the intended novelty; the other three do not currently justify themselves as distinct player-facing content.

Required Phase 20 gate response:

- proof-trace fingerprints must normalize coordinates enough to catch copied answer skeletons;
- candidate-shrink signatures must record whether the same one-wave local-count closure is being replayed;
- rule-impact vectors must distinguish a truly different dependency shape from the same rule family with padding;
- novelty claims must require a written closest-case comparison before promotion.

## Phase 19 Gate Gaps

Phase 19 gates caught:

- opening-state triviality;
- zero proof waves;
- zero deductions;
- simple full-board isomorphism;
- basic rule contribution;
- technique retention during minimization.

Phase 19 gates did not catch:

- effective-board equivalence after removing irrelevant padding;
- identical solver work and candidate shrink despite larger boards;
- identical proof technique order and conclusion pattern;
- copied final guest answer pattern;
- same local-count deduction skeleton with changed reveal count or board shape;
- lack of explicit novelty claim and reviewer evidence.

## Round 1 Decision

Preserve as useful baselines:

- `case-004`
- `case-011`
- `case-012`

Treat as rejected until new anti-clone gates prove otherwise:

- `case-001`
- `case-002`
- `case-005`
- `case-006`

Watchlist:

- `case-003`, because it shares the same final answer and same technique family as `case-011`; it should remain player-facing only if the new proof/effective-board novelty evidence supports it.

No selector/content changes are made in Round 1. This round records the evidence that later anti-clone gates must enforce.

## Round 1 Self-Checks

Debug self-check:

- Smallest anti-clone fixture tested: `case-006` versus `case-004` for padded-board clone; `case-001`/`case-002`/`case-005` versus `case-012` for repeated B3/C3 answer pattern.
- Effective-board reduction covered: design requirement recorded; implementation deferred to Round 2.
- Padded-board clone failure covered: audit records exact metrics and expected failure condition.
- Proof-trace clone failure covered: audit records repeated technique/answer pattern; implementation deferred.
- Candidate-shrink signature covered: identical solver/candidate metrics for `case-006` versus `case-004` recorded; formal signature deferred.
- Rule-impact vector covered: gap recorded; implementation deferred.
- Novelty claim covered: gap recorded; manifest deferred.
- Existing accepted cases protected: `case-004`, `case-011`, and `case-012` marked preserve.
- Rejected Phase 19 cases handled: `case-001`, `case-002`, `case-005`, and `case-006` marked suspect/rejected pending new gates.
- Runtime/player secrecy checked: no runtime changes this round.
- Rejected candidate evidence recorded: user rejection and authoring metrics recorded.
- Regression risk: docs-only audit.

Architecture self-check:

- Domain remains the source of truth for puzzle/rule/board types: yes, no domain changes.
- Schema remains the content contract: yes, no schema changes.
- Solver remains exact backend: yes, audit uses authoring CLI output.
- Proof remains human explanation backend: yes, audit uses public proof metrics.
- Generator/authoring remain private maintainer tooling: yes.
- Anti-clone gates consume public APIs rather than duplicating solver/proof semantics: planned explicitly.
- Shipped content is intentionally promoted: no promotion this round.
- Experimental/rejected candidates remain private: no content changes.
- Target access stayed behind the narrow app boundary: yes.
- Player marks stayed out of solver/proof facts: yes.
- Developer-only data stayed gated: yes.
- Theme/VN/editor/backend/new DSL/new proof technique scope avoided: yes.
- Unrelated files left untouched: yes.
