# Phase 21 Second-Pass Repair Review

Round: 8
Decision: no additional repair required before promotion decisions.

## Candidates Reviewed

The best candidates from Rounds 4-7 are:

| Candidate | Skeleton | Status |
| --- | --- | --- |
| `phase-21-s2-intersection-001` | S2 crossing intersection | Promotion queue |
| `phase-21-s3-difference-001` | S3 hidden-bottle difference | Promotion queue |

Rejected or non-queue candidates remain rejected:

- local-count attempts repeat the B3/C3 local-count pattern or fail to produce accepted generated candidates;
- older intersection candidates collide with `case-011`;
- older mixed candidates collide with `case-004`;
- earlier retained-difference attempts either became zero-wave unique, failed no-guess/final uniqueness, lost `LOCAL_SCOPE_DIFFERENCE` under minimization, or were already promoted as `case-012`.

## Focused Commands

```powershell
pnpm authoring -- report content/experimental/phase-21/candidates/phase-21-s2-intersection-001.json
pnpm authoring -- report content/experimental/phase-21/candidates/phase-21-s3-difference-001.json
pnpm authoring -- anti-clone content/cases/case-011.json content/cases/case-012.json content/cases/case-004.json content/experimental/phase-21/candidates/phase-21-s2-intersection-001.json content/experimental/phase-21/candidates/phase-21-s3-difference-001.json --novelty-manifest content/novelty-claims.json
```

## Evidence

`phase-21-s2-intersection-001` report:

- `ok: true`
- initial guest layouts: 2
- final guest cells: `C2`, `B3`
- proof techniques: `LOCAL_SCOPE_DIFFERENCE`, `LOCAL_SCOPE_INTERSECTION`
- deduction count: 3
- solver truncation: false

`phase-21-s3-difference-001` report:

- `ok: true`
- initial guest layouts: 4
- final guest cells: `B4`, `C4`
- proof techniques: `LOCAL_COUNT_SATURATED`, `LOCAL_SCOPE_DIFFERENCE`
- deduction count: 8
- solver truncation: false

Combined anti-clone report with current selector plus both candidates:

- status: `fail`
- hard failures: 2
- reviewer-blocking findings: 0
- structural evidence groups: none
- novelty issues:
  - missing claim for `phase-21-s2-intersection-001`
  - missing claim for `phase-21-s3-difference-001`

This is the expected pre-promotion state: both candidate structures survive anti-clone comparison, but neither has an accepted novelty claim yet.

## Repair Decision

No repair is applied in Round 8.

The S2 and S3 candidates already satisfy the repair goal more cleanly than the rejected candidates:

- S2 avoids the `case-011` single-guest intersection clone pattern.
- S3 avoids the `case-012` B3/C3 retained-difference pattern and omits global guest count.
- The combined anti-clone report finds no effective-board, proof-trace, candidate-shrink, or rule-impact collisions among the selector and the two queue candidates.

Round 9 should record broader generator capability evidence. Rounds 10 and 11 should decide whether to promote these two candidates with accepted novelty claims and shipped-case copies.

## Round 8 Self-Checks

Debug self-check:

- Smallest candidate/skeleton tested: the two promotion-queue candidates together.
- Standard validation covered: report commands for both queue candidates.
- Anti-clone report covered: baseline selector plus both queue candidates, with novelty manifest.
- Novelty claim covered: claims intentionally still missing until promotion decision.
- Proof/no-guess path covered: both reports are no-guess and human-explainable.
- Rejected Phase 19 cases stayed out: yes.
- Generator/authoring rejection evidence recorded: earlier rejection docs remain the evidence source.
- Runtime/player secrecy checked: no runtime changes.
- Regression risk: docs-only repair review.

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
