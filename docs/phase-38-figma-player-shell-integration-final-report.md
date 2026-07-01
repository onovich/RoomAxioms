# Phase 38 - Figma Player Shell Integration Final Report

Status: READY_FOR_CHECK
Final implementation commit before report: `8ff4b49`
Final report commit: committed with this report
Push: `origin/main`
Pages: PASS, run `28547399093`, HTTP `200` at `http://blog.onovich.com/RoomAxioms/`

## Summary

- Converted the temporary Figma puzzle prototype direction into production
  player-shell components on the real player route.
- Preserved the real `useRoomAxiomsGame` data flow, case data, rule selection,
  board interactions, evidence log, marks, submit flow, and VN preferences.
- Kept the temporary Figma prototype routes as visual references only:
  `/RoomAxioms/?prototype=figma-puzzle` and
  `/RoomAxioms/#figma-puzzle-prototype`.
- Enforced the product requirement that the formal player UI uses a 1920x1080
  design canvas with proportional 16:9 scaling, including letterbox/pillarbox
  margins instead of stretching.

## Implemented

- Production scene shell primitives:
  - paper texture and scene color tokens
  - reusable nine-slice frame component
  - divider and rule icon primitives
  - manifest slots for Figma/prototype-derived placeholder assets
- Fixed 1920x1080 player shell:
  - top bar slot
  - left rule panel slot
  - central board slot
  - right evidence/submit slot
  - persistent bottom VN overlay slot
  - proportional scale metrics exposed as `data-player-scale`
- Figma-style production components:
  - `TopBar`
  - `RulePanel`
  - `BoardPanel`
  - `EvidencePanel`
  - `Dialogs` / `VNDialogueOverlay`
- Tests and docs:
  - player shell geometry and viewport tests
  - player surface secrecy/accessibility tests
  - VN event category and portrait-slot tests
  - asset manifest and character fallback tests
  - viewport smoke report
  - buffer audit report

## VN Behavior

- Onboarding/tutorial: preserved through the existing VN intro and first-action
  event surfaces.
- Partner sense-rule scenes: preserved through the safe proof-backed hint wrapper
  surface, without restoring the ordinary Hint product button.
- Success/failure scenes: preserved.
- Protagonist performance: preserved in static scenes and portrait-slot tests.
- Persistent overlay: portraits and dialogue box now live inside the player
  canvas as semi-transparent/frozen overlay elements, not as a separate modal.
- Interaction boundary: idle VN overlay does not block board/rule/evidence clicks
  outside its own controls.

## Validation

- `C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Validate.cmd`: PASS
- `C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Smoke.cmd`: PASS
- `pnpm lint`: PASS in commit/push wrappers
- `pnpm typecheck`: PASS in commit/push wrappers
- `pnpm test`: PASS in commit/push wrappers
- `pnpm build`: PASS in commit/push wrappers
- `git diff --check`: PASS
- GitHub Pages run `28547399093`: PASS
- Online HTTP smoke: `http://blog.onovich.com/RoomAxioms/` returned HTTP `200`

Browser/screenshot smoke:

- 1920x1080: canvas `1920x1080`, scale `1.000000`, aspect `1.777778`
- 1366x768: canvas `1365.333x768`, scale `0.711111`, aspect `1.777778`
- 2560x1080: pillarbox `320px` left/right, aspect `1.777778`
- 1920x1440: letterbox `180px` top/bottom, aspect `1.777778`
- 390x844: canvas `390x219.375`, controlled proportional shrinkage, aspect `1.777778`
- Final local smoke at 1366x768:
  - grid cells: `16`
  - VN overlay present: `true`
  - developer panel present: `false`
  - target spoiler present: `false`
  - ordinary Hint/搭档复核 button present: `false`

Local screenshot evidence:

- `tmp/phase38-round3-1920x1080.png`
- `tmp/phase38-round3-1366x768.png`
- `tmp/phase38-round3-390x844.png`
- `tmp/phase38-round11-1920x1080.png`
- `tmp/phase38-round11-1366x768.png`
- `tmp/phase38-round11-2560x1080.png`
- `tmp/phase38-round11-1920x1440.png`
- `tmp/phase38-round11-390x844.png`
- `tmp/phase38-final-1366x768.png`

## Boundary Scans

- Editor/workbench untouched: PASS. No `apps/web/src/workbench` source files were
  changed in this phase.
- No solver/proof/schema/domain semantic change: PASS.
- No case promotion or content production: PASS.
- No backend, UGC, analytics, or daily challenge work: PASS.
- No final-art approval claim: PASS. Figma/prototype assets remain placeholder
  or user-provided manifest slots.
- Player secrecy: PASS. Developer diagnostics remain gated; runtime browser
  smoke found no developer panel, target spoiler, or internal diagnostic terms.
- Ordinary Hint product entry: PASS. The TopBar button/keyboard product entry
  remains removed. Partner sense-rule VN remains available only through the
  safe wrapper surface.

## Caveats

- Final cut-art replacement is intentionally deferred. Current portrait and
  frame assets are registered as placeholder/user-provided slots.
- The 390x844 fallback preserves the required 1920x1080 fixed canvas by
  proportional shrinkage; it does not introduce a separate free-flow mobile
  layout.
- The report commit itself triggers another Pages workflow run; the latest
  pre-report Pages run and online HTTP smoke were successful before this report
  was committed.

## Next

- Planner/checker should run `$checkandgoal` against this report and the pushed
  branch.
- If Phase 38 passes, planner may proceed with `$goalnext`.
