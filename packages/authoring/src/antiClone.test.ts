import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import { allCells, type PuzzleDefinition } from '@room-axioms/domain'
import { parsePuzzleDefinition } from '@room-axioms/schema'

import { reduceEffectiveBoard } from './antiClone.js'

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../..')
const case004Path = resolve(repositoryRoot, 'content/cases/case-004.json')
const paddedCase004Path = resolve(
  repositoryRoot,
  'content/experimental/phase-20/padded-case004-right-edge.json',
)

describe('effective-board reduction', () => {
  it('removes a revealed safe right edge from a padded case-004 clone', () => {
    const reduction = reduceEffectiveBoard(loadCase(paddedCase004Path))

    expect(reduction.puzzleId).toBe('phase-20-padded-case004-right-edge')
    expect(reduction.originalBoard).toEqual({ width: 5, height: 4 })
    expect(reduction.effectiveBoard).toEqual({ width: 4, height: 4 })
    expect(reduction.bounds).toEqual({ xMin: 0, xMax: 3, yMin: 0, yMax: 3 })
    expect(reduction.irrelevantCells).toEqual(['E1', 'E2', 'E3', 'E4'])
    expect(reduction.effectiveCells).not.toContain('E1')
    expect(reduction.cells.find((cell) => cell.cellId === 'D1')).toMatchObject({
      normalizedCellId: 'D1',
      targetKind: 'guest',
    })
  })

  it('keeps the canonical cleaning baseline at its original 4x4 footprint', () => {
    const puzzle = loadCase(case004Path)
    const reduction = reduceEffectiveBoard(puzzle)

    expect(reduction.puzzleId).toBe('case-004')
    expect(reduction.originalBoard).toEqual({ width: 4, height: 4 })
    expect(reduction.effectiveBoard).toEqual({ width: 4, height: 4 })
    expect(reduction.bounds).toEqual({ xMin: 0, xMax: 3, yMin: 0, yMax: 3 })
    expect(new Set(reduction.effectiveCells)).toEqual(new Set(allCells(puzzle.board)))
  })

  it('records why each effective cell survived the reduction', () => {
    const reduction = reduceEffectiveBoard(loadCase(paddedCase004Path))
    const cellsById = new Map(reduction.cells.map((cell) => [cell.cellId, cell]))

    expect(cellsById.get('B1')?.reasons).toContain('proof-premise')
    expect(cellsById.get('D1')?.reasons).toEqual(expect.arrayContaining([
      'candidate-guest-layout',
      'final-guest',
    ]))
  })
})

function loadCase(casePath: string): PuzzleDefinition {
  const input = JSON.parse(readFileSync(casePath, 'utf8')) as unknown
  const parsed = parsePuzzleDefinition(input)

  if (!parsed.ok || parsed.puzzle === undefined) {
    throw new Error(`Fixture failed schema validation: ${casePath}`)
  }

  return parsed.puzzle
}
