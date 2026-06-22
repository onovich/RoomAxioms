# 《房间公理》规则 DSL 与关卡格式规范

**Schema 版本：** 1  
**状态：** MVP 实施基线

---

## 1. 设计原则

1. 数据可验证、可迁移、可序列化；
2. 同一规则由 UI、求解器、证明器共同解释；
3. 不嵌入 JavaScript、正则脚本或自然语言表达式；
4. 规则语义与显示文案分离；
5. 新规则类型通过联合类型扩展，并触发编译期穷尽检查；
6. 坐标和邻域边界严格确定。

---

## 2. 完整关卡示例

```json
{
  "schemaVersion": 1,
  "id": "case-004",
  "title": "客房 04：清扫记录",
  "board": { "width": 4, "height": 4 },
  "allowedKinds": ["empty", "bottle", "bin", "mirror", "guest"],
  "rules": [
    {
      "id": "R1",
      "type": "globalCount",
      "target": "bin",
      "count": { "op": "eq", "value": 1 },
      "presentation": {
        "title": "清扫容器",
        "flavor": "本客房只配备一个清扫容器。"
      }
    },
    {
      "id": "R2",
      "type": "globalCount",
      "target": "guest",
      "count": { "op": "eq", "value": 2 },
      "presentation": {
        "title": "未登记住客",
        "flavor": "本房间里有两位没有登记姓名的住客。"
      }
    },
    {
      "id": "R3",
      "type": "forEachCount",
      "subject": "bottle",
      "scope": { "kind": "orthogonal" },
      "target": "bin",
      "count": { "op": "eq", "value": 1 },
      "presentation": {
        "title": "酒瓶清扫",
        "flavor": "每只空酒瓶都应能交给唯一的清扫容器。"
      }
    },
    {
      "id": "R4",
      "type": "forEachCount",
      "subject": "bin",
      "scope": { "kind": "adjacent" },
      "target": "guest",
      "count": { "op": "eq", "value": 0 },
      "presentation": {
        "title": "清扫安全区",
        "flavor": "清扫容器附近不应有会呼吸的东西。"
      }
    },
    {
      "id": "R5",
      "type": "forEachCount",
      "subject": "mirror",
      "scope": { "kind": "adjacent" },
      "target": "guest",
      "count": { "op": "eq", "value": 1 },
      "presentation": {
        "title": "镜面登记",
        "flavor": "每面镜子只应照见一位未登记住客。"
      }
    },
    {
      "id": "R6",
      "type": "forEachCount",
      "subject": "bottle",
      "scope": { "kind": "orthogonal" },
      "target": "guest",
      "count": { "op": "eq", "value": 0 },
      "presentation": {
        "title": "酒瓶禁区",
        "flavor": "未登记住客不会替你收走空酒瓶。"
      }
    }
  ],
  "initialReveals": ["B1", "A2", "C2"],
  "target": {
    "A1": "empty", "B1": "bottle", "C1": "mirror", "D1": "guest",
    "A2": "bottle", "B2": "bin", "C2": "bottle", "D2": "empty",
    "A3": "mirror", "B3": "empty", "C3": "mirror", "D3": "empty",
    "A4": "empty", "B4": "guest", "C4": "empty", "D4": "empty"
  },
  "metadata": {
    "difficulty": 2,
    "tags": ["intersection", "local-count", "tutorial-candidate"],
    "author": "internal",
    "status": "draft"
  }
}
```

---

## 3. 顶层字段

| 字段 | 类型 | 必填 | 约束 |
|---|---|---:|---|
| `schemaVersion` | integer | 是 | 当前必须为 1 |
| `id` | string | 是 | `^[a-z0-9][a-z0-9-]{2,63}$`，全库唯一 |
| `title` | string | 是 | 1-80 字符 |
| `board` | object | 是 | MVP 宽高 3-5；正式目标 4-5 |
| `allowedKinds` | array | 是 | 去重，必须含 `empty` 和 `guest` |
| `rules` | array | 是 | id 唯一，至少一条 guest 相关规则 |
| `initialReveals` | array | 是 | 坐标有效、去重、目标不得为 guest |
| `target` | object | 是 | 覆盖每个格子且无额外坐标 |
| `metadata` | object | 是 | 难度、标签、作者、状态 |

---

## 4. 格子类型

```ts
type CellKind = 'empty' | 'bottle' | 'bin' | 'mirror' | 'guest';
```

语义：

- `guest` 是唯一危险类型；
- 其他类型均可调查；
- `empty` 是真实类型，不代表未知；
- 未知是知识状态，不属于 `CellKind`。

未来新增类型必须声明是否危险、图标、名称和可作为规则主体/目标的能力。MVP 不支持每关自定义类型。

---

## 5. 坐标

### 5.1 格式

```text
<ColumnLetter><RowNumber>
```

- 列从 A 开始；
- 行从 1 开始；
- MVP 最大 5×5，仍应实现多字母列解析以便扩展；
- 输入可规范化大小写，但序列化统一大写。

### 5.2 稳定顺序

所有坐标列表序列化时按行优先：先 y，再 x。4×4 为：

```text
A1, B1, C1, D1, A2, B2, ... D4
```

---

## 6. 数量比较器

```ts
type Comparator =
  | { op: 'eq'; value: number }
  | { op: 'gte'; value: number }
  | { op: 'lte'; value: number };
```

约束：

- value 为非负整数；
- `eq 0` 的 UI 标准文案使用“没有”；
- 对局部 scope，value 不得大于该 scope 在任何主体位置的理论最大值，除非规则意图使某些主体位置不可能；静态校验可警告而非一律拒绝；
- MVP 内容优先使用 `eq`，`gte/lte` 仅在通过可解释性测试后启用。

