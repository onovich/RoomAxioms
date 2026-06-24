# 房间公理 / Room Axioms

> 一款“规则怪谈外衣 + 固定公理 + 客观揭示 + 零猜测验证”的格状推理游戏。

## 一句话定义

玩家进入房间前就能看到全部规则。房间中每个格子的内容在开局前已经固定；调查只会揭示早已存在的物件，不会新增、修改或追溯规则。玩家把多个物证及其关系叠加，推出哪些格子必然安全、哪些格子必然藏有“访客”。

## 项目名

- 中文名：**《房间公理》**
- 英文名：**Room Axioms**
- 内部简称：**RA**
- 命名理由：规则在开局时就是不可变的“公理”；调查获得的是“观察事实”。这一区分是项目区别于动态规则怪谈、拆弹顺序题和普通扫雷换皮的核心。

## 已锁定的产品结论

1. 仅推进“固定规则、逐格揭示物证”方向。
2. 所有机械规则开局完整展示，之后不得新增、删除、改义或追溯生效。
3. 点击格子揭示客观物件，不揭示新规则。
4. 中间可存在多个候选世界，但必须始终存在可由公开信息证明的安全调查或危险标记。
5. 最终“访客”布局必须唯一；完整陈设布局不要求唯一。
6. “零猜测”由精确求解器硬性验收，不能依赖设计者主观判断。
7. 另设人类可读推理器；只有机器可证但人类规则库无法解释的关卡不得发布。
8. 邻域必须用精确定义和图示表达：角落 3 格、边缘 5 格、内部 8 格；不再使用易误解的“周围八格”。
9. MVP 浏览器优先、静态部署、无后端、无倒计时，先验证推理循环。

## 交付物导航

| 文件 | 用途 |
|---|---|
| `docs/01_PRODUCT_DESIGN.md` | 完整产品/GDD、核心循环、规则、内容与验收标准 |
| `docs/02_UI_UX_DESIGN.md` | UI 信息架构、界面、交互、响应式与无障碍规范 |
| `docs/03_TECHNICAL_DESIGN.md` | 技术栈、数据模型、规则 DSL、求解器、生成器、测试与性能 |
| `docs/04_ARCHITECTURE.md` | 系统架构、模块边界、数据流、状态机和架构决策 |
| `docs/05_CODEX_HANDOFF.md` | Codex 接手顺序、仓库结构、首批 PR、完成定义与护栏 |
| `docs/06_RULE_DSL_SPEC.md` | 关卡 JSON 与规则 DSL 的可实现规范 |
| `docs/07_BACKLOG_AND_DECISIONS.md` | 已决策、未办事项、风险和里程碑 |
| `prototype/index.html` | 分文件版交互式 UI/玩法原型 |
| `房间公理_UI交互原型.html` | 单文件版交互原型，可直接打开 |
| `房间公理_项目设计与技术交接.docx` | 可编辑的 69 页合并版文档 |
| `房间公理_项目设计与技术交接.pdf` | 便于阅读和评审的 69 页合并版文档 |

## Codex 最短接手路径

1. 阅读本文件与 `docs/05_CODEX_HANDOFF.md`。
2. 先实现纯 TypeScript 领域模型、关卡 Schema 与 4×4 样例，不先做美术。
3. 实现精确求解器的 `isSatisfiable(assumptions)`、`forcedCells()` 与危险布局唯一性检查。
4. 实现人类推理器和可解释证明；验证器必须同时通过两套求解器。
5. 接入 React UI、Web Worker 和开发者验证层。
6. 用 `prototype/index.html` 作为视觉与交互参考，不把其中硬编码的样例逻辑直接当成生产架构。

## 当前执行指南

- 最近验收：**Phase 7 - MVP Content And UX Hardening PASS**，最终提交 `10c62ed`
- 当前阶段：**Phase 8 - Release QA And Playtest Loop**
- 执行指南：`../phase-8-release-qa-playtest-loop-goal-mode-execution-guide.md`
- 预算：6 个执行者会话轮

## MVP 完成定义

- 能加载至少 10 个关卡 JSON。
- 全部规则在调查前可见且含机器精确定义。
- 支持调查、访客标记、安全笔记、撤销、提示、重置和提交结论。
- 每关通过：一致性、零猜测、危险布局唯一、人类可解释、边界语义和回归测试。
- 求解器在 5×5、5 种格子类型的目标规模下，普通查询 P95 小于 100 ms；浏览器中放入 Worker，不阻塞交互。
- Chrome、Firefox、Safari 对应内核的 Playwright 主流程测试通过。

## 当前状态

设计与技术交接基线已形成；代码仓库尚未创建。未办事项详见 `docs/07_BACKLOG_AND_DECISIONS.md`。
# Current Execution Guide (Codex)

- Recent planner acceptance: **Phase 9 - Generator And Expansion Spike PASS**, final commit `58dab89`.
- Current phase: **Phase 10 - Authoring CLI And Proof Technique Hardening**.
- Execution guide: `../phase-10-authoring-cli-proof-technique-hardening-goal-mode-execution-guide.md`.
- Budget: 16 executor rounds.
- Scope note: this phase adds private authoring reports and proof hardening; it must not ship a public editor, UGC platform, backend, or breaking schema migration.
