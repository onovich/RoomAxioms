# Phase 21 Difference Candidate Attempt

Round: 6
Skeleton: S3 - Offset Difference Pair
Candidate: `content/experimental/phase-21/candidates/phase-21-s3-difference-001.json`
Decision: accepted for promotion queue, not yet player-facing.

## Source

The Phase 21 S3 template sample with seed `2103` produced no accepted candidate:

- attempts: 192
- accepted candidates: 0
- rejection summary: all sampled targets failed `TARGET_VIOLATES_RULES`
- stats: node count 192, propagation count 400, not truncated

Round 6 also rechecked the earlier retained-difference pool:

| Candidate | Result |
| --- | --- |
| `phase-13-local-scope-difference-001` | report passed, but `minimize --require-technique LOCAL_SCOPE_DIFFERENCE` failed because minimization dropped the technique. |
| `phase-13-local-scope-difference-002` | repair-proof; explanation gaps and no final uniqueness. |
| `phase-14-local-scope-difference-001` | repair-proof; explanation gaps and no final uniqueness. |
| `phase-14-local-scope-difference-002` | zero-wave initially unique; not a normal puzzle. |
| `phase-14-local-scope-difference-003` | zero-wave initially unique; not a normal puzzle. |
| `phase-15-retained-difference-001` | repair-proof; explanation gaps and no final uniqueness. |
| `phase-15-retained-difference-002` | repair-proof; explanation gap and no final uniqueness. |
| `phase-15-retained-difference-003` | already promoted as `case-012`; anti-clone hard-fails against `case-012`. |

The accepted private candidate was then hand-authored from S3 instead of copying Phase 19 content. Its skeleton is:

1. mirror quiet scope marks local non-guests safe;
2. a hidden bottle becomes known through that safe reveal path;
3. a local scope difference confirms `B4`;
4. the hidden bottle and local count constraints finish the unique guest layout at `B4`, `C4`.

The candidate deliberately has no global guest-count rule, so it does not replay `case-012`'s global-count support pattern.

## Focused Commands

```powershell
pnpm authoring -- report content/experimental/phase-21/candidates/phase-21-s3-difference-001.json
pnpm authoring -- score content/experimental/phase-21/candidates/phase-21-s3-difference-001.json
pnpm authoring -- minimize content/experimental/phase-21/candidates/phase-21-s3-difference-001.json --require-technique LOCAL_SCOPE_DIFFERENCE
pnpm authoring -- anti-clone content/cases/case-011.json content/cases/case-012.json content/cases/case-004.json content/experimental/phase-21/candidates/phase-21-s3-difference-001.json --novelty-manifest content/novelty-claims.json
```

## Evidence Summary

Actual result after copying into Phase 21 private content:

- report: `ok: true`
- initial guest layouts: 4
- proof: no-guess and human-explainable
- proof techniques: `LOCAL_COUNT_SATURATED`, `LOCAL_SCOPE_DIFFERENCE`
- proof waves: 1
- deductions: 8
- final guest cells: `B4`, `C4`
- score: 15.54, band 4, uncalibrated
- solver truncation: false
- `minimize --require-technique LOCAL_SCOPE_DIFFERENCE`: `ok: true`
- anti-clone structural evidence groups against `case-011`, `case-012`, and `case-004`: none
- anti-clone status before promotion: `fail`, only because `phase-21-s3-difference-001` has no accepted novelty claim yet

## Reviewer Decision

This candidate is allowed into the promotion queue because it differs from `case-012` under the Phase 21 review criteria:

- final guests are `B4`, `C4`, not the rejected `B3`, `C3` pattern;
- the proof keeps `LOCAL_SCOPE_DIFFERENCE` after minimization;
- the rule set omits global guest count, unlike `case-012`;
- the hidden-bottle dependency creates a different local proof shape from the Phase 15 promoted candidate;
- anti-clone review reports no effective-board, proof-trace, candidate-shrink, or rule-impact evidence groups against the current selector.

It is not promoted in Round 6 because promotion is reserved for Rounds 10-11 after the mixed and repair attempts are compared.

## Round 6 Self-Checks

Debug self-check:

- Smallest candidate/skeleton tested: S3 hidden-bottle local-scope-difference candidate.
- Standard validation covered: report, score, and minimization commands are required before commit.
- Anti-clone report covered: baseline selector plus candidate, with novelty manifest.
- Novelty claim covered: no accepted claim yet; promotion deferred.
- Proof/no-guess path covered: candidate proof path is checked by report/minimize.
- Rejected Phase 19 cases stayed out: yes.
- Generator/authoring rejection evidence recorded: S3 seed `2103` produced zero accepted candidates.
- Runtime/player secrecy checked: no runtime changes.
- Regression risk: private candidate and docs only.

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
