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

## Current Execution State

- Recently accepted: Phase 14 - Difference Authoring Heuristics And Candidate Repair, PASS, final commit `ea23617`.
- Current active phase: Phase 15 - Retained Difference Candidate Search And Promotion.
- Active guide: `docs/phase-15-retained-difference-candidate-search-promotion-goal-mode-execution-guide.md`.
- Executor budget: 12 rounds.
- Executor status: ready for dispatch.
- Final report target: `docs/phase-15-retained-difference-candidate-search-promotion-final-report.md`.
- Promoted content: `content/cases/case-011.json` and `content/cases/case-012.json`.
- Phase 12 experimental content: `content/experimental/phase-12/phase-12-local-scope-difference-001.json`; not promoted to shipped content.
- Phase 13 experimental content: `content/experimental/phase-13/`; not promoted to shipped content because reviewed candidates did not preserve `LOCAL_SCOPE_DIFFERENCE` through minimization and proof gates.
- Phase 14 experimental content: `content/experimental/phase-14/`; not promoted to shipped content because the retained-difference candidate still failed proof/final uniqueness and the repaired candidates erased the need for `LOCAL_SCOPE_DIFFERENCE`.
- Phase 14 result: private authoring retention checks now make required proof-technique survival explicit during minimization; no public editor, new DSL, or automatic promotion entered the product.
- Phase 15 result so far: promoted one retained-difference case as `content/cases/case-012.json` after report/score/web verification and `minimize --require-technique LOCAL_SCOPE_DIFFERENCE` retained the required technique.
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
- Extra planner/checker budget: roughly 1-2 turns per phase, about 8-16 turns before MVP.
