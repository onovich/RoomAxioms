# 《房间公理》技术设计文档

**版本：** 0.1  
**日期：** 2026-06-22  
**读者：** Codex、前端工程师、玩法程序、关卡工具开发者

---

## 1. 技术目标

MVP 的技术重点不是渲染，而是建立一个可信的逻辑内容管线：

1. 同一份规则定义可被 UI、精确求解器、人类推理器和生成器共同消费；
2. 任何发布关卡都可机器证明一致、零猜测且最终危险布局唯一；
3. 提示能够输出人类可读的证明，不以穷举结果冒充解释；
4. 浏览器中的求解不阻塞 UI；
5. 内容通过 JSON 数据驱动，不允许关卡注入可执行代码。

---

## 2. 推荐技术栈

### 2.1 运行与构建

| 层 | 选择 | 基线 |
|---|---|---|
| JavaScript 运行时 | Node.js | 24 LTS |
| 包管理 | pnpm | 11.x，锁定 lockfile |
| 语言 | TypeScript | 6.0.x，`strict` |
| UI | React | 19.2.x 的最新补丁版本 |
| 构建 | Vite | 8.x |
| 样式 | CSS Modules + CSS Custom Properties | 无大型 UI 框架 |
| 数据验证 | Zod | 4.x |
| 单元/属性测试 | Vitest | 4.x |
| 端到端 | Playwright Test | 最新稳定 1.x，lockfile 固定 |
| 部署 | 静态站点 | GitHub Pages / Cloudflare Pages / 任意静态主机 |

### 2.2 选择理由

- 浏览器 MVP 不需要 SSR、数据库或 API 服务，Vite 静态应用足够。
- React 适合规则卡、棋盘状态、弹层和开发者面板的组件化；不使用 React Server Components。
- TypeScript 让规则联合类型、证明节点和 Worker 消息保持可穷尽检查。
- Zod 在加载关卡时执行运行时校验，并可生成或配合 JSON Schema。
- Vitest 与 Vite 共享转换管线；Playwright 覆盖 Chromium、Firefox 与 WebKit。
- pnpm workspace 适合拆分领域、求解器、生成器和 UI 包。
- MVP 采用自研有限域 CSP 内核，减少对不可解释黑盒 SAT/WASM 包的依赖；保留以后替换求解后端的接口。

### 2.3 明确不选

- **Next.js/SSR**：无 SEO 动态内容和服务端需求，会扩大部署与安全面。
- **Redux**：游戏状态规模小且天然适合纯 reducer；先不引入。
- **Canvas/Pixi/Unity/Godot**：MVP 棋盘和规则是 DOM 友好型，DOM 更利于可访问性和测试。
- **远程后端求解**：会引入延迟、隐私与离线问题；所有 MVP 求解在本地 Worker 或 Node CLI 完成。
- **在关卡 JSON 中嵌入 JS 表达式**：不可审计、不安全、难以迁移。

---

## 3. Monorepo 结构

```text
room-axioms/
├─ apps/
│  └─ web/                       # React/Vite 玩家端与开发者模式
├─ packages/
│  ├─ domain/                    # 坐标、格子、规则、会话事件、纯 reducer
│  ├─ schema/                    # Zod Schema、JSON 迁移、静态校验
│  ├─ rule-engine/               # 范围计算与规则求值
│  ├─ solver/                    # 精确 CSP、assumption 查询、唯一性
│  ├─ proof/                     # 人类推理器、证明图、提示文案
│  ├─ generator/                 # 关卡生成、最小化、难度评分
│  ├─ ui/                        # 可复用表现组件与设计 token
│  └─ content/                   # 关卡 JSON 与索引
├─ tools/
│  └─ puzzle-cli/                # validate / solve / explain / generate
├─ tests/
│  ├─ fixtures/
│  ├─ solver-oracles/
│  └─ e2e/
├─ docs/
├─ pnpm-workspace.yaml
├─ package.json
└─ pnpm-lock.yaml
```

### 3.1 依赖方向

