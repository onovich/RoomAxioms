# Phase 2 Schema And Content Contract Goal Mode Execution Guide

日期：2026-06-23  
状态：给执行者使用的 Phase 2 开发指令文档  
阶段：Phase 2 - Schema And Content Contract  
轮数预算：6 轮，其中 1-4 为主实现，5 为缓冲修复，6 为最终验证

## 0. 直接给执行者的 Goal Prompt

你正在执行《房间公理 / Room Axioms》的 Phase 2：Schema And Content Contract。

请阅读本指南、`README.md`、`Role.md`、`docs/phase-1-domain-core-final-report.md`、`docs/room-axioms-handoff/docs/06_RULE_DSL_SPEC.md`、`docs/room-axioms-handoff/docs/03_TECHNICAL_DESIGN.md`、`docs/room-axioms-handoff/docs/05_CODEX_HANDOFF.md`，然后在 6 轮预算内完成：

- 新建 `packages/schema` workspace 包，内部包名为 `@room-axioms/schema`。
- 使用 Zod v4 建立 Puzzle Schema v1，覆盖 `PuzzleDefinition`、`RuleDefinition`、坐标、board、target、initial reveals、metadata 和 presentation。
- 提供结构化诊断 API，使错误数据可以返回稳定 error code、path 和 context，而不是 UI 文案或技术堆栈。
- 新增 `content/cases/case-004.json` 作为基准内容样例，并让测试证明它能被 schema 解析为 domain `PuzzleDefinition`。
- 保持 `packages/domain` 纯净：不得让 domain 依赖 schema、Zod、React、浏览器 API 或 Node 文件系统。
- 让根验证继续覆盖 `apps/web`、`packages/domain` 和新增的 `packages/schema`。
- 每轮都必须通过对应验证后提交并推送，失败不得进入下一轮。

本阶段不要实现 Oracle、CSP solver、人类推理器、Worker、内容生成器、关卡编辑器、正式 CLI 工具链、10 关内容或 UI 重设计。

使用 `$donextgoal` 执行本指南。执行完成后向 planner 线程 `019ef0df-a626-7181-9ca6-1cc75c1f4c47` 汇报。

## 1. 必读上下文

- `README.md`
- `AGENTS.md`
- `Role.md`
- `docs/development-plan.md`
- `docs/phase-1-domain-core-final-report.md`
- `docs/phase-1-domain-core-goal-mode-execution-guide.md`
- `docs/room-axioms-handoff/README.md`
- `docs/room-axioms-handoff/docs/03_TECHNICAL_DESIGN.md`
- `docs/room-axioms-handoff/docs/05_CODEX_HANDOFF.md`
- `docs/room-axioms-handoff/docs/06_RULE_DSL_SPEC.md`
- `docs/room-axioms-handoff/docs/07_BACKLOG_AND_DECISIONS.md`
- Current domain code under `packages/domain/src`
- Current prototype data under `apps/web/src/data/case004.ts`

Phase 1 is accepted. Treat `@room-axioms/domain` as the source of domain types and helper semantics. Schema may depend on domain; domain must not depend on schema.

## 2. 本阶段要完成什么

本阶段完成 RA-003：Puzzle Schema v1、Zod 校验、错误诊断和基准样例。

Required deliverables:

- `packages/schema/package.json`
- `packages/schema/tsconfig.json` and `packages/schema/tsconfig.build.json`
- `packages/schema/src/index.ts`
- `packages/schema/src/puzzleSchema.ts` or equivalent schema module
- `packages/schema/src/diagnostics.ts` or equivalent structured error module
- Tests for valid `case-004`, invalid schema version, invalid coordinates, duplicate ids, missing target cells, extra target cells, unknown cell kinds, invalid rule references, invalid initial reveals, and presentation constraints
- `content/cases/case-004.json` as the canonical JSON fixture for the current prototype puzzle
- Root workspace scripts still covering all packages through `pnpm -r --if-present`
- Documentation note explaining the package boundary and fixture location

Minimum public API:

