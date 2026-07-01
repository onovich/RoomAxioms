import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { PlayerShell } from './PlayerShell'
import {
  PLAYER_DESIGN_HEIGHT,
  PLAYER_DESIGN_WIDTH,
  calculatePlayerCanvasScale,
} from './PlayerShellGeometry'

describe('player shell', () => {
  it('keeps the formal player canvas at a 1920x1080 baseline', () => {
    const html = renderToStaticMarkup(
      <PlayerShell
        board={<section>board</section>}
        dialogs={<section>vn</section>}
        evidence={<section>evidence</section>}
        mobilePanel="board"
        mobileTabs={<nav>tabs</nav>}
        rules={<section>rules</section>}
        topbar={<header>topbar</header>}
      />,
    )

    expect(html).toContain('data-player-shell="fixed-16-9"')
    expect(html).toContain(`data-design-width="${PLAYER_DESIGN_WIDTH}"`)
    expect(html).toContain(`data-design-height="${PLAYER_DESIGN_HEIGHT}"`)
    expect(html).toContain('class="scene-player-canvas"')
    expect(html).toContain('class="scene-player-workstation"')
  })

  it('uses proportional letterbox or pillarbox scaling', () => {
    expect(calculatePlayerCanvasScale(1920, 1080)).toBe(1)
    expect(calculatePlayerCanvasScale(1366, 768)).toBeCloseTo(768 / 1080, 5)
    expect(calculatePlayerCanvasScale(390, 844)).toBeCloseTo(390 / 1920, 5)
    expect(calculatePlayerCanvasScale(2560, 1080)).toBe(1)
    expect(calculatePlayerCanvasScale(1920, 1440)).toBe(1)
    expect(calculatePlayerCanvasScale(3840, 2160)).toBe(2)
  })
})
