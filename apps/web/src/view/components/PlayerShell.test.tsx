import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { PlayerShell } from './PlayerShell'
import {
  PLAYER_DESIGN_ASPECT_RATIO,
  PLAYER_DESIGN_HEIGHT,
  PLAYER_DESIGN_WIDTH,
  calculatePlayerCanvasViewport,
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
    expect(html).toContain('data-player-scale="1.000000"')
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

  it('reports the fixed canvas box used for letterbox and pillarbox viewports', () => {
    const baseline = calculatePlayerCanvasViewport(1920, 1080)
    expect(baseline).toEqual({
      height: 1080,
      marginX: 0,
      marginY: 0,
      scale: 1,
      width: 1920,
    })

    const wide = calculatePlayerCanvasViewport(2560, 1080)
    expect(wide.width / wide.height).toBeCloseTo(PLAYER_DESIGN_ASPECT_RATIO, 5)
    expect(wide.marginX).toBe(320)
    expect(wide.marginY).toBe(0)

    const tall = calculatePlayerCanvasViewport(1920, 1440)
    expect(tall.width / tall.height).toBeCloseTo(PLAYER_DESIGN_ASPECT_RATIO, 5)
    expect(tall.marginX).toBe(0)
    expect(tall.marginY).toBe(180)

    const phone = calculatePlayerCanvasViewport(390, 844)
    expect(phone.width).toBe(390)
    expect(phone.height).toBe(219.375)
    expect(phone.width / phone.height).toBeCloseTo(PLAYER_DESIGN_ASPECT_RATIO, 5)
    expect(phone.marginY).toBeCloseTo(312.3125, 5)
  })
})
