# Phase 39 - Player Shell Visual QA And Asset Intake Readiness Goal 模式执行指南

日期：2026-07-02
状态：给前端线程使用的 Phase 39 开发指令文档
目标执行线程：`019f1d5a-6fb8-7911-9400-87b59922c00a`

## 0. 直接给执行者的 Goal Prompt

你是 RoomAxioms / 《未登记现场》的前端开发线程。Phase 38 已经把正式玩家路线迁入 1920x1080 固定设计画布、Figma 主稿方向的 player shell，并保持真实游戏逻辑。请进入 Goal 模式执行 Phase 39：对正式玩家页做视觉验收、非最终资产依赖的 UI 修补、最终切图资产接入准备。

本阶段的核心不是继续大改结构，也不是接入尚未提供的最终切图。你要让当前玩家页足够适合用户检查，并让后续最终美术替换有清晰 slot、尺寸、命名、验收和回滚路径。

重点：

- 保持 1920x1080 设计画布与 16:9 等比缩放，不回退自由流式布局。
- 保持真实 `useRoomAxiomsGame` 数据流，不使用 Figma 原型静态数据。
- 只修不依赖最终资产的小视觉问题：对齐、层级、线宽、间距、字体大小、滚动/裁切、VN 待机透明度、点击穿透、面板留白。
- 输出视觉差距报告和最终资产接入清单，方便用户切图后直接替换。
- 不碰编辑器，不碰 solver/proof/schema/domain，不做关卡内容。

每轮必须验证、提交、推送，最后回报 planner/checker。

## 1. 必读上下文

先阅读：

- `docs/phase-38-figma-player-shell-integration-goal-mode-execution-guide.md`
- `docs/phase-38-figma-player-shell-integration-final-report.md`
- `docs/phase-38-player-shell-integration-map.md`
- `docs/phase-38-player-shell-viewport-smoke.md`
- `docs/phase-38-player-shell-buffer-audit.md`
- `docs/ui-art-sample-frontend-adaptation-requirements.md`
- `docs/unregistered-scene-ui-requirements.md`
- `docs/未登记现场_项目设定与玩法对接文档.md`
- `apps/web/src/view/screens/RoomAxiomsScreen.tsx`
- `apps/web/src/view/components/TopBar.tsx`
- `apps/web/src/view/components/RulePanel.tsx`
- `apps/web/src/view/components/BoardPanel.tsx`
- `apps/web/src/view/components/EvidencePanel.tsx`
- `apps/web/src/view/components/Dialogs.tsx`
- `apps/web/src/theme/`
- `apps/web/src/vn/`
- `apps/web/public/figma-puzzle-prototype/`

参考入口：

- 正式玩家路线：`/RoomAxioms/`
- Figma 对照原型：`/RoomAxioms/?prototype=figma-puzzle`

## 2. 本阶段要完成什么

### 2.1 视觉验收包

生成并记录当前正式玩家页的可复查证据：

- 1920x1080 原始画布。
- 1366x768 等比缩放。
- 2560x1080 pillarbox。
- 1920x1440 letterbox。
- 390x844 受控缩小。

输出文档：

- `docs/phase-39-player-shell-visual-delta-report.md`
- 记录当前正式玩家页与 Figma prototype / 主稿需求的差距。
- 差距按 P0/P1/P2 排序。
- 标明哪些可以当前修，哪些必须等待最终切图。

### 2.2 小视觉修补

只修不依赖最终切图的 P0/P1 问题，例如：

- 画布居中、留边、缩放精度。
- 面板相对位置与大小。
- 规则栏/棋盘/登记栏滚动行为。
- VN 常驻层透明度、层级、人物与对话框位置。
- 文本可读性、字号、行高、字重。
- 点击穿透和焦点顺序。
- 提交红框与普通框的视觉层级。

不要为了“像图”引入静态假数据或隐藏真实状态。

### 2.3 最终资产接入准备

输出并验证最终切图接入清单：

- `docs/phase-39-final-art-asset-intake-checklist.md`

