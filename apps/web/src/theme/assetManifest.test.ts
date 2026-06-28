import { describe, expect, it } from 'vitest'

import {
  DEFAULT_THEME_ASSET_MANIFEST,
  assetEntriesByKind,
  findThemeAssetManifestLeaks,
  isFinalThemeAsset,
  isPlaceholderLikeThemeAsset,
  resolveThemeAsset,
  type ThemeAssetManifest,
} from './assetManifest'

describe('theme asset manifest', () => {
  it('resolves manifest entries without marking placeholders as final art', () => {
    const portrait = resolveThemeAsset(DEFAULT_THEME_ASSET_MANIFEST, 'portrait', 'investigator')

    expect(portrait).toMatchObject({
      requestedId: 'investigator',
      kind: 'portrait',
      status: 'placeholder',
      placeholder: true,
      final: false,
    })
    expect(isPlaceholderLikeThemeAsset(portrait)).toBe(true)
    expect(isFinalThemeAsset(portrait)).toBe(false)
  })

  it('returns a safe missing placeholder for absent assets', () => {
    const missing = resolveThemeAsset(DEFAULT_THEME_ASSET_MANIFEST, 'background', 'not-supplied-yet')

    expect(missing).toMatchObject({
      requestedId: 'not-supplied-yet',
      kind: 'background',
      status: 'missing',
      label: 'Missing background placeholder',
      placeholder: true,
      final: false,
    })
    expect(missing.src).toBeUndefined()
  })

  it('preserves user-provided and approved status without upgrading unfinished art', () => {
    const manifest: ThemeAssetManifest = {
      id: 'test-manifest',
      title: 'Test manifest',
      assets: [
        {
          id: 'portrait-draft',
          kind: 'portrait',
          status: 'userProvided',
          label: 'User-provided draft portrait',
          src: '/assets/theme/portrait-draft.png',
        },
        {
          id: 'approved-frame',
          kind: 'dialogueFrame',
          status: 'approved',
          label: 'Approved dialogue frame',
          src: '/assets/theme/dialogue-frame.png',
        },
      ],
    }

    const draft = resolveThemeAsset(manifest, 'portrait', 'portrait-draft')
    const approved = resolveThemeAsset(manifest, 'dialogueFrame', 'approved-frame')

    expect(draft).toMatchObject({
      status: 'userProvided',
      placeholder: false,
      final: false,
    })
    expect(approved).toMatchObject({
      status: 'approved',
      placeholder: false,
      final: true,
    })
  })

  it('groups assets by kind for browser renderers', () => {
    expect(assetEntriesByKind(DEFAULT_THEME_ASSET_MANIFEST, 'portrait').map((asset) => asset.id)).toEqual([
      'investigator',
      'dispatcher',
    ])
    expect(assetEntriesByKind(DEFAULT_THEME_ASSET_MANIFEST, 'sound')).toEqual([])
  })

  it('reserves Phase 34 scene-map and packaging slots without final art', () => {
    expect(resolveThemeAsset(DEFAULT_THEME_ASSET_MANIFEST, 'logoMark', 'brand-mark')).toMatchObject({
      status: 'placeholder',
      placeholder: true,
      final: false,
    })
    expect(resolveThemeAsset(DEFAULT_THEME_ASSET_MANIFEST, 'boardFrame', 'scene-board-frame')).toMatchObject({
      status: 'placeholder',
      placeholder: true,
      final: false,
    })
    expect(assetEntriesByKind(DEFAULT_THEME_ASSET_MANIFEST, 'objectIcon').map((asset) => asset.id)).toEqual([
      'bottle-icon',
      'bin-icon',
      'mirror-icon',
    ])
    expect(assetEntriesByKind(DEFAULT_THEME_ASSET_MANIFEST, 'cellMarkedAnomalyOverlay')).toHaveLength(1)
    expect(assetEntriesByKind(DEFAULT_THEME_ASSET_MANIFEST, 'characterPortrait').map((asset) => asset.id)).toEqual([
      'investigator',
      'dispatcher',
    ])
  })

  it('keeps the default placeholder manifest free of secrecy leaks', () => {
    expect(findThemeAssetManifestLeaks(DEFAULT_THEME_ASSET_MANIFEST)).toEqual([])
  })

  it('reports forbidden target, candidate, forced, solver, and proof terms in asset metadata', () => {
    const manifest: ThemeAssetManifest = {
      id: 'bad-manifest',
      title: 'Bad manifest',
      assets: [
        {
          id: 'target-answer-background',
          kind: 'background',
          status: 'placeholder',
          label: 'Candidate solver proof background',
          src: '/assets/forced-cell.png',
          notes: 'Shows the guest-layout answer.',
        },
      ],
    }

    expect(findThemeAssetManifestLeaks(manifest)).toEqual([
      expect.objectContaining({ field: 'id', term: 'answer' }),
      expect.objectContaining({ field: 'id', term: 'target' }),
      expect.objectContaining({ field: 'id', term: 'target-answer' }),
      expect.objectContaining({ field: 'label', term: 'candidate' }),
      expect.objectContaining({ field: 'label', term: 'proof' }),
      expect.objectContaining({ field: 'label', term: 'solver' }),
      expect.objectContaining({ field: 'src', term: 'forced' }),
      expect.objectContaining({ field: 'notes', term: 'answer' }),
      expect.objectContaining({ field: 'notes', term: 'guest-layout' }),
    ])
  })
})