```ts
import type { PuzzleDefinition } from '@room-axioms/domain';

export interface SchemaIssue {
  readonly code: string;
  readonly path: readonly (string | number)[];
  readonly message: string;
  readonly context?: Readonly<Record<string, unknown>>;
}

export interface ParsePuzzleResult {
  readonly ok: boolean;
  readonly puzzle?: PuzzleDefinition;
  readonly issues: readonly SchemaIssue[];
}

export function parsePuzzleDefinition(input: unknown): ParsePuzzleResult;
export function assertPuzzleDefinition(input: unknown): PuzzleDefinition;
export function formatSchemaIssues(issues: readonly SchemaIssue[]): readonly string[];
```

The exact names can vary if the package uses a clearer established local pattern, but the public API must keep structured diagnostics available to later CLI, content tooling, web dev panels, and tests.

## 3. 本阶段不做什么

- 不实现 brute-force Oracle。那是 Phase 3。
- 不实现 CSP solver、forced cells、guest uniqueness、model counting 或 no-guess verifier。
- 不实现 human reasoner、proof DAG、proof renderer 或 hint engine。
- 不实现 Worker 集成。
- 不实现正式 `pnpm puzzle validate` CLI；可以为 tests 暴露 package API，但不要扩大到 CLI 产品面。
- 不新增 10 关内容，不做生成器，不做编辑器。
- 不改变当前游戏 UI 视觉、文案节奏、交互节奏或关卡目标。
- 不把 Zod 或 schema 依赖加入 `packages/domain`。
- 不让 schema 执行任意脚本、正则脚本、`eval`、`Function` 构造器或作者自定义代码。

## 4. 每轮固定工作流

每轮开始：

1. 读取本指南和 `Role.md`。
2. 查看 `git status --short --branch`。
3. 明确本轮只处理一个小目标。
4. 检查是否存在用户未提交变更；不得覆盖或误纳入无关文件。

每轮实现：

1. 先保持 domain 类型为 source of truth，再让 schema 映射到这些类型。
2. 每个新增 public API 必须有测试。
3. 每个诊断错误必须有稳定 code，并且测试覆盖至少一个失败 fixture。
4. 列表、target keys 和 issue 输出必须稳定排序。
5. 不允许为了 case-004 特判坐标、规则或答案。

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

如果改动影响本地启动或 web import，再运行真实 HTTP smoke。不要 stage unrelated untracked files。不要提交 `apps/web/dist`、`node_modules`、coverage、cache 或本地端口日志。

## 6. 分轮安排

### Round 1 - Schema Package Boundary

Goal:

- 建立 `packages/schema` workspace 包，包名 `@room-axioms/schema`。
- 添加 Zod v4 依赖和 TS/Vitest 配置。
- 更新 root validation，使 `pnpm lint/typecheck/test/build` 覆盖 schema 包。
- 暴露初始 `src/index.ts`，先不要迁移 case-004。

Expected validation:

