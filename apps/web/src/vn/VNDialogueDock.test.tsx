import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { DEFAULT_THEME_ASSET_MANIFEST } from '../theme/assetManifest'
import { createHintDialogueScene } from './dialogue'
import { VNDialogueDock } from './VNDialogueDock'

describe('VN dialogue dock', () => {
  it('renders hint dialogue as a non-modal partner review dock', () => {
    const scene = createHintDialogueScene({
      title: '数量已经够了',
      conclusion: 'A1 可以继续勘察。',
      premises: ['用到规则 R1'],
      reasoning: '这一步不用猜。',
    })

    expect(scene).not.toBeNull()
    if (scene === null) throw new Error('expected hint scene')

    const html = renderToStaticMarkup(
      <VNDialogueDock
        scene={scene}
        lineIndex={0}
        manifest={DEFAULT_THEME_ASSET_MANIFEST}
        onAdvance={() => undefined}
        onClose={() => undefined}
      />,
    )

    expect(html).toContain('class="vn-dock"')
    expect(html).not.toContain('aria-modal="true"')
    expect(html).toContain('调度员')
    expect(html).toContain('可以解释的一步')
    expect(html).toContain('theme/final/portraits/assistant-sensing.png')
    expect(html).toContain('1 / 4')
  })
})