```text
schema ──> domain
rule-engine ──> domain
solver ──> domain + rule-engine
proof ──> domain + rule-engine
proof 不依赖 solver 的内部搜索过程

generator ──> domain + schema + solver + proof
content ──> schema
ui ──> domain
web ──> domain + schema + solver(worker facade) + proof + ui + content
```

禁止 `domain` 反向依赖 React、Zod、浏览器 API 或 Node 文件系统。

---

## 4. 领域模型

### 4.1 基础类型

```ts
export type CellKind =
  | 'empty'
  | 'bottle'
  | 'bin'
  | 'mirror'
  | 'guest';

export type CellId = string; // 解析后必须规范化，例如 B3

export interface Coord {
  readonly x: number; // 0-based
  readonly y: number; // 0-based
}

export interface BoardSize {
  readonly width: number;
  readonly height: number;
}

export interface Observation {
  readonly cellId: CellId;
  readonly kind: CellKind;
}

export type PlayerMark = 'guest' | 'safe';
```

### 4.2 关卡定义与运行态分离

```ts
export interface PuzzleDefinition {
  readonly schemaVersion: 1;
  readonly id: string;
  readonly title: string;
  readonly board: BoardSize;
  readonly allowedKinds: readonly CellKind[];
  readonly rules: readonly RuleDefinition[];
  readonly initialReveals: readonly CellId[];
  readonly target: Readonly<Record<CellId, CellKind>>;
  readonly metadata: PuzzleMetadata;
}

export interface GameState {
  readonly puzzleId: string;
  readonly observations: ReadonlyMap<CellId, CellKind>;
  readonly marks: ReadonlyMap<CellId, PlayerMark>;
  readonly status: 'briefing' | 'playing' | 'failed' | 'completed';
  readonly failedCell?: CellId;
  readonly hintCount: number;
  readonly eventLog: readonly GameEvent[];
}
```

玩家运行态不得把 `target` 放入普通 React state 或可被 UI 组件随意读取的 Context。生产加载器可拆成 `publicPuzzle` 与 `solutionPayload`；静态单机无法防止用户查看资源，但代码边界仍应避免意外泄露。

### 4.3 事件模型

```ts
export type GameEvent =
  | { type: 'CASE_STARTED'; at: number }
  | { type: 'CELL_INSPECTED'; at: number; cellId: CellId; result: CellKind }
  | { type: 'MARK_CHANGED'; at: number; cellId: CellId; mark: PlayerMark | null }
  | { type: 'HINT_REQUESTED'; at: number; proofId: string }
  | { type: 'CONCLUSION_SUBMITTED'; at: number; correct: boolean }
  | { type: 'CASE_FAILED'; at: number; cellId: CellId }
  | { type: 'CASE_COMPLETED'; at: number };
```

使用纯 `reduceGameState(state, event)`，便于重放、测试和未来存档迁移。

---

## 5. 规则 DSL

MVP 规则只允许两个核心形式：全局计数与逐主体邻域计数。详见 `06_RULE_DSL_SPEC.md`。

### 5.1 联合类型

```ts
export type Comparator =
  | { op: 'eq'; value: number }
  | { op: 'gte'; value: number }
  | { op: 'lte'; value: number };

export type Scope =
  | { kind: 'global' }
  | { kind: 'orthogonal' }
  | { kind: 'adjacent' };

export interface GlobalCountRule {
  readonly type: 'globalCount';
  readonly id: string;
  readonly target: CellKind;
  readonly count: Comparator;
}

export interface ForEachCountRule {
  readonly type: 'forEachCount';
  readonly id: string;
  readonly subject: CellKind;
  readonly scope: Exclude<Scope, { kind: 'global' }>;
  readonly target: CellKind;
  readonly count: Comparator;
}

export type RuleDefinition = GlobalCountRule | ForEachCountRule;
```

### 5.2 语义

`forEachCount(subject=A, scope=N, target=B, eq=k)` 表示：

> 对棋盘中每一个实际类型为 A 的格子 c，`N(c)` 中实际类型为 B 的格子数量恰好为 k。

