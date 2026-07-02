# Phase 40 - Final Art First Pass Intake And Preview Final Report

Date: 2026-07-02
Executor thread: `019f1d5a-6fb8-7911-9400-87b59922c00a`
Planner thread: `019ef0df-a626-7181-9ca6-1cc75c1f4c47`

## Result

PASS. The first approved final art pass is connected to the production player shell while preserving the existing 1920x1080 fixed design canvas, 16:9 proportional scaling, real `useRoomAxiomsGame` data flow, and real player route logic.

## Commits

- `b39d921` `assets: export final character portraits`
- `cabd332` `feat: wire final portraits into player shell manifest`
- `7616211` `feat: approve figma shell assets`

## Figma Exports

Figma file: `vvFlfc7o0G2MK9C9QIF04v`

| Asset | Node | Local path | Dimensions | Status |
| --- | --- | --- | --- | --- |
| `主角半身像 - 普通` | `52:75` | `apps/web/public/theme/final/portraits/protagonist-normal.png` | `377x454` | approved |
| `主角半身像 - 思考` | `52:83` | `apps/web/public/theme/final/portraits/protagonist-thinking.png` | `377x454` | approved |
| `助手半身像 - 普通` | `52:98` | `apps/web/public/theme/final/portraits/assistant-normal.png` | `377x454` | approved |
| `助手半身像 - 感应定则` | `52:103` | `apps/web/public/theme/final/portraits/assistant-sensing.png` | `377x454` | approved |
| `VN-对话框` | `33:114` | `apps/web/public/theme/final/dialogue/dialogue-default.png` | `1081x276` | approved |

All exported PNGs were checked as `Format32bppArgb` with sampled transparent pixels and sampled visible pixels.

## Production Integration

- Preserved VN-facing portrait ids: `investigator`, `investigator-thinking`, `dispatcher`, `dispatcher-sensing`.
- Updated those ids to resolve to the Phase 40 portrait PNGs with `approved` status.
- Wired `dialogueFrame:dialogue-default` into `VNDialogueOverlay` and `VNDialogueDock` via CSS custom property rendering.
- Promoted user-confirmed Figma shell assets to `approved`: dialogue frame, nine-slice frames, dividers, public rule icons, and retained Figma shell portrait references.
- Kept onboarding/tutorial, partner sense-rule, success/failure, and protagonist performance scenes on existing VN data.

## Still Temporary Or Placeholder

- Logo mark can remain missing.
- Paper background/texture can remain solid fallback.
- `现场登记记录列表` final style remains unconfirmed.
- `我的标记列表` final style remains unconfirmed.
- `现场平面图` final style remains unconfirmed.
- No solver, proof, schema, domain, backend, editor, or workbench behavior changed.

## Preview Evidence

Local preview URL:

- `http://127.0.0.1:5173/RoomAxioms/`

Screenshot evidence:

- `tmp/phase40-preview-clean-1920x1080.png`
- `tmp/phase40-preview-clean-1366x768.png`
- `tmp/phase40-preview-clean-390x844.png`
- `tmp/phase40-preview-vn-idle-1920x1080.png`

Measured browser smoke:

- `1920x1080`: canvas `1920x1080`, aspect `1.777778`, no horizontal overflow.
- `1366x768`: canvas `1365.333x768`, aspect `1.777778`, no horizontal overflow.
- `390x844`: canvas `390x219.375`, aspect `1.777778`, no horizontal overflow with vertical letterbox margins.
- VN overlay uses `/RoomAxioms/theme/final/portraits/assistant-normal.png`.
- VN frame background includes `dialogue-default.png` and `data-frame-placeholder="false"`.

## Validation

- CommitAndPush wrappers:
  - `b39d921`: lint PASS, typecheck PASS, test PASS, build PASS, push PASS.
  - `cabd332`: lint PASS, typecheck PASS, test PASS, build PASS, push PASS.
  - `7616211`: lint PASS, typecheck PASS, test PASS, build PASS, push PASS.
- Focused asset review:
  - `pnpm --dir apps/web exec vitest run src/theme/assetReview.test.ts src/theme/assetManifest.test.ts src/vn/dialogue.test.ts`: PASS.
- Focused rendering tests:
  - `pnpm --dir apps/web exec vitest run src/theme/assetManifest.test.ts src/theme/assetReview.test.ts src/theme/characterPortraits.test.ts src/vn/VNDialogueDock.test.tsx src/vn/VNDialogueOverlay.test.tsx src/view/components/SceneFrame.test.tsx`: PASS.
- `git diff --check`: PASS.
- `Smoke.cmd`: PASS.

## Notes

- Historical untracked `tmp/phase38-*` and `tmp/phase39-*` screenshots remain untouched.
- Ordinary Hint product entry remains removed. Partner sense-rule VN rendering remains covered by component tests and the VN dock path.
