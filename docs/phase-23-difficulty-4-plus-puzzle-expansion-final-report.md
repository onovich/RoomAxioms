# Phase 23 Difficulty 4+ Puzzle Expansion Final Report

Post-Phase 24 note: `case-021` was later kept in the release selector but downgraded by user review to player-facing difficulty 3. The Phase 23 target-4 evidence below is retained as historical machine-gate evidence, not as the current selector tier.

Status: READY_FOR_CHECK_WITH_BLOCKER
Guide: docs/phase-23-difficulty-4-plus-puzzle-expansion-goal-mode-execution-guide.md
Final commit: final report commit; hash reported by executor route response

## Summary

Phase 23 implemented the requested intake, copy/quarantine, degeneracy, difficulty review, candidate evidence, and selector-tier work, but did not honestly produce the requested 20 new target-4 cases plus 10 super-hard cases.

Promoted Phase 23 cases:

- Target 4/5 at Phase 23 close: 1 (`case-021`, later downgraded to difficulty 3 by Phase 24 user review)
- Super-hard 6-7: 0

Final status is therefore `READY_FOR_CHECK_WITH_BLOCKER`.

## User Rating Intake

`docs/phase-23/user-rating-intake.md` records the user's Phase 22 ratings as binding input:

- `case-004`, `case-011`, and `case-012` remain useful accepted baseline cases.
- `case-015`, `case-017`, `case-018`, and `case-020` are low-rated baseline/mechanics samples, not 4+ content.
- `case-019` is not accepted as player-facing content.
- Edge/sightline singleton giveaways and untranslated terms are explicit Phase 23 defects.

## Copy And Case-019 Resolution

- `case-004` universal positive wording was repaired to use `必有`.
- Shipped selector copy was localized in the earlier Phase 23 copy pass.
- `case-019` remains in `content/cases` for auditability but is absent from `apps/web/src/content/cases.ts`, so it is quarantined from the player selector.
- Boundary scan: `case-019` and `east-shelf` only appear in `content/cases/case-019.json`, not in the web selector path.

## Degeneracy Gates Implemented

Implemented and validated in authoring/anti-clone gates:

- singleton or near-singleton region/line scopes;
- direct line/region count giveaways;
- redundant/non-contributing rules;
- material rule-family diversity;
- clone-like proof, shrink, rule-impact, and effective-board signatures.

Evidence docs:

- `docs/phase-23/degeneracy-gate-design.md`
- `docs/phase-23/difficulty-rubric-v2.md`

## Target 4/5 Cases

Promoted:

- `content/cases/case-021.json`

`case-021` authoring report:

- `ok`: true
- recommended bucket: `target-4`
- initial guest layouts: 56
- proof waves: 4
- deductions: 23
- effective unknown cells: 19
- frontier unlocks: 3
- shared-variable overlap: 5
- material families: `anchor`, `foreach`, `global`, `region`
- redundant rules: none
- degeneracy: pass
- targetFour: pass
- superHard: fail on proof-wave-count

Target attempts:

- Round 09: inherited/generator audit found no existing Phase 23 target-ready candidate.
- Round 10: `case-021` promoted.
- Round 11: L-chain probes rejected.
- Round 12: double-row anchor-chain probes rejected.
- Round 13: sightline-region-anchor and middle-mirror line-finish probes rejected.

Documented target probes/attempts: at least 30 including generator seeds, temporary probes, and the promoted `case-021`.

## Super-Hard 6-7 Cases

Promoted: none.

Round 14 attempted ten super-hard reveal-reduction probes, `phase-23-super-hard-probe-041` through `phase-23-super-hard-probe-050`.

Result:

- 0 promoted.
- Several remained structurally target-4 but exceeded the candidate-layout cap.
- None reached the 6 proof-wave super-hard threshold.
- One-reveal variants made important rules redundant or lost shared-overlap pressure.

Finding: the current content method cannot make honest 6-7 cases by simply reducing reveals on a 4+ skeleton.

## Rejected And Deferred Candidates

Rejected/deferred evidence:

- `docs/phase-23/target-candidate-production-round-09.md`
- `docs/phase-23/target-candidate-production-round-11.md`
- `docs/phase-23/target-candidate-production-round-12.md`
- `docs/phase-23/target-candidate-production-round-13.md`
- `docs/phase-23/super-hard-candidate-production-round-14.md`
- `content/experimental/phase-23/rejected/phase-23-probe-022-double-row-anchor-chain.json`

