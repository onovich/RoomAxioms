# Phase 38 - Figma Player Shell Integration Goal 模式执行指南

日期：2026-07-02
状态：给前端线程使用的 Phase 38 开发指令文档
目标执行线程：`019f1d5a-6fb8-7911-9400-87b59922c00a`

## 0. 直接给执行者的 Goal Prompt

你是 RoomAxioms / 《未登记现场》的前端开发线程。请进入 Goal 模式，执行本指南，把当前隔离的 Figma 临时原型页转化为正式玩家路线可使用的前端壳层与主题组件，为后续最终切图资产接入做准备。

本阶段不是继续还原静态截图，也不是重做玩法。你要保留现有真实游戏逻辑、solver/proof/runtime、玩家交互和案卷数据流，把正式玩家页改造成接近 Figma 原型的《未登记现场》纸质勘察系统界面。

重点修正：

- VN 演出不是只保留成功/失败。必须保留新手引导演出、搭档感应定则演出、成功/失败演出，并支持主角演出。
- 半身像和对话框应像原画那样常驻覆盖在游戏界面上，处于半透明冻结/待机状态；不要做成独立弹窗，也不要默认消失。
- 主角与助手都要有半身像槽位和状态映射。暂缺状态图时允许用正常图 fallback。
- 普通 Hint 功能从产品路线移除；但“搭档感应定则”作为规则/推理触发的 VN 演出保留，不暴露 solver/proof 内部。

请在每轮结束前完成本轮验证、提交、推送，并向规划线程汇报 commit hash、push 结果和下一轮目标。

## 1. 必读上下文

先阅读这些文件，再动代码：

- `docs/ui-art-sample-frontend-adaptation-requirements.md`
- `docs/unregistered-scene-ui-requirements.md`
- `docs/未登记现场_项目设定与玩法对接文档.md`
- `docs/unregistered-scene-packaging-decisions.md`
- `docs/phase-34-unregistered-scene-frontend-adaptation-final-report.md`
- `docs/phase-35-rule-object-model-editor-vn-overlay-final-report.md`
- `docs/phase-38-figma-player-shell-integration-goal-mode-execution-guide.md`
- `apps/web/src/figma-puzzle-prototype/FigmaPuzzlePrototype.tsx`
- `apps/web/src/figma-puzzle-prototype/FigmaPuzzlePrototype.css`
- `apps/web/public/figma-puzzle-prototype/`
- `apps/web/src/view/screens/RoomAxiomsScreen.tsx`
- `apps/web/src/view/components/TopBar.tsx`
- `apps/web/src/view/components/RulePanel.tsx`
- `apps/web/src/view/components/BoardPanel.tsx`
- `apps/web/src/view/components/EvidencePanel.tsx`
- `apps/web/src/view/components/Dialogs.tsx`
- `apps/web/src/vn/`
- `apps/web/src/theme/`

前端临时原型当前入口：

- `/RoomAxioms/?prototype=figma-puzzle`
- `/RoomAxioms/#figma-puzzle-prototype`

临时原型是视觉规格样张，不是生产 UI。它是固定 1920x1080 的静态 SVG/foreignObject 画布，不能原样替换正式路由。

## 2. 本阶段要完成什么

### 2.1 生产化 Figma 视觉壳层

从临时原型中提取可复用生产组件和 token：

- 纸质勘察页面背景。
- 深蓝墨线 / 红色异常 / 米白纸面 / 弱纹理 token。
- 九宫格自拉伸面板组件，至少支持普通面板和红色提交面板。
- 规则图标槽位。
- 角色半身像层。
- 底部 VN 对话层。

允许保留临时原型 route 作为对照，但正式玩家路线必须使用真实组件和真实数据，不得使用原型里的静态规则/静态案件数字/静态 VN 文案。

### 2.2 改造正式玩家页布局

把 `RoomAxiomsScreen` 和现有组件改造成 Figma 主稿方向：

- 顶栏：项目名、案件档案、案卷编号/名称、已标记异常、已检查/已登记进度、重置/设置。
- 左栏：现场定则，使用真实 `game.puzzle.rules` 和当前规则选中逻辑。
- 中央：现场平面图，使用真实 `BoardPanel` 交互、格子状态、标注、规则高亮。
- 右栏：现场登记记录、我的标记、提交调查。
- 底部：VN 常驻层，半身像与对话框直接盖在纸面 UI 上，不另开窗体。

