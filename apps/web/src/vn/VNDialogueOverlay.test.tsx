import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import {
  DEFAULT_THEME_ASSET_MANIFEST,
  type ThemeAssetManifest,
} from '../theme/assetManifest'
import { STATIC_DIALOGUE_SCENES } from './dialogue'
import { VNDialogueOverlay } from './VNDialogueOverlay'
import { activeDialogueLine, nextDialogueLineIndex } from './dialogueNavigation'

describe('VN dialogue overlay', () => {
  it('selects active and next dialogue lines deterministically', () => {
    const scene = STATIC_DIALOGUE_SCENES[0]

    expect(activeDialogueLine(scene, 0)?.id).toBe('case-intro-1')
    expect(activeDialogueLine(scene, 99)).toBeNull()
    expect(nextDialogueLineIndex(scene, 0)).toBe(1)
    expect(nextDialogueLineIndex(scene, 1)).toBeNull()
  })

  it('renders speaker, text, progress, and placeholder assets', () => {
    const scene = STATIC_DIALOGUE_SCENES[0]
    const html = renderToStaticMarkup(
      <VNDialogueOverlay
        scene={scene}
        lineIndex={0}
        manifest={DEFAULT_THEME_ASSET_MANIFEST}
        onAdvance={() => undefined}
        onClose={() => undefined}
      />,
    )

    expect(html).toContain('role="dialog"')
    expect(html).toContain('调度员')
    expect(html).toContain('档案已打开')
    expect(html).toContain('1 / 2')
    expect(html).toContain('Field office placeholder background')
    expect(html).toContain('Neutral dispatcher portrait placeholder')
  })

  it('renders approved asset URLs when the manifest supplies them', () => {
    const manifest: ThemeAssetManifest = {
      id: 'test-assets',
      title: 'Test assets',
      assets: [
        ...DEFAULT_THEME_ASSET_MANIFEST.assets,
        {
          id: 'field-office-approved',
          kind: 'background',
          status: 'approved',
          label: 'Approved field office',
          src: '/theme/field-office.png',
        },
        {
          id: 'investigator-approved',
          kind: 'portrait',
          status: 'approved',
          label: 'Approved investigator portrait',
          src: '/theme/investigator.png',
        },
      ],
    }
    const scene = {
      ...STATIC_DIALOGUE_SCENES[0],
      lines: [{
        ...STATIC_DIALOGUE_SCENES[0].lines[0],
        backgroundId: 'field-office-approved',
        portraitId: 'investigator-approved',
      }],
    }
    const html = renderToStaticMarkup(
      <VNDialogueOverlay
        scene={scene}
        lineIndex={0}
        manifest={manifest}
        onAdvance={() => undefined}
        onClose={() => undefined}
      />,
    )

    expect(html).toContain('/theme/field-office.png')
    expect(html).toContain('/theme/investigator.png')
  })
})
