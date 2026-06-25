# Phase 21 Selector Ladder And Copy Review

Round: 12
Decision: keep the five-case selector and order it as a readable MVP ladder.

## Selector Order

| Order | Case | Role in ladder | Notes |
| ---: | --- | --- | --- |
| 1 | `case-004` | Default mixed baseline | Preserved default; introduces the existing cleaning-chain baseline. |
| 2 | `case-011` | Compact intersection | Single-guest local-scope-intersection baseline. |
| 3 | `case-013` | Crossing ledger | Compact two-guest case combining local-scope difference and intersection. |
| 4 | `case-012` | Retained difference baseline | 4x3 retained-difference corridor with global count support. |
| 5 | `case-014` | Hidden-bottle difference | 4x4 no-global-count difference case with more initial structure. |

`DEFAULT_CASE_ID` remains `case-004`.

## Copy Review

The promoted cases use player-facing Chinese copy:

- `case-013`: `客房 13：交叉账簿`, `案卷 13 · 交叉账簿`
- `case-014`: `客房 14：暗瓶缺口`, `案卷 14 · 暗瓶缺口`

Rule copy uses concrete neighbor language instead of abstract scope terms:

- `上下左右邻格`
- `周围一圈`

Metadata stays free of internal phase labels. Difficulty is still provisional and uncalibrated because there is no real playtest evidence in this phase.

## Rejected Case Review

Rejected or suspect cases remain out of the player selector:

- `case-001`
- `case-002`
- `case-003`
- `case-005`
- `case-006`
- Phase 19 rejected replacements
- generated/rejected Phase 21 samples

The only new shipped cases are `case-013` and `case-014`.

## Round 12 Self-Checks

Debug self-check:

- Smallest candidate/skeleton tested: selector order and copy across five shipped cases.
- Standard validation covered: focused web content/runtime tests run after selector changes.
- Anti-clone report covered: full proposed selector remains the Round 11 anti-clone set and will be re-run in the final gate sweep.
- Novelty claim covered: claims exist for all five selector cases.
- Proof/no-guess path covered: case verification tests cover all selector cases.
- Rejected Phase 19 cases stayed out: yes.
- Generator/authoring rejection evidence recorded: no generated sample promoted.
- Runtime/player secrecy checked: selector summaries expose id/title/caseName/difficulty/tags/board only.
- Regression risk: selector order and tests only.

Architecture self-check:

- Domain remains the source of truth for puzzle/rule/board types: yes.
- Schema remains the content contract: yes.
- Solver remains exact backend: yes.
- Proof remains human explanation backend: yes.
- Generator/authoring remain private maintainer tooling: yes.
- Candidate design starts from proof skeletons, not map padding: yes.
- Anti-clone gates consume public APIs rather than duplicating solver/proof semantics: yes.
- Shipped content is intentionally promoted: yes, `case-013` and `case-014`.
- Experimental/rejected candidates remain private: yes.
- Target access stayed behind the narrow app boundary: yes.
- Player marks stayed out of solver/proof facts: yes.
- Developer-only data stayed gated: yes.
- Theme/VN/editor/backend/new DSL/new proof technique scope avoided: yes.
- Unrelated files left untouched: yes.
