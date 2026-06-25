# Phase 21 Distinct Puzzle Ladder Production Final Report

Status: READY_FOR_CHECK

Planner thread: `019ef0df-a626-7181-9ca6-1cc75c1f4c47`

Executor scope: Phase 21 only.

## Summary

Phase 21 produced a smaller honest selector with five meaningful cases:

1. `case-004` - default mixed cleaning-chain baseline
2. `case-011` - compact local-scope-intersection baseline
3. `case-013` - new crossing-ledger case using `LOCAL_SCOPE_DIFFERENCE` and `LOCAL_SCOPE_INTERSECTION`
4. `case-012` - retained local-scope-difference baseline
5. `case-014` - new hidden-bottle difference case using `LOCAL_COUNT_SATURATED` and `LOCAL_SCOPE_DIFFERENCE`

The phase promoted two genuinely distinct new cases beyond the Phase 20 selector:

- `case-013`
- `case-014`

`case-004` remains the default case. `case-004`, `case-011`, and `case-012` were preserved.

## Key Evidence

- Acceptance contract: `docs/phase-21/baseline-acceptance-contract.md`
- Proof skeleton catalog: `docs/phase-21/proof-skeleton-catalog.md`
- Candidate templates and manifest: `content/experimental/phase-21/templates`, `docs/phase-21/candidate-source-manifest.md`
- Generator capability evidence: `docs/phase-21/generator-capability-evidence.md`
- First promotion decision: `docs/phase-21/first-promotion-decision.md`
- Second promotion decision: `docs/phase-21/second-promotion-decision.md`
- Selector ladder and copy review: `docs/phase-21/selector-ladder-copy-review.md`

## Generator And Authoring Evidence

Seven private skeleton templates were sampled with deterministic seeds `2101` through `2107`.

- Total attempts: 1344
- Accepted generated candidates: 0
- Dominant rejection: `TARGET_VIOLATES_RULES`
- Additional proof-gap rejection: S5 produced 3 `PROOF_GUESS_POINT` rejections

This zero-accepted generator result was recorded honestly. The two promoted cases came from manual authoring/proof-skeleton work, not from padding generated map variants.

## Promoted Case Gates

`case-013`:

- report: PASS
- initial guest layouts: 2
- final guest cells: `C2`, `B3`
- proof techniques: `LOCAL_SCOPE_DIFFERENCE`, `LOCAL_SCOPE_INTERSECTION`
- deduction count: 3
- no-guess and human explainable: PASS
- score: 9.73, band 2, uncalibrated
- minimize with `--require-technique LOCAL_SCOPE_INTERSECTION`: PASS
- anti-clone: PASS

`case-014`:

- report: PASS
- initial guest layouts: 4
- final guest cells: `B4`, `C4`
- proof techniques: `LOCAL_COUNT_SATURATED`, `LOCAL_SCOPE_DIFFERENCE`
- deduction count: 8
- no-guess and human explainable: PASS
- score: 15.54, band 4, uncalibrated
- minimize with `--require-technique LOCAL_SCOPE_DIFFERENCE`: PASS
- anti-clone: PASS

Full selector anti-clone command:

```powershell
node packages/authoring/dist/cli.js anti-clone content/cases/case-004.json content/cases/case-011.json content/cases/case-013.json content/cases/case-012.json content/cases/case-014.json --novelty-manifest content/novelty-claims.json
```

Result:

- status: `pass`
- hard failures: 0
- reviewer-blocking findings: 0
- structural evidence groups: none
- accepted novelty claims: `case-004`, `case-011`, `case-012`, `case-013`, `case-014`
- missing-review novelty issues: none

## Selector And Boundary Scans

Rejected/suspect cases remain out of the player selector:

- `case-001`
- `case-002`
- `case-003`
- `case-005`
- `case-006`
- `case-007`
- `case-008`
- `case-009`
- `case-010`

Boundary scan evidence:

```powershell
rg -n "case-001|case-002|case-003|case-005|case-006|case-007|case-008|case-009|case-010|phase-21-s|content/experimental" apps\web\src\content\cases.ts apps\web\src\content\caseVerification.ts apps\web\src\runtime apps\web\src\view apps\web\src\logic
```

Result: no matches.

Additional scan:

```powershell
rg -n "phase-21|internal-phase|experimental|draft" content\cases apps\web\src\content
```

Result: only the existing performance-baseline test fixture contains `status: 'draft'`; shipped cases and selector content are clean.

## Validation

Round validation after successful commits:

- `pnpm lint`: PASS
- `pnpm typecheck`: PASS
- `pnpm test`: PASS
  - apps/web: 11 files, 54 tests
  - packages/authoring: 4 files, 46 tests
- `pnpm build`: PASS
- `git diff --check`: PASS, normal CRLF working-copy warnings only

Focused checks:

- `cmd /c pnpm.cmd --filter @room-axioms/web test -- src/content/caseVerification.test.ts src/content/runtimeSmoke.test.ts`: PASS
- `cmd /c pnpm.cmd --filter @room-axioms/authoring test -- src/noveltyClaims.test.ts`: PASS
- authoring report/score/minimize for `case-013`: PASS
- authoring report/score/minimize for `case-014`: PASS
- full selector anti-clone: PASS

Smoke:

- `StartDevServer.cmd`: PASS, started PID `3644`
- `Smoke.cmd`: PASS
- `StopDevServer.cmd`: PASS
- Local HTTP smoke URL: `http://127.0.0.1:5173/RoomAxioms/`
- Online HTTP: `https://onovich.github.io/RoomAxioms/` returned `200`
- Online HTTP: `http://blog.onovich.com/RoomAxioms/` returned `200`

## Commits

Phase 21 commits after planner guide:

- `388969a` docs: record Phase 21 dispatch
- `c87434f` docs: record Phase 21 acceptance contract
- `8028766` docs: catalog Phase 21 proof skeletons
- `7b5522d` docs: add Phase 21 candidate templates
- `0db32ae` docs: record Phase 21 local-count rejection
- `eafabbd` docs: record Phase 21 intersection candidate
- `4a920c3` docs: record Phase 21 difference candidate
- `a2dbe6f` docs: record Phase 21 mixed rejection
- `385119d` docs: review Phase 21 candidate repairs
- `0c1fc3e` docs: record Phase 21 generator evidence
- `c6b7669` content: promote Phase 21 crossing case
- `d3c9d0b` content: promote Phase 21 hidden-bottle case
- `9070075` content: order Phase 21 selector ladder

## Boundaries

Kept:

- No Puzzle Schema v1 semantic changes.
- No solver rewrite.
- No new proof techniques.
- No public editor, UGC, backend, analytics, daily challenge, broad UI/theme/VN work, or fabricated playtest calibration.
- Generated/rejected experimental content remains out of the player selector.
- Player UI does not expose target/candidate/forced/generator/authoring/anti-clone internals.
- Difficulty scores remain uncalibrated authoring metrics.

Known non-blocking workspace note:

- Two unrelated untracked docs remain unstaged and were not touched by Phase 21.

## Blockers

None.

## PASS Criteria

PASS criteria are met:

- At least two distinct new cases were promoted: `case-013`, `case-014`.
- Existing useful cases `case-004`, `case-011`, and `case-012` were preserved.
- `case-004` remains the default case.
- Promoted cases pass schema, solver, proof/no-guess, runtime, technique-retention, novelty, and anti-clone gates.
- Full selector anti-clone review passes.
- Rejected Phase 19 clone cases remain out of the player selector.
- Generator evidence is honest and does not fabricate accepted output.
- Validation, local smoke, online HTTP checks, commits, and pushes passed.
