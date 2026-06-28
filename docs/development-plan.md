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
| Phase 22 - Expressive Mechanics And Content Expansion Lab | Add region, sightline, anchor-frontier, and high-tier contaminated-record mechanics, then use them to try an honest 10-20 case selector | User-approved mechanics expansion | 24 rounds |
| Phase 23 - Difficulty 4+ Puzzle Expansion And Degeneracy Gates | Turn user playtest ratings into stricter difficulty, copy, degeneracy, and anti-giveaway gates, then attempt 20 target-difficulty and 10 super-hard new cases | User rejection of low-difficulty Phase 22 cases | 40 rounds |
| Phase 24 - Rule Grammar Expressiveness Expansion | Expand the rule grammar deliberately after Phase 23 evidence shows which puzzle interactions remain too shallow; prioritize shared variables, overlapping scopes, conditional/comparative constraints, and contaminated-record variants that create deeper proof frontiers | User direction: rule grammar expansion is the next planning priority | 24 rounds |
| Phase 25 - Authoring Editor And Live Diagnostics Workbench | Build a maintainer-facing level editor plus immediate diagnostics for uniqueness, no-guess proof, rule contribution, degeneracy, effective board, clone risk, and difficulty signals so human authors can design faster without relying on bulk AI generation | User direction: editor + instant diagnostics is the next-stage plan | 28 rounds |
| Phase 26 - Workbench-Guided Puzzle Ladder Production | Use the Phase 25 workbench to author, repair, and promote genuinely non-degenerate high-quality puzzles while preserving strict anti-clone, proof, copy, and playability gates | Phase 24/25 follow-up | 32 rounds |
| Phase 27 - Proof And Authoring Bridge Hardening | Harden proof/authoring support for derived-fact reuse, late closure, comparative/overlap/conditional material, and targeted fixtures before another broad puzzle-production pass | Phase 26 blocker follow-up | 24 rounds |
| Phase 28 - Nondegenerate Puzzle Rewrite Sprint | Use Phase 27 proof/diagnostic improvements to rewrite the best near-miss skeletons into non-degenerate target-4 candidates, prioritizing C15 first and late-closure redesign for C06/C10/C09 second | Phase 27 blocker follow-up | 18 rounds |
| Phase 29 - Proof Skeleton Authoring Workflow | Pivot from JSON mutation to proof-skeleton-first authoring: define wave-by-wave human proof templates, add private skeleton review artifacts/tooling, and produce reviewable skeleton briefs before any further content promotion attempt | Phase 28 blocker follow-up | 16 rounds |
| Phase 30 - Non-Singleton Overlap Proof Bridge | Add the smallest proof/authoring bridge or early diagnostic for non-singleton overlap-frontier skeletons that current solver constraints find material but HumanReasoner cannot explain | Phase 29 blocker follow-up | 18 rounds |
| Phase 31 - Rule Expression Builder And Theme Packaging Workflow | Turn the private workbench into a rule-expression authoring surface where authors compose rules instead of editing JSON, generated text follows rule logic, and the Unregistered Scene theme/VN packaging workflow is split for parallel art-driven implementation | Phase 30 blocker-aware product pivot | 22 rounds |
| Phase 32 - Theme VN Runtime Foundation | Build the safe presentation foundation for the Unregistered Scene wrapper: asset manifest, placeholder-safe theme hooks, VN dialogue data/renderer, trigger integration, and secrecy tests without final art claims or mechanics changes | Phase 31 theme packaging follow-up | 24 rounds |

## Current Execution State

