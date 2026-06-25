# Phase 21 Mixed Candidate Attempt

Round: 7
Skeleton: S4 - Object Intersection Then Guest Exclusion
Decision: no mixed candidate accepted; do not promote a mixed case in this round.

## Source

The Phase 21 S4 template sample with seed `2104` produced no accepted candidate:

- attempts: 192
- accepted candidates: 0
- rejection summary: all sampled targets failed `TARGET_VIOLATES_RULES`
- stats: node count 192, propagation count 234, not truncated

Round 7 also re-reviewed the previous mixed candidate:

- candidate: `content/experimental/phase-19/candidates/phase-19-mixed-wide-001.json`
- report: `ok: true`
- initial guest layouts: 15
- proof techniques: `KNOWN_SAFE_FROM_NON_GUEST_OBJECT`, `LOCAL_COUNT_SATURATED`, `UNIQUE_TARGET_NEIGHBOR_INTERSECTION`
- final guest cells: `D1`, `B4`
- score: 23.40, band 5, uncalibrated
- minimize: `ok: true`, but the reveal set collapses from 7 reveals to 1 reveal

The formal validation is strong, but the product/content gate rejects it because it repeats `case-004`.

## Focused Commands

```powershell
pnpm authoring -- sample --seed 2104 --template content/experimental/phase-21/templates/s4-object-intersection-template.json
pnpm authoring -- report content/experimental/phase-19/candidates/phase-19-mixed-wide-001.json
pnpm authoring -- score content/experimental/phase-19/candidates/phase-19-mixed-wide-001.json
pnpm authoring -- minimize content/experimental/phase-19/candidates/phase-19-mixed-wide-001.json
pnpm authoring -- anti-clone content/cases/case-011.json content/cases/case-012.json content/cases/case-004.json content/experimental/phase-19/candidates/phase-19-mixed-wide-001.json --novelty-manifest content/novelty-claims.json
```

## Anti-Clone Rejection

The anti-clone report against the current selector returned:

- status: `fail`
- hard failures: 3
- reviewer-blocking findings: 2
- evidence groups:
  - `effective-isomorphism`: hard-fail against `case-004`
  - `proof-trace`: exact hard-fail against `case-004`
  - `candidate-shrink`: reviewer-blocking against `case-004`
  - `rule-impact`: reviewer-blocking against `case-004`
- novelty status: missing claim for `phase-19-mixed-wide-001`

This is exactly the Phase 20 rejection mode for `case-006`: a formally valid mixed puzzle that is effectively a padded or widened `case-004` experience.

## Reviewer Decision

No mixed candidate enters the promotion queue in Round 7.

The phase already has two stronger promotion-queue candidates from different skeleton families:

- S2: `phase-21-s2-intersection-001`
- S3: `phase-21-s3-difference-001`

Round 8 should focus on repairing or confirming those candidates rather than trying to salvage the `case-004` clone family.

## Round 7 Self-Checks

Debug self-check:

- Smallest candidate/skeleton tested: S4 template sample and prior mixed-wide candidate.
- Standard validation covered: report, score, and minimization for the prior mixed candidate.
- Anti-clone report covered: baseline selector plus mixed-wide candidate, with novelty manifest.
- Novelty claim covered: no accepted claim; candidate rejected before promotion.
- Proof/no-guess path covered: prior mixed candidate proof is valid but clone-blocked.
- Rejected Phase 19 cases stayed out: yes.
- Generator/authoring rejection evidence recorded: S4 seed `2104` produced zero accepted candidates.
- Runtime/player secrecy checked: no runtime changes.
- Regression risk: docs-only rejection evidence.

Architecture self-check:

- Domain remains the source of truth for puzzle/rule/board types: yes.
- Schema remains the content contract: yes.
- Solver remains exact backend: yes.
- Proof remains human explanation backend: yes.
- Generator/authoring remain private maintainer tooling: yes.
- Candidate design starts from proof skeletons, not map padding: yes; padding evidence rejected.
- Anti-clone gates consume public APIs rather than duplicating solver/proof semantics: yes.
- Shipped content is intentionally promoted: no shipped content change.
- Experimental/rejected candidates remain private: yes.
- Target access stayed behind the narrow app boundary: yes.
- Player marks stayed out of solver/proof facts: yes.
- Developer-only data stayed gated: yes.
- Theme/VN/editor/backend/new DSL/new proof technique scope avoided: yes.
- Unrelated files left untouched: yes.
