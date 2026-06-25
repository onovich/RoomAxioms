import {
  allCells,
  formatCellId,
  parseCellId,
  type BoardSize,
  type CellId,
  type CellKind,
  type PuzzleDefinition,
  type RuleDefinition,
} from '@room-axioms/domain'
import { z } from 'zod'
import { puzzleDefinitionSchema } from './puzzleSchema.js'

export interface SchemaIssue {
  readonly code: string
  readonly path: readonly (string | number)[]
  readonly message: string
  readonly context?: Readonly<Record<string, unknown>>
}

export interface ParsePuzzleResult {
  readonly ok: boolean
  readonly puzzle?: PuzzleDefinition
  readonly issues: readonly SchemaIssue[]
}

export class PuzzleSchemaError extends Error {
  readonly issues: readonly SchemaIssue[]

  constructor(issues: readonly SchemaIssue[]) {
    super(formatSchemaIssues(issues).join('\n'))
    this.name = 'PuzzleSchemaError'
    this.issues = issues
  }
}

type ZodIssue = z.ZodError['issues'][number]

export function parsePuzzleDefinition(input: unknown): ParsePuzzleResult {
  const parsed = puzzleDefinitionSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, issues: sortIssues(parsed.error.issues.map(zodIssueToSchemaIssue)) }
  }

  const puzzle = parsed.data as PuzzleDefinition
  const issues = validatePuzzleSemantics(puzzle)
  if (issues.length > 0) return { ok: false, issues }

  return { ok: true, puzzle, issues: [] }
}

export function assertPuzzleDefinition(input: unknown): PuzzleDefinition {
  const result = parsePuzzleDefinition(input)
  if (result.ok && result.puzzle) return result.puzzle

  throw new PuzzleSchemaError(result.issues)
}

export function formatSchemaIssues(issues: readonly SchemaIssue[]): readonly string[] {
  return issues.map((issue) => {
    const context = issue.context ? ` ${formatContext(issue.context)}` : ''
    return `${issue.code} at ${formatPath(issue.path)}: ${issue.message}${context}`
  })
}

function validatePuzzleSemantics(puzzle: PuzzleDefinition): readonly SchemaIssue[] {
  const issues: SchemaIssue[] = []
  const expectedCells = allCells(puzzle.board)
  const expectedCellSet = new Set<CellId>(expectedCells)
  const targetKeys = Object.keys(puzzle.target)

  for (const cellId of expectedCells) {
    if (!(cellId in puzzle.target)) {
      issues.push(
        createIssue('TARGET_MISSING_CELL', ['target', cellId], `Target is missing cell ${cellId}`, {
          cellId,
        }),
      )
    }
  }

  for (const cellId of sortCellLikeIds(targetKeys, puzzle.board)) {
    if (!isCellIdInside(cellId, puzzle.board) || !expectedCellSet.has(canonicalCellId(cellId, puzzle.board))) {
      issues.push(
        createIssue('TARGET_EXTRA_CELL', ['target', cellId], `Target contains extra cell ${cellId}`, {
          cellId,
        }),
      )
    }
  }

  issues.push(...validateInitialReveals(puzzle))
  issues.push(...validateRegions(puzzle))
  issues.push(...validateAnchors(puzzle))
  issues.push(...validateRules(puzzle))

  return sortIssues(issues)
}

function validateInitialReveals(puzzle: PuzzleDefinition): readonly SchemaIssue[] {
  const issues: SchemaIssue[] = []
  const seen = new Map<CellId, number>()

  puzzle.initialReveals.forEach((cellId, index) => {
    const canonical = tryCanonicalCellId(cellId, puzzle.board)
    if (!canonical) {
      issues.push(
        createIssue(
          'INITIAL_REVEAL_OUT_OF_BOARD',
          ['initialReveals', index],
          `Initial reveal ${cellId} is outside the board`,
          { cellId },
        ),
      )
      return
    }

    const firstIndex = seen.get(canonical)
    if (firstIndex !== undefined) {
      issues.push(
        createIssue(
          'INITIAL_REVEAL_DUPLICATE',
          ['initialReveals', index],
          `Initial reveal ${canonical} is duplicated`,
          { cellId: canonical, firstIndex },
        ),
      )
    } else {
      seen.set(canonical, index)
    }

    if (puzzle.target[canonical] === 'guest') {
      issues.push(
        createIssue(
          'INITIAL_REVEAL_GUEST',
          ['initialReveals', index],
          `Initial reveal ${canonical} cannot reveal a guest`,
          { cellId: canonical },
        ),
      )
    }
  })

  return issues
}

