import {
  DEFAULT_OBJECT_TYPE_REGISTRY,
  formatCellId,
  type BoardSize,
  type CellId,
  type CellKind,
  type Comparator,
  type Direction,
  type ObjectTypeRegistry,
  type RuleDefinition,
} from '@room-axioms/domain'

export type RuleExpressionSelector =
  | { readonly kind: 'target' }
  | { readonly kind: 'empty' }
  | { readonly kind: 'object'; readonly objectTypeId: string }
  | { readonly kind: 'anyObject' }
  | { readonly kind: 'objectGroup'; readonly objectTypeIds: readonly string[]; readonly label: string }

export type RuleExpressionLocalRelation =
  | 'orthogonal'
  | 'surrounding'
  | 'north'
  | 'south'
  | 'east'
  | 'west'

export type RuleExpressionScope =
  | { readonly kind: 'global' }
  | { readonly kind: 'local'; readonly relation: RuleExpressionLocalRelation }
  | { readonly kind: 'row'; readonly index: number }
  | { readonly kind: 'column'; readonly index: number }
  | { readonly kind: 'corners'; readonly regionId?: string }
  | { readonly kind: 'edge'; readonly regionId?: string }
  | { readonly kind: 'interior'; readonly regionId?: string }
  | { readonly kind: 'region'; readonly regionId: string; readonly title?: string }
  | {
      readonly kind: 'lineOfSight'
      readonly origin?: CellId
      readonly direction: Direction
      readonly stopAtKinds?: readonly CellKind[]
    }

export type RuleExpressionPredicate =
  | { readonly kind: 'exists' }
  | { readonly kind: 'none' }
  | { readonly kind: 'exactly'; readonly value: number }
  | { readonly kind: 'atLeast'; readonly value: number }
  | { readonly kind: 'atMost'; readonly value: number }
  | { readonly kind: 'all' }

export interface RuleExpression {
  readonly id: string
  readonly subject?: RuleExpressionSelector
  readonly scope: RuleExpressionScope
  readonly target: RuleExpressionSelector
  readonly predicate: RuleExpressionPredicate
}

export interface RuleExpressionGeneratedText {
  readonly title: string
  readonly flavor: string
}

export type RuleExpressionCompileBlockCode =
  | 'selector-not-legacy-compatible'
  | 'subject-required'
  | 'directional-local-scope-unsupported'
  | 'all-predicate-needs-fixed-scope'
  | 'generated-region-required'
  | 'line-of-sight-origin-required'

export interface RuleExpressionSyntheticRegion {
  readonly id: string
  readonly title: string
  readonly cells: readonly CellId[]
}

export type RuleExpressionCompileResult =
  | {
      readonly status: 'compiled'
      readonly rule: RuleDefinition
      readonly generatedText: RuleExpressionGeneratedText
      readonly proofSupport: 'existing-dsl' | 'requires-authoring-report'
    }
  | {
      readonly status: 'blocked'
      readonly code: RuleExpressionCompileBlockCode
      readonly message: string
      readonly generatedText: RuleExpressionGeneratedText
      readonly syntheticRegion?: RuleExpressionSyntheticRegion
    }

export interface RuleExpressionCompileContext {
  readonly board?: BoardSize
  readonly objectRegistry?: ObjectTypeRegistry
}

export function generateRuleExpressionText(
  expression: RuleExpression,
  context: RuleExpressionCompileContext = {},
): RuleExpressionGeneratedText {
  const target = selectorPhrase(expression.target, context)
  const predicate = predicatePhrase(expression.predicate, target)

  if (expression.scope.kind === 'local') {
    const subject = expression.subject ? selectorPhrase(expression.subject, context) : '指定对象'
    const scope = localRelationPhrase(expression.scope.relation)
    return {
      title: `每个${subject}的${scope}${predicate}`,
      flavor: `每个${subject}的${scope}，${predicate}。`,
    }
  }

  if (expression.scope.kind === 'lineOfSight') {
    const scope = lineOfSightPhrase(expression.scope)
    return {
      title: `${scope}${predicate}`,
      flavor: `${scope}，${predicate}。`,
    }
  }

  const scope = scopePhrase(expression.scope, context)
  return {
    title: `${scope}${predicate}`,
    flavor: `${scope}，${predicate}。`,
  }
}