清单必须列出：

- asset key
- 当前 placeholder/userProvided 路径
- 期望最终文件名
- 推荐尺寸或宽高比
- 是否允许九宫格拉伸
- 是否需要透明背景
- 是否可能泄露隐藏答案或内部术语
- 替换后应跑的测试/烟测

如果 manifest 缺少 slot，应补 slot；但不得标记 final approved。

### 2.4 正式玩家路线保密与可访问性回归

继续确保：

- ordinary Hint 按钮不回归。
- VN 搭档感应只包装安全、公开、proof-backed 信息。
- 普通玩家 DOM 不暴露 target/candidate/forced/proof/solver。
- dev inspector 仍只在 devMode 下出现。
- 键盘仍能操作棋盘、规则、提交、VN 控制。

## 3. 本阶段不做什么

- 不接入用户尚未提供的最终切图。
- 不声称当前临时美术是 final approved。
- 不改 1920x1080 固定画布路线。
- 不改关卡编辑器/workbench。
- 不改 solver/proof/schema/domain。
- 不做 object model 语义迁移。
- 不新增/推广关卡。
- 不恢复普通 Hint 产品入口。
- 不做 backend、UGC、analytics、daily challenge。
- 不把 Figma prototype 的静态文案/规则/案件数字作为正式数据。

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

不要提交无关 untracked 文件。截图证据如果保留在 `tmp/`，最终报告中可以引用本地路径，但不要默认提交大体积临时图，除非本轮明确需要。

## 6. 分轮安排

总预算：10 轮。

- Round 1：视觉验收基线。生成正式路线与 prototype 对照截图/测量，输出视觉差距报告初稿。
- Round 2：修 P0/P1 布局问题：画布、留边、面板区域、缩放和溢出。
- Round 3：修规则/棋盘/登记栏的文本、滚动、密度、点击穿透与焦点问题。
- Round 4：修 VN 常驻层：半身像位置、对话框位置、透明度、待机冻结、控制可点区。
- Round 5：最终资产 slot 审计：补齐 manifest slot、fallback、命名和非 final 状态。
- Round 6：输出最终切图接入清单，并加入必要的 manifest/asset review 测试。
- Round 7：玩家保密、普通 Hint 不回归、dev gating、可访问性回归。
- Round 8：缓冲修复轮。
- Round 9：浏览器 smoke 与线上/本地 evidence 整理。
- Round 10：最终验证、最终报告、推送并回报 planner。

## 7. PASS 标准

- 正式玩家路线仍是 1920x1080 固定设计画布与 16:9 等比缩放。
- 真实游戏逻辑、案卷数据、规则、棋盘、登记、提交和 VN 状态未被静态 prototype 数据替换。
- P0/P1 视觉问题已修或明确记录为“等待最终切图”。
- 最终资产接入清单完整，manifest slot 清楚，临时资产未被标为 final approved。
- 普通 Hint 产品入口不回归。
- 普通玩家路线无 target/candidate/forced/proof/solver 泄露。
- 编辑器/workbench 未被本阶段修改。
- `pnpm lint`、`pnpm typecheck`、`pnpm test`、`pnpm build` 全部 PASS。
- local smoke PASS。
- 若触发 Pages，Pages PASS 且在线 HTTP 200。
- 最终报告存在并列出 caveat、截图/浏览器 evidence、后续等待用户切图的事项。

## 8. 最终报告模板

```markdown
# Phase 39 - Player Shell Visual QA And Asset Intake Readiness Final Report

Status: READY_FOR_CHECK / READY_FOR_CHECK_WITH_BLOCKER
Final commit:
Push:
Pages:

## Summary
- 

## Visual Delta
- P0:
- P1:
- P2:
- Waiting for final art:

## Implemented Fixes
- 

## Asset Intake Readiness
- checklist:
- manifest slots:
- non-final asset status:

## Validation
- lint:
- typecheck:
- test:
- build:
- local smoke:
- browser smoke:
- git diff --check:

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
