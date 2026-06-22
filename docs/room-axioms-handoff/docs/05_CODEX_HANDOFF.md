# 《房间公理》Codex 接手文档

**目标：** 让 Codex 在不重新讨论核心方向的情况下，按可审查的小步提交建立 MVP。

---

## 1. 先读什么

按顺序阅读：

1. 根目录 `README.md`
2. `01_PRODUCT_DESIGN.md`
3. `03_TECHNICAL_DESIGN.md`
4. `06_RULE_DSL_SPEC.md`
5. 本文
6. `02_UI_UX_DESIGN.md`
7. `04_ARCHITECTURE.md`

原型 `prototype/index.html` 只作为交互与视觉参照；不要复制其硬编码样例求解逻辑作为生产实现。

---

## 2. 不得擅自改变的约束

1. 只做固定规则、客观揭示方向。
2. 调查过程中不新增机械规则。
3. 不以隐藏规则、文案双关或未来揭示否定过去推理。
4. 最终访客布局唯一，完整安全陈设可多解。
5. 零猜测必须由程序验证。
6. 精确求解器与人类推理器分离。
7. 边界邻域只含棋盘内格子，并在 UI 图示。
8. MVP 不加后端、倒计时、账号、3D 或复杂剧情。
9. 关卡 DSL 不允许可执行 JavaScript。
10. UI 组件不能直接读取完整目标棋盘。

遇到实现冲突时，先创建 ADR 或 issue，不要静默放宽约束。

---

## 3. 建议初始化命令

使用主版本的最新稳定补丁，随后提交 lockfile：

```bash
corepack enable
corepack prepare pnpm@11 --activate
mkdir room-axioms && cd room-axioms
pnpm init
```

建立 workspace：

```yaml
# pnpm-workspace.yaml
packages:
  - apps/*
  - packages/*
  - tools/*
```

应用初始化：

```bash
pnpm create vite apps/web --template react-ts
```

根目录建议脚本：

```json
{
  "scripts": {
    "build": "pnpm -r build",
    "typecheck": "pnpm -r typecheck",
    "test": "pnpm -r test",
    "lint": "pnpm -r lint",
    "e2e": "playwright test",
    "puzzle": "pnpm --filter @room-axioms/puzzle-cli start"
  }
}
```

Node 版本写入 `.nvmrc` 或 `.node-version`：`24`。`packageManager` 字段固定实际 pnpm 补丁版本。

---

## 4. 目标仓库结构

```text
room-axioms/
├─ apps/web/
├─ packages/domain/
├─ packages/schema/
├─ packages/rule-engine/
├─ packages/solver/
├─ packages/proof/
├─ packages/generator/
├─ packages/ui/
├─ packages/content/
├─ tools/puzzle-cli/
├─ tests/fixtures/
├─ tests/e2e/
├─ docs/
├─ .github/workflows/ci.yml
├─ pnpm-workspace.yaml
├─ package.json
└─ pnpm-lock.yaml
```

每个包使用 `@room-axioms/<name>`。所有包默认 ESM。公共 API 通过 `src/index.ts` 导出，不跨包引用内部路径。

---

## 5. 实施计划：按 PR 拆分

### PR-001：仓库骨架与质量门禁

**内容**

- pnpm workspace；
- React/Vite 应用空壳；
- TypeScript strict；
- ESLint、格式化、Vitest；
- GitHub Actions：install、typecheck、test、build；
- 基础 README。

**验收**

- `pnpm install --frozen-lockfile` 可复现；
- `pnpm typecheck && pnpm test && pnpm build` 全通过；
- 不加入业务状态库或 UI 框架。

### PR-002：领域模型与邻域

**内容**

- CellKind、Coord、CellId、BoardSize；
- 坐标解析/格式化；
- orthogonal/adjacent 邻域；
- RuleDefinition 联合类型；
- GameEvent 和纯 reducer。

**测试**

- 四角、四边、内部邻域数量与坐标；
- 非法坐标；
- reducer 事件序列。

**关键验收**

- “邻接域”角落 3、边缘 5、内部 8；
- domain 不依赖浏览器和 React。

### PR-003：关卡 Schema 与基准样例

**内容**

- Zod Schema v1；
- 静态语义检查；
- `case-004` 基准样例；
- target 完整性和规则满足检查的接口占位。

**验收**

- 错误坐标、重复 id、缺失 target、未知类型会失败；
- 基准样例可 parse；
- 公共 payload 与 solution payload 分离。

### PR-004：朴素 Oracle

**内容**

- 仅支持 3×3 或受限类型的全枚举参考求解器；
- 模型满足检查；
- 测试辅助，不进入生产 UI。

