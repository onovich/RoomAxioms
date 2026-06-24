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

## Current Execution State

- Recently accepted: Phase 10 - Authoring CLI And Proof Technique Hardening, PASS, final commit `c377dfb`; copy cleanup commit `f0fcc97`.
- Current active phase: Phase 11 - Candidate Promotion And Playtest Calibration.
- Active guide: `docs/phase-11-candidate-promotion-playtest-calibration-goal-mode-execution-guide.md`.
- Executor budget: 12 rounds.
- Executor status: complete and ready for planner check.
- Final report: `docs/phase-11-candidate-promotion-playtest-calibration-final-report.md`.
- Promoted content: `content/cases/case-011.json`.
- Dispatch target: executor thread `019ef271-256c-7be2-9663-e658e2378564`.

## Total Budget

- Main pre-MVP executor budget: 65 rounds, covering Phase 1 through Phase 8.
- Expansion exploration budget: 8 rounds, covering Phase 9.
- Post-spike hardening budget: 16 rounds, covering Phase 10.
- Content promotion and calibration budget: 12 rounds, covering Phase 11.
- Extra planner/checker budget: roughly 1-2 turns per phase, about 8-16 turns before MVP.
