import { describe, expect, it } from 'vitest'
import { parsePuzzleDefinition } from '@room-axioms/schema'

import case001Fixture from '../../../content/cases/case-001.json' with { type: 'json' }
import case002Fixture from '../../../content/cases/case-002.json' with { type: 'json' }
import case003Fixture from '../../../content/cases/case-003.json' with { type: 'json' }
import case004Fixture from '../../../content/cases/case-004.json' with { type: 'json' }
import case005Fixture from '../../../content/cases/case-005.json' with { type: 'json' }
import case006Fixture from '../../../content/cases/case-006.json' with { type: 'json' }
import case007Fixture from '../../../content/cases/case-007.json' with { type: 'json' }
import case008Fixture from '../../../content/cases/case-008.json' with { type: 'json' }
import case009Fixture from '../../../content/cases/case-009.json' with { type: 'json' }
import case010Fixture from '../../../content/cases/case-010.json' with { type: 'json' }

import { scorePuzzleDifficulty } from './index.js'

const fixtures = [
  case001Fixture,
  case002Fixture,
  case003Fixture,
  case004Fixture,
  case005Fixture,
  case006Fixture,
  case007Fixture,
  case008Fixture,
  case009Fixture,
  case010Fixture,
] as const

describe('MVP case provisional difficulty scoring', () => {
  it('scores all ten MVP cases without claiming real playtest calibration', () => {
    const scores = fixtures.map((fixture) => {
      const parsed = parsePuzzleDefinition(fixture)
      if (!parsed.ok || parsed.puzzle === undefined) {
        throw new Error(`Unexpected invalid fixture: ${JSON.stringify(parsed.issues)}`)
      }

      return scorePuzzleDifficulty(parsed.puzzle)
    })
    expect(scores.map((score) => score.puzzleId)).toEqual([
      'case-001',
      'case-002',
      'case-003',
      'case-004',
      'case-005',
      'case-006',
      'case-007',
      'case-008',
      'case-009',
      'case-010',
    ])
    expect(scores.every((score) => score.calibratedWithRealPlaytest === false)).toBe(true)
    expect(scores.every((score) => score.metrics.solverTruncated === false)).toBe(true)
    expect(scores.find((score) => score.puzzleId === 'case-004')).toMatchObject({
      metrics: {
        candidateGuestLayouts: 15,
        revealCount: 3,
        proofWaveCount: 1,
      },
    })
  })
})