function validateRegions(puzzle: PuzzleDefinition): readonly SchemaIssue[] {
  const issues: SchemaIssue[] = []
  const seenRegionIds = new Map<string, number>()

  puzzle.regions?.forEach((region, regionIndex) => {
    const firstRegionIndex = seenRegionIds.get(region.id)
    if (firstRegionIndex !== undefined) {
      issues.push(
        createIssue(
          'REGION_ID_DUPLICATE',
          ['regions', regionIndex, 'id'],
          `Region id ${region.id} is duplicated`,
          { regionId: region.id, firstIndex: firstRegionIndex },
        ),
      )
    } else {
      seenRegionIds.set(region.id, regionIndex)
    }

    const seenCells = new Map<CellId, number>()
    region.cells.forEach((cellId, cellIndex) => {
      const canonical = tryCanonicalCellId(cellId, puzzle.board)
      if (!canonical) {
        issues.push(
          createIssue(
            'REGION_CELL_OUT_OF_BOARD',
            ['regions', regionIndex, 'cells', cellIndex],
            `Region ${region.id} contains cell ${cellId} outside the board`,
            { regionId: region.id, cellId },
          ),
        )
        return
      }

      const firstCellIndex = seenCells.get(canonical)
      if (firstCellIndex !== undefined) {
        issues.push(
          createIssue(
            'REGION_CELL_DUPLICATE',
            ['regions', regionIndex, 'cells', cellIndex],
            `Region ${region.id} duplicates cell ${canonical}`,
            { regionId: region.id, cellId: canonical, firstIndex: firstCellIndex },
          ),
        )
      } else {
        seenCells.set(canonical, cellIndex)
      }
    })
  })

  return issues
}

function validateAnchors(puzzle: PuzzleDefinition): readonly SchemaIssue[] {
  const issues: SchemaIssue[] = []
  const allowedKinds = new Set<CellKind>(puzzle.allowedKinds)
  const seenAnchorIds = new Map<string, number>()

  puzzle.anchors?.forEach((anchor, anchorIndex) => {
    const firstIndex = seenAnchorIds.get(anchor.id)
    if (firstIndex !== undefined) {
      issues.push(
        createIssue(
          'ANCHOR_ID_DUPLICATE',
          ['anchors', anchorIndex, 'id'],
          `Anchor id ${anchor.id} is duplicated`,
          { anchorId: anchor.id, firstIndex },
        ),
      )
    } else {
      seenAnchorIds.set(anchor.id, anchorIndex)
    }

    if (!allowedKinds.has(anchor.subject)) {
      issues.push(
        createIssue(
          'ANCHOR_KIND_NOT_ALLOWED',
          ['anchors', anchorIndex, 'subject'],
          `Anchor ${anchor.id} references subject kind ${anchor.subject} outside allowedKinds`,
          { anchorId: anchor.id, kind: anchor.subject },
        ),
      )
    }
  })

  return issues
}

function validateRules(puzzle: PuzzleDefinition): readonly SchemaIssue[] {
  const issues: SchemaIssue[] = []
  const allowedKinds = new Set<CellKind>(puzzle.allowedKinds)
  const regionIds = new Set((puzzle.regions ?? []).map((region) => region.id))
  const anchorIds = new Set((puzzle.anchors ?? []).map((anchor) => anchor.id))
  const seenRuleIds = new Map<string, number>()
  let hasGuestRule = false

  puzzle.rules.forEach((rule, index) => {
    const firstIndex = seenRuleIds.get(rule.id)
    if (firstIndex !== undefined) {
      issues.push(
        createIssue('RULE_ID_DUPLICATE', ['rules', index, 'id'], `Rule id ${rule.id} is duplicated`, {
          ruleId: rule.id,
          firstIndex,
        }),
      )
    } else {
      seenRuleIds.set(rule.id, index)
    }

    if (rule.target === 'guest' || (rule.type === 'forEachCount' && rule.subject === 'guest')) {
      hasGuestRule = true
    }

    issues.push(...validateRuleKindReferences(rule, index, allowedKinds))
    issues.push(...validateRuleRegionReferences(rule, index, regionIds))
    issues.push(...validateRuleAnchorReferences(rule, index, anchorIds))
    issues.push(...validateRuleLineReferences(rule, index, puzzle))
  })

  if (!hasGuestRule) {
    issues.push(
      createIssue('GUEST_RULE_MISSING', ['rules'], 'At least one rule must reference guest', {
        requiredKind: 'guest',
      }),
    )
  }

  return issues
}

