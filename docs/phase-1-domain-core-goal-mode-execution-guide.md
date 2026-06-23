# Phase 1 Domain Core Goal Mode Execution Guide

日期：2026-06-23  
状态：给执行者使用的 Phase 1 开发指令文档  
阶段：Phase 1 - Domain Core Package  
轮数预算：8 轮，其中 1-5 为主实现，6-7 为缓冲修复，8 为最终验证  

## 0. 直接给执行者的 Goal Prompt

你正在执行《房间公理 / Room Axioms》的 Phase 1：Domain Core Package。

请阅读本指南、根目录 `README.md`、`docs/room-axioms-handoff/docs/05_CODEX_HANDOFF.md`、`docs/room-axioms-handoff/docs/06_RULE_DSL_SPEC.md`、`docs/room-axioms-handoff/docs/03_TECHNICAL_DESIGN.md`，然后在 8 轮预算内完成：

- 新建或正规化 `packages/domain`，发布内部 workspace 包 `@room-axioms/domain`。
- 将坐标、棋盘、邻域、格子类型、规则类型、会话事件和纯 reducer 从 app-local 代码提升为纯 TypeScript 领域核心。
- 让 `apps/web` 继续可运行，并改为使用 `@room-axioms/domain` 的公共 API。
- 保持当前线上原型的视觉和交互行为不变。
- 每轮都必须通过对应验证后提交并推送，失败不得进入下一轮。

本阶段不要实现 Schema/Zod、Oracle、CSP 求解器、人类推理器、Worker、10 关内容、关卡编辑器或 UI 重设计。

使用 `$donextgoal` 执行本指南。执行完成后向 planner 线程 `019ef0df-a626-7181-9ca6-1cc75c1f4c47` 汇报。

## 1. 必读上下文

- `README.md`
- `AGENTS.md`
- `Role.md`
- `docs/room-axioms-handoff/README.md`
- `docs/room-axioms-handoff/docs/03_TECHNICAL_DESIGN.md`
- `docs/room-axioms-handoff/docs/04_ARCHITECTURE.md`
- `docs/room-axioms-handoff/docs/05_CODEX_HANDOFF.md`
- `docs/room-axioms-handoff/docs/06_RULE_DSL_SPEC.md`
- `docs/room-axioms-handoff/docs/07_BACKLOG_AND_DECISIONS.md`
- Current app code under `apps/web/src/domain`, `apps/web/src/logic`, and `apps/web/src/hooks`.

Use the handoff docs as product and architecture authority. The current app is a refactored online prototype, not the final domain architecture.

## 2. 本阶段要完成什么

本阶段完成 PR-002 的工程化版本：领域模型与邻域正规化。

Required deliverables:

- `packages/domain/package.json`
- `packages/domain/tsconfig.json` or equivalent build config
- `packages/domain/src/index.ts`
- `packages/domain/src/types.ts`
- `packages/domain/src/coordinates.ts`
- `packages/domain/src/rules.ts` if rule types are cleaner outside `types.ts`
- `packages/domain/src/events.ts` and a pure reducer if needed by current app state
- Tests for coordinates, neighborhoods, invalid coordinates, stable ordering, and reducer behavior
- Root workspace and scripts updated so validation covers both `apps/web` and `packages/domain`
- `apps/web` imports domain public API from `@room-axioms/domain`, not app-local duplicated files
- Current web app still builds and behaves the same for case-004
- Documentation note in README or app README describing the domain package boundary

Minimum public API:

```ts
export type CellKind = 'empty' | 'bottle' | 'bin' | 'mirror' | 'guest';
export type CellId = string;
export interface Coord { readonly x: number; readonly y: number; }
export interface BoardSize { readonly width: number; readonly height: number; }
export type ScopeKind = 'global' | 'orthogonal' | 'adjacent';

export function columnsForWidth(width: number): readonly string[];
export function parseCellId(id: CellId, size: BoardSize): Coord;
export function formatCellId(coord: Coord, size: BoardSize): CellId;
export function allCells(size: BoardSize): readonly CellId[];
export function neighbors(id: CellId, scope: Exclude<ScopeKind, 'global'>, size: BoardSize): readonly CellId[];
export function sortCellIds(ids: Iterable<CellId>, size: BoardSize): readonly CellId[];
```

Rule types must match the DSL v1 shape documented in `06_RULE_DSL_SPEC.md`.

## 3. 本阶段不做什么

- 不引入 Zod Schema。那是 Phase 2。
- 不实现 brute-force Oracle。那是 Phase 3。
- 不实现 CSP solver、forced cells、guest uniqueness 或 model counting。
- 不把 current `analysis.ts` 包装成正式 solver。
- 不新增关卡。
- 不修改游戏产品契约。
- 不重做 UI 视觉、布局、文案风格或交互节奏。
- 不把目标棋盘暴露给普通 UI selectors。
- 不更改 GitHub Pages 部署策略，除非 validation 证明当前配置已坏。

## 4. 每轮固定工作流

每轮开始：

1. 读取本指南和 `Role.md`。
2. 查看 `git status --short --branch`。
3. 明确本轮只处理一个小目标。
4. 检查是否存在用户未提交变更，不能覆盖或误纳入无关文件。

每轮实现：

1. 先改纯领域层，再改 app 调用方。
2. 每个公共 API 需要测试或现有测试覆盖。
3. 任何列表输出必须稳定排序。
4. 不允许为了 case-004 特判坐标或答案。

每轮收尾回复必须包含：

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

优先使用项目 GitFlow wrapper：