当前 Figma 原型是 1920x1080 宽屏布局；这不是临时缺陷，而是正式产品的默认设计画布规格。

正式玩家页应以 1920x1080 为基准画布：

- 默认设计分辨率为 1920x1080。
- 页面可按浏览器窗口等比缩放放大或缩小。
- 始终维持 16:9 高宽比，不因窗口比例变化拉伸变形。
- 全屏模式下仍维持 1920x1080 的设计画布和 16:9 高宽比，通过 letterbox/pillarbox 留边处理多余空间。
- 不要把核心布局改造成自由流式响应式三栏；响应式重点是等比缩放后的可读性、交互可达性和必要的安全边距。

移动端可以先采用缩放画布或受控提示策略，但不能破坏 1920x1080 设计画布作为正式默认规格的前提。

### 2.3 VN 演出修正

VN 的产品方向：

- 保留新手引导演出。
- 保留搭档感应定则演出。
- 保留成功/失败演出。
- 保留主角演出。
- 半身像和对话框常驻，未播放新句子时展示最后一句/待机句，半透明冻结，不阻塞棋盘操作。
- 对话框和半身像直接覆盖在游戏界面上，不作为 modal，不使用独立窗体外观。

角色与状态：

- 主角：正常、思考、成功、失败。缺图时 fallback 到正常。
- 助手：正常、感应定则、成功、失败。缺图时 fallback 到正常。
- 当前可用临时图可以沿用已有 `theme/portraits/phase-35` 或 Figma prototype assets，但必须通过 theme asset manifest 注册，不要散落硬编码路径。

触发边界：

- 新手引导可以在首次进入、首次选规则、首次调查安全格、首次标记异常等已有安全触发点播放。
- 搭档感应定则只能包装已有安全、公开、proof-backed 的提示性信息；不得泄露 target、candidate、forced cell、solver/proof 内部字段。
- 普通 Hint 按钮/通用 Hint 产品入口不要恢复。

### 2.4 资产 manifest 准备

把 Figma prototype 资产整理为正式接入前的 manifest 槽位：

- 九宫格普通框。
- 九宫格提交框。
- 分割线。
- 规则类型图标。
- 主角半身像。
- 助手半身像。
- 纸面背景 / 弱纹理。

资产状态保持 `placeholder` 或 `userProvided`，不要声称 final approved。后续最终切图会替换这些 slot。

### 2.5 可访问性与响应式

- 按钮、选择器、棋盘格仍必须可键盘访问。
- VN 常驻层不得吃掉棋盘点击；可点击区域只限对话框自己的控制。
- 文本不应溢出面板。
- 1366x768、1920x1080、390x844 至少要能 smoke。

## 3. 本阶段不做什么

- 不做关卡编辑器工作。编辑器相关开发归线程 `019f1da7-d87b-7010-aacf-27a50529092f`。
- 不改 solver/proof/oracle/schema/domain 语义。
- 不做 arbitrary object rule semantics 迁移。
- 不新增或推广关卡。
- 不恢复普通 Hint 按钮。
- 不把 Figma 原型的静态数据当成正式数据。
- 不引入 backend、UGC、analytics、daily challenge。
- 不声称最终美术已完成。
- 不泄露 target、候选解、forced-cell、proof internals。

## 4. 每轮固定工作流

每轮回复必须包含：

- 本轮目标。
- 本轮完成内容。
- Debug 自检。
- 架构自检。
- 已运行验证命令与结果。
- commit hash 与 push 结果。
- 下一轮目标。
- 是否消耗缓冲轮。

推进规则：

- 验证失败：不得提交推送，不得进入下一轮。
- 验证通过但提交失败：不得进入下一轮。
- 提交成功但推送失败：不得进入下一轮。
- 推送成功：记录 commit hash 和远端分支，然后进入下一轮。

优先使用项目 wrapper：

```powershell
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Validate.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StartDevServer.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Smoke.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StopDevServer.cmd
C:\Users\Administrator\.codex\skills\project-git-workflow\scripts\git\CommitAndPush.cmd -Message "<message>" -Paths <phase files>
```

