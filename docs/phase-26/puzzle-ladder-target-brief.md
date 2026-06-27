# Phase 26 Puzzle Ladder Target Brief

Status: Round 1 baseline.
Guide: `docs/phase-26-workbench-guided-puzzle-ladder-production-goal-mode-execution-guide.md`

## Purpose

Phase 26 uses the private Phase 25 workbench and authoring CLI to produce a
smaller, honest puzzle ladder. The goal is not to fill the selector with more
cases. The goal is to find or repair cases whose proof flow is materially
distinct, readable from player-facing text, and not explained by padding,
mirroring, singleton scopes, or one-rule closure.

Automated authoring scores remain uncalibrated. Human review can downgrade or
reject a mechanically valid case, as happened with `case-021`.

## Current Selector Baseline

The current player-facing selector contains:

| Case | Current role | Phase 26 interpretation |
| --- | --- | --- |
| `case-004` | Default baseline | Preserve unless a deliberately superior default is documented. Useful mixed cleaning-chain baseline. |
| `case-011` | Baseline | Preserve as local-scope intersection baseline, but do not count as high-quality new production. |
| `case-013` | Baseline | Preserve for now; user intake rated nearby Phase 21/22 content low, so new candidates must exceed this proof experience. |
| `case-015` | Baseline/tutorial | Known low-rated/simple case; candidate for quarantine or replacement if Phase 26 produces better content. |
| `case-012` | Baseline | Preserve as retained local-scope difference baseline. |
| `case-014` | Baseline/audit | Familiar-feeling baseline; candidate for replacement if a stronger non-clone passes gates. |
| `case-017` | Baseline/tutorial | Low-rated sightline/blocker case; do not use as a target-quality model. |
| `case-018` | Baseline/tutorial | Low-rated anchor-frontier case; do not use as a target-quality model. |
| `case-020` | Baseline/tutorial | Low-rated sightline/blocker case; do not use as a target-quality model. |
| `case-021` | Baseline difficulty 3 | Mechanically valid and released, but explicitly downgraded after user review; R3/R4 redundancy remains a caveat. |

This means Phase 26 promotion accounting starts from a conservative position:
retained shipped cases may stay playable, but new promotion credit requires fresh
evidence from the workbench, CLI report/score, anti-clone checks, novelty review,
and plain-copy review.

## Binding Quality Risks

Reject or quarantine a candidate when one of these is the main reason it works:

- opening guest layout is already unique;
- proof has zero waves or zero meaningful deductions for a normal case;
- a singleton or near-singleton region, line, sightline, overlap, or conditional
  scope gives away a guest or no-guest cell;
- a public rule directly gives a group of safe/no-guest cells while pretending to
  be a hard clue;
- a rule title or flavor relies on highlight-only scope membership;
- visible copy uses internal terms such as `anchor`, raw rule family names,
  `target-4`, safe-area wording, empty-zone wording, or untranslated English;
- rule contribution marks passenger rules as redundant without a documented
  onboarding reason;
- the effective board removes padded cells that do not affect uncertainty,
  proof movement, or final uniqueness;
- proof trace, candidate-shrink signature, rule-impact vector, or effective-board
  shape collides with an accepted case without a strong novelty claim;
- the candidate differs only by mirror, rotation, object labels, padding, or
  irrelevant safe area;
- difficulty is presented as playtest-calibrated without real participant
  evidence.

Warnings may be reviewed by a maintainer, but Phase 26 should not count a case as
a promoted high-quality addition unless the review explains why the warning does
not carry the player's experience.

## Promotion Gate

Every promoted Phase 26 case must have evidence for:

- `pnpm authoring -- report <candidate>` passing schema, target-rules,
  initial satisfiability, no-guess proof, final uniqueness, and no truncation
  under default caps or an explicit cap-aware justification;