export function compileRuleExpression(
  expression: RuleExpression,
  context: RuleExpressionCompileContext = {},
): RuleExpressionCompileResult {
  const generatedText = generateRuleExpressionText(expression, context)
  const target = selectorToLegacyKind(expression.target, context.objectRegistry)
  if (!target) {
    return blocked('selector-not-legacy-compatible', 'This target selector cannot compile to Puzzle Schema v1 yet.', generatedText)
  }

  const count = predicateToComparator(expression.predicate)
  if (!count) {
    return blocked(
      'all-predicate-needs-fixed-scope',
      'The all-cells predicate needs a fixed scope expansion before it can compile safely.',
      generatedText,
    )
  }

  switch (expression.scope.kind) {
    case 'global':
      return compiled({
        id: expression.id,
        type: 'globalCount',
        target,
        count,
        presentation: generatedText,
      }, generatedText)
    case 'row':
    case 'column':
      return compiled({
        id: expression.id,
        type: 'lineCount',
        scope: { kind: expression.scope.kind, index: expression.scope.index },
        target,
        count,
        presentation: generatedText,
      }, generatedText, 'requires-authoring-report')
    case 'region':
      return compiled({
        id: expression.id,
        type: 'regionCount',
        regionId: expression.scope.regionId,
        target,
        count,
        presentation: generatedText,
      }, generatedText)
    case 'local': {
      if (expression.scope.relation !== 'orthogonal' && expression.scope.relation !== 'surrounding') {
        return blocked(
          'directional-local-scope-unsupported',
          'Directional single-neighbor local scopes need a narrow DSL extension before promotion.',
          generatedText,
        )
      }
      if (!expression.subject) {
        return blocked('subject-required', 'Local per-object rules need a subject selector.', generatedText)
      }
      const subject = selectorToLegacyKind(expression.subject, context.objectRegistry)
      if (!subject) {
        return blocked('selector-not-legacy-compatible', 'This subject selector cannot compile to Puzzle Schema v1 yet.', generatedText)
      }
      return compiled({
        id: expression.id,
        type: 'forEachCount',
        subject,
        scope: { kind: expression.scope.relation === 'orthogonal' ? 'orthogonal' : 'adjacent' },
        target,
        count,
        presentation: generatedText,
      }, generatedText)
    }
    case 'lineOfSight':
      if (!expression.scope.origin) {
        return blocked(
          'line-of-sight-origin-required',
          'Current DSL line-of-sight compilation needs a concrete origin cell.',
          generatedText,
        )
      }
      return compiled({
        id: expression.id,
        type: 'lineCount',
        origin: expression.scope.origin,
        scope: {
          kind: 'ray',
          direction: expression.scope.direction,
          stopAtKinds: expression.scope.stopAtKinds,
        },
        target,
        count,
        presentation: generatedText,
      }, generatedText, 'requires-authoring-report')
    case 'corners':
    case 'edge':
    case 'interior': {
      const syntheticRegion = syntheticRegionForScope(expression.scope, context.board)
      if (expression.scope.regionId) {
        return compiled({
          id: expression.id,
          type: 'regionCount',
          regionId: expression.scope.regionId,
          target,
          count,
          presentation: generatedText,
        }, generatedText)
      }
      return blocked(
        'generated-region-required',
        'This positional scope must be materialized as an explicit generated region before compiling to Puzzle Schema v1.',
        generatedText,
        syntheticRegion,
      )
    }
  }
}

function compiled(
  rule: RuleDefinition,
  generatedText: RuleExpressionGeneratedText,
  proofSupport: 'existing-dsl' | 'requires-authoring-report' = 'existing-dsl',
): RuleExpressionCompileResult {
  return {
    status: 'compiled',
    rule,
    generatedText,
    proofSupport,
  }
}

function blocked(
  code: RuleExpressionCompileBlockCode,
  message: string,
  generatedText: RuleExpressionGeneratedText,
  syntheticRegion?: RuleExpressionSyntheticRegion,
): RuleExpressionCompileResult {
  return { status: 'blocked', code, message, generatedText, syntheticRegion }
}

function selectorToLegacyKind(
  selector: RuleExpressionSelector,
  registry: ObjectTypeRegistry = DEFAULT_OBJECT_TYPE_REGISTRY,
): CellKind | undefined {
  switch (selector.kind) {
    case 'target':
      return 'guest'
    case 'empty':
      return 'empty'
    case 'object':
      return registry.objectTypes.find((objectType) => objectType.id === selector.objectTypeId)?.legacyKind
    case 'anyObject':
    case 'objectGroup':
      return undefined
  }
}

function predicateToComparator(predicate: RuleExpressionPredicate): Comparator | undefined {
  switch (predicate.kind) {
    case 'exists':
      return { op: 'gte', value: 1 }
    case 'none':
      return { op: 'eq', value: 0 }
    case 'exactly':
      return { op: 'eq', value: predicate.value }
    case 'atLeast':
      return { op: 'gte', value: predicate.value }
    case 'atMost':
      return { op: 'lte', value: predicate.value }
    case 'all':
      return undefined
  }
}