function validateRuleKindReferences(
  rule: RuleDefinition,
  index: number,
  allowedKinds: ReadonlySet<CellKind>,
): readonly SchemaIssue[] {
  const issues: SchemaIssue[] = []

  if (!allowedKinds.has(rule.target)) {
    issues.push(
      createIssue(
        'RULE_KIND_NOT_ALLOWED',
        ['rules', index, 'target'],
        `Rule ${rule.id} references target kind ${rule.target} outside allowedKinds`,
        { ruleId: rule.id, kind: rule.target },
      ),
    )
  }

  if (rule.type === 'forEachCount' && !allowedKinds.has(rule.subject)) {
    issues.push(
      createIssue(
        'RULE_KIND_NOT_ALLOWED',
        ['rules', index, 'subject'],
        `Rule ${rule.id} references subject kind ${rule.subject} outside allowedKinds`,
        { ruleId: rule.id, kind: rule.subject },
      ),
    )
  }

  if (rule.type === 'lineCount' && rule.scope.kind === 'ray') {
    rule.scope.stopAtKinds?.forEach((kind, blockerIndex) => {
      if (allowedKinds.has(kind)) return

      issues.push(
        createIssue(
          'RULE_KIND_NOT_ALLOWED',
          ['rules', index, 'scope', 'stopAtKinds', blockerIndex],
          `Rule ${rule.id} references blocker kind ${kind} outside allowedKinds`,
          { ruleId: rule.id, kind },
        ),
      )
    })
  }

  return issues
}

function validateRuleRegionReferences(
  rule: RuleDefinition,
  index: number,
  regionIds: ReadonlySet<string>,
): readonly SchemaIssue[] {
  if (rule.type !== 'regionCount' || regionIds.has(rule.regionId)) return []

  return [
    createIssue(
      'RULE_REGION_UNKNOWN',
      ['rules', index, 'regionId'],
      `Rule ${rule.id} references unknown region ${rule.regionId}`,
      { ruleId: rule.id, regionId: rule.regionId },
    ),
  ]
}

function validateRuleAnchorReferences(
  rule: RuleDefinition,
  index: number,
  anchorIds: ReadonlySet<string>,
): readonly SchemaIssue[] {
  if (rule.type !== 'anchorCount' || anchorIds.has(rule.anchorId)) return []

  return [
    createIssue(
      'RULE_ANCHOR_UNKNOWN',
      ['rules', index, 'anchorId'],
      `Rule ${rule.id} references unknown anchor ${rule.anchorId}`,
      { ruleId: rule.id, anchorId: rule.anchorId },
    ),
  ]
}

function validateRuleLineReferences(
  rule: RuleDefinition,
  index: number,
  puzzle: PuzzleDefinition,
): readonly SchemaIssue[] {
  if (rule.type !== 'lineCount') return []

  if (rule.scope.kind === 'row' && rule.scope.index >= puzzle.board.height) {
    return [
      createIssue(
        'LINE_SCOPE_OUT_OF_BOARD',
        ['rules', index, 'scope', 'index'],
        `Rule ${rule.id} references row ${rule.scope.index} outside the board`,
        { ruleId: rule.id, index: rule.scope.index },
      ),
    ]
  }

  if (rule.scope.kind === 'column' && rule.scope.index >= puzzle.board.width) {
    return [
      createIssue(
        'LINE_SCOPE_OUT_OF_BOARD',
        ['rules', index, 'scope', 'index'],
        `Rule ${rule.id} references column ${rule.scope.index} outside the board`,
        { ruleId: rule.id, index: rule.scope.index },
      ),
    ]
  }

  if (rule.scope.kind !== 'ray') return []

  if (rule.origin === undefined) {
    return [
      createIssue(
        'LINE_RAY_ORIGIN_MISSING',
        ['rules', index, 'origin'],
        `Rule ${rule.id} must include origin for a ray scope`,
        { ruleId: rule.id },
      ),
    ]
  }

  if (!tryCanonicalCellId(rule.origin, puzzle.board)) {
    return [
      createIssue(
        'LINE_RAY_ORIGIN_OUT_OF_BOARD',
        ['rules', index, 'origin'],
        `Rule ${rule.id} references ray origin ${rule.origin} outside the board`,
        { ruleId: rule.id, cellId: rule.origin },
      ),
    ]
  }

  return []
}

