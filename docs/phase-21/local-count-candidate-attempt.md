# Phase 21 Local-Count Candidate Attempt

Round: 4
Skeleton: S1 - Split Local Count Closure
Decision: rejected; no local-count promotion.

## Attempt A - Phase 21 S1 Template Sampling

Command:

```powershell
pnpm authoring -- sample --seed 2101 --template content/experimental/phase-21/templates/s1-split-local-count-template.json
```

Result:

- `ok: false`
- attempts: 160
- accepted candidates: 0
- rejection summary: all 160 sampled targets failed `TARGET_VIOLATES_RULES`; final report also included `NO_CANDIDATE_ACCEPTED`
- solver stats: node count 160, propagation count 324, not truncated

Interpretation:

The S1 split local-count template is too restrictive in its current form. It did not produce a concrete candidate for report/score/minimize promotion review.

## Attempt B - Concrete Local-Count Negative Control

Because Attempt A produced no candidate JSON, Round 4 also rechecked the existing private local-count candidate `content/experimental/phase-19/candidates/phase-19-local-count-compact-001.json` as a negative control. It is useful because it demonstrates why a solver/proof-valid local-count puzzle is still not acceptable under Phase 21 novelty rules.

Commands:

```powershell
pnpm authoring -- report content/experimental/phase-19/candidates/phase-19-local-count-compact-001.json
pnpm authoring -- score content/experimental/phase-19/candidates/phase-19-local-count-compact-001.json
pnpm authoring -- minimize content/experimental/phase-19/candidates/phase-19-local-count-compact-001.json
pnpm authoring -- anti-clone content/cases/case-011.json content/cases/case-012.json content/cases/case-004.json content/experimental/phase-19/candidates/phase-19-local-count-compact-001.json --novelty-manifest content/novelty-claims.json
```

Standard validation result:

- report: `ok: true`
- schema: pass
- target rules: pass
- initial satisfiability: pass
- initial guest layouts: 7
- proof/no-guess: pass
- final guest cells: `B3`, `C3`
- wave count: 1
- deduction count: 6
- technique ids: `LOCAL_COUNT_SATURATED`
- score: 13.07, band 3, uncalibrated
- minimize: `ok: true`, initial reveals reduced from 3 to 2 while preserving `LOCAL_COUNT_SATURATED`

Anti-clone and novelty result:

- anti-clone status: `fail`
- hard failures: 1
- reviewer-blocking groups: 0
- failure reason: missing required novelty claim for `phase-19-local-count-compact-001`

Reviewer decision:

- Reject as a Phase 21 promotion candidate.
- It repeats the rejected Phase 19 local-count answer pattern: final guests `B3`, `C3` after one wave of `LOCAL_COUNT_SATURATED`.
- It does not satisfy S1's required split topology or proof movement.
- It has no accepted novelty claim and should not be added to the player selector.

## Round 4 Outcome

No local-count candidate is promoted. Later Phase 21 attempts should prefer S2/S3/S4/S7 skeletons, where the proof movement is more likely to differ from `case-011`, `case-012`, and `case-004`.

## Round 4 Self-Checks

Debug self-check:

- Smallest candidate/skeleton tested: S1 template sample and one concrete local-count negative control.
- Standard validation covered: report, score, and minimize for the concrete local-count control.
- Anti-clone report covered: baseline selector plus the local-count control.
- Novelty claim covered: anti-clone failed due missing novelty claim; no accepted claim added.
- Proof/no-guess path covered: concrete control is no-guess but rejected for novelty/answer-pattern reasons.
- Rejected Phase 19 cases stayed out: yes, no selector change.
- Generator/authoring rejection evidence recorded: S1 sample rejected all 160 attempts at target-rules; local-count control rejected by reviewer decision.
- Runtime/player secrecy checked: no runtime changes.
- Regression risk: docs-only evidence.

Architecture self-check:

- Domain remains the source of truth for puzzle/rule/board types: yes.
- Schema remains the content contract: yes.
- Solver remains exact backend: yes.
- Proof remains human explanation backend: yes.
- Generator/authoring remain private maintainer tooling: yes.
- Candidate design starts from proof skeletons, not map padding: yes.
- Anti-clone gates consume public APIs rather than duplicating solver/proof semantics: yes.
- Shipped content is intentionally promoted: no promotion this round.
- Experimental/rejected candidates remain private: yes.
- Target access stayed behind the narrow app boundary: yes.
- Player marks stayed out of solver/proof facts: yes.
- Developer-only data stayed gated: yes.
- Theme/VN/editor/backend/new DSL/new proof technique scope avoided: yes.
- Unrelated files left untouched: yes.