不要 staging 无关 untracked 文件。

## 5. 每轮通过后提交推送工作流

每轮必须：

1. `git status --short --branch`
2. 运行本轮相关 focused tests。
3. 对 UI 变更运行 typecheck/build。
4. 必要时运行 local smoke。
5. `git diff --check`
6. 使用 `CommitAndPush.cmd` 提交并推送。
7. 确认 `git status --short --branch` 干净或只剩明确无关 untracked。

## 6. 分轮安排

总预算：14 轮。

- Round 1：正式 UI 对接盘点。输出 Figma prototype 到现有正式组件的映射表，确认不碰编辑器和玩法语义。
- Round 2：抽取九宫格/纸面/分割线/规则图标为生产组件或 theme primitive，保留临时原型对照入口。
- Round 3：建立正式玩家页的新 shell：1920x1080 固定设计画布、等比缩放容器、letterbox/pillarbox 背景，以及顶栏、左规则、中地图、右记录、底部 VN overlay 的稳定区域。
- Round 4：把 `TopBar` 接入 Figma 风格：案卷编号/名称、进度、重置、设置；移除普通 Hint 产品入口。
- Round 5：把 `RulePanel` 接入 Figma 风格：规则编号、规则文本、规则图标、选中态、规则范围高亮不变。
- Round 6：把 `BoardPanel` 接入 Figma 风格：纸面地图区、格子状态、标注、坐标、规则高亮、键盘访问。
- Round 7：把 `EvidencePanel` 接入 Figma 风格：登记记录、我的标记、提交调查红框。
- Round 8：重构 VN 常驻层：半身像层、底部对话框、半透明冻结、不阻塞棋盘。
- Round 9：接入 VN 事件：新手引导、搭档感应定则、成功、失败、主角状态、助手状态。
- Round 10：资产 manifest 与 fallback：注册 prototype/临时资产槽位，标注非最终资产。
- Round 11：画布缩放与文本适配：1920x1080 原始比例、1366x768 等比缩放、全屏 16:9、非 16:9 窗口 letterbox/pillarbox、390x844 受控退化。
- Round 12：玩家保密扫描与可访问性修复。
- Round 13：缓冲修复轮。
- Round 14：最终验证、Pages smoke、最终报告。

## 7. PASS 标准

- 正式玩家路线默认进入 Figma 主稿方向的 1920x1080 等比缩放《未登记现场》UI，而不是旧三栏卡片风格。
- 玩家页在普通窗口和全屏下都维持 16:9 高宽比，不发生横向/纵向拉伸变形。
- 真实游戏逻辑仍通过现有 `useRoomAxiomsGame`、真实案卷、真实规则、真实棋盘、真实提交流程驱动。
- 临时原型可保留为对照入口，但不得成为正式页面的数据源。
- 普通 Hint 产品入口已移除；VN 新手引导、搭档感应定则、成功/失败、主角/助手演出保留。
- VN 半身像和对话框常驻覆盖在界面上，不是 modal，不阻塞棋盘正常操作。
- 玩家路线不泄露 target/candidate/forced/proof/solver internals。
- 编辑器/workbench 路线未被本阶段改动或破坏。
- `pnpm lint`、`pnpm typecheck`、`pnpm test`、`pnpm build` 全部通过。
- local smoke 通过。
- 若部署触发 GitHub Pages，Pages 成功并在线 HTTP 200。
- 最终报告存在并记录验证、截图/浏览器 evidence、已知 caveat。

## 8. 最终报告模板

```markdown
# Phase 38 - Figma Player Shell Integration Final Report

Status: READY_FOR_CHECK / READY_FOR_CHECK_WITH_BLOCKER
Final commit:
Push:
Pages:

## Summary
- 

## Implemented
- 

## VN Behavior
- 新手引导：
- 搭档感应定则：
- 成功/失败：
- 主角演出：
- 常驻/冻结/非 modal：

## Validation
- lint:
- typecheck:
- test:
- build:
- local smoke:
- browser/screenshot smoke:
- git diff --check:

## Boundary Scans
- editor/workbench untouched:
- no solver/proof/schema/domain semantic change:
- no player secrecy leak:
- no ordinary Hint product entry:

## Caveats
- 

## Next
- 
```
