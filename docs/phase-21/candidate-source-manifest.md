# Phase 21 Candidate Source Manifest

Round: 3

This manifest records the source skeleton for Phase 21 private templates and candidates. Candidate files under `content/experimental/phase-21/candidates` are not player-facing.

## Template Registry

| Template | Skeleton | Intended technique path | Promotion status |
| --- | --- | --- | --- |
| `content/experimental/phase-21/templates/s1-split-local-count-template.json` | S1 | `LOCAL_COUNT_SATURATED` / `LOCAL_COUNT_ALL_REMAINING` | template only |
| `content/experimental/phase-21/templates/s2-delayed-intersection-template.json` | S2 | `LOCAL_COUNT_SATURATED` -> `LOCAL_SCOPE_INTERSECTION` | template only |
| `content/experimental/phase-21/templates/s3-offset-difference-template.json` | S3 | setup deduction -> `LOCAL_SCOPE_DIFFERENCE` | template only |
| `content/experimental/phase-21/templates/s4-object-intersection-template.json` | S4 | `UNIQUE_TARGET_NEIGHBOR_INTERSECTION` -> object-safe -> guest exclusion | template only |
| `content/experimental/phase-21/templates/s5-global-finish-template.json` | S5 | local safe deductions -> `GLOBAL_COUNT_ALL_REMAINING` | template only |
| `content/experimental/phase-21/templates/s6-local-object-template.json` | S6 | object all-remaining -> object-safe -> guest local count | template only |
| `content/experimental/phase-21/templates/s7-intersection-difference-template.json` | S7 | `LOCAL_SCOPE_INTERSECTION` -> `LOCAL_SCOPE_DIFFERENCE` | template only |

## Candidate Registry

| Candidate | Source skeleton | Source note | Round status |
| --- | --- | --- | --- |
| `content/experimental/phase-21/candidates/phase-21-s2-intersection-001.json` | S2 | Copied from earlier Phase 12 private fixture for renewed Phase 21 anti-clone review; not a Phase 19 rejected case. | Round 5 promotion queue, not player-facing |

Candidate JSONs must be added only with a skeleton source, standard authoring reports, and explicit promotion/rejection evidence.

## Round 3 Self-Checks

Debug self-check:

- Smallest candidate/skeleton tested: seven report-only templates tied to skeletons S1-S7.
- Standard validation covered: template JSON parse and diff check; candidate validation starts in Round 4.
- Anti-clone report covered: no new candidate enters selector this round.
- Novelty claim covered: source skeleton recorded for future claims.
- Proof/no-guess path covered: future candidate reports will verify concrete paths.
- Rejected Phase 19 cases stayed out: yes, no rejected case copied.
- Generator/authoring rejection evidence recorded: templates ready for bounded attempts.
- Runtime/player secrecy checked: no runtime change.
- Regression risk: private experimental files and docs only.

Architecture self-check:

- Domain remains the source of truth for puzzle/rule/board types: yes.
- Schema remains the content contract: yes.
- Solver remains exact backend: yes.
- Proof remains human explanation backend: yes.
- Generator/authoring remain private maintainer tooling: yes.
- Candidate design starts from proof skeletons, not map padding: yes.
- Anti-clone gates consume public APIs rather than duplicating solver/proof semantics: yes.
- Shipped content is intentionally promoted: no shipped content change.
- Experimental/rejected candidates remain private: yes.
- Target access stayed behind the narrow app boundary: yes.
- Player marks stayed out of solver/proof facts: yes.
- Developer-only data stayed gated: yes.
- Theme/VN/editor/backend/new DSL/new proof technique scope avoided: yes.
- Unrelated files left untouched: yes.