- `pnpm install`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`

Architecture self-check:

- `packages/schema` 依赖 `@room-axioms/domain`，但 `packages/domain` 不依赖 schema 或 Zod。
- schema 包不依赖 React、Vite UI、浏览器 API 或 Node fs runtime。

### Round 2 - DSL V1 Zod Schemas

Goal:

- 为 `CellKind`、`BoardSize`、`Comparator`、`Scope`、`GlobalCountRule`、`ForEachCountRule`、`RuleDefinition`、`PuzzleMetadata` 和 `PuzzleDefinition` 建立 Zod schema。
- 对齐 `06_RULE_DSL_SPEC.md` 的 v1 字段约束：`schemaVersion` 必须为 1，id 格式，board MVP 尺寸，allowedKinds 去重且含 `empty` 和 `guest`，metadata status/difficulty/tags。
- 测试 valid minimal puzzle、invalid schema version、unknown kind、invalid comparator、invalid scope。

Architecture self-check:

- 类型输出应映射到 domain `PuzzleDefinition`，不要在 schema 包重新定义漂移的业务类型。
- presentation 只是数据字段，不生成 React 元素或 UI 文案逻辑。

### Round 3 - Semantic Validation And Diagnostics

Goal:

- 实现 `parsePuzzleDefinition` 和 `assertPuzzleDefinition`。
- 在 Zod 基础上增加语义检查：target 覆盖所有格子且无额外坐标；initial reveals 有效、去重且不揭示 guest；rule ids 唯一；rule subject/target 在 allowedKinds 中；至少存在 guest 相关规则；presentation title 非空。
- 实现结构化 `SchemaIssue`，稳定输出 `code`、`path`、`message`、`context`。
- 测试错误坐标、重复 rule id、缺失 target、额外 target、invalid initial reveal、rule 引用 unknown kind。

Architecture self-check:

- schema 层只做数据契约和局部语义校验，不求解 target 是否满足全部规则。
- 错误诊断可供 CLI/web dev panel 使用，但不携带玩家端提示策略。

### Round 4 - Case-004 JSON Fixture And App Compatibility

Goal:

- 新增 `content/cases/case-004.json`，内容与当前 `apps/web/src/data/case004.ts` 的 puzzle 数据一致。
- 添加 fixture 测试，证明 JSON fixture parse 后得到 domain `PuzzleDefinition`。
- 选择保守迁移：web app 可以继续通过 TS adapter 导出现有 `case004`，但数据源和 schema fixture 必须保持一致；如果迁移 web import，必须保持 UI 行为不变。
- 更新 README 或 `apps/web/README.md` 说明 content fixture 与 schema 包边界。

Expected validation:

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- If web import changed: local HTTP smoke for `/RoomAxioms/`.

Architecture self-check:

- `content/cases/case-004.json` 不包含函数、脚本或生成逻辑。
- UI labels/tool labels 留在 web 层；puzzle schema 只验证 puzzle data。

### Round 5 - Buffer Fixes

Use only if previous rounds reveal integration issues.

Allowed work:

- Fix package exports, TS references, JSON import settings, or test fixtures.
- Strengthen diagnostic codes and paths.
- Remove duplicate schema/domain definitions.
- Document minor package boundary details.

Not allowed:

- Starting Oracle, solver, proof, Worker, generator, editor, or 10-level content work.

### Round 6 - Final Validation And Handoff Report

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
- Fixture paths created
- Diagnostics codes added
- Tests added
- Validation results
- Commit hashes
- Push status
- Whether Phase 2 PASS criteria are met
- Any blockers for Phase 3 Oracle And Verification Harness

## 7. PASS 标准

Phase 2 passes only when all are true:

- `packages/schema` exists and builds as `@room-axioms/schema`.
- Schema package depends on domain and Zod, while domain remains Zod-free and schema-free.
- Puzzle Schema v1 covers the fields documented in `06_RULE_DSL_SPEC.md`.
- `parsePuzzleDefinition` returns domain-compatible `PuzzleDefinition` on success and structured issues on failure.
- Invalid fixture tests cover wrong schema version, invalid/out-of-board coordinates, duplicate ids, missing target cells, extra target cells, unknown cell kinds, invalid rule references, invalid initial reveals, and empty presentation title.
- `content/cases/case-004.json` exists and passes schema validation.
- Current web app still passes lint/typecheck/test/build and, if touched, HTTP smoke.
- No Oracle, CSP solver, human reasoner, Worker, generator, editor, 10-level content, or UI redesign scope entered this phase.
- GitHub Pages workflow remains green after final push.
- Working tree is clean.

## 8. Debug Self-Check Template

Use this every round:

```text
Debug self-check:
- Smallest fixture used:
- Failure localization if validation failed:
- Success path covered:
- Failure/invalid/empty/stale state covered:
- JSON/content migration risk:
- UI smoke needed this round: yes/no, why:
- Regression risk:
```

## 9. Architecture Self-Check Template

Use this every round:

```text
Architecture self-check:
- Domain remains the source of truth for puzzle/domain types:
- Domain package remains schema-free and Zod-free:
- Schema package avoids UI/runtime/solver semantics:
- Content fixtures contain data only, no executable behavior:
- Deferred scope avoided:
- Unrelated files left untouched:
```

## 10. Final Report Template

```markdown
# Phase 2 Schema And Content Contract Final Report

Status: READY_FOR_CHECK
Guide: `docs/phase-2-schema-content-goal-mode-execution-guide.md`
Phase: Phase 2 - Schema And Content Contract

## Summary
## Files Changed By Category
## Public API Created
## Fixture Paths
## Diagnostics Codes
## Tests Added
## Validation
## Commits
## PASS Criteria
## Phase 3 Notes
```
