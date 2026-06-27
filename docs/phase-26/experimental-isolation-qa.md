# Phase 26 Experimental Isolation QA

Status: Round 24 evidence.
Guide: `docs/phase-26-workbench-guided-puzzle-ladder-production-goal-mode-execution-guide.md`

## Purpose

Round 24 completes the runtime/selector QA lane by checking the content boundary
from the other side: Phase 26 experimental candidates and historical rejected
cases may remain in repository evidence, but they must not become player-facing
unless deliberately promoted through all gates.

This round makes one small test hardening change and no content promotion:
`apps/web/src/content/caseVerification.test.ts` now treats `p26-*` ids as
internal case ids and explicitly keeps `case-019` out of `contentCases`.

## Authoritative Boundaries

Player selector:

- Source: `apps/web/src/content/cases.ts`.
- Imports only `case-004`, `case-011`, `case-012`, `case-013`, `case-014`,
  `case-015`, `case-017`, `case-018`, `case-020`, and `case-021`.
- `DEFAULT_CASE_ID` remains `case-004`.
- `caseTierById` remains empty, so no case is presented as `target-4` or
  `super-hard`.

Private workbench library:

- Source: `apps/web/src/workbench/caseLibrary.ts`.
- `shippedWorkbenchCases` are derived from `contentCases`.
- `experimentalWorkbenchCases` intentionally imports a small curated diagnostic
  set from older experimental phases: Phase 10, 12, 22, 23, 24, and 25.
- No Phase 26 candidate is imported into the workbench library.

Experimental evidence:

- Phase 26 candidates remain under
  `content/experimental/phase-26/candidates/`.
- There are 15 candidate JSON files, `p26-c01` through `p26-c15`.
- These ids appear in candidate files and Phase 26 evidence docs only.

## Round 24 Scans

Candidate inventory:

```powershell
rg --files content\experimental\phase-26
```

Result: PASS. The inventory shows Phase 26 templates, evidence READMEs, and
15 candidate JSON files under `content/experimental/phase-26/candidates/`.

Player-facing Phase 26 scan:

```powershell
rg "p26-c|phase-26" apps\web\src\workbench apps\web\src\content apps\web\src\view apps\web\src\runtime apps\web\src\logic content\cases -n
```

Result: PASS. No matches. Phase 26 candidates are absent from web content,
views, runtime, logic, private workbench imports, and shipped case JSON.

Repository-wide Phase 26 scan:

```powershell
rg "content/experimental/phase-26|content\\experimental\\phase-26|p26-c" . -n -g "!node_modules" -g "!dist" -g "!.git"
```

Result: PASS. Matches are limited to Phase 26 candidate JSON, templates, and
Phase 26 documentation/evidence. No app runtime or player selector path imports
them.

Developer gating scan:

```powershell
rg "showTarget|target-spoiler|developerTargetKind|createDeveloperInspectorModel|devMode" apps\web\src\view apps\web\src\hooks apps\web\src\logic -n
```

Result: PASS. Target overlay and forced-cell display remain guarded by
`devMode`; developer inspector data returns `null` when `devMode` is false.

## Test Hardening

Round 24 strengthens `apps/web/src/content/caseVerification.test.ts`:

- internal selector ids now match `phase-*` and `p26-*`;
- historical rejected `case-019` is explicitly included in the rejected-id
  selector exclusion list.

This codifies the Phase 26 isolation boundary in the web content suite rather
than relying only on ad hoc search.

## QA Decision

No Phase 26 candidate is player-facing.

No historical rejected case is restored to the selector.

No workbench diagnostic fixture is promoted into player content.

No developer-only target overlay, forced-cell analysis, no-guess report, or
inspector data is exposed in normal player mode by this round. Existing runtime
and component tests continue to cover those gates.

The phase should now move from runtime/selector QA into buffer/final blocker
preparation unless a concrete validation failure appears.
