# Phase 4 Solver Core And Queries Goal Mode Execution Guide

日期：2026-06-23  
状态：给执行者使用的 Phase 4 开发指令文档  
阶段：Phase 4 - Solver Core And Queries  
轮数预算：10 轮，其中 1-7 为主实现，8-9 为缓冲修复，10 为最终验证

## 0. 直接给执行者的 Goal Prompt

你正在执行《房间公理 / Room Axioms》的 Phase 4：Solver Core And Queries。

请阅读本指南、`README.md`、`Role.md`、`docs/phase-3-oracle-verification-final-report.md`、`docs/room-axioms-handoff/docs/03_TECHNICAL_DESIGN.md`、`docs/room-axioms-handoff/docs/04_ARCHITECTURE.md`、`docs/room-axioms-handoff/docs/05_CODEX_HANDOFF.md`、`docs/room-axioms-handoff/docs/06_RULE_DSL_SPEC.md`，然后在 10 轮预算内完成：

- 新建 `packages/solver` workspace 包，内部包名为 `@room-axioms/solver`。
- 实现有限域 exact solver core：domain bitmask、trail/rollback、constraint propagation、MRV DFS、节点预算和统计。
- 支持当前 DSL v1 的 `globalCount` 和 `forEachCount` 规则。
- 提供 `isSatisfiable`、`findModel`、`findForcedCells`、`isGuestLayoutUnique` 和 `countGuestLayouts` 等查询能力。
- 使用 `@room-axioms/oracle` 对 2x2/3x3 小盘进行交叉验证，防止漏解或假解。
- 对 `content/cases/case-004.json` 通过 schema 加载，并验证 target satisfies rules、初始状态可满足、候选危险布局可统计/截断、forced-cell 查询和最终 guest-layout uniqueness 语义。
- 继续保持 `packages/domain` 纯净：不得让 domain 依赖 schema、oracle、solver、Zod、React、浏览器 API 或 Node 文件系统。
- 每轮都必须通过对应验证后提交并推送，失败不得进入下一轮。

本阶段不要实现 HumanReasoner、proof DAG、proof renderer、hint engine、Worker 接入、正式 CLI、UI developer overlay、内容生成器、关卡编辑器、10 关内容或 UI 重设计。

使用 `$donextgoal` 执行本指南。执行完成后向 planner 线程 `019ef0df-a626-7181-9ca6-1cc75c1f4c47` 汇报。

## 1. 必读上下文

- `README.md`
- `AGENTS.md`
- `Role.md`
- `docs/development-plan.md`
- `docs/phase-3-oracle-verification-final-report.md`
- `docs/phase-3-oracle-verification-goal-mode-execution-guide.md`
- `docs/room-axioms-handoff/README.md`
- `docs/room-axioms-handoff/docs/03_TECHNICAL_DESIGN.md`
- `docs/room-axioms-handoff/docs/04_ARCHITECTURE.md`
- `docs/room-axioms-handoff/docs/05_CODEX_HANDOFF.md`
- `docs/room-axioms-handoff/docs/06_RULE_DSL_SPEC.md`
- `docs/room-axioms-handoff/docs/07_BACKLOG_AND_DECISIONS.md`
- Current domain code under `packages/domain/src`
- Current schema code under `packages/schema/src`
- Current oracle code under `packages/oracle/src`
- Canonical content fixture `content/cases/case-004.json`

Phase 3 is accepted. Treat `@room-axioms/oracle` as the correctness reference for small fixtures. The solver may depend on domain, schema, and oracle for tests/cross-checks. Domain must not depend on solver.

## 2. 本阶段要完成什么

本阶段完成 RA-005 和 RA-006 的工程化版本：exact CSP core、assumption queries、forced cells、guest-layout uniqueness 和候选危险布局计数。

Required deliverables:

- `packages/solver/package.json`
- `packages/solver/tsconfig.json` and `packages/solver/tsconfig.build.json`
- `packages/solver/src/index.ts`
- `packages/solver/src/types.ts`
- `packages/solver/src/bitset.ts` or equivalent domain bitmask helpers
- `packages/solver/src/constraints.ts` or equivalent rule compilation module
- `packages/solver/src/search.ts` or equivalent propagation/search module
- `packages/solver/src/queries.ts` or equivalent public query module
- Tests for bitmask domain operations, propagation, rollback/trail isolation, satisfiable/unsatisfiable cases, `findModel`, assumptions, forced safe/guest cells, guest-layout uniqueness, guest layout counting/capping, and oracle cross-checks
- Case-004 solver regression tests with bounded query budgets
- Documentation note explaining solver/oracle/package boundaries and the current performance budget

Minimum public API:

```ts
import type { CellId, CellKind, Observation, PuzzleDefinition } from '@room-axioms/domain';

export type SolverAssumption =
  | { readonly kind: 'cellIs'; readonly cellId: CellId; readonly value: CellKind }
  | { readonly kind: 'cellIsNot'; readonly cellId: CellId; readonly value: CellKind };

export interface SolveInput {
  readonly puzzle: PuzzleDefinition;
  readonly observations?: readonly Observation[];
}

export interface SolverOptions {
  readonly maxNodes?: number;
  readonly maxModels?: number;
  readonly maxGuestLayouts?: number;
}

export interface SolverStats {
  readonly nodeCount: number;
  readonly propagationCount: number;
  readonly truncated: boolean;
}

export interface SolverModel {
  readonly cells: Readonly<Record<CellId, CellKind>>;
}

export interface SolveResult {
  readonly satisfiable: boolean;
  readonly model: SolverModel | null;
  readonly stats: SolverStats;
}

export interface ForcedCellResult {
  readonly safe: readonly CellId[];
  readonly guests: readonly CellId[];
  readonly stats: SolverStats;
}

export interface UniqueLayoutResult {
  readonly unique: boolean;
  readonly guestCells: readonly CellId[] | null;
  readonly stats: SolverStats;
}

export interface GuestLayoutCountResult {
  readonly count: number;
  readonly greaterThan?: number;
  readonly stats: SolverStats;
}

export function isSatisfiable(input: SolveInput, assumptions?: readonly SolverAssumption[], options?: SolverOptions): SolveResult;
export function findModel(input: SolveInput, assumptions?: readonly SolverAssumption[], options?: SolverOptions): SolveResult;
export function findForcedCells(input: SolveInput, options?: SolverOptions): ForcedCellResult;
export function isGuestLayoutUnique(input: SolveInput, options?: SolverOptions): UniqueLayoutResult;
export function countGuestLayouts(input: SolveInput, cap: number, options?: SolverOptions): GuestLayoutCountResult;
```

Exact names may vary if implementation finds a clearer local pattern, but the public API must expose satisfiability, model search, assumptions, forced-cell queries, guest-layout uniqueness, guest-layout counting, caps, and stats.

## 3. 本阶段不做什么

- 不实现 HumanReasoner、proof DAG、proof renderer、hint explanation 或 no-guess verifier。
- 不实现 Worker protocol、async cancellation across thread boundary、UI integration 或 developer overlay。
- 不实现正式 `pnpm puzzle validate` CLI；可以为 tests 暴露 package API。
- 不新增 10 关内容，不做生成器，不做编辑器。
- 不改变当前游戏 UI 视觉、文案节奏、交互节奏或关卡目标。
- 不把 solver 的 exact-search 结果直接包装成玩家提示。
- 不要求完整 safe-object layout 唯一；唯一性只比较 guest bitset。
- 不把玩家 marks 自动加入 solver knowledge；只有客观 observations 和 explicit assumptions 可作为约束。

## 4. 每轮固定工作流

每轮开始：

1. 读取本指南和 `Role.md`。
2. 查看 `git status --short --branch`。
3. 明确本轮只处理一个小目标。
4. 检查是否存在用户未提交变更；不得覆盖或误纳入无关文件。

每轮实现：

