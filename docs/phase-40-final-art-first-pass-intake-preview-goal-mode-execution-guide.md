# Phase 40 - Final Art First Pass Intake And Preview Goal 模式执行指南

日期：2026-07-02
状态：给前端线程使用的 Phase 40 开发指令文档
目标执行线程：`019f1d5a-6fb8-7911-9400-87b59922c00a`

## 0. 直接给执行者的 Goal Prompt

你是 RoomAxioms / 《未登记现场》的前端开发线程。用户已确认第一批最终资产接入策略。请进入 Goal 模式，执行 Phase 40：从 Figma 导出指定四张角色半身像画布，接入正式玩家页；将用户已确认的现有 Figma/临时资产从 `userProvided` 转为 `approved`；保留尚未确认的三个区域为暂用状态；完成后提供可预览页面和截图证据。

用户明确决策：

- Logo 可以暂缺，不阻塞本阶段。
- 角色半身像需要从 Figma 中查找以下画布内容，并把整个画布导出为所需素材，不包含背景色：
  - `主角半身像 - 普通`
  - `主角半身像 - 思考`
  - `助手半身像 - 普通`
  - `助手半身像 - 感应定则`
- 对话框框体使用 Figma 现有九宫格，透明背景。
- 纸面背景先用纯色。
- 案件纸纹理使用 `现场平面图-边框` 图层自带纹理。
- 其他现有 Figma 资产可确认为最终稿。
- 暂时没确认的内容：
  - `现场登记记录列表` 的最终样式
  - `我的标记列表` 的最终样式
  - `现场平面图` 的最终样式
  这三项继续使用暂用方案，后续用户确认后再替换。

执行完成后，请启动本地预览并回报 planner，让用户可以检查。

## 1. 必读上下文

先阅读：

- `docs/phase-39-player-shell-visual-qa-asset-intake-readiness-final-report.md`
- `docs/phase-39-final-art-asset-intake-checklist.md`
- `docs/phase-39-player-shell-visual-delta-report.md`
- `docs/phase-38-figma-player-shell-integration-final-report.md`
- `docs/ui-art-sample-frontend-adaptation-requirements.md`
- `apps/web/src/theme/assetManifest.ts`
- `apps/web/src/theme/assetReview.test.ts`
- `apps/web/src/theme/characterPortraits.ts` 或现有角色 fallback 映射文件
- `apps/web/src/theme/sceneShellAssets.ts`
- `apps/web/src/vn/`
- `apps/web/src/view/`
- `apps/web/public/figma-puzzle-prototype/`

Figma 文件线索：

- 前端线程之前使用的 Figma file key：`vvFlfc7o0G2MK9C9QIF04v`
- 之前目标 frame：`28:5`
- 本阶段需要在该文件中搜索/定位四个画布名称：
  - `主角半身像 - 普通`
  - `主角半身像 - 思考`
  - `助手半身像 - 普通`
  - `助手半身像 - 感应定则`

## 2. 本阶段要完成什么

### 2.1 Figma 半身像导出

从 Figma 中定位四个画布/Frame/节点：

- 若名称完全匹配，直接导出。
- 若名称略有差异，按中文名称相近项定位，并在最终报告说明实际 node 名称和 node id。
- 导出整个画布内容。
- 导出 PNG，透明背景，不包含画布背景色。
- 放入正式主题资产目录，建议：

```text
apps/web/public/theme/final/portraits/protagonist-normal.png
apps/web/public/theme/final/portraits/protagonist-thinking.png
apps/web/public/theme/final/portraits/assistant-normal.png
apps/web/public/theme/final/portraits/assistant-sensing.png
```

如果 Figma 导出 API 无法直接透明导出，应尝试合理替代：

- 使用 Figma export settings / asset URL。
- 或导出后确认 alpha/背景透明。
- 如果不能保证透明，不得标为 approved，必须报告 blocker。

### 2.2 角色映射接入

将 VN/角色半身像映射到新最终素材：

- 主角 normal -> `protagonist-normal.png`
- 主角 thinking -> `protagonist-thinking.png`
- 主角 success/failure 若没有图，继续 fallback 到 normal，但在 manifest/report 中说明。
- 助手 normal -> `assistant-normal.png`
- 助手 sensing -> `assistant-sensing.png`
- 助手 success/failure 若没有图，继续 fallback 到 normal。

保持：

- 半身像常驻 overlay。
- VN 新手引导、搭档感应定则、成功/失败演出都不丢。
- 不恢复 ordinary Hint 产品入口。

### 2.3 已确认资产转正

将用户已确认的现有 Figma 资产转为最终稿/approved，包括：

- 对话框九宫格框体。
- 普通面板九宫格框体。
- 提交红框九宫格框体。
- 分割线。
- 规则图标。
- `现场平面图-边框` 图层/资产，如果当前实现已有对应 frame/texture slot，接入并标为 approved；若尚未独立成资产，先保持当前 Figma frame slot，并在报告里说明。

仍保持暂用/placeholder，不转 approved：

