# Phase 31 Rule Text Generation Contract

Status: Round 1 copy and text-generation contract.

## Principle

One structured rule expression produces one readable Chinese rule sentence.

Generated text is derived from rule logic. It is not independent copy that can
drift away from the rule object.

## Browser-Safe Ownership

The text generator should live in a browser-safe authoring layer, not in the
React component and not in Node-only CLI code.

Preferred package location:

- `packages/authoring/src/ruleText.ts`

Expected exports:

```ts
type GeneratedRuleText = {
  title: string
  flavor: string
  scopeDescription?: string
  warnings: readonly string[]
}

function generateRuleText(rule: RuleDefinition, context: RuleTextContext): GeneratedRuleText
```

`RuleTextContext` may include board, regions, anchors, allowed object kinds,
and locale. It must not include solver/proof outputs, target answer facts, or
player observations.

## Locale Contract

Phase 31 implements Simplified Chinese only.

The API should leave room for later templates:

```ts
type RuleTextLocale = 'zh-CN'
```

Do not hard-code copy in React components if it belongs to rule meaning.

## Object Terms

Current domain kinds and preferred Chinese terms:

| Kind | Generated term |
| --- | --- |
| `guest` | `访客` |
| `empty` | `没有访客` when used as a safe/guest-exclusion outcome |
| `bottle` | `酒瓶` |
| `bin` | `垃圾桶` |
| `mirror` | `镜子` |

Avoid treating `empty` as an object noun such as `空房` in player-facing rule
copy. If a rule counts `empty`, wording must make the semantic meaning clear.

## Scope Terms

Preferred wording:

| Scope | Generated phrase |
| --- | --- |
| `global` | `全场` |
| `orthogonal` | `上下左右邻格` |
| `adjacent` | `周围一圈` |
| row | `第 N 行` |
| column | `第 N 列` |
| region | the region title, plus explicit cells when the title is not enough |
| ray | direction phrase plus blocker phrase when present |

Highlight may visualize a scope, but the text must identify what the scope
means. A named region is acceptable only when the title itself is precise or the
sentence includes coordinates/cells.

## Forbidden Or Deprecated Visible Terms

Generated player/author-facing rule text must not use:

- `安全区`
- `空区`
- `空房`
- `侧翼`
- `锚点`
- `清扫点`
- `已确认清扫点`

If future theme wording replaces these terms, it needs a new documented user
approval before entering generated text.

## Comparator Terms

| Comparator | Wording |
| --- | --- |
| `eq` | `恰好` / `正好` |
| `neq` | `不是` |
| `gt` | `多于` |
| `gte` | `至少` |
| `lt` | `少于` |
| `lte` | `至多` |

Counts should use Arabic numerals for scanability, for example `恰好 1 个`.

## Family Templates

### `globalCount`

Template:

- `全场恰好有 3 个访客。`
- `全场没有访客。`

### `forEachCount`

Template:

- `每个酒瓶的上下左右邻格，恰好有 1 个垃圾桶。`
- `每个镜子的周围一圈，没有访客。`

### `regionCount`

Template:

- `A2、B2、C2 这 3 格，恰好有 1 个访客。`
- `北侧记录区（A2、B2、C2）恰好有 1 个访客。`

If the region title is abstract, generated text should include cells. The rule
must not depend on highlight to reveal membership.

### `scopeOverlapCount`

Template:

- `左侧记录区与右侧记录区的交集里，恰好有 1 个访客。`
- If the overlap is not obvious from names, append explicit cells.

### `comparativeCount`

Template:

- `左侧记录区里的访客数，比右侧记录区多 1。`
- `A 组里的访客数，与 B 组相同。`

### `conditionalCount`

Template:

- `如果 A 区恰好有 1 个访客，那么 B 区没有访客。`

The text must clearly separate condition and consequence.

## Copy Quality Tests

Tests should cover:

- every editable MVP family;
- each comparator family;
- local scopes `orthogonal` and `adjacent`;
- region text with explicit cells;
- forbidden term scan;
- import/export round trip preserving generated text;
- unsupported family read-only text or reason.

## Non-Goals

- Do not generate narrative flavor from solver/proof data.
- Do not generate hints.
- Do not calibrate difficulty.
- Do not rewrite shipped case copy unless separately justified.
