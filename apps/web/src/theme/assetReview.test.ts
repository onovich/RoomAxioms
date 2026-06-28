import { describe, expect, it } from 'vitest'

import { STATIC_DIALOGUE_SCENES } from '../vn/dialogue'
import { DEFAULT_THEME_ASSET_MANIFEST, type ThemeAssetManifest } from './assetManifest'
import { createThemeAssetReviewReport, validateThemeAssetIntake } from './assetReview'

describe('theme asset review workflow', () => {
  it('summarizes placeholder manifest status and dialogue triggers for private review', () => {
    const report = createThemeAssetReviewReport(DEFAULT_THEME_ASSET_MANIFEST, STATIC_DIALOGUE_SCENES)

    expect(report.manifestId).toBe('unregistered-scene-placeholder')
    expect(report.statusCounts.placeholder).toBe(DEFAULT_THEME_ASSET_MANIFEST.assets.length)
    expect(report.placeholderAssetIds).toContain('field-office')
    expect(report.dialogueCategories).toContain('caseIntro')
    expect(report.dialogueLeaks).toEqual([])
    expect(report.manifestLeaks).toEqual([])
  })

  it('requires source, license, dimensions, src, and approval for player-route assets', () => {
    const manifest: ThemeAssetManifest = {
      id: 'draft-assets',
      title: 'Draft assets',
      assets: [
        {
          id: 'investigator-draft',
          kind: 'portrait',
          status: 'userProvided',
          label: 'Investigator draft',
        },
        {
          id: 'field-office-final',
          kind: 'background',
          status: 'approved',
          label: 'Field office final',
          src: '/theme/field-office.png',
          source: {
            label: 'User supplied original art',
            license: 'Owned by project',
          },
          dimensions: {
            width: 1920,
            height: 1080,
          },
        },
      ],
    }

    expect(validateThemeAssetIntake(manifest).map((issue) => issue.code)).toEqual([
      'SRC_REQUIRED',
      'SOURCE_REQUIRED',
      'LICENSE_REQUIRED',
      'DIMENSIONS_REQUIRED',
      'PLAYER_ROUTE_APPROVAL_REQUIRED',
    ])
  })

  it('accepts fully reviewed approved assets without final-art claims in placeholders', () => {
    const manifest: ThemeAssetManifest = {
      id: 'approved-assets',
      title: 'Approved assets',
      assets: [
        {
          id: 'dialogue-frame-approved',
          kind: 'dialogueFrame',
          status: 'approved',
          label: 'Approved dialogue frame',
          src: '/theme/dialogue-frame.png',
          source: {
            label: 'User supplied original frame',
            license: 'Owned by project',
          },
          dimensions: {
            aspectRatio: '80:21',
          },
          safeForPlayerRoute: true,
        },
      ],
    }

    expect(validateThemeAssetIntake(manifest)).toEqual([])
  })
})
