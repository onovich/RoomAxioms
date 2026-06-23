# Phase 3 Oracle And Verification Harness Goal Mode Execution Guide

日期：2026-06-23  
状态：给执行者使用的 Phase 3 开发指令文档  
阶段：Phase 3 - Oracle And Verification Harness  
轮数预算：7 轮，其中 1-5 为主实现，6 为缓冲修复，7 为最终验证

## 0. 直接给执行者的 Goal Prompt

你正在执行《房间公理 / Room Axioms》的 Phase 3：Oracle And Verification Harness。

请阅读本指南、`README.md`、`Role.md`、`docs/phase-2-schema-content-final-report.md`、`docs/room-axioms-handoff/docs/03_TECHNICAL_DESIGN.md`、`docs/room-axioms-handoff/docs/05_CODEX_HANDOFF.md`、`docs/room-axioms-handoff/docs/06_RULE_DSL_SPEC.md`，然后在 7 轮预算内完成：

- 新建 `packages/oracle` workspace 包，内部包名为 `@room-axioms/oracle`。
- 使用 `@room-axioms/domain` 的类型和规则语义，使用 `@room-axioms/schema` 作为内容加载/验证入口。
- 实现小规模 brute-force oracle：规则满足检查、目标模型检查、小棋盘全枚举、观察事实约束、稳定排序和可截断统计。
- 增加手算 fixture 和回归测试，证明 oracle 与人工可验证模型一致。
- 对 `content/cases/case-004.json` 至少验证 schema parse 和 target satisfies rules；不要尝试对 4x4/5-kind case-004 做无界完整枚举。
- 继续保持 `packages/domain` 纯净：不得让 domain 依赖 schema、oracle、Zod、React、浏览器 API 或 Node 文件系统。
- 每轮都必须通过对应验证后提交并推送，失败不得进入下一轮。

本阶段不要实现 CSP solver、forced-cell 查询、guest-layout uniqueness 产品接口、人类推理器、proof DAG、Worker、正式 CLI、内容生成器、关卡编辑器、10 关内容或 UI 重设计。

使用 `$donextgoal` 执行本指南。执行完成后向 planner 线程 `019ef0df-a626-7181-9ca6-1cc75c1f4c47` 汇报。

## 1. 必读上下文

- `README.md`
- `AGENTS.md`
- `Role.md`
- `docs/development-plan.md`
- `docs/phase-2-schema-content-final-report.md`
- `docs/phase-2-schema-content-goal-mode-execution-guide.md`
- `docs/room-axioms-handoff/README.md`
- `docs/room-axioms-handoff/docs/03_TECHNICAL_DESIGN.md`
- `docs/room-axioms-handoff/docs/04_ARCHITECTURE.md`
- `docs/room-axioms-handoff/docs/05_CODEX_HANDOFF.md`
- `docs/room-axioms-handoff/docs/06_RULE_DSL_SPEC.md`
- `docs/room-axioms-handoff/docs/07_BACKLOG_AND_DECISIONS.md`
- Current domain code under `packages/domain/src`
- Current schema code under `packages/schema/src`
- Canonical content fixture `content/cases/case-004.json`

Phase 2 is accepted. Treat `@room-axioms/domain` as the source of puzzle and rule types, and `@room-axioms/schema` as the safe content parsing boundary. Oracle may depend on both. Domain must not depend on oracle or schema.

## 2. 本阶段要完成什么

本阶段完成 RA-004：小规模 brute-force oracle 与验证 harness。

Required deliverables:

- `packages/oracle/package.json`
- `packages/oracle/tsconfig.json` and `packages/oracle/tsconfig.build.json`
- `packages/oracle/src/index.ts`
- `packages/oracle/src/ruleEvaluator.ts` or equivalent rule satisfaction module
- `packages/oracle/src/enumerate.ts` or equivalent brute-force enumerator
- `packages/oracle/src/verify.ts` or equivalent verification harness
- Tests for global count rules, local count rules, target satisfaction, unsatisfied target detection, observation constraints, no-model fixtures, multiple-model fixtures, stable model ordering, max model/node caps, and schema-loaded fixtures
- At least two tiny hand-calculated fixtures in tests, preferably 2x2 or 3x3 with limited kinds
- Documentation note explaining oracle's test-helper boundary and why case-004 is not fully enumerated in Phase 3

Minimum public API:

```ts
import type { CellId, CellKind, Observation, PuzzleDefinition, RuleDefinition } from '@room-axioms/domain';

export type CellAssignment = Readonly<Record<CellId, CellKind>>;

export interface OracleModel {
  readonly cells: CellAssignment;
}

export interface RuleEvaluation {
  readonly ruleId: string;
  readonly satisfied: boolean;
  readonly actual: number | readonly number[];
}

export interface OracleOptions {
  readonly maxModels?: number;
  readonly maxNodes?: number;
}

export interface OracleSearchResult {
  readonly satisfiable: boolean;
  readonly models: readonly OracleModel[];
  readonly modelCount: number;
  readonly nodeCount: number;
  readonly truncated: boolean;
}

export interface OracleVerificationReport {
  readonly targetSatisfiesRules: boolean;
  readonly initialSatisfiable: boolean;
  readonly issues: readonly string[];
  readonly metrics: Readonly<Record<string, number | boolean>>;
}

export function evaluateRule(rule: RuleDefinition, puzzle: PuzzleDefinition, model: OracleModel): RuleEvaluation;
export function satisfiesRules(puzzle: PuzzleDefinition, model: OracleModel): boolean;
export function targetSatisfiesRules(puzzle: PuzzleDefinition): boolean;
export function enumerateModels(
  puzzle: PuzzleDefinition,
  observations?: readonly Observation[],
  options?: OracleOptions,
): OracleSearchResult;
export function verifyPuzzleWithOracle(puzzle: PuzzleDefinition, options?: OracleOptions): OracleVerificationReport;
```

Exact names may vary if the implementation finds a clearer local pattern, but the public API must expose rule evaluation, target satisfaction, small-board enumeration, and verification report data.

## 3. 本阶段不做什么

- 不实现 optimized CSP solver、constraint propagation、MRV search、bitset production backend 或 Worker cancellation。
- 不实现 forced-cell 查询、guest-layout uniqueness 产品接口、candidate count UI 或 developer overlay。
- 不实现 human reasoner、proof DAG、proof renderer、hint explanation 或 no-guess verifier。
- 不实现正式 `pnpm puzzle validate` CLI；可以为 tests 暴露 package API。
- 不新增 10 关内容，不做生成器，不做编辑器。
- 不改变当前游戏 UI 视觉、文案节奏、交互节奏或关卡目标。
- 不让 oracle 访问 React、Vite UI、浏览器 API、Worker 或 DOM。
- 不对 case-004 做无界全空间枚举。4x4/5-kind 的基准关卡在本阶段只做 schema parse 和 target rule satisfaction。

## 4. 每轮固定工作流

每轮开始：

1. 读取本指南和 `Role.md`。
2. 查看 `git status --short --branch`。
3. 明确本轮只处理一个小目标。
4. 检查是否存在用户未提交变更；不得覆盖或误纳入无关文件。

每轮实现：

1. 先实现纯 rule/oracle 逻辑，再接 schema-loaded fixture。
2. 每个 public API 必须有测试或被更高层测试覆盖。
3. 枚举输出必须稳定排序，按 `allCells(size)` 的 cell 顺序和 `allowedKinds` 的 kind 顺序生成。
4. 所有无界操作必须有 `maxModels` 或 `maxNodes` 防护，并返回 `truncated`。
5. 不允许为了 case-004 特判规则、坐标或答案。

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

### Round 1 - Oracle Package Boundary

Goal:

- 建立 `packages/oracle` workspace 包，包名 `@room-axioms/oracle`。
- 依赖 `@room-axioms/domain` 和 `@room-axioms/schema`。
- 添加 TS/Vitest 配置和初始 public exports。
- 更新 root validation，使 `pnpm lint/typecheck/test/build` 覆盖 oracle 包。

Expected validation:

