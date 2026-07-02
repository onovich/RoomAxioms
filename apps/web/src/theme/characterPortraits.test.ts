import { describe, expect, it } from 'vitest'

import {
  resolveSceneCharacterPortrait,
  sceneCharacterPortraitId,
} from './characterPortraits'
import { DEFAULT_THEME_ASSET_MANIFEST } from './assetManifest'

describe('scene character portrait fallbacks', () => {
  it('maps protagonist states to approved final manifest portrait assets', () => {
    expect(sceneCharacterPortraitId('protagonist', 'normal')).toBe('investigator')
    expect(sceneCharacterPortraitId('protagonist', 'thinking')).toBe('investigator-thinking')
    expect(sceneCharacterPortraitId('protagonist', 'success')).toBe('investigator')
    expect(sceneCharacterPortraitId('protagonist', 'failure')).toBe('investigator')

    const portrait = resolveSceneCharacterPortrait('protagonist', 'failure')
    expect(portrait).toMatchObject({
      kind: 'portrait',
      status: 'approved',
      final: true,
    })
    expect(portrait.src).toContain('theme/final/portraits/protagonist-normal.png')
  })

  it('maps assistant sensing and outcome states to approved final manifest portrait assets', () => {
    expect(sceneCharacterPortraitId('assistant', 'normal')).toBe('dispatcher')
    expect(sceneCharacterPortraitId('assistant', 'sensing')).toBe('dispatcher-sensing')
    expect(sceneCharacterPortraitId('assistant', 'success')).toBe('dispatcher')
    expect(sceneCharacterPortraitId('assistant', 'failure')).toBe('dispatcher')

    const sensing = resolveSceneCharacterPortrait('assistant', 'sensing', DEFAULT_THEME_ASSET_MANIFEST)
    expect(sensing).toMatchObject({
      kind: 'portrait',
      status: 'approved',
      final: true,
    })
    expect(sensing.src).toContain('theme/final/portraits/assistant-sensing.png')
  })
})
