# Room Axioms Development Plan

Date: 2026-06-23
Purpose: shared phase plan and executor round budget for planner, executor, and checker threads.

## Round Definition

One executor round means: read the active guide, complete one narrow goal, run the validation required for that round, commit and push, then report the result.

Planner/checker rounds are not counted in the executor budgets below. Most phases also need 1-2 planner/checker turns for PASS validation, repair routing, and the next guide.

## Phase Plan

| Phase | Scope | Backlog | Budget |
|---|---|---|---:|
| Phase 0 - Prototype Baseline | Accept handoff, initialize repo, publish current web prototype, preserve original docs and prototype assets | RA-001 + prototype publication | done |
| Phase 1 - Domain Core Package | Create `@room-axioms/domain` with coordinates, board traversal, neighborhoods, rule types, events, and pure reducer while preserving current UI behavior | RA-002 | 8 rounds |
| Phase 2 - Schema And Content Contract | Create Puzzle Schema v1, Zod validation, diagnostics, fixture conventions, and case-004 content migration | RA-003 | 6 rounds |
| Phase 3 - Oracle And Verification Harness | Implement small-scale brute-force oracle, align with hand-calculated fixtures, and form regression baseline | RA-004 | 7 rounds |
| Phase 4 - Solver Core And Queries | Implement finite-domain CSP core, candidate worlds, forced-cell queries, guest-layout uniqueness, counting, and performance budgets | RA-005, RA-006 | 10 rounds |
| Phase 5 - Human Reasoning And Proofs | Implement HumanReasoner v1, proof DAG, proof renderer, no-guess verifier, and case-004 explainable chain | RA-007, RA-008, RA-010 | 10 rounds |
| Phase 6 - Web Runtime Integration | Connect solver/proof through Worker, hints, developer inspector, progress, and error states while preserving stable UI flow | RA-009, RA-010, RA-012, RA-016 | 8 rounds |
| Phase 7 - MVP Content And UX Hardening | Produce first 10 cases, three-engine E2E, keyboard/screen-reader support, responsive polish, performance baseline, and rule-copy revision | RA-011, RA-013, RA-014, RA-015, RA-018, RA-019, RA-020 | 10 rounds |
| Phase 8 - Release QA And Playtest Loop | Validate Pages release, run playtest research, organize findings, fix P0/P1 defects, and decide MVP release readiness | RA-017 + release gates | 6 rounds |
| Phase 9 - Generator And Expansion Spike | Explore generator v1, initial reveal minimization, difficulty scoring, technique expansion, internal editor, and follow-up scope | RA-021 to RA-028 | 8 exploratory rounds |
| Phase 10 - Authoring CLI And Proof Technique Hardening | Implement `LOCAL_SCOPE_INTERSECTION`, add private authoring CLI/report workflow, and create validated experimental mid-band fixtures without public UGC or content promotion | Phase 9 recommendations | 16 rounds |
| Phase 11 - Candidate Promotion And Playtest Calibration | Use authoring CLI evidence to promote validated mid-band candidates, harden runtime/copy/smoke evidence, and prepare honest playtest calibration records without public UGC or new DSL | Phase 10 recommendations | 12 rounds |
| Phase 12 - Local Scope Difference And Content Expansion | Implement proof-side `LOCAL_SCOPE_DIFFERENCE`, validate experimental difference fixtures, and optionally promote one gated case without new DSL or public editor scope | Phase 9/11 recommendations | 14 rounds |
| Phase 13 - Difference Case Authoring And Release Calibration | Author or sample a natural mid-band difference case, require minimization to retain `LOCAL_SCOPE_DIFFERENCE`, and promote at most one gated case | Phase 12 follow-up | 12 rounds |
| Phase 14 - Difference Authoring Heuristics And Candidate Repair | Turn Phase 13 stop evidence into private retention-check tooling, better difference candidate heuristics, and at most one gated promotion | Phase 13 follow-up | 14 rounds |
| Phase 15 - Retained Difference Candidate Search And Promotion | Use Phase 14 retention tooling to search for a natural retained-difference case that unlocks later proof progress, with at most one gated promotion | Phase 14 follow-up | 12 rounds |
| Phase 16 - Case 012 Release QA And Playtest Calibration | Release QA, copy review, smoke, player-secrecy checks, and honest playtest calibration prep for the newly promoted `case-012` | Phase 15 follow-up | 8 rounds |
| Phase 17 - MVP Release Closure And Honest Playtest Intake | Close the current 12-case MVP as a release candidate with release checklist, known limitations, honest playtest intake, smoke evidence, and release decision | Phase 16 follow-up | 6 rounds |
| Phase 18 - Public Playtest Launch Package And Metadata Cleanup | Prepare an honest public playtest launch package, clean internal shipped-case metadata, and validate the release-candidate sharing surface without new product scope | Phase 17 follow-up | 6 rounds |
| Phase 19 - High-Quality Puzzle Ladder And Generator Quality Gates | Replace filler/mirror cases with a real difficulty ladder, add automated content quality gates, and report the generator/authoring capability ceiling honestly | User playtest feedback + content quality follow-up | 14 rounds |
| Phase 20 - Anti-Clone Puzzle Quality And Ladder Repair | Repair Phase 19's rejected content by adding effective-board, proof-trace, shrink-signature, rule-impact, and novelty-claim gates before rebuilding the selector | User rejection of Phase 19 clone-like cases | 16 rounds |
| Phase 21 - Distinct Puzzle Ladder Production | Produce new player-facing cases from distinct proof skeletons under Phase 20 anti-clone gates, promoting only genuinely novel cases | Phase 20 follow-up | 16 rounds |

