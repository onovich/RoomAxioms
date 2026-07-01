import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { SceneDivider, SceneNineSlicePanel, SceneRuleIcon } from './SceneFrame'

describe('scene frame primitives', () => {
  it('renders the temporary paper nine-slice frame as stretchable pieces', () => {
    const html = renderToStaticMarkup(
      <SceneNineSlicePanel>
        <span>content</span>
      </SceneNineSlicePanel>,
    )

    expect(html).toContain('class="scene-nine-slice-panel"')
    expect(html).toContain('data-frame-variant="paper"')
    expect(html).toContain('box-001-top-left.png')
    expect(html.match(/scene-nine-slice-piece/g)).toHaveLength(9)
    expect(html).toContain('class="scene-nine-slice-content"')
    expect(html).toContain('content')
  })

  it('renders submit frame, dividers, and rule icon slots from Figma assets', () => {
    const html = renderToStaticMarkup(
      <>
        <SceneNineSlicePanel variant="submit" />
        <SceneDivider id="side" />
        <SceneRuleIcon id="orthogonal" />
      </>,
    )

    expect(html).toContain('data-frame-variant="submit"')
    expect(html).toContain('box-002-middle-stretch.png')
    expect(html).toContain('divider-side.svg')
    expect(html).toContain('rule-orthogonal-icon.svg')
  })
})
