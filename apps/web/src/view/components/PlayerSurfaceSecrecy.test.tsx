import type { CellKind } from '@room-axioms/domain'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import type { RoomAxiomsGame } from '../../hooks/useRoomAxiomsGame'
import { BoardPanel } from './BoardPanel'
import { EvidencePanel } from './EvidencePanel'

const cellIds = [
  'A1', 'B1', 'C1', 'D1',
  'A2', 'B2', 'C2', 'D2',
  'A3', 'B3', 'C3', 'D3',
  'A4', 'B4', 'C4', 'D4',
] as const

describe('player surface secrecy and accessibility', () => {
  it('keeps developer runtime details out of the non-dev evidence panel', () => {
    const html = renderToStaticMarkup(<EvidencePanel game={playerGame()} />)

    expect(html).toContain('data-panel="evidence"')
    expect(html).not.toMatch(/Developer runtime inspector|Runtime Inspector|Guest layouts|Forced safe|Forced anomalies|Solver|Proof|candidateGuestLayouts/)
    expect(html).not.toContain('DEV')
    expect(html).not.toContain('A4')
    expect(html).not.toContain('D4')
  })

  it('keeps board cells keyboard-addressable without non-dev target spoilers', () => {
    const html = renderToStaticMarkup(<BoardPanel game={playerGame()} />)

    expect(html).toContain('role="grid"')
    expect(html.match(/role="gridcell"/g)).toHaveLength(16)
    expect(html).toContain('role="toolbar"')
    expect(html).toContain('data-cell-id="A1"')
    expect(html).toContain('aria-rowindex="1"')
    expect(html).toContain('aria-colindex="1"')
    expect(html).not.toMatch(/target-spoiler|target-tag|dev-safe|dev-guest/)
  })
})

function playerGame(): RoomAxiomsGame {
  return {
    actionLog: [
      {
        id: 'A1',
        initial: true,
        kind: 'empty',
        order: 0,
      },
    ],
    analysis: {
      binCandidates: ['C4'],
      elapsed: 4.2,
      forcedGuests: ['D4'],
      forcedSafe: ['A4'],
      satisfiable: true,
      truncated: false,
      unique: false,
    },
    analysisError: null,
    analysisLayoutCountText: 'candidateGuestLayouts=12',
    analysisRequestId: 1,
    analysisStatus: 'complete',
    analysisWarnings: [],
    cells: [...cellIds],
    cycleMark: () => undefined,
    devMode: false,
    developerTargetKind: () => null,
    handleCell: () => undefined,
    highlightedCells: () => [],
    hoveredCell: null,
    marks: new Map([
      ['B2', 'guest'],
      ['C3', 'safe'],
    ]),
    observedKind: (cellId: string): CellKind | null => (cellId === 'A1' ? 'empty' : null),
    puzzle: {
      board: { height: 4, width: 4 },
      cells: [],
      id: 'case-004',
      initialReveals: ['A1'],
      rules: [],
      title: 'case 004',
    },
    revealed: new Set(['A1']),
    runtimeAnalysis: null,
    selectedRule: null,
    setHoveredCell: () => undefined,
    setShowTarget: () => undefined,
    setTool: () => undefined,
    showTarget: false,
    status: {
      kind: 'idle',
      text: 'Ready',
    },
    submitConclusion: () => undefined,
    targetGuestCount: 4,
    tool: 'inspect',
  } as unknown as RoomAxiomsGame
}
