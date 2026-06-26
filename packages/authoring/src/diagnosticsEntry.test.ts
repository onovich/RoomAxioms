import { describe, expect, it } from 'vitest'

import {
  DEFAULT_CAPS,
  evaluateDraftDiagnostics,
  type AuthoringDraftDiagnosticsReport,
} from '@room-axioms/authoring/diagnostics'

describe('browser-safe diagnostics entrypoint', () => {
  it('exposes draft diagnostics without importing the root CLI surface', () => {
    const report: AuthoringDraftDiagnosticsReport = evaluateDraftDiagnostics({
      draft: { id: 'broken-draft' },
    })

    expect(DEFAULT_CAPS).toMatchObject({
      maxNodes: 20_000,
      maxModels: 20_000,
      maxGuestLayouts: 100,
      candidateLayoutCap: 100,
    })
    expect(report).toMatchObject({
      ok: false,
      status: 'invalid-draft',
      groups: expect.arrayContaining([
        expect.objectContaining({
          id: 'blocking-errors',
          status: 'fail',
        }),
        expect.objectContaining({
          id: 'correctness',
          status: 'skipped',
        }),
      ]),
    })
  })
})