## Current Execution State

- Recently accepted: Phase 20 - Anti-Clone Puzzle Quality And Ladder Repair, PASS, final commit `0618515`.
- Current active phase: Phase 21 - Distinct Puzzle Ladder Production.
- Active guide: `docs/phase-21-distinct-puzzle-ladder-production-goal-mode-execution-guide.md`.
- Executor budget: 16 rounds.
- Executor status: ready for dispatch.
- Final report target: `docs/phase-21-distinct-puzzle-ladder-production-final-report.md`.
- Promoted content: `content/cases/case-011.json` and `content/cases/case-012.json`.
- Phase 12 experimental content: `content/experimental/phase-12/phase-12-local-scope-difference-001.json`; not promoted to shipped content.
- Phase 13 experimental content: `content/experimental/phase-13/`; not promoted to shipped content because reviewed candidates did not preserve `LOCAL_SCOPE_DIFFERENCE` through minimization and proof gates.
- Phase 14 experimental content: `content/experimental/phase-14/`; not promoted to shipped content because the retained-difference candidate still failed proof/final uniqueness and the repaired candidates erased the need for `LOCAL_SCOPE_DIFFERENCE`.
- Phase 14 result: private authoring retention checks now make required proof-technique survival explicit during minimization; no public editor, new DSL, or automatic promotion entered the product.
- Phase 15 result: promoted one retained-difference case as `content/cases/case-012.json` after report/score/web verification and `minimize --require-technique LOCAL_SCOPE_DIFFERENCE` retained the required technique.
- Phase 16 result: case-012 release QA, authoring retention, runtime secrecy tests, responsive/keyboard smoke evidence, playtest protocol, and empty honest feedback log are complete. No new cases or broad feature expansion were added.
- Phase 17 result: current 12-case MVP is documented as a release candidate with checklist, known limitations, release decision, playtest intake protocol, empty honest feedback log, smoke evidence, and boundary scans complete. No P0/P1 release blocker was found.
- Phase 18 result: public playtest launch package is ready, internal shipped-case metadata is neutralized, the 12-case release candidate is preserved, and difficulty remains uncalibrated until real playtest evidence exists.
- Phase 19 result: player-facing content is now an 8-case difficulty ladder; the trivial and mirror cases were replaced or removed from the selector; private authoring quality gates now cover opening ambiguity, proof waves, deduction count, rule contribution, non-isomorphism, and technique retention.
- Phase 20 result: the player selector is now the smaller honest set `case-011`, `case-012`, and `case-004`; anti-clone gates now cover effective-board reduction, proof-trace fingerprints, candidate-shrink signatures, rule-impact vectors, and novelty claims; rejected Phase 19 clones are no longer player-facing.
- Phase 21 planned work: expand the selector only with cases designed from distinct proof skeletons and accepted by Phase 20 anti-clone gates; promote at least two genuinely novel cases or report a blocker rather than padding.
- Dispatch target: executor thread `019ef271-256c-7be2-9663-e658e2378564`.

## Total Budget

- Main pre-MVP executor budget: 65 rounds, covering Phase 1 through Phase 8.
- Expansion exploration budget: 8 rounds, covering Phase 9.
- Post-spike hardening budget: 16 rounds, covering Phase 10.
- Content promotion and calibration budget: 12 rounds, covering Phase 11.
- Difference proof and content expansion budget: 14 rounds, covering Phase 12.
- Difference case authoring budget: 12 rounds, covering Phase 13.
- Difference authoring heuristic budget: 14 rounds, covering Phase 14.
- Retained-difference candidate search budget: 12 rounds, covering Phase 15.
- Case-012 release QA and calibration budget: 8 rounds, covering Phase 16.
- MVP release closure budget: 6 rounds, covering Phase 17.
- Public playtest launch package budget: 6 rounds, covering Phase 18.
- High-quality puzzle ladder budget: 14 rounds, covering Phase 19, completed.
- Anti-clone ladder repair budget: 16 rounds, covering Phase 20, completed.
- Distinct puzzle ladder production budget: 16 rounds, covering Phase 21.
- Extra planner/checker budget: roughly 1-2 turns per phase, about 8-16 turns before MVP.
