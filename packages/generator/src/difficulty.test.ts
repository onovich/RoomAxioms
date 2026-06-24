import { describe, expect, it } from 'vitest'
import type { PuzzleDefinition, RuleDefinition } from '@room-axioms/domain'

import {
  createGeneratorSeed,
  generateVerifiedCandidates,
  scorePuzzleDifficulty,
  type GeneratorInputContract,
} from './index.js'

const oneGuestRule: RuleDefinition = {
  id: 'R1',
  type: 'globalCount',
  target: 'guest',
  count: { op: 'eq', value: 1 },
  presentation: {
    title: 'One guest',
    flavor: 'Exactly one guest is in this experimental room.',
  },
}

const scoringPuzzle: PuzzleDefinition = {
  schemaVersion: 1,
  id: 'experimental-score-saturated',
  title: 'Experimental scoring saturated',
  board: { width: 3, height: 3 },
  allowedKinds: ['empty', 'guest'],
  rules: [oneGuestRule],
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
    tags: ['experimental', 'difficulty'],
    author: 'internal-generator-spike',
    status: 'draft',
  },
}

function generatorInput(): GeneratorInputContract {
  return {
    seed: createGeneratorSeed(41),
    board: { width: 3, height: 3 },
    allowedKinds: ['empty', 'guest'],
    guestCount: 1,
    rules: [oneGuestRule],
    initialRevealRange: { min: 8, max: 8 },
    caps: {
      maxAttempts: 2,
      maxNodes: 10_000,
      maxModels: 10_000,
      maxGuestLayouts: 100,
      maxAccepted: 1,
    },
    artifactPolicy: 'report-only',
  }
}

describe('provisional difficulty scoring', () => {
  it('marks scores as uncalibrated and derives metrics from solver/proof reports', () => {
    const score = scorePuzzleDifficulty(scoringPuzzle)

    expect(score.calibratedWithRealPlaytest).toBe(false)
    expect(score.metrics).toMatchObject({
      boardCells: 9,
      revealCount: 8,
      unknownCellCount: 1,
      candidateGuestLayouts: 1,
      proofWaveCount: 0,
      deductionCount: 0,
      techniqueCount: 0,
      solverTruncated: false,
    })
    expect(score.score).toBeGreaterThan(0)
    expect(score.band).toBe(1)
  })

  it('can score an experimental accepted candidate without promoting it', () => {
    const generated = generateVerifiedCandidates(generatorInput())
    const puzzle = generated.accepted[0]?.puzzle
    expect(puzzle).toBeDefined()

    const score = scorePuzzleDifficulty(puzzle as PuzzleDefinition)
    expect(score.puzzleId).toBe('experimental-phase-9-001')
    expect(score.calibratedWithRealPlaytest).toBe(false)
    expect(score.metrics.solverTruncated).toBe(false)
  })
})
