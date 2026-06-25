import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import {
  evaluateNoveltyClaimManifest,
  type NoveltyClaimManifest,
} from './noveltyClaims.js'

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../..')
const manifestPath = resolve(repositoryRoot, 'content/novelty-claims.json')

describe('novelty claim manifest', () => {
  it('accepts the Phase 21 novelty manifest for useful baselines, promoted cases, and rejected suspects', () => {
    const report = evaluateNoveltyClaimManifest(loadManifest(), [
      'case-004',
      'case-011',
      'case-012',
      'case-013',
      'case-014',
      'case-015',
      'case-017',
      'case-018',
      'case-019',
      'case-020',
    ])

    expect(report.ok).toBe(true)
    expect(report.acceptedPuzzleIds).toEqual([
      'case-004',
      'case-011',
      'case-012',
      'case-013',
      'case-014',
      'case-015',
      'case-017',
      'case-018',
      'case-019',
      'case-020',
    ])
    expect(report.rejectedPuzzleIds).toEqual([
      'case-001',
      'case-002',
      'case-003',
      'case-005',
      'case-006',
      'case-016',
    ])
  })

  it('reports missing required claims', () => {
    const report = evaluateNoveltyClaimManifest(loadManifest(), ['case-999'])

    expect(report.ok).toBe(false)
    expect(report.issues).toContainEqual(expect.objectContaining({
      code: 'MISSING_REQUIRED_CLAIM',
      puzzleId: 'case-999',
    }))
  })

  it('requires reviewer evidence for accepted claims', () => {
    const manifest = loadManifest()
    const [firstClaim, ...otherClaims] = manifest.claims
    if (firstClaim === undefined) {
      throw new Error('Expected novelty manifest fixture to include at least one claim.')
    }
    const report = evaluateNoveltyClaimManifest({
      ...manifest,
      claims: [
        {
          ...firstClaim,
          evidence: {
            ...firstClaim.evidence,
            reviewerNote: '',
          },
        },
        ...otherClaims,
      ],
    }, ['case-004'])

    expect(report.ok).toBe(false)
    expect(report.issues).toContainEqual(expect.objectContaining({
      code: 'MISSING_REVIEWER_EVIDENCE',
      puzzleId: 'case-004',
    }))
  })
})

function loadManifest(): NoveltyClaimManifest {
  return JSON.parse(readFileSync(manifestPath, 'utf8')) as NoveltyClaimManifest
}