Common rejection causes:

- proof `GUESS_POINT` or `EXPLANATION_GAP`;
- solver/candidate-layout caps;
- redundant rules after adding enough reveals to tame caps;
- degeneracy warning/failure;
- line/sightline rules becoming visually novel but materially unnecessary.

## Selector Order

At Phase 23 close, `apps/web/src/content/cases.ts` assigned selector tiers:

- baseline/mechanics samples: all existing selected cases except `case-021`;
- target-4 candidate: `case-021`;
- super-hard: none.

`apps/web/src/view/components/TopBar.tsx` renders selector `optgroup` labels so low-rated baseline content no longer masquerades as 4+ content.

Post-Phase 24 status: `case-021` is now a baseline difficulty-3 case, so the current selector has no `target-4` or `super-hard` cases.

## Validation Evidence

Final code-validation run before selector commit:

- `pnpm lint`: PASS
- `pnpm typecheck`: PASS
- `pnpm test`: PASS
  - domain: 3 files, 19 tests
  - schema: 4 files, 32 tests
  - oracle: 5 files, 18 tests
  - solver: 7 files, 48 tests
  - proof: 9 files, 49 tests
  - generator: 8 files, 15 tests
  - web: 11 files, 76 tests
  - authoring: 5 files, 60 tests
- `pnpm build`: PASS

Focused validation:

- `pnpm --filter @room-axioms/web test -- src/content/caseVerification.test.ts`: PASS
- `pnpm authoring -- report content/cases/case-021.json`: PASS, target-4
- `pnpm authoring -- anti-clone <selector cases> --novelty-manifest content/novelty-claims.json --include-degeneracy`: overall FAIL due legacy baseline gates; `case-021` degeneracy and rule-family PASS, novelty manifest PASS.

## Smoke / Pages Evidence

- `StartDevServer.cmd`: PASS, served `http://127.0.0.1:5173/RoomAxioms/`
- `Smoke.cmd`: PASS
- `StopDevServer.cmd`: PASS, stopped process tree
- `https://onovich.github.io/RoomAxioms/`: HTTP 200
- `http://blog.onovich.com/RoomAxioms/`: HTTP 200

## Boundary Scans

- `rg "case-019|phase-23-probe|super-hard-probe|content/experimental" apps/web/src content/cases -n`: only `content/cases/case-019.json` matched.
- `rg "east shelf|east-shelf|East shelf|west shelf|north shelf|south shelf" apps/web/src content/cases -n`: only quarantined `content/cases/case-019.json` matched.
- Player UI still does not import experimental candidates, rejected probes, authoring reports, target layouts, forced-cell overlays, generator internals, or anti-clone internals.

## Blockers Or Caveats

- Blocker: Phase 23 did not produce the requested 20 target-4 promotions or 10 super-hard promotions.
- Honest promoted count at Phase 23 close was 1 target-4 and 0 super-hard; after the Phase 24 case-021 downgrade, the current honest high-tier count is 0 target-4 and 0 super-hard.
- Legacy selector cases still fail new Phase 23 gates when judged as hard content:
  - degeneracy fail: `case-015`, `case-017`, `case-018`, `case-020`;
  - single material-family fail: `case-011`, `case-013`, `case-014`.
- The selector now labels these as baseline/mechanics samples rather than 4+ content.
- Future high-tier production likely needs new proof skeletons or verifier-backed high-tier mechanics, not reveal reduction or visual reshuffling of `case-021`.

## PASS Criteria Status

- Final report exists: PASS
- User rating intake exists: PASS
- Difficulty rubric exists: PASS
- `case-004` `必有` copy repaired: PASS
- `case-019` repaired or quarantined: PASS, quarantined from selector
- Degeneracy gates implemented: PASS
- At least 20 target candidates attempted: PASS
- At least 10 super-hard candidates attempted: PASS
- 20 target promotions: FAIL/BLOCKED, only 1 promoted
- 10 super-hard promotions: FAIL/BLOCKED, 0 promoted
- Promoted Phase 23 case passes schema/solver/proof/degeneracy/novelty/runtime: PASS for `case-021`
- Player secrecy preserved: PASS
- No non-scope public editor/backend/analytics/theme work: PASS
- Final status: READY_FOR_CHECK_WITH_BLOCKER