- `pnpm install`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`

Architecture self-check:

- oracle 可依赖 schema/domain，但 domain 不依赖 oracle。
- oracle 不依赖 React、Vite UI、浏览器 API、Worker 或 Node fs runtime。

### Round 2 - Rule Evaluator

Goal:

- 实现 global count 和 for-each local count 的规则满足检查。
- 使用 `neighbors`、`allCells` 和 domain types，保持与 Phase 1 邻域语义一致。
- 覆盖 `eq`、`gte`、`lte` comparator。
- 添加满足和不满足模型测试，包括 corner、edge、interior local scope。

Architecture self-check:

- 规则语义只来自 domain `RuleDefinition`，不得复制漂移的 DSL 类型。
- evaluator 不读取 schema internals，也不访问 UI labels。

### Round 3 - Brute-Force Enumeration

Goal:

- 实现小规模枚举器，输入 `PuzzleDefinition`、可选 observations 和 `OracleOptions`。
- 默认只枚举 `allowedKinds` 中的 kind，按 board cell 顺序生成稳定模型。
- 支持 `maxModels` 和 `maxNodes`，超限返回 `truncated: true`。
- 测试 satisfiable、unsatisfiable、多模型、observations 收缩、稳定排序和 cap 行为。

Architecture self-check:

- 枚举器是 reference oracle，不是优化 solver。
- 玩家 marks 不进入 observations；只有客观 observation 才可作为约束。

### Round 4 - Verification Harness And Tiny Fixtures

Goal:

- 实现 `targetSatisfiesRules` 和 `verifyPuzzleWithOracle`。
- 添加至少两个 2x2/3x3 手算 fixtures，覆盖有模型、无模型、target 违反规则、initial observations 可满足。
- 明确 `verifyPuzzleWithOracle` 在模型空间超限时返回 issue/truncated 指标，不假装完整验证。
- 保证 case-004 只做 target rule satisfaction 和 schema parse，不做无界枚举。

Architecture self-check:

- verification report 是测试/开发 harness，不是玩家提示或最终发布验证器。
- 本阶段不判断 humanExplainable 或 noGuess。

### Round 5 - Schema-Loaded Content Regression

Goal:

- 从 `content/cases/case-004.json` 通过 `@room-axioms/schema` 解析后进入 oracle target satisfaction。
- 添加文档说明：Phase 3 oracle 的小规模边界、case-004 的非枚举原因，以及 Phase 4 CSP 将与 oracle 对齐。
- 增强 tests，确保新增 rule type 时 `assertNever` 或等价穷尽检查会暴露缺口。

Expected validation:

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`

### Round 6 - Buffer Fixes

Use only if previous rounds reveal integration issues.

Allowed work:

- Fix package exports, TS references, model ordering, cap semantics, or fixture gaps.
- Strengthen failure reports and test names.
- Add small hand-calculated fixtures.
- Tighten boundary scans.

Not allowed:

- Starting CSP propagation, forced-cell queries, uniqueness product interface, human reasoner, proof, Worker, CLI, generator, editor, or UI work.

### Round 7 - Final Validation And Handoff Report

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
- Tiny fixture coverage
- Case-004 verification coverage
- Tests added
- Validation results
- Boundary scan results
- Commit hashes
- Push status
- Whether Phase 3 PASS criteria are met
- Any blockers for Phase 4 Solver Core And Queries

## 7. PASS 标准

Phase 3 passes only when all are true:

- `packages/oracle` exists and builds as `@room-axioms/oracle`.
- Oracle package depends on domain/schema but has no React, Vite UI, browser API, Worker, or Node fs runtime dependency.
- Domain package remains schema-free, oracle-free, Zod-free, and UI-free.
- Rule evaluator covers `globalCount` and `forEachCount`, `eq/gte/lte`, `orthogonal/adjacent`, and satisfied/unsatisfied cases.
- Brute-force enumeration works for small fixtures, respects observations, returns stable ordering, and reports truncation for caps.
- Hand-calculated fixtures prove satisfiable, unsatisfiable, multiple-model, and target-violating cases.
- `content/cases/case-004.json` is parsed through schema and its target satisfies rules.
- Current web app still passes lint/typecheck/test/build.
- No CSP solver, forced-cell query, human reasoner, proof, Worker, CLI, generator, editor, 10-level content, or UI redesign scope entered this phase.
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
- Enumeration cap risk:
- UI smoke needed this round: yes/no, why:
- Regression risk:
```

## 9. Architecture Self-Check Template

Use this every round:

```text
Architecture self-check:
- Domain remains the source of truth for puzzle/rule types:
- Schema remains the content parsing boundary:
- Oracle remains a test/reference package, not UI/runtime solver:
- Deferred CSP/forced-cell/proof/Worker scope avoided:
- Case-004 was not fully enumerated without bounds:
- Unrelated files left untouched:
```

## 10. Final Report Template

```markdown
# Phase 3 Oracle And Verification Harness Final Report

Status: READY_FOR_CHECK
Guide: `docs/phase-3-oracle-verification-goal-mode-execution-guide.md`
Phase: Phase 3 - Oracle And Verification Harness

## Summary
## Files Changed By Category
## Public API Created
## Fixture Coverage
## Case-004 Coverage
## Tests Added
## Validation
## Boundary Scans
## Commits
## PASS Criteria
## Phase 4 Notes
```