- Logo。
- 纸面背景纹理，继续纯色。
- `现场登记记录列表` 最终样式。
- `我的标记列表` 最终样式。
- `现场平面图` 最终样式。

### 2.4 Manifest 和审查测试

更新 `assetManifest` / `assetReview`：

- approved asset 必须有 source/license/dimensions。
- source/license 可写明：用户在项目 Figma 中提供并确认作为最终稿。
- 不允许文件名、asset key、source metadata 中包含 `target/candidate/forced/proof/solver/answer` 等泄露词。
- approved asset count 应大于 0。
- 未确认资产不得被误标 approved。

### 2.5 预览

完成后必须：

- 启动本地 dev server。
- 提供正式玩家路线预览 URL：`http://127.0.0.1:5173/RoomAxioms/`
- 截图至少：
  - 1920x1080
  - 1366x768
  - VN active
  - VN idle/frozen
- 回报截图路径。

## 3. 本阶段不做什么

- 不制作或生成新美术。
- 不补 Logo。
- 不最终化 `现场登记记录列表`、`我的标记列表`、`现场平面图` 三项样式。
- 不改变 1920x1080 固定画布与 16:9 等比缩放。
- 不改编辑器/workbench。
- 不改 solver/proof/schema/domain。
- 不做关卡内容。
- 不恢复 ordinary Hint 产品入口。
- 不把无法确认透明/授权/尺寸的资产标为 approved。

## 4. 每轮固定工作流

每轮回复必须包含：

- 本轮目标
- 本轮完成内容
- Debug 自检
- 架构自检
- 已运行验证命令与结果
- commit hash 与 push 结果
- 下一轮目标
- 是否消耗缓冲轮

推进规则：

- 验证失败：不得提交推送，不得进入下一轮。
- 验证通过但提交失败：不得进入下一轮。
- 提交成功但推送失败：不得进入下一轮。
- 推送成功：记录 commit hash 和远端分支，然后进入下一轮。

## 5. 每轮通过后提交推送工作流

优先使用项目 wrapper：

```powershell
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Validate.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StartDevServer.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Smoke.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StopDevServer.cmd
C:\Users\Administrator\.codex\skills\project-git-workflow\scripts\git\CommitAndPush.cmd -Message "<message>" -Paths <phase files>
```

图片资产可以提交，但只提交本阶段正式主题资产路径。不要提交 `tmp/` 截图证据，除非最终报告明确要求。

## 6. 分轮安排

总预算：8 轮。

- Round 1：Figma 资产定位与导出。找到四个半身像画布，导出透明 PNG，记录 node id、尺寸、透明检查。
- Round 2：角色 manifest 与 VN 映射接入。把四张半身像接到主角/助手状态，补 fallback 测试。
- Round 3：已确认九宫格/分割线/规则图标等资产转 approved，保留未确认三项为暂用状态。
- Round 4：asset review / leak scan / approved count / 未确认项不误批 测试。
- Round 5：浏览器预览修补：检查 1920x1080、1366x768、VN active/idle，修小布局问题。
- Round 6：本地预览与用户检查准备。启动 dev server，记录 URL、截图路径和注意事项。
- Round 7：缓冲修复轮。
- Round 8：最终验证、最终报告、推送并回报 planner。

## 7. PASS 标准

- 四张指定半身像从 Figma 导出，透明背景，不含背景色。
- 半身像接入正式 VN/角色映射。
- 成功/失败缺图时有明确 fallback，不破坏演出。
- 用户已确认资产标为 approved；用户未确认的三项不标 approved。
- Logo 仍可缺失，不阻塞。
- 纸面背景仍可纯色。
- ordinary Hint 产品入口不回归。
- 玩家路线无 target/candidate/forced/proof/solver 泄露。
- 1920x1080 固定画布和 16:9 缩放保持。
- 编辑器/workbench 未被修改。
- `pnpm lint`、`pnpm typecheck`、`pnpm test`、`pnpm build` PASS。
- local smoke PASS。
- 本地预览 URL 已提供。
- 最终报告记录 Figma node ids、导出路径、approved asset 列表、暂用 asset 列表和截图路径。

## 8. 最终报告模板

```markdown
# Phase 40 - Final Art First Pass Intake And Preview Final Report

Status: READY_FOR_CHECK / READY_FOR_CHECK_WITH_BLOCKER
Final commit:
Push:
Preview URL:

## Summary
- 

## Exported From Figma
| Asset | Figma node name | Figma node id | Output path | Dimensions | Transparent |
| --- | --- | --- | --- | --- | --- |

## Approved Assets
- 

## Still Temporary / Not Yet Confirmed
- Logo
- Paper background
- 现场登记记录列表
- 我的标记列表
- 现场平面图

## Validation
- lint:
- typecheck:
- test:
- build:
- local smoke:
- browser preview:
- git diff --check:

## Preview Evidence
- 1920x1080:
- 1366x768:
- VN active:
- VN idle:

## Boundary Scans
- editor/workbench untouched:
- no solver/proof/schema/domain changes:
- no ordinary Hint product entry:
- no player secrecy leak:

## Caveats
- 

## Next
- 
```