**意义**

后续 CSP 的结果必须与 oracle 在小规模随机实例上相同。

### PR-005：精确 CSP 内核

**内容**

- bitmask domain；
- trail 回滚；
- globalCount 和 forEachCount 约束；
- propagation + MRV DFS；
- findModel / isSatisfiable；
- 预算和统计。

**验收**

- 基准样例 target 满足规则；
- 随机小盘与 oracle 对齐；
- assumption 查询不污染下一次查询。

### PR-006：强制格、候选布局与唯一性

**内容**

- forcedSafe / forcedGuests；
- guest-layout uniqueness；
- 候选 guest bitset 去重计数；
- 基准样例收缩快照：15 → 5 → 2 → 1。

**验收**

- 唯一性只比较 guest 布局；
- 初始状态识别出安全调查集合；
- 对每个强制结论可生成反例查询结果。

### PR-007：人类推理器 v1

**内容**

至少实现：

- 全局计数闭合；
- 局部计数闭合；
- 唯一目标邻域交集；
- 已知非访客物件安全；
- 结构化证明 DAG 与中文模板。

**验收**

- 基准样例每一波有证明；
- 每个 deduction 用 exact solver 自动校验；
- 不允许 explanation 文本直接写死坐标解。

### PR-008：关卡验证器与 CLI

**内容**

- `validate`、`solve`、`explain`；
- 零猜测闭包；
- explanation gap；
- 非进展检测；
- JSON 与人类可读报告；
- CI 验证所有内容。

**验收**

- 人工构造的多解猜测关卡被拒绝；
- 目标违反规则被拒绝；
- 基准样例通过；
- 退出码可供 CI 使用。

### PR-009：UI Shell

**内容**

- 三栏布局；
- RulePanel、BoardGrid、EvidencePanel；
- 工具切换、规则帮助弹层；
- 响应式布局；
- CSS token；
- 基本键盘导航。

**验收**

- 视觉参考原型；
- 无求解逻辑写入组件；
- 390、768、1280 宽度不溢出关键操作。

### PR-010：完整游戏流程

**内容**

- 目标访问边界；
- 调查、失败、标记、提交、重置；
- 事件存档；
- 规则 briefing；
- 成功/失败结算。

**验收**

- 能手动完成基准样例；
- 错误标记不泄露；
- 调查 guest 失败；
- UI 普通组件无完整 target 访问。

### PR-011：Worker、提示与开发者层

**内容**

- solver Worker 协议；
- 陈旧响应丢弃和取消；
- 提示证明；
- 候选数、强制格、目标显示（dev only）；
- 性能统计。

**验收**

- 求解不阻塞 UI；
- 玩家模式不显示强制格；
- 提示只来自 HumanReasoner；
- dev overlay 与 CLI 结果一致。

### PR-012：内容、E2E 与发布

**内容**

- 至少 10 关；
- Playwright 主流程；
- 存档兼容；
- 静态部署；
- 内容 hash 与验证签名。

**验收**

- 全关验证通过；
- 三浏览器内核通过；
- 无高优先级 a11y 问题；
- 预览站可离线完成已加载关卡。

---

## 6. 首个实现任务的精确说明

Codex 首个业务任务应是 `domain + neighborhood`，不要直接做 UI。

### 输入

- BoardSize；
- Coord 或 CellId；
- scope kind。

### 输出

- 稳定排序、无重复、仅棋盘内的坐标列表。

### 稳定排序

按 `y` 再 `x` 升序，避免测试与证明顺序漂移。

### 必测示例（4×4）

```text
adjacent(A1) = [B1, A2, B2]
orthogonal(A1) = [B1, A2]
adjacent(B1) = [A1, C1, A2, B2, C2]
orthogonal(B2) = [B1, A2, C2, B3]
adjacent(B2) = [A1, B1, C1, A2, C2, A3, B3, C3]
```

不要把棋盘外坐标放入集合，也不要用固定“8”补空位。

---

## 7. 基准样例数据

目标：

```text
A1 empty   B1 bottle   C1 mirror   D1 guest
A2 bottle  B2 bin      C2 bottle   D2 empty
A3 mirror  B3 empty    C3 mirror   D3 empty
A4 empty   B4 guest    C4 empty    D4 empty
```

初始揭示：

```text
B1=bottle, A2=bottle, C2=bottle
```

规则：

```text
bin global eq 1
guest global eq 2
for each bottle, orthogonal bin eq 1
for each bin, adjacent guest eq 0
for each mirror, adjacent guest eq 1
for each bottle, orthogonal guest eq 0
```