1. 先实现 solver 纯算法层，再接 schema-loaded fixture。
2. 每个 public API 必须有测试或被更高层测试覆盖。
3. 查询输出必须稳定排序，cell id 按 domain row-major order。
4. 所有搜索必须有 node/model/layout cap，并清楚报告 `truncated`。
5. assumptions 必须通过 trail/rollback 隔离，不得污染下一次查询。
6. 与 oracle 对齐的测试必须只使用小棋盘/少类型 fixture。
7. 不允许为了 case-004 特判规则、坐标或答案。

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
git diff --check
```

不要 stage unrelated untracked files。不要提交 `apps/web/dist`、`node_modules`、coverage、cache 或本地端口日志。

## 6. 分轮安排

### Round 1 - Solver Package Boundary

Goal:

- 建立 `packages/solver` workspace 包，包名 `@room-axioms/solver`。
- 依赖 `@room-axioms/domain` 和 `@room-axioms/schema`；允许测试依赖或 dev 依赖使用 `@room-axioms/oracle`。
- 添加 TS/Vitest 配置和初始 public exports。
- 更新 root validation，使 `pnpm lint/typecheck/test/build` 覆盖 solver 包。

Expected validation:

- `pnpm install`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`

Architecture self-check:

- solver 可依赖 schema/domain/oracle，但 domain 不依赖 solver。
- solver 不依赖 React、Vite UI、浏览器 API、Worker 或 Node fs runtime。

### Round 2 - Bitmask Domains And Constraints

Goal:

- 实现 cell domain bitmask helpers，覆盖 allowedKinds、singleton、remove、intersect、contains、clone/snapshot。
- 编译 `globalCount` 和 `forEachCount` 规则为 solver constraints。
- 实现 rule satisfaction/possible bounds 的基础工具，复用 domain neighbors/allCells 语义。
- 添加 bitmask、constraint bounds、edge/corner/interior local scope tests。

Architecture self-check:

- 规则语义只来自 domain `RuleDefinition`。
- 不复制与 oracle 漂移的规则解释；必要时在测试里与 oracle 交叉比较。

### Round 3 - Propagation And Trail Rollback

Goal:

- 实现 propagation loop、trail mutation/rollback、contradiction reporting。
- 覆盖 global count lower/upper bound、local target count lower/upper bound、subject activation 和 target exclusion。
- 添加 tests 证明 assumptions 查询后基础状态未污染。

Architecture self-check:

- trail 是 solver 内部机制，不泄漏到 public UI/data layer。
- 失败状态有可定位代码或测试名，不用玩家端文案。

### Round 4 - Search, Satisfiability, And FindModel

Goal:

- 实现 MRV DFS 或等价 search。
- 支持 `isSatisfiable`、`findModel`、`maxNodes`、stats。
- 对 tiny fixtures 与 oracle 做模型存在性和 target satisfaction 对齐。
- 测试 satisfiable、unsatisfiable、truncated、stable model ordering。

Architecture self-check:

- solver 是 exact backend，不是 human proof。
- cap/truncation 不得被误报为完整 UNSAT 或 UNIQUE。

### Round 5 - Assumption Queries And Forced Cells

Goal:

- 实现 `SolverAssumption` 的 `cellIs` / `cellIsNot`。
- 实现 `findForcedCells`：`c = guest` 不可满足则 forced safe，`c != guest` 不可满足则 forced guest。
- 测试 forced safe、forced guest、no forced cells、assumption isolation。
- 在 small fixtures 上与 oracle brute-force result 对齐。

Architecture self-check:

- forced safe/guest 是 exact query，不是玩家提示。
- 玩家 marks 不自动转为 assumptions。

### Round 6 - Guest Layout Uniqueness And Counting

Goal:

- 实现 guest bitset projection。
- 实现 `isGuestLayoutUnique`，唯一性只比较 guest layout，不要求完整 safe-object model 唯一。
- 实现 `countGuestLayouts`，按 cap 返回 exact count 或 `greaterThan`。
- 测试完整模型多解但 guest layout 唯一、guest layout 多解、count cap。

Architecture self-check:

- 阻断约束只针对 guest boolean vector。
- safe object 差异不破坏 guest-layout uniqueness。

### Round 7 - Case-004 Solver Regression

Goal:

- 通过 `@room-axioms/schema` 加载 `content/cases/case-004.json`。
- 验证 target satisfies rules、initial observations satisfiable。
- 运行 bounded forced-cell 和 guest-layout/candidate queries，记录稳定 snapshot。
- 如果完整 case-004 查询超预算，必须返回 truncated/greaterThan，而不是假装完整结果。