规则对隐藏的 A 同样有效；“未揭示”只影响玩家知识，不改变世界约束。

### 5.3 坐标与邻域函数

```ts
function orthogonalNeighbors(c: Coord, size: BoardSize): Coord[];
function adjacentNeighbors(c: Coord, size: BoardSize): Coord[];
```

两者只返回棋盘内坐标。边界测试必须覆盖四角、四边和内部。

---

## 6. 精确求解器设计

### 6.1 目标能力

```ts
interface ExactSolver {
  isSatisfiable(input: SolveInput, assumptions?: Assumption[]): SolveResult;
  findModel(input: SolveInput, assumptions?: Assumption[]): Model | null;
  findForcedCells(input: SolveInput): ForcedCellResult;
  isGuestLayoutUnique(input: SolveInput): UniqueLayoutResult;
  countModels(input: SolveInput, cap: number): ModelCountResult;
}
```

### 6.2 表示

每个格子维护一个 5 位 domain bitmask：

```text
EMPTY  00001
BOTTLE 00010
BIN    00100
MIRROR 01000
GUEST  10000
```

已揭示事实把 domain 收缩为单值。玩家标记默认不加入求解约束；只有开发工具明确选择“把玩家假设加入分析”时才加入。

### 6.3 约束传播

每条约束实现：

```ts
interface Constraint {
  readonly watchedCells: readonly number[];
  propagate(state: MutableDomains, trail: Trail): PropagationResult;
  isSatisfied(model: Model): boolean;
}
```

MVP 传播规则：

- 全局类型计数的下界/上界；
- 局部目标计数的下界/上界；
- 主体蕴含：若格子确定为主体，激活局部计数；
- 主体排除：若任何主体可能性会导致局部约束不可满足，移除该主体类型；
- 已确认数等于上界时排除其余目标；
- 可能目标数等于下界时确认全部目标。

### 6.4 搜索

1. 传播到不动点；
2. 若矛盾，回溯；
3. 若所有 domain 单值，得到模型；
4. 选择 domain 最小的格子（MRV）；
5. 按启发式尝试类型，使用 trail 回滚；
6. 支持取消令牌和节点预算。

启发式优先选择参与约束最多的格子；类型顺序不影响正确性，但影响性能。

### 6.5 强制格查询

对每个未调查格 c：

- 查询 `constraints ∧ (c = guest)`；若不可满足，则 c 强制安全。
- 查询 `constraints ∧ (c ≠ guest)`；若不可满足，则 c 强制访客。

可复用基础传播状态，并以 assumption trail 做增量查询。初版允许每格独立求解，性能达到目标后再优化。

### 6.6 危险布局唯一性

1. 找到一个模型 M；
2. 记录其 guest bitset `G(M)`；
3. 增加阻断约束：至少一个格子的 guest 布尔值与 `G(M)` 不同；
4. 若第二次不可满足，则危险布局唯一。

注意：第二模型中安全物件可不同，只要 guest bitset 相同仍视为同一危险布局。因此阻断只针对 guest 布尔向量，而非完整模型。

### 6.7 候选数

开发者 UI 的候选数是完整模型数还是危险布局数必须标明。建议默认显示“候选危险布局数”，去重 guest bitset；设置 cap，例如 10,000。超过上限显示 `>10,000`，不阻塞 UI。

---

## 7. 人类推理器与证明系统

### 7.1 设计边界

人类推理器不是精确搜索过程的文字化。它只执行批准的推理模板，并返回结构化证明。

```ts
interface HumanReasoner {
  derive(state: KnowledgeState): readonly Deduction[];
}

interface Deduction {
  readonly id: string;
  readonly conclusion:
    | { kind: 'safe'; cellId: CellId }
    | { kind: 'guest'; cellId: CellId }
    | { kind: 'object'; cellId: CellId; object: CellKind };
  readonly ruleIds: readonly string[];
  readonly premises: readonly ProofPremise[];
  readonly technique: TechniqueId;
  readonly explanationKey: string;
}
```

### 7.2 MVP 技巧库