- `pnpm authoring -- score <candidate>` recorded as uncalibrated;
- initial guest-layout count greater than one;
- at least one proof wave and at least one non-trivial deduction;
- degeneracy gate not failing;
- rule contribution and rule-family diversity reviewed;
- anti-clone comparison against the shipped selector with
  `--include-degeneracy`;
- novelty claim written in language a human reviewer can understand;
- Chinese player-facing copy that fully describes rule semantics without relying
  on hidden highlights;
- workbench diagnostics exported or summarized in the candidate review log.

The preferred result is 6-10 promotions. The minimum PASS target is 4. If strict
gates block four honest promotions, the phase should return
`READY_FOR_CHECK_WITH_BLOCKER` with a useful rejection corpus instead of padding
the selector.

## Target Proof Skeletons

These skeletons are authoring targets, not promises that every attempt will pass.
Rounds 3-4 should turn them into candidate templates and the review ledger should
record which skeleton each attempt used.

| Skeleton | Intended proof shape | Useful rule pressure | Rejection traps |
| --- | --- | --- | --- |
| Crossing overlap unlock | Two visible scopes overlap; resolving one side leaves the overlap or remainder saturated. | `scopeOverlapCount`, region/line counts, local object facts. | Direct overlap singleton, hidden highlight dependency, clone of `case-004` chain. |
| Comparative balance fork | Two readable scopes are compared; one observed object or local count breaks the tie later. | `comparativeCount`, region counts, anchor/local counts. | Same-scope comparison, decorative comparison, opening unique layout. |
| Conditional frontier unlock | A public condition becomes true after an early deduction and activates a second count. | `conditionalCount`, local/region counts, reveal frontier. | Condition already fully decides the puzzle, consequence is a direct giveaway. |
| Difference/intersection braid | Local-scope difference and intersection alternate so an early safe/object conclusion unlocks a later guest conclusion. | `LOCAL_SCOPE_DIFFERENCE`, `LOCAL_SCOPE_INTERSECTION`, object-local rules. | Reusing `case-011` or `case-012` answer pattern, one-family closure. |
| Object-gated local saturation | A specific object kind turns a neighborhood or ring into a saturated count only after another rule identifies the object. | `foreach`, `anchorCount`, local counts, object reveals. | Anchor wording exposed as an internal label, all guests found by one object rule. |
| Two-wave reveal frontier | Opening observations leave several layouts; first wave finds a safe/object cell that changes the material scope for the second wave. | Region/line/sightline with blockers, anchor-frontier, local counts. | Padded board, singleton ray after opening, proof wave only from trivial safe cells. |
| Grammar-and-classic hybrid | One Phase 24 grammar rule is necessary, but classic rules carry the rest of the player-readable proof. | One of `scopeOverlapCount`, `comparativeCount`, or `conditionalCount` plus classic counts. | Grammar fixture with `initialGuestLayouts = 1` and no proof wave. |

At least one promoted case should materially use Phase 24 grammar. If no such
case survives, record whether the blocker is proof support, copy clarity,
degeneracy, or subjective redundancy.

## Candidate Attempt Accounting

Phase 26 must attempt at least 12 serious candidates. A serious attempt must have:

- a candidate id and file path under `content/experimental/phase-26/` or an
  explicitly named repaired shipped case;
- an intended proof skeleton from this brief or a new documented skeleton;
- authoring `report` evidence;
- authoring `score` evidence;
- workbench or diagnostics summary;
- decision: rejected, deferred, repaired, promoted, or quarantined;
- exact rejection reason if not promoted.

Rejected candidates remain valuable if they sharpen the blocker. Do not delete
them to make the phase look cleaner.

## Round 2 Audit Targets

Round 2 should extend this brief or create companion evidence with:

- a quick workbench/CLI audit of all currently selected cases;
- a list of shipped cases that are replacement candidates rather than promotion
  quality references;
- the initial structure for `docs/phase-26/candidate-review-log.md`;
- the private folder plan for `content/experimental/phase-26/`.

No Phase 26 candidate should be promoted before that ledger exists.