预期验证波次至少能复现：

```text
initial guest layouts: 15
C1=mirror: 5
A3=mirror: 2
C3=mirror: 1
final guests: D1, B4
```

注意：验证器可在每波揭示多个已证明安全格，所以实际波次格式可以不同；最终结论和无猜测性质必须相同。

---

## 8. 编码规范

- TypeScript `strict: true`；
- 禁止 `any`，确有必要需局部注释理由；
- 对 RuleDefinition 使用 `assertNever` 保证穷尽；
- 纯函数优先；
- 公共数组/对象尽量 readonly；
- 领域包不抛 UI 文案，只抛错误码和结构化上下文；
- 稳定排序所有对外列表；
- 浮点数不进入核心逻辑；
- 求解器随机化必须显式 seed；
- 测试名称描述规则与边界，不只写“works”。

### 8.1 Commit / PR

每个 PR：

- 只解决一个架构阶段；
- 附测试；
- 附对公开 API 的说明；
- 若修改规则语义，更新 DSL 文档与 fixtures；
- 若候选收缩快照变化，说明原因。

---

## 9. Definition of Done

一项逻辑功能完成需要：

1. 类型与 API 完整；
2. 正向、反向、边界测试；
3. 与 oracle 或 exact solver 交叉验证；
4. 错误码可诊断；
5. 文档/示例更新；
6. 无未处理的超时路径；
7. UI 功能有键盘与触控路径；
8. E2E 或组件测试覆盖用户主路径；
9. `pnpm lint/typecheck/test/build` 全绿；
10. 没有通过硬编码关卡答案绕过通用实现。

---

## 10. Codex 常见误区警告

### 10.1 不要把玩家标记当事实

访客旗是玩家笔记，不应自动加入 solver knowledge。否则错误旗会让系统给出基于错误假设的“必然”提示。

### 10.2 不要只验证目标棋盘

目标满足规则不等于关卡零猜测。必须模拟所有中间知识状态。

### 10.3 不要要求完整模型唯一

只要求 guest bitset 唯一。安全物件可以存在多种仍相容的安排。

### 10.4 不要把 exact 搜索结果直接翻译成提示

“测试了所有模型，所以 B2 安全”不是玩家可接受的证明。需要 HumanReasoner 技巧。

### 10.5 不要让边缘默认拥有虚拟空格

棋盘外不属于 scope。数量基于实际返回的棋盘内集合。

### 10.6 不要把未来目标事实提前交给 solver

玩家态 solver 只能使用规则和 observations。验证器揭示安全格时才从 target 取值。

### 10.7 不要在 UI 中自动显示强制格

这会把游戏变成按高亮点击。强制格只在提示或开发者模式出现。

---

## 11. 待建 Issue 列表

- RA-001 Monorepo scaffold
- RA-002 Domain coordinates and neighborhoods
- RA-003 Puzzle Schema v1
- RA-004 Brute-force oracle
- RA-005 CSP core
- RA-006 Forced-cell queries
- RA-007 Guest-layout uniqueness
- RA-008 Human technique: global/local counts
- RA-009 Human technique: unique target intersection
- RA-010 Proof DAG and renderer
- RA-011 No-guess verifier
- RA-012 Puzzle CLI
- RA-013 Game UI shell
- RA-014 Input and marks
- RA-015 Worker integration
- RA-016 Developer inspector
- RA-017 Save repository
- RA-018 E2E and accessibility
- RA-019 First 10 cases
- RA-020 Generator spike

优先级和未决问题见 `07_BACKLOG_AND_DECISIONS.md`。

---

## 12. 可直接交给 Codex 的首轮提示词

```text
你正在实现《房间公理》浏览器 MVP。请先阅读 README、产品设计、技术设计、架构、规则 DSL 和 Codex handoff。

本轮只完成 PR-002：@room-axioms/domain 的坐标、棋盘和邻域模型，以及对应测试。不要实现 React UI、求解器或关卡生成器。

硬性语义：
- orthogonal scope 只含共享边且位于棋盘内的格子；
- adjacent scope 只含共享边或角且位于棋盘内的格子；
- 角落 adjacent=3、边缘 adjacent=5、内部 adjacent=8；
- 返回结果按 y、x 稳定排序；
- domain 包不得依赖 React、浏览器 API 或 Zod；
- TypeScript strict，无 any；
- 对 4×4 的四角、四边、内部写完整测试。

完成后给出：改动文件、公共 API、测试摘要、仍未实现内容。不要改变固定规则/客观揭示/零猜测的产品契约。
```