- `GLOBAL_COUNT_SATURATED`
- `GLOBAL_COUNT_ALL_REMAINING`
- `LOCAL_COUNT_SATURATED`
- `LOCAL_COUNT_ALL_REMAINING`
- `UNIQUE_TARGET_NEIGHBOR_INTERSECTION`
- `LOCAL_SCOPE_INTERSECTION`
- `LOCAL_SCOPE_DIFFERENCE`
- `KNOWN_SAFE_FROM_NON_GUEST_OBJECT`

每个技巧有：适用条件、形式化结论、中文模板、示例和单元测试。

### 7.3 证明图

证明以 DAG 表示：

```ts
interface ProofNode {
  readonly id: string;
  readonly kind: 'fact' | 'rule' | 'derived';
  readonly label: string;
  readonly parents: readonly string[];
}
```

UI 默认显示简短证明，可展开为所有前提。证明必须稳定排序，便于快照测试。

### 7.4 解释缺口

验证时比较：

- 精确求解器的强制安全/危险集合；
- 人类推理器可得集合。

若精确集合非空但人类集合为空，关卡在该状态出现“解释缺口”。MVP 发布门槛要求无解释缺口。

---

## 8. 零猜测验证器

### 8.1 输入与输出

```ts
interface VerificationReport {
  readonly satisfiable: boolean;
  readonly targetSatisfiesRules: boolean;
  readonly guestLayoutUniqueAtEnd: boolean;
  readonly noGuess: boolean;
  readonly humanExplainable: boolean;
  readonly waves: readonly VerificationWave[];
  readonly errors: readonly ValidationIssue[];
  readonly metrics: DifficultyMetrics;
}
```

### 8.2 算法

```text
knowledge = initial observations
seenStateHashes = ∅

loop:
  assert target board satisfies all rules
  exact = solve(knowledge)
  if UNSAT: fail(CONTRADICTION)

  if guest layout unique(exact):
      pass

  humanDeductions = humanReasoner.derive(knowledge)
  safe = humanDeductions.safe cells not yet revealed
  guests = humanDeductions.guest cells not yet confirmed

  exactForced = exactSolver.findForcedCells(knowledge)
  if safe ∪ guests is empty:
      if exactForced nonempty: fail(EXPLANATION_GAP)
      else fail(GUESS_POINT)

  verify every human deduction against exact solver
  add guest confirmations to knowledge
  reveal every safe cell from target board into knowledge

  if state hash repeats: fail(NON_PROGRESS)
```

### 8.3 为什么可一次揭示所有强制安全格

强制安全是相对于当前候选集合的全称结论；加入更多真实事实只会缩小集合。因此它们不会在同一局中反转。批量揭示用于验证闭包，不要求玩家 UI 自动批量执行。

### 8.4 额外质量检查

即使无猜测也可能无趣，需记录：

- 每波安全格数；
- 每波新约束物件数；
- 连续空地揭示数；
- 候选危险布局收缩率；
- 最短与最长可解释路径；
- 使用的技巧种类；
- 冗余规则和冗余初始物证。

---

## 9. 关卡生成器

### 9.1 v0：手工目标 + 自动验证

首个可交付版本不自动生成关卡。设计师编写 JSON 和目标棋盘，CLI 输出验证报告与提示证明。

### 9.2 v1：生成-验证-淘汰

1. 随机选择尺寸、类型数量和规则模板；
2. 用 CSP 生成满足规则的完整目标模型；
3. 随机选择初始揭示；
4. 运行零猜测验证；
5. 失败则淘汰；
6. 成功后删除冗余揭示；
7. 根据难度区间筛选；
8. 计算与现有关卡的结构相似度。

### 9.3 v2：反向构造

先创建期望的证明波次，再求一个能实现该证明图的目标棋盘。该方式质量更高但实现更复杂，不属于 MVP。

### 9.4 CLI

```bash
pnpm puzzle validate content/cases/case-004.json
pnpm puzzle solve content/cases/case-004.json --state initial
pnpm puzzle explain content/cases/case-004.json --all-waves
pnpm puzzle generate --size 5x5 --difficulty 3 --count 20
pnpm puzzle minimize content/cases/case-004.json
```