- Recently checked: Phase 31 - Rule Expression Builder And Theme Packaging Workflow, accepted, final commit `4a1c364`.
- Current executor result: Phase 32 dispatched to executor thread `019ef271-256c-7be2-9663-e658e2378564`.
- Active guide: `docs/phase-32-theme-vn-runtime-foundation-goal-mode-execution-guide.md`.
- Executor budget: 24 rounds.
- Executor status: executing theme VN runtime foundation.
- Last completed final report: `docs/phase-31-rule-expression-builder-theme-packaging-final-report.md`.
- Current player-facing selector: `case-004`, `case-011`, `case-013`, `case-015`, `case-012`, `case-014`, `case-017`, `case-018`, `case-020`, and `case-021`.
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
- Phase 21 result: promoted two distinct new cases, `case-013` and `case-014`, preserving `case-004`, `case-011`, and `case-012`; the final selector is `case-004`, `case-011`, `case-013`, `case-012`, and `case-014`, all passing anti-clone and novelty gates.
- Phase 22 result: region/zone, sightline/blocker, anchor-frontier, and high-tier contaminated-record verifier support are implemented and accepted; the player selector now has 10 anti-clone-checked cases (`case-004`, `case-011`, `case-013`, `case-015`, `case-012`, `case-014`, `case-017`, `case-018`, `case-019`, `case-020`) preserving `case-004` as default; contaminated-record content remains internal verifier evidence only.
- Phase 23 target: encode the user's difficulty ratings and failure modes into stricter authoring gates, fix copy and `case-019`, reject direct edge/sightline giveaways, and attempt 20 new 4/5 cases plus 10 super-hard 6-7 cases without padding or fabricated calibration.
- Phase 23 result: accepted with blocker. The phase produced stricter difficulty/degeneracy gates, localized copy fixes, selector tiering, and one machine-valid high-tier candidate (`case-021`); later Phase 24 user review kept `case-021` released but downgraded its player-facing difficulty to 3. `case-019` is quarantined from the player selector; the requested 20 target-4 and 10 super-hard promotions remain blocked by current mechanics/content-production limits.
- Phase 24 interrupt hotfix result: accepted. Pages deployment now succeeds for `case-021` after CI-only heavy verification timeouts were raised to 30 seconds and the shipped-case verification release ceiling was raised to 10 seconds; correctness checks still require schema, solver/proof, no-guess, uniqueness, runtime readiness, and no truncation.
- Phase 24 interrupt content-quality checkpoint: accepted at commit `24fa876`. `case-021` now removes the fixed five-cell region giveaway rule, treats those cells as ordinary opening reveals, uses `垃圾桶` wording, and records the remaining copy/degeneracy audit in `docs/phase-24/case-021-salvage-and-copy-audit.md`.
- Phase 24 interrupt rating checkpoint: `case-021` remains released but is presented as difficulty 3/baseline rather than `target-4`; R3/R4 redundancy was probed, but narrow removal/replacement attempts either broke no-guess proof or produced default authoring truncation, so the overlap remains a documented quality caveat; Phase 24 grammar work remains active.
- Planned Phase 24 direction: expand the rule grammar only after Phase 23 exposes the real bottlenecks; favor constraints that make rules share variables and create multi-step overlapping proof frontiers, not one-off syntax.
- Phase 24 target: implement additive comparative, conditional, overlap, and readable contaminated-record grammar slices where feasible; prove them through fixtures, authoring reports, experimental cases, and hardness probes rather than bulk case production.
- Phase 24 result: accepted with blocker. `scopeOverlapCount`, `comparativeCount`, and `conditionalCount` are implemented end to end across domain/schema/oracle/solver/proof/authoring/web copy and hints; `recordContamination` remains deferred. The blocker is content expressiveness: Phase 24 experimental cases validate grammar integration but have `initialGuestLayouts = 1` and `proofWaveCount = 0`, so they are not non-degenerate high-difficulty puzzles.
- Planned Phase 25 direction: build a maintainer-facing authoring editor and live diagnostics workbench so level design becomes an inspectable human-in-the-loop workflow rather than pure AI generation.
- Phase 25 target: implement a private maintainer-only workbench that can import/edit/export puzzle drafts and show immediate schema, solver, proof, degeneracy, clone-risk, rule contribution, copy-warning, and difficulty diagnostics without exposing public UGC.
- Phase 25 result: accepted. The private workbench exists behind `#authoring-workbench` / `?authoring=workbench`, supports import/edit/export, and surfaces schema, solver, proof, degeneracy, clone-risk, rule contribution, copy-warning, difficulty, and cap/truncation diagnostics while keeping normal player flow unchanged.
- Planned Phase 26 direction: use the workbench to produce and validate a smaller but genuinely non-degenerate puzzle ladder, prioritizing quality over quantity and treating subjective fun/novelty as human-review gates.
- Phase 26 target: attempt at least 12 serious workbench-guided candidates, promote at least 4 genuinely non-degenerate cases if strict gates allow, and otherwise report an honest blocker with a high-quality rejection corpus.
- Phase 26 result: accepted with blocker. Fifteen serious workbench-guided candidates were attempted and all were rejected under strict gates; the player selector remains unchanged. The blocker points to proof/authoring readiness gaps around derived-fact reuse, late closure, and Phase 24 grammar material.
- Planned Phase 27 direction: harden proof and authoring fixtures for derived facts, late closure, comparative/overlap/conditional techniques, and no-guess closure before attempting another broad puzzle ladder pass.
- Phase 27 target: build focused fixtures, proof techniques, diagnostics, and a small near-miss repair trial so Phase 26 failure modes become explainable or detectable earlier; do not run another broad content batch.
- Phase 27 result: accepted with blocker. Derived object and grammar-count bridge support now works for focused fixtures, proof closure diagnostics are more precise, and C15 now reaches no-guess/human-explainable status; no case was promoted because C15 remains degenerate and C06/C10/C09 still need new late-closure content design.
- Planned Phase 28 direction: run a narrow rewrite sprint instead of a broad generation batch, starting from C15's now-proven overlap skeleton and only promoting content that passes non-degeneracy, target-4, anti-clone, proof, and copy gates.
- Phase 28 result: accepted with blocker. Three serious C15 rewrites and two C10 late-closure rewrites were rejected under strict gates; no shipped content changed. The evidence says local JSON mutation is exhausted for these skeletons.
- Planned Phase 29 direction: create a proof-skeleton-first authoring workflow so humans and tools design intended wave-by-wave reasoning before committing to board/rule JSON.
- Phase 29 result: accepted with blocker. The skeleton format, review rubric, target-4 checklist, authoring helper, three skeleton briefs, and one translation trial are complete. The trial avoided C15's old degeneracy but produced no human-visible overlap deduction, identifying a focused proof/authoring bridge gap.
- Planned Phase 30 direction: implement or explicitly diagnose the smallest non-singleton overlap proof bridge needed by the Phase 29 overlap-frontier skeleton; do not run another content production sprint.
- Phase 30 result: accepted with blocker. The non-singleton overlap scope-difference bridge now produces human-visible deductions for the Phase 29 trial opener, and diagnostics distinguish unsupported overlap material from partial bridge stalls. The trial still reaches a later `GUESS_POINT`, so it remains non-promotable and the next phase should not be another broad JSON mutation or AI puzzle-production sprint.
- Planned Phase 31 direction: serve human level design and presentation work. Build a private rule expression builder so authors compose rule logic through controls, generated copy follows that logic, JSON becomes export/storage only, and theme/VN packaging is broken into asset intake and implementation tracks that can run in parallel with manual puzzle authoring.
- Phase 31 result: accepted. The workbench now has a private structured rule-expression builder for supported rule families; generated Chinese rule text follows rule logic; raw rules JSON is debug/export instead of the normal authoring path; and theme/VN package intake plus secrecy helper scaffolding exists for later art-driven implementation.
- Planned Phase 32 direction: build a safe, asset-ready theme/VN runtime foundation: asset manifest, placeholder-safe rendering, dialogue data and overlay, case/hint/success/failure triggers, and secrecy tests. Do not import final art, generate AI art, promote cases, or alter puzzle mechanics in this phase.
- Dispatch target: executor thread `019ef271-256c-7be2-9663-e658e2378564`.

