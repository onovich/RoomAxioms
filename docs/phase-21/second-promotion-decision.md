# Phase 21 Second Promotion Decision

Round: 11
Decision: promote `phase-21-s3-difference-001` as `case-014`.

## Shipped Content Changes

- Added `content/cases/case-014.json`.
- Added `case-014` to the player selector after `case-012`.
- Added an accepted novelty claim for `case-014`.
- Kept `case-004` as the default case.

The shipped case keeps the hidden-bottle difference skeleton but replaces private labels with formal player-facing Chinese copy and validated maintainer metadata.

## Focused Commands

```powershell
node packages/authoring/dist/cli.js report content/cases/case-014.json
node packages/authoring/dist/cli.js score content/cases/case-014.json
node packages/authoring/dist/cli.js minimize content/cases/case-014.json --require-technique LOCAL_SCOPE_DIFFERENCE
node packages/authoring/dist/cli.js anti-clone content/cases/case-011.json content/cases/case-013.json content/cases/case-012.json content/cases/case-014.json content/cases/case-004.json --novelty-manifest content/novelty-claims.json
```

## Gate Evidence

`report`:

- `ok: true`
- diagnostics: `VALIDATION_PASS`
- schema ok: true
- target satisfies rules: true
- initial guest layouts: 4
- final guest cells: `B4`, `C4`
- no-guess: true
- human explainable: true
- proof techniques: `LOCAL_COUNT_SATURATED`, `LOCAL_SCOPE_DIFFERENCE`
- deduction count: 8
- wave count: 1
- solver truncation: false

`score`:

- `ok: true`
- score: 15.54
- band: 4
- note: authoring metrics remain uncalibrated until real playtest evidence exists

`minimize --require-technique LOCAL_SCOPE_DIFFERENCE`:

- `ok: true`
- diagnostics: `MINIMIZATION_COMPLETE`, `TECHNIQUE_RETENTION_PASS`
- before reveal count: 8
- after reveal count: 6
- before cells: `A1`, `B1`, `C1`, `A2`, `B2`, `C2`, `B3`, `D3`
- after cells: `A1`, `B1`, `C1`, `A2`, `B2`, `C2`

`anti-clone` with the full proposed selector:

- `ok: true`
- status: `pass`
- diagnostics: `ANTI_CLONE_PASS`
- hard failures: 0
- reviewer-blocking findings: 0
- structural evidence groups: none
- novelty manifest: accepted for `case-004`, `case-011`, `case-012`, `case-013`, and `case-014`; no missing-review issues

## Distinctness Review

`case-014` is distinct enough to promote:

- it is not `case-012`: both include `LOCAL_SCOPE_DIFFERENCE`, but `case-012` is a 4x3 corridor with a global guest count and final guests `B3`, `C3`; `case-014` is a 4x4 hidden-bottle layout with no global guest count and final guests `B4`, `C4`;
- it is not `case-013`: `case-013` is a compact 3x3 crossing-ledger case that combines difference and intersection; `case-014` is a wider local quiet-zone proof with no intersection step;
- it is not `case-011`: `case-011` is a single-guest intersection baseline, while `case-014` resolves a two-guest bottom-row pair;
- it is not `case-004`: `case-004` uses mixed bin placement and cleaning-chain rules, while `case-014` has no global count and relies on local quiet-zone constraints.

The anti-clone report found no effective-board, proof-trace, shrink-signature, or rule-impact collision against the full proposed selector.

## Round 11 Self-Checks

Debug self-check:

- Smallest candidate/skeleton tested: `case-014`, promoted from S3 hidden-bottle difference.
- Standard validation covered: report, score, technique-retention minimize, anti-clone, and focused web content test update.
- Anti-clone report covered: `case-011`, `case-013`, `case-012`, `case-014`, `case-004`.
- Novelty claim covered: accepted claim added for `case-014`.
- Proof/no-guess path covered: `LOCAL_COUNT_SATURATED` plus `LOCAL_SCOPE_DIFFERENCE`, no guess, human explainable.
- Rejected Phase 19 cases stayed out: yes.
- Generator/authoring rejection evidence recorded: Round 9 remains the generator limitation evidence.
- Runtime/player secrecy checked: selector imports only shipped case data; no target/candidate/forced/generator internals added to player UI.
- Regression risk: one shipped case, selector order, novelty manifest, and focused tests.

Architecture self-check:

- Domain remains the source of truth for puzzle/rule/board types: yes.
- Schema remains the content contract: yes.
- Solver remains exact backend: yes.
- Proof remains human explanation backend: yes.
- Generator/authoring remain private maintainer tooling: yes.
- Candidate design starts from proof skeletons, not map padding: yes.
- Anti-clone gates consume public APIs rather than duplicating solver/proof semantics: yes.
- Shipped content is intentionally promoted: yes, `case-014`.
- Experimental/rejected candidates remain private: yes.
- Target access stayed behind the narrow app boundary: yes.
- Player marks stayed out of solver/proof facts: yes.
- Developer-only data stayed gated: yes.
- Theme/VN/editor/backend/new DSL/new proof technique scope avoided: yes.
- Unrelated files left untouched: yes.
