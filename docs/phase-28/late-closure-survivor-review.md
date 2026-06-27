# Phase 28 Late-Closure Survivor Review

Status: no late-closure survivor eligible for promotion or repair.

Guide: `docs/phase-28-nondegenerate-puzzle-rewrite-sprint-goal-mode-execution-guide.md`

The backup lane used C10 because its Phase 26 form had a useful two-wave bottle
frontier, passed degeneracy, and kept its core techniques under minimization,
but stopped with explanation gaps on `D2`, `A3`, and `B3`. Phase 28 tried two
focused repairs rather than a broad candidate batch.

## Baseline C10

Baseline evidence from `p26-c10-frontier-repair`:

- Initial guest layouts: 9.
- Proof: 2 waves / 4 deductions.
- Techniques: `REGION_COUNT_SATURATED`, `LOCAL_COUNT_ALL_REMAINING`.
- Degeneracy: pass.
- Blocker: `EXPLANATION_GAP` on `D2`, `A3`, and `B3`, with final guest-layout
  uniqueness still false.

The desired rewrite target was therefore a real late closure: keep the
north-three and bottle-local path, explain the three safe gaps, then force the
second guest without direct safe dumping or opening uniqueness.

## Attempt Results

| Candidate | What improved | What failed | Decision |
| --- | --- | --- | --- |
| `p28-c10-a-late-closure-frontier` | Machine no-guess/final uniqueness passes; copy scopes are explicit. | Proof collapses to 1 wave / 3 deductions; R7 and R5 redundant; minimizer reduces six reveals to `C3`; R7 condition hard-fails as singleton direct giveaway; R8 near-count giveaway. | reject |
| `p28-c10-b-broadened-condition-frontier` | R7 condition no longer hard-fails direct giveaway; copy scopes remain explicit. | Initial guest layouts drop to 1; proof has 0 waves / 0 deductions; R4/R5 redundant; R8 still near-count giveaway. | reject |

## Design Conclusion

The C10 repair lane exposes two opposite failure modes:

- A singleton conditional trigger can make the verifier happy while removing the
  intended late proof chain.
- A broadened conditional trigger can avoid the singleton gate while
  over-constraining the opening into a zero-deduction puzzle.

Neither is a tooling bug. The diagnostics distinguish the failures correctly:
A is a degeneracy/rule-contribution failure, while B is an opening-uniqueness
and zero-proof failure. A viable future rewrite needs a different skeleton, not
a local patch:

- the late trigger must be multi-cell and not forced at the opening;
- the consequence must not be a direct safe dump over the whole unresolved gap;
- the second-guest closure must require at least one human deduction after the
  bottle-local step;
- `LOCAL_COUNT_ALL_REMAINING` plus a late grammar/count technique must survive
  minimization.

## Boundary Notes

- No shipped `content/cases` files changed.
- No player selector/default case changed.
- No proof, solver, schema, or web runtime semantics changed.
- Experimental C10 candidates remain under `content/experimental/phase-28/`.