---

## 7. Scope

### 7.1 `orthogonal`

对主体格 c，返回共享边且位于棋盘内的格子。

### 7.2 `adjacent`

对主体格 c，返回共享边或角且位于棋盘内的格子。

### 7.3 不包含主体自身

两种 scope 均不包含 c。

### 7.4 边界语义

棋盘外没有格子，不参与计数，不被视为空地，也不构成虚拟安全位。

未来 scope 扩展使用 discriminated union，不允许以字符串表达式临时解析。

---

## 8. `globalCount`

```json
{
  "id": "R2",
  "type": "globalCount",
  "target": "guest",
  "count": { "op": "eq", "value": 2 },
  "presentation": { "title": "...", "flavor": "..." }
}
```

形式语义：

```text
compare(|{ c ∈ Board : kind(c) = target }|, count)
```

MVP 每个关卡必须有 `guest eq N`，N ≥ 1。建议关键 clue 类型也有明确全局数量，或至少有初始可见实例。

---

## 9. `forEachCount`

```json
{
  "id": "R5",
  "type": "forEachCount",
  "subject": "mirror",
  "scope": { "kind": "adjacent" },
  "target": "guest",
  "count": { "op": "eq", "value": 1 },
  "presentation": { "title": "...", "flavor": "..." }
}
```

形式语义：

```text
∀ c ∈ Board,
  kind(c) = subject
  ⇒ compare(|{ n ∈ scope(c) : kind(n) = target }|, count)
```

这是单向蕴含：

- 每面镜子约束附近访客；
- 不推出每名访客附近必有镜子；
- 不推出镜子数量等于访客数量；
- 多面镜子可以被同一名访客同时满足。

UI 必须用主体到目标的方向表示。

---

## 10. Presentation

```ts
interface RulePresentation {
  title: string;
  flavor?: string;
}
```

机械标准句由程序根据规则结构生成，不由内容作者手写。例如：

```text
每面镜子的邻接域中，恰好有 1 名访客。
```

原因：避免风味文案与实际 DSL 漂移。`flavor` 只作氛围，不得添加条件或例外。

未来多语言通过 key + localization table，不在规则里复制多语言机械句。

---

## 11. Metadata

```ts
interface PuzzleMetadata {
  difficulty: 1 | 2 | 3 | 4 | 5;
  tags: string[];
  author: string;
  status: 'draft' | 'validated' | 'published' | 'deprecated';
  notes?: string;
}
```

`difficulty` 在验证后可被工具建议值覆盖，但人工可在有限范围内调整。发布内容额外生成 validation block，不由作者手写。

---

## 12. 运行时公共格式

玩家端不需要 target。构建时生成：

```ts
interface PublicPuzzle {
  schemaVersion: 1;
  id: string;
  title: string;
  board: BoardSize;
  allowedKinds: CellKind[];
  rules: RuleDefinition[];
  initialObservations: Observation[];
  metadata: PublicMetadata;
}
```

其中 `initialObservations` 由 `initialReveals + target` 在构建时生成。玩家端无需知道 initial reveal 坐标之外的 target。

---

## 13. 验证规则

### 13.1 Schema 级

- 类型、必填字段、范围、模式；
- 未知字段默认拒绝；
- 数组去重；
- rule id 唯一。

### 13.2 静态语义级

- 所有坐标在棋盘内；
- target 完整覆盖；
- initial reveal 不是 guest；
- 规则引用类型在 allowedKinds；
- guest 总量规则存在且目标一致；
- presentation 不为空。

### 13.3 模型级

- target 满足全部规则；
- 初始 observations 与 target 一致；
- 至少一个模型；
- 无猜测；
- 最终 guest 布局唯一；
- 人类可解释。

### 13.4 警告级

- 某规则在所有目标主体上都不产生信息；
- 某主体类型目标中数量为 0，使规则真空成立；
- 初始揭示冗余；
- 无信息安全格过多；
- 规则重复或被其他规则蕴含；
- 证明只依赖总量，局部规则未使用。

---

## 14. Validation Report 格式

```json
{
  "puzzleId": "case-004",
  "contentHash": "sha256:...",
  "validatorVersion": "0.1.0",
  "passed": true,
  "checks": {
    "schema": true,
    "targetSatisfiesRules": true,
    "initialSatisfiable": true,
    "noGuess": true,
    "humanExplainable": true,
    "guestLayoutUnique": true
  },
  "metrics": {
    "initialCandidateGuestLayouts": 15,
    "waves": 4,
    "maxProofNodes": 7,
    "uninformativeRevealRatio": 0.25
  },
  "issues": [],
  "proofWaves": []
}
```

报告属于生成物，不回写作者源 JSON。

---

## 15. Schema 版本策略

- 主版本字段以整数递增；
- 读取器只接受已知版本；
- 迁移链必须逐版本执行；
- 规则语义改变必须升级 schemaVersion，不能只改解释器；
- 已发布关卡保存 contentHash 与 validatorVersion；
- 迁移后必须重新运行完整验证。

---

## 16. 未来扩展示例（非 MVP）

以下仅预留方向，不在 v1 实现：

```ts
interface LineCountRule {
  type: 'lineCount';
  axis: 'row' | 'column';
  subject?: CellKind;
  target: CellKind;
  count: Comparator;
}

interface DistanceCountRule {
  type: 'distanceCount';
  subject: CellKind;
  metric: 'manhattan';
  distance: number;
  target: CellKind;
  count: Comparator;
}
```

每个新增类型必须同步更新：Schema、rule-engine、exact solver、human reasoner、机械文案、邻域 UI、测试和迁移。
