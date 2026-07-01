import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import type { CaseSummary } from '../../content/cases'
import type { RoomAxiomsGame } from '../../hooks/useRoomAxiomsGame'
import { TopBar } from './TopBar'

const cases: readonly CaseSummary[] = [
  {
    board: { height: 4, width: 4 },
    caseName: '案卷 04 · 客房清扫记录',
    difficulty: 2,
    id: 'case-004',
    tags: [],
    tier: 'baseline',
    title: 'case 004',
  },
]

function topBarGame(): RoomAxiomsGame {
  return {
    cells: ['A1', 'A2', 'A3', 'A4'],
    marks: new Map([['A2', 'guest']]),
    puzzle: {
      board: { height: 4, width: 4 },
      cells: [],
      id: 'case-004',
      initialReveals: [],
      rules: [],
      title: 'case 004',
      caseName: '案卷 04 · 客房清扫记录',
    },
    replayCaseIntro: () => undefined,
    reset: () => undefined,
    revealed: new Set(['A1', 'A2']),
    setVNEnabled: () => undefined,
    setVNReducedMotion: () => undefined,
    setVNTextSpeed: () => undefined,
    targetGuestCount: 3,
    vnPreferences: {
      enabled: true,
      reducedMotion: false,
      textSpeed: 'normal',
    },
  } as unknown as RoomAxiomsGame
}

describe('TopBar', () => {
  it('renders the Figma-style case header without the ordinary Hint product entry', () => {
    const html = renderToStaticMarkup(
      <TopBar
        cases={cases}
        game={topBarGame()}
        onSelectCase={() => undefined}
        selectedCaseId="case-004"
      />,
    )

    expect(html).toContain('案件档案')
    expect(html).toContain('04')
    expect(html).toContain('客房清扫记录')
    expect(html).toContain('已标记异常')
    expect(html).toContain('1 / 3')
    expect(html).not.toContain('搭档复核')
  })
})