CLI 非零退出码表示验证失败，供 CI 阻止不合格关卡合并。

---

## 10. Web Worker 设计

精确求解放入 Worker，避免阻塞 React。

### 10.1 消息协议

```ts
export type SolverRequest =
  | { id: string; type: 'LOAD_PUZZLE'; puzzle: PublicPuzzle }
  | { id: string; type: 'ANALYZE_STATE'; observations: Observation[] }
  | { id: string; type: 'GET_HINT'; observations: Observation[] }
  | { id: string; type: 'CANCEL'; targetRequestId: string };

export type SolverResponse =
  | { id: string; ok: true; type: 'ANALYSIS'; result: StateAnalysis }
  | { id: string; ok: true; type: 'HINT'; result: Deduction }
  | { id: string; ok: false; error: SerializedError };
```

每次状态变化生成新的 request id。UI 丢弃晚于当前状态版本的旧响应。

### 10.2 缓存

缓存键：

```text
puzzle content hash + sorted observations hash
```

开发阶段先用内存 LRU；不把求解缓存持久化。

---

## 11. React 状态与 UI 边界

### 11.1 状态分层

- 领域状态：`useReducer`，事件驱动；
- UI 临时状态：当前工具、选中规则、弹层、hover；
- 异步分析状态：Worker 请求、结果、错误；
- 持久状态：关卡成绩、设置、当前存档。

不把派生数据重复存储。例如已标记数量从 marks 计算。

### 11.2 组件不可做的事

- `CellButton` 不直接判断规则；
- `RuleCard` 不读取目标棋盘；
- UI 不自行计算“安全”；
- 事件 reducer 不执行求解；
- 求解器不依赖 React 文案。

---

## 12. 数据加载、版本与迁移

### 12.1 关卡加载

1. 读取 JSON；
2. Zod parse；
3. 运行静态语义检查：坐标范围、规则引用、目标完整性；
4. 开发/CI 运行完整验证；
5. 生产构建只打包已生成验证签名的内容。

### 12.2 内容签名

每个发布关卡生成：

```json
{
  "contentHash": "sha256:...",
  "validatorVersion": "0.1.0",
  "reportHash": "sha256:..."
}
```

这不是安全防作弊机制，而是防止目标 JSON 修改后忘记重跑验证。

### 12.3 Schema 迁移

- `schemaVersion` 必填；
- 迁移函数纯函数、逐版本；
- 旧版本内容先迁移再校验；
- 不允许运行时静默忽略未知字段。

---

## 13. 持久化

MVP 使用 IndexedDB 或 localStorage；推荐轻量封装 IndexedDB，以便存储事件日志和成绩。

```ts
interface SaveRecord {
  readonly saveVersion: 1;
  readonly puzzleId: string;
  readonly puzzleContentHash: string;
  readonly events: readonly GameEvent[];
  readonly updatedAt: number;
}
```

若内容 hash 改变，旧局存档标为不兼容并提示重开；成绩可按关卡 id 迁移但需标记旧版本。

---

## 14. 测试策略

### 14.1 单元测试

- 坐标解析与邻域：所有角、边、内部；
- 每种规则的满足/不满足模型；
- domain 传播与回溯；
- assumption 不污染基础状态；
- guest layout 唯一性只比较 guest bitset；
- reducer 的每个事件；
- 证明模板稳定性。

### 14.2 属性测试

建议使用自建随机生成循环或后续引入 fast-check：

- 求解器返回的每个模型都满足规则；
- 人类推理器的每个结论都被精确求解器证明；
- 加入真实 observation 后候选集不增加；
- 强制安全格揭示后仍不可能为 guest；
- 回溯前后 domain 一致。

### 14.3 Oracle 测试

对 3×3、少类型小棋盘用朴素全枚举器作为 oracle，与 CSP 结果比较。这是防止复杂传播器产生漏解或假解的关键。

### 14.4 关卡回归

每个关卡保存验证快照：

- 初始候选危险布局数；
- 每波强制格；
- 每波揭示；
- 最终访客集合；
- 技巧序列；
- 难度指标。

