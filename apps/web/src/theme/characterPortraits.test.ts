import { describe, expect, it } from 'vitest'

import {
  resolveSceneCharacterPortrait,
  sceneCharacterPortraitId,
} from './characterPortraits'
import { DEFAULT_THEME_ASSET_MANIFEST } from './assetManifest'

describe('scene character portrait fallbacks', () => {
  it('maps protagonist states to manifest portrait assets without final-art claims', () => {
    expect(sceneCharacterPortraitId('protagonist', 'normal')).toBe('investigator')
    expect(sceneCharacterPortraitId('protagonist', 'thinking')).toBe('investigator-thinking')
    expect(sceneCharacterPortraitId('protagonist', 'success')).toBe('investigator')
    expect(sceneCharacterPortraitId('protagonist', 'failure')).toBe('investigator')

    const portrait = resolveSceneCharacterPortrait('protagonist', 'failure')
    expect(portrait).toMatchObject({
      kind: 'portrait',
      status: 'userProvided',
      final: false,
    })
    expect(portrait.src).toContain('theme/portraits/phase-35/investigator-normal.png')
  })

  it('maps assistant sensing and outcome states to safe temporary fallbacks', () => {
    expect(sceneCharacterPortraitId('assistant', 'normal')).toBe('dispatcher')
    expect(sceneCharacterPortraitId('assistant', 'sensing')).toBe('dispatcher-sensing')
    expect(sceneCharacterPortraitId('assistant', 'success')).toBe('dispatcher')
    expect(sceneCharacterPortraitId('assistant', 'failure')).toBe('dispatcher')

    const sensing = resolveSceneCharacterPortrait('assistant', 'sensing', DEFAULT_THEME_ASSET_MANIFEST)
    expect(sensing).toMatchObject({
      kind: 'portrait',
      status: 'userProvided',
      final: false,
    })
    expect(sensing.src).toContain('theme/portraits/phase-35/dispatcher-sensing.png')
  })
})
