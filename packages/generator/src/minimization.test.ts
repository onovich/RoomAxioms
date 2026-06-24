import { describe, expect, it } from 'vitest'
import type { PuzzleDefinition } from '@room-axioms/domain'

import { minimizeInitialReveals } from './index.js'

const intersectionPuzzle: PuzzleDefinition = {
  schemaVersion: 1,
  id: 'experimental-minimize-intersection',
  title: 'Experimental minimization intersection',
  board: { width: 3, height: 3 },
  allowedKinds: ['empty', 'bottle', 'guest'],
  rules: [
    {
      id: 'R1',
      type: 'globalCount',
      target: 'guest',
      count: { op: 'eq', value: 1 },
      presentation: {
        title: 'One guest',
        flavor: 'Exactly one guest is in this experimental room.',
      },
    },
    {
      id: 'R2',
      type: 'forEachCount',
      subject: 'bottle',
      scope: { kind: 'adjacent' },
      target: 'guest',
      count: { op: 'eq', value: 1 },
      presentation: {
        title: 'Bottle witnesses',
        flavor: 'Every bottle sees exactly one guest nearby.',
      },
    },
  ],
  initialReveals: ['A1', 'B1', 'C1', 'A3', 'C3'],
  target: {
    A1: 'bottle',
    B1: 'empty',
    C1: 'bottle',
    A2: 'empty',
    B2: 'guest',
    C2: 'empty',
    A3: 'bottle',
    B3: 'empty',
    C3: 'bottle',
  },
  metadata: {
    difficulty: 1,
    tags: ['experimental', 'intersection'],
    author: 'internal-generator-spike',
    status: 'draft',
  },
}

const saturatedPuzzle: PuzzleDefinition = {
  schemaVersion: 1,
  id: 'experimental-minimize-saturated',
  title: 'Experimental minimization saturated',
  board: { width: 3, height: 3 },
  allowedKinds: ['empty', 'guest'],
  rules: [
    {
      id: 'R1',
      type: 'globalCount',
      target: 'guest',
      count: { op: 'eq', value: 1 },
      presentation: {
        title: 'One guest',
        flavor: 'Exactly one guest is in this experimental room.',
      },
    },
  ],
  initialReveals: ['A1', 'B1', 'C1', 'A2', 'C2', 'A3', 'B3', 'C3'],
  target: {
    A1: 'empty',
    B1: 'empty',
    C1: 'empty',
    A2: 'empty',
    B2: 'guest',
    C2: 'empty',
    A3: 'empty',
    B3: 'empty',
    C3: 'empty',
  },
  metadata: {
    difficulty: 1,
    tags: ['experimental', 'global-count'],
    author: 'internal-generator-spike',
    status: 'draft',
  },
}

describe('initial reveal minimization', () => {
  it('removes redundant reveals only when no-guess proof and final uniqueness survive', () => {
    const report = minimizeInitialReveals(intersectionPuzzle, { order: ['B1'] })

    expect(report.beforeCells).toEqual(['A1', 'B1', 'C1', 'A3', 'C3'])
    expect(report.afterCells).toEqual(['A1', 'C1', 'A3', 'C3'])
    expect(report.beforeCount).toBe(5)
    expect(report.afterCount).toBe(4)
    expect(report.steps).toEqual([
      {
        cellId: 'B1',
        removed: true,
        reason: 'preserved-no-guess-and-uniqueness',
      },
    ])
    expect(report.proofBefore.noGuess).toBe(true)
    expect(report.proofAfter.noGuess).toBe(true)
    expect(report.proofAfter.guestLayoutUniqueAtEnd).toBe(true)
    expect(report.proofAfter.finalGuestCells).toEqual(['B2'])
  })

  it('keeps reveals that are required for proof completion', () => {
    const report = minimizeInitialReveals(saturatedPuzzle, { order: ['A1'] })

    expect(report.afterCells).toEqual(saturatedPuzzle.initialReveals)
    expect(report.steps).toEqual([
      {
        cellId: 'A1',
        removed: false,
        reason: 'required-for-proof',
      },
    ])
    expect(report.proofAfter.noGuess).toBe(true)
  })
})
