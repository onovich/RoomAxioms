import { allCells, neighbors, sortCellIds } from '@room-axioms/domain'
import type { CellId, CellKind, Comparator, ForEachCountRule, PuzzleDefinition } from '../domain/types'

export interface AnalysisResult {
  readonly layouts: readonly (readonly CellId[])[]
  readonly binCandidates: readonly CellId[]
  readonly forcedSafe: readonly CellId[]
  readonly forcedGuests: readonly CellId[]
  readonly unique: boolean
  readonly elapsed: number
}

export function analyzePuzzle(
  puzzle: PuzzleDefinition,
  observations: ReadonlyMap<CellId, CellKind>,
  now: () => number = () => performance.now(),
): AnalysisResult {
  const start = now()
  const cells = allCells(puzzle.board)
  const guestCount = exactGlobalCount(puzzle, 'guest')
  const binCount = exactGlobalCount(puzzle, 'bin')
  const knownGuests = matchingObserved(observations, 'guest')
  const knownBins = matchingObserved(observations, 'bin')
  const binCandidates = getBinCandidates(puzzle, observations, cells, binCount)
  const layoutKeys = new Set<string>()
  const layouts: CellId[][] = []

  if (binCount === 1 && knownBins.length <= 1 && knownGuests.length <= guestCount) {
    for (const binId of binCandidates) {
      const unknownGuestCells = cells.filter((id) => {
        if (id === binId) return false
        const observed = observations.get(id)
        return observed === undefined
      })

      for (const remainingGuests of combinations(unknownGuestCells, guestCount - knownGuests.length)) {
        const guests = sortCellIds([...knownGuests, ...remainingGuests], puzzle.board)
        if (!observedSubjectRulesPass(puzzle, observations, binId, guests)) continue

        const key = guests.join(',')
        if (!layoutKeys.has(key)) {
          layoutKeys.add(key)
          layouts.push([...guests])
        }
      }
    }
  }

  const unknown = cells.filter((id) => !observations.has(id))
  const forcedSafe = unknown.filter(
    (id) => layouts.length > 0 && layouts.every((layout) => !layout.includes(id)),
  )
  const forcedGuests = unknown.filter(
    (id) => layouts.length > 0 && layouts.every((layout) => layout.includes(id)),
  )

  return {
    layouts,
    binCandidates,
    forcedSafe: sortCellIds(forcedSafe, puzzle.board),
    forcedGuests: sortCellIds(forcedGuests, puzzle.board),
    unique: layouts.length === 1,
    elapsed: now() - start,
  }
}

function exactGlobalCount(puzzle: PuzzleDefinition, kind: CellKind): number {
  const rule = puzzle.rules.find(
    (item) => item.type === 'globalCount' && item.target === kind && item.count.op === 'eq',
  )

  return rule?.count.value ?? 0
}

function matchingObserved(
  observations: ReadonlyMap<CellId, CellKind>,
  kind: CellKind,
): readonly CellId[] {
  return [...observations.entries()].filter(([, value]) => value === kind).map(([id]) => id)
}

function getBinCandidates(
  puzzle: PuzzleDefinition,
  observations: ReadonlyMap<CellId, CellKind>,
  cells: readonly CellId[],
  binCount: number,
): readonly CellId[] {
  const knownBins = matchingObserved(observations, 'bin')
  const candidates = knownBins.length > 0 ? knownBins : cells.filter((id) => !observations.has(id))

  if (binCount !== 1) return []

  const bottleToBinRules = puzzle.rules.filter(isBottleToBinRule)
  const knownBottles = matchingObserved(observations, 'bottle')

  return sortCellIds(
    candidates.filter((candidate) => {
      const observed = observations.get(candidate)
      if (observed !== undefined && observed !== 'bin') return false

      return bottleToBinRules.every((rule) =>
        knownBottles.every((bottleId) =>
          neighbors(bottleId, rule.scope.kind, puzzle.board).includes(candidate),
        ),
      )
    }),
    puzzle.board,
  )
}

function observedSubjectRulesPass(
  puzzle: PuzzleDefinition,
  observations: ReadonlyMap<CellId, CellKind>,
  binId: CellId,
  guests: readonly CellId[],
): boolean {
  const guestSet = new Set(guests)

  const subjectFacts = new Map(observations)
  subjectFacts.set(binId, 'bin')

  for (const rule of puzzle.rules) {
    if (rule.type !== 'forEachCount') continue

    for (const [cellId, observedKind] of subjectFacts.entries()) {
      const actualSubject = cellId === binId ? 'bin' : observedKind
      if (actualSubject !== rule.subject) continue

      const scopedCells = neighbors(cellId, rule.scope.kind, puzzle.board)
      const count = scopedCells.filter((id) => {
        if (rule.target === 'guest') return guestSet.has(id)
        if (rule.target === 'bin') return id === binId
        return observations.get(id) === rule.target
      }).length

      if (!compare(count, rule.count)) return false
    }
  }

  return true
}

function isBottleToBinRule(rule: PuzzleDefinition['rules'][number]): rule is ForEachCountRule {
  return (
    rule.type === 'forEachCount' &&
    rule.subject === 'bottle' &&
    rule.target === 'bin' &&
    rule.count.op === 'eq' &&
    rule.count.value === 1
  )
}

function compare(value: number, comparator: Comparator): boolean {
  if (comparator.op === 'eq') return value === comparator.value
  if (comparator.op === 'gte') return value >= comparator.value
  return value <= comparator.value
}

function combinations<T>(items: readonly T[], choose: number): readonly (readonly T[])[] {
  if (choose < 0) return []
  if (choose === 0) return [[]]

  const out: T[][] = []

  function visit(start: number, picked: T[]) {
    if (picked.length === choose) {
      out.push([...picked])
      return
    }

    for (let index = start; index <= items.length - (choose - picked.length); index += 1) {
      picked.push(items[index])
      visit(index + 1, picked)
      picked.pop()
    }
  }

  visit(0, [])
  return out
}