```powershell
C:\Users\Administrator\.codex\skills\project-git-workflow\scripts\git\Status.cmd
C:\Users\Administrator\.codex\skills\project-git-workflow\scripts\git\CommitAndPush.cmd -Message "<message>" -Paths <phase-relevant paths>
```

提交前必须验证：

```powershell
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

不要 stage unrelated untracked files。不要提交 `apps/web/dist`、`node_modules` 或本地缓存。

## 6. 分轮安排

### Round 1 - Package Boundary

Goal:

- 建立 `packages/domain` workspace 包。
- 更新 `pnpm-workspace.yaml` 覆盖 `packages/*`。
- 增加 domain package 的 build/test/typecheck 脚本。
- 调整根脚本，使根验证能覆盖 web 和 domain。

Expected validation:

- `pnpm install`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`

Architecture self-check:

- `packages/domain` 不依赖 React、DOM、Vite、Zod、Node fs。
- workspace 包名为 `@room-axioms/domain`。

### Round 2 - Coordinates And Neighborhoods

Goal:

- 从 `apps/web/src/domain/coordinates.ts` 提升坐标和邻域函数到 `packages/domain`。
- 保留或迁移测试，覆盖四角、边缘、内部、非法坐标、多字母列、稳定排序。
- `apps/web` 改用 `@room-axioms/domain`。

Required examples:

```text
adjacent(A1) = [B1, A2, B2]
orthogonal(A1) = [B1, A2]
adjacent(B1) = [A1, C1, A2, B2, C2]
orthogonal(B2) = [B1, A2, C2, B3]
adjacent(B2) = [A1, B1, C1, A2, C2, A3, B3, C3]
```

Architecture self-check:

- 棋盘外不参与计数。
- 不存在虚拟空格。
- 输出顺序按 y 再 x。

### Round 3 - Domain Types And Rule Definitions

Goal:

- 提升 `CellKind`、`CellId`、`BoardSize`、`Comparator`、`RuleDefinition`、`PuzzleDefinition` 等类型。
- RuleDefinition 必须与 DSL v1 对齐。
- 加 `assertNever` 或等价 exhaustiveness helper。
- `apps/web/src/data/case004.ts` 使用 domain package 类型。

Architecture self-check:

- 类型不携带 UI 文案渲染逻辑。
- Presentation 字段只是数据，不生成 React 元素。

### Round 4 - Events And Pure Reducer

Goal:

- 定义 `GameEvent`、`GameState`、`PlayerMark`、session status 等领域事件类型。
- 实现纯 `reduceGameState(state, event)`，覆盖当前 web app 需要的开始、调查、标记、提示、提交、失败、完成、重置语义。
- `apps/web` 可以暂时继续用 hook state，但 reducer API 必须有测试。

Architecture self-check:

- 玩家标记不是 observation，不自动加入 solver knowledge。
- reducer 不读取完整 target，也不执行求解。
- target access boundary 仍在 app 层或后续专门接口层。

### Round 5 - App Migration And Compatibility

Goal:

- 清理 `apps/web/src/domain` 中被替代的 app-local duplications。
- 确认 current case-004 UI 行为不变。
- 修复 import paths、tsconfig references、package exports。
- 更新 `apps/web/README.md` 或 root `README.md` 的 package boundary 说明。

Expected verification:

- Unit tests pass.
- Build output still uses `/RoomAxioms/` base.
- Manual local smoke if UI imports changed materially.

### Round 6 - Buffer Fixes 1

Use only if previous rounds reveal integration issues.

Allowed work:

- Fix TS project references.
- Fix package exports.
- Fix lint/typecheck/test command coverage.
- Add missing reducer or coordinate edge tests.

Not allowed:

- Starting Schema, Oracle, solver, or UI redesign.

### Round 7 - Buffer Fixes 2

Use only if needed.

Allowed work:

- Strengthen test fixtures.
- Update docs for package API.
- Remove dead app-local files.
- Stabilize CI/Pages workflow if domain package changed build flow.

### Round 8 - Final Validation And Handoff Report

Goal:

- Run full validation.
- Confirm branch clean after push.
- Produce final executor report back to planner.

Required commands:

```powershell
pnpm lint
pnpm typecheck
pnpm test
pnpm build
git status --short --branch
```

Final report must include:

- Files changed by category
- Public API created
- Tests added
- Validation results
- Commit hashes
- Push status
- Whether Phase 1 PASS criteria are met
- Any blockers for Phase 2 Schema v1

## 7. PASS 标准

Phase 1 passes only when all are true:

- `packages/domain` exists and builds as `@room-axioms/domain`.
- Domain package has no React, Vite, browser API, Zod, solver, or Node fs dependency.
- `apps/web` imports domain public API instead of duplicating equivalent domain code.
- Orthogonal and adjacent scope semantics are covered by tests, including corner, edge, and internal cells.
- Invalid coordinate tests exist.
- Rule DSL v1 type definitions exist and are exhaustively typed.
- Game event/reducer API exists with tests for current basic session events.
- Current web app still passes lint/typecheck/test/build.
- GitHub Pages workflow remains green after the final push.
- Working tree is clean.

## 8. Debug Self-Check Template

Use this every round:

```text
Debug self-check:
- Smallest fixture used:
- Failure localization if validation failed:
- Success path covered:
- Failure/invalid/empty/stale state covered:
- UI smoke needed this round: yes/no, why:
- Regression risk:
```

## 9. Architecture Self-Check Template

Use this every round:

```text
Architecture self-check:
- Source-of-truth layer preserved:
- Domain package remains framework-free:
- App code avoided duplicating domain semantics:
- Target board access did not leak into ordinary UI:
- Deferred scope avoided:
- Unrelated files left untouched:
```