## Candidate Future Directions

These are accepted as candidates, not active execution scope:

- Human-authored proof skeletons with solver-assisted map/fact filling.
- A bad-case corpus for rejected patterns such as mirrors, padding, one-rule solutions, singleton sightlines, and direct edge giveaways.
- Batch candidate generation plus ruthless automated filtering, with AI only reviewing survivors.
- Theme/VN packaging integration after the puzzle production loop is stable.
- Public editor or UGC only after private authoring and validation workflows are mature.

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
- Distinct puzzle ladder production budget: 16 rounds, covering Phase 21, completed.
- Expressive mechanics and content expansion lab budget: 24 rounds, covering Phase 22, completed.
- Difficulty 4+ puzzle expansion budget: 40 rounds, covering Phase 23, completed with blocker.
- Rule grammar expressiveness expansion budget: 24 rounds, covering Phase 24, completed with blocker.
- Authoring editor and live diagnostics workbench budget: 28 rounds, covering Phase 25, completed.
- Workbench-guided puzzle ladder production budget: 32 rounds, covering Phase 26, completed with blocker.
- Proof and authoring bridge hardening budget: 24 rounds, covering Phase 27, completed with blocker.
- Nondegenerate puzzle rewrite sprint budget: 18 rounds, covering Phase 28, completed with blocker.
- Proof skeleton authoring workflow budget: 16 rounds, covering Phase 29, completed with blocker.
- Non-singleton overlap proof bridge budget: 18 rounds, covering active Phase 30.
- Rule expression builder and theme packaging workflow budget: 22 rounds, covering Phase 31, completed.
- Theme VN runtime foundation budget: 24 rounds, covering planned Phase 32.
- Extra planner/checker budget: roughly 1-2 turns per phase, about 8-16 turns before MVP.