内容修改必须显式更新快照并审查差异。

### 14.5 E2E

Playwright 覆盖：

1. 阅读规则并打开邻域说明；
2. 完成基准样例；
3. 错误调查失败；
4. 右键/工具标记与撤销；
5. 错误提交不泄露具体答案；
6. 提示展示证明；
7. 键盘完成主流程；
8. 视口 1280×800、768×1024、390×844；
9. Chromium、Firefox、WebKit。

---

## 15. 性能预算

### 15.1 目标规模

- MVP 最大 5×5；
- 5 种格子类型；
- 2-5 名访客；
- 6-10 条规则；
- 3-8 个初始揭示。

### 15.2 预算

| 操作 | 目标 |
|---|---:|
| 首屏静态资源 gzip | < 300 KB（不含字体/音频） |
| UI 输入响应 | < 50 ms |
| Worker 普通状态分析 P95 | < 100 ms |
| 单次完整关卡验证 P95 | < 2 s（Node CLI） |
| 候选计数 | 200 ms 预算，超时返回下界/上限标记 |
| E2E 首次可交互 | 普通桌面网络 < 2 s |

所有求解 API 支持超时、取消和节点数统计。

---

## 16. 错误处理与诊断

错误分类：

- `SCHEMA_INVALID`
- `TARGET_INCOMPLETE`
- `TARGET_VIOLATES_RULE`
- `STATE_UNSAT`
- `GUESS_POINT`
- `EXPLANATION_GAP`
- `NON_PROGRESS`
- `SOLVER_TIMEOUT`
- `WORKER_CRASH`
- `SAVE_INCOMPATIBLE`

玩家端不显示技术堆栈。开发模式显示：错误码、关卡 id、状态 hash、规则 id 和可复现 CLI 命令。

---

## 17. 安全与隐私

- 关卡数据视为不可信输入，必须 Schema 校验；
- DSL 不执行 `eval`、Function 构造器或任意脚本；
- 风味文本按普通文本渲染，不使用未经净化的 `dangerouslySetInnerHTML`；
- 静态站点不收集 PII；
- 遥测默认开发环境开启、公开版本需明确开关与隐私说明；
- 依赖版本由 lockfile 固定，CI 使用 frozen lockfile；
- 定期升级安全补丁，尤其 React 与构建工具。

---

## 18. CI/CD

每个 PR：

```text
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm puzzle validate --all
pnpm build
pnpm e2e
```

主分支额外：

- 生成验证报告；
- 构建静态站点；
- 上传 Playwright 报告和失败 trace；
- 部署预览；
- 发布仅允许验证签名匹配的关卡。

---

## 19. 技术实施顺序

1. domain：坐标、邻域、规则类型、目标棋盘校验；
2. schema：JSON 加载与基准样例；
3. 朴素 oracle：仅供小棋盘测试；
4. CSP 精确求解器；
5. 强制格与唯一危险布局；
6. 人类推理器前三个技巧；
7. 验证器与 CLI；
8. React UI shell；
9. Worker 集成；
10. 提示和开发者验证层；
11. 内容与 E2E；
12. 生成器实验。

不要先做完整关卡编辑器或美术资产。

---

## 20. 参考版本来源

技术基线在 2026-06-22 依据官方资料制定：

- Node.js Releases: https://nodejs.org/en/about/previous-releases
- React Versions: https://react.dev/versions
- React 19.2: https://react.dev/blog/2025/10/01/react-19-2
- Vite 8 announcement: https://vite.dev/blog/announcing-vite8
- TypeScript 6.0 release notes: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-6-0.html
- pnpm 11 announcement: https://pnpm.io/blog/releases/11.0
- Vitest guide: https://vitest.dev/guide/
- Playwright introduction/release notes: https://playwright.dev/docs/intro
- Zod 4: https://zod.dev/v4

实际初始化时使用上述主版本的最新稳定补丁，并将精确版本写入 lockfile；不要使用 RC、canary 或 `latest` 浮动版本进入 CI。