Expected snapshot target:

- 保存当前实现能稳定得到的 metrics；如果能达到 handoff 中 `15 -> 5 -> 2 -> 1` 的危险布局收缩快照，则记录；若暂时只能得到部分 bounded snapshot，说明边界并保留 Phase 5/6 后续验证点。

Architecture self-check:

- case-004 不允许硬编码。
- snapshot 是 regression data，不是 UI 展示。

### Round 8 - Buffer Fixes 1

Use only if previous rounds reveal integration issues.

Allowed work:

- Fix package exports, TS references, constraint propagation bugs, cap semantics, assumption isolation, or fixture gaps.
- Strengthen oracle cross-checks.
- Improve stats and test diagnostics.

Not allowed:

- Starting human reasoner, proof, Worker, CLI, generator, editor, or UI work.

### Round 9 - Buffer Fixes 2

Use only if needed.

Allowed work:

- Stabilize case-004 bounded regression.
- Add tiny randomized or table-driven small fixtures if useful.
- Document performance caveats and Phase 5/6 handoff notes.
- Tighten boundary scans.

### Round 10 - Final Validation And Handoff Report

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
git diff --check
git status --short --branch
```

Final report must include:

- Files changed by category
- Public API created
- Solver algorithm summary
- Oracle cross-check coverage
- Forced-cell and uniqueness coverage
- Case-004 regression results
- Tests added
- Validation results
- Boundary scan results
- Commit hashes
- Push status
- Whether Phase 4 PASS criteria are met
- Any blockers for Phase 5 Human Reasoning And Proofs

## 7. PASS 标准

Phase 4 passes only when all are true:

- `packages/solver` exists and builds as `@room-axioms/solver`.
- Solver package depends on domain/schema and uses oracle only for tests or bounded cross-checks.
- Domain package remains solver-free, oracle-free, schema-free, Zod-free, and UI-free.
- Solver source has no React, Vite UI, browser API, Worker, DOM, or Node fs runtime dependency.
- Bitmask domain operations, propagation, trail rollback, satisfiability, model search, assumptions, forced cells, guest-layout uniqueness, and guest-layout counting all have tests.
- Solver results match oracle on small fixtures.
- Case-004 is loaded through schema and has bounded solver regression coverage.
- Guest-layout uniqueness compares only guest bitsets, not full model identity.
- Search caps/truncation are represented honestly and never reported as complete proof.
- Current web app still passes lint/typecheck/test/build.
- No HumanReasoner, proof DAG, Worker, CLI, generator, editor, 10-level content, or UI redesign scope entered this phase.
- GitHub Pages workflow remains green after final push.
- Working tree is clean.

## 8. Debug Self-Check Template

Use this every round:

```text
Debug self-check:
- Smallest fixture used:
- Failure localization if validation failed:
- Success path covered:
- Failure/invalid/empty/truncated state covered:
- Assumption rollback checked:
- Oracle cross-check needed/done:
- UI smoke needed this round: yes/no, why:
- Regression risk:
```

## 9. Architecture Self-Check Template

Use this every round:

```text
Architecture self-check:
- Domain remains the source of truth for puzzle/rule types:
- Schema remains the content parsing boundary:
- Oracle remains the small-fixture correctness reference:
- Solver remains exact backend, not human proof or UI hint:
- Guest-layout uniqueness did not require full model uniqueness:
- Deferred proof/Worker/UI/CLI scope avoided:
- Unrelated files left untouched:
```

## 10. Final Report Template

```markdown
# Phase 4 Solver Core And Queries Final Report

Status: READY_FOR_CHECK
Guide: `docs/phase-4-solver-core-goal-mode-execution-guide.md`
Phase: Phase 4 - Solver Core And Queries

## Summary
## Files Changed By Category
## Public API Created
## Solver Algorithm Summary
## Oracle Cross-Check Coverage
## Forced-Cell And Uniqueness Coverage
## Case-004 Regression
## Tests Added
## Validation
## Boundary Scans
## Commits
## PASS Criteria
## Phase 5 Notes
```