function zodIssueToSchemaIssue(issue: ZodIssue): SchemaIssue {
  const path = normalizePath(issue.path)
  return createIssue(zodIssueCode(issue, path), path, issue.message, { zodCode: issue.code })
}

function zodIssueCode(issue: ZodIssue, path: readonly (string | number)[]): string {
  const pathText = path.join('.')

  if (pathText === 'schemaVersion') return 'SCHEMA_VERSION_UNSUPPORTED'
  if (pathText.endsWith('presentation.title')) return 'PRESENTATION_TITLE_EMPTY'
  if (pathText.endsWith('presentation.flavor')) return 'PRESENTATION_FLAVOR_EMPTY'
  if (pathText.includes('scope')) return 'SCOPE_INVALID'
  if (pathText.endsWith('count.op') || pathText.endsWith('count.value')) return 'COMPARATOR_INVALID'
  if (isCellKindPath(path)) return 'CELL_KIND_UNKNOWN'
  if (issue.code === 'unrecognized_keys') return 'SCHEMA_UNKNOWN_KEY'

  return 'SCHEMA_INVALID'
}

function isCellKindPath(path: readonly (string | number)[]): boolean {
  const last = path[path.length - 1]
  const previous = path[path.length - 2]

  return (
    previous === 'allowedKinds' ||
    previous === 'stopAtKinds' ||
    previous === 'target' ||
    last === 'target' ||
    last === 'subject'
  )
}

function createIssue(
  code: string,
  path: readonly (string | number)[],
  message: string,
  context?: Readonly<Record<string, unknown>>,
): SchemaIssue {
  return context ? { code, path, message, context } : { code, path, message }
}

function normalizePath(path: readonly PropertyKey[]): readonly (string | number)[] {
  return path.map((segment) => (typeof segment === 'symbol' ? segment.toString() : segment))
}

function tryCanonicalCellId(cellId: CellId, size: BoardSize): CellId | null {
  try {
    return canonicalCellId(cellId, size)
  } catch {
    return null
  }
}

function canonicalCellId(cellId: CellId, size: BoardSize): CellId {
  return formatCellId(parseCellId(cellId, size), size)
}

function isCellIdInside(cellId: CellId, size: BoardSize): boolean {
  return tryCanonicalCellId(cellId, size) !== null
}

function sortCellLikeIds(ids: Iterable<CellId>, size: BoardSize): readonly CellId[] {
  return [...ids].sort((a, b) => compareCellLikeIds(a, b, size))
}

function compareCellLikeIds(a: CellId, b: CellId, size: BoardSize): number {
  const aCoord = tryParseCellId(a, size)
  const bCoord = tryParseCellId(b, size)

  if (aCoord && bCoord) return aCoord.y - bCoord.y || aCoord.x - bCoord.x
  if (aCoord) return -1
  if (bCoord) return 1
  return a.localeCompare(b)
}

function tryParseCellId(cellId: CellId, size: BoardSize): { readonly x: number; readonly y: number } | null {
  try {
    return parseCellId(cellId, size)
  } catch {
    return null
  }
}

function sortIssues(issues: readonly SchemaIssue[]): readonly SchemaIssue[] {
  return [...issues].sort((a, b) => comparePaths(a.path, b.path) || a.code.localeCompare(b.code))
}

function comparePaths(a: readonly (string | number)[], b: readonly (string | number)[]): number {
  const length = Math.max(a.length, b.length)

  for (let index = 0; index < length; index += 1) {
    const aPart = a[index]
    const bPart = b[index]
    if (aPart === undefined) return -1
    if (bPart === undefined) return 1

    const comparison = comparePathPart(aPart, bPart)
    if (comparison !== 0) return comparison
  }

  return 0
}

function comparePathPart(a: string | number, b: string | number): number {
  if (typeof a === 'number' && typeof b === 'number') return a - b
  if (typeof a === 'number') return -1
  if (typeof b === 'number') return 1
  return a.localeCompare(b)
}

function formatPath(path: readonly (string | number)[]): string {
  if (path.length === 0) return '$'

  return path.reduce<string>((output, segment) => {
    if (typeof segment === 'number') return `${output}[${segment}]`
    return `${output}.${segment}`
  }, '$')
}

function formatContext(context: Readonly<Record<string, unknown>>): string {
  const sorted = Object.fromEntries(Object.entries(context).sort(([a], [b]) => a.localeCompare(b)))
  return JSON.stringify(sorted)
}