function selectorPhrase(
  selector: RuleExpressionSelector,
  context: RuleExpressionCompileContext,
): string {
  switch (selector.kind) {
    case 'target':
      return '异常区域'
    case 'empty':
      return '没有异常也没有物件的格子'
    case 'object': {
      const registry = context.objectRegistry ?? DEFAULT_OBJECT_TYPE_REGISTRY
      const objectType = registry.objectTypes.find((candidate) => candidate.id === selector.objectTypeId)
      return objectType?.label.zhHans ?? selector.objectTypeId
    }
    case 'anyObject':
      return '任意物件'
    case 'objectGroup':
      return selector.label
  }
}

function predicatePhrase(predicate: RuleExpressionPredicate, targetPhrase: string): string {
  switch (predicate.kind) {
    case 'exists':
      return `至少有 1 个${targetPhrase}`
    case 'none':
      return `没有${targetPhrase}`
    case 'exactly':
      return `恰好有 ${predicate.value} 个${targetPhrase}`
    case 'atLeast':
      return `至少有 ${predicate.value} 个${targetPhrase}`
    case 'atMost':
      return `至多有 ${predicate.value} 个${targetPhrase}`
    case 'all':
      return `全部都是${targetPhrase}`
  }
}

function scopePhrase(
  scope: Exclude<RuleExpressionScope, { readonly kind: 'local' } | { readonly kind: 'lineOfSight' }>,
  context: RuleExpressionCompileContext,
): string {
  switch (scope.kind) {
    case 'global':
      return '全场'
    case 'row':
      return `第 ${scope.index + 1} 行`
    case 'column':
      return `第 ${scope.index + 1} 列`
    case 'corners':
      return cellListScopePhrase('四个角', syntheticRegionForScope(scope, context.board)?.cells)
    case 'edge':
      return cellListScopePhrase('外圈边缘格', syntheticRegionForScope(scope, context.board)?.cells)
    case 'interior':
      return cellListScopePhrase('内侧格', syntheticRegionForScope(scope, context.board)?.cells)
    case 'region':
      return scope.title ?? `区域 ${scope.regionId}`
  }
}

function localRelationPhrase(relation: RuleExpressionLocalRelation): string {
  switch (relation) {
    case 'orthogonal':
      return '上下左右邻格'
    case 'surrounding':
      return '周围一圈'
    case 'north':
      return '上方一格'
    case 'south':
      return '下方一格'
    case 'east':
      return '右方一格'
    case 'west':
      return '左方一格'
  }
}

function lineOfSightPhrase(scope: Extract<RuleExpressionScope, { readonly kind: 'lineOfSight' }>): string {
  return `${scope.origin ?? '指定格'}向${directionPhrase(scope.direction)}的视线格`
}

function directionPhrase(direction: Direction): string {
  switch (direction) {
    case 'north':
      return '上'
    case 'south':
      return '下'
    case 'east':
      return '右'
    case 'west':
      return '左'
  }
}

function cellListScopePhrase(title: string, cells: readonly CellId[] | undefined): string {
  if (!cells || cells.length === 0) return title
  return `${title}（${cells.join('、')}）`
}

function syntheticRegionForScope(
  scope: Extract<RuleExpressionScope, { readonly kind: 'corners' | 'edge' | 'interior' }>,
  board: BoardSize | undefined,
): RuleExpressionSyntheticRegion | undefined {
  if (!board) return undefined

  switch (scope.kind) {
    case 'corners':
      return {
        id: scope.regionId ?? 'generated-corners',
        title: '四个角',
        cells: cornerCells(board),
      }
    case 'edge':
      return {
        id: scope.regionId ?? 'generated-edge',
        title: '外圈边缘格',
        cells: edgeCells(board),
      }
    case 'interior':
      return {
        id: scope.regionId ?? 'generated-interior',
        title: '内侧格',
        cells: interiorCells(board),
      }
  }
}

function cornerCells(board: BoardSize): readonly CellId[] {
  return [
    formatCellId({ x: 0, y: 0 }, board),
    formatCellId({ x: board.width - 1, y: 0 }, board),
    formatCellId({ x: 0, y: board.height - 1 }, board),
    formatCellId({ x: board.width - 1, y: board.height - 1 }, board),
  ]
}

function edgeCells(board: BoardSize): readonly CellId[] {
  const cells: CellId[] = []
  for (let y = 0; y < board.height; y += 1) {
    for (let x = 0; x < board.width; x += 1) {
      if (x === 0 || y === 0 || x === board.width - 1 || y === board.height - 1) {
        cells.push(formatCellId({ x, y }, board))
      }
    }
  }
  return cells
}

function interiorCells(board: BoardSize): readonly CellId[] {
  const cells: CellId[] = []
  for (let y = 1; y < board.height - 1; y += 1) {
    for (let x = 1; x < board.width - 1; x += 1) {
      cells.push(formatCellId({ x, y }, board))
    }
  }
  return cells
}
