import {
  DEFAULT_THEME_ASSET_MANIFEST,
  resolveThemeAsset,
  type ResolvedThemeAsset,
  type ThemeAssetManifest,
} from './assetManifest'

export type SceneCharacterId = 'protagonist' | 'assistant'
export type SceneCharacterState = 'normal' | 'thinking' | 'sensing' | 'success' | 'failure'

export const SCENE_CHARACTER_PORTRAIT_IDS = {
  protagonist: {
    normal: 'investigator',
    thinking: 'investigator-thinking',
    sensing: 'investigator-thinking',
    success: 'investigator',
    failure: 'investigator',
  },
  assistant: {
    normal: 'dispatcher',
    thinking: 'dispatcher',
    sensing: 'dispatcher-sensing',
    success: 'dispatcher',
    failure: 'dispatcher',
  },
} as const satisfies Record<SceneCharacterId, Record<SceneCharacterState, string>>

export function sceneCharacterPortraitId(
  character: SceneCharacterId,
  state: SceneCharacterState,
): string {
  return SCENE_CHARACTER_PORTRAIT_IDS[character][state]
}

export function resolveSceneCharacterPortrait(
  character: SceneCharacterId,
  state: SceneCharacterState,
  manifest: ThemeAssetManifest = DEFAULT_THEME_ASSET_MANIFEST,
): ResolvedThemeAsset {
  return resolveThemeAsset(manifest, 'portrait', sceneCharacterPortraitId(character, state))
}
