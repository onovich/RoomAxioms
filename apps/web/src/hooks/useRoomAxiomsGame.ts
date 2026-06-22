import { useCallback, useEffect, useMemo, useState } from 'react'
import { allCells, neighbors } from '../domain/coordinates'
import { cellLabels } from '../data/case004'
import { analyzePuzzle, type AnalysisResult } from '../logic/analysis'
import { createHint, kindIsInspectable, type Hint } from '../logic/hints'
import type {
  CellId,
  CellKind,
  ObservationEntry,
  PlayerMark,
  PuzzleDefinition,
  RuleDefinition,
  Tool,
} from '../domain/types'

type StatusKind = 'normal' | 'success' | 'error'
type ResultKind = 'success' | 'failure'
type MobilePanel = 'rules' | 'board' | 'evidence'

interface StatusMessage {
  readonly text: string
  readonly kind: StatusKind
}

export interface ResultDialogState {
  readonly kind: ResultKind
  readonly title: string
  readonly eyebrow: string
  readonly body: string
  readonly stats: readonly { readonly label: string; readonly value: string | number }[]
}

export interface RoomAxiomsGame {
  readonly puzzle: PuzzleDefinition
  readonly cells: readonly CellId[]
  readonly revealed: ReadonlySet<CellId>
  readonly marks: ReadonlyMap<CellId, PlayerMark>
  readonly actionLog: readonly ObservationEntry[]
  readonly observations: ReadonlyMap<CellId, CellKind>
  readonly tool: Tool
  readonly selectedRule: string | null
  readonly hoveredCell: CellId | null
  readonly devMode: boolean
  readonly showTarget: boolean
  readonly failed: boolean
  readonly hintCount: number
  readonly inspectCount: number
  readonly analysis: AnalysisResult
  readonly status: StatusMessage
  readonly hint: Hint | null
  readonly result: ResultDialogState | null
  readonly mobilePanel: MobilePanel
  readonly setTool: (tool: Tool) => void
  readonly setHoveredCell: (cellId: CellId | null) => void
  readonly selectRule: (ruleId: string) => void
  readonly highlightedCells: (cellId: CellId) => readonly string[]
  readonly handleCell: (cellId: CellId) => void
  readonly cycleMark: (cellId: CellId) => void
  readonly requestHint: () => void
  readonly closeHint: () => void
  readonly submitConclusion: () => void
  readonly closeResult: () => void
  readonly reset: () => void
  readonly setDevMode: (enabled: boolean) => void
  readonly setShowTarget: (enabled: boolean) => void
  readonly setMobilePanel: (panel: MobilePanel) => void
}

export function useRoomAxiomsGame(puzzle: PuzzleDefinition): RoomAxiomsGame {
  const cells = useMemo(() => allCells(puzzle.board), [puzzle])
  const [revealed, setRevealed] = useState<ReadonlySet<CellId>>(
    () => new Set(puzzle.initialReveals),
  )
  const [marks, setMarks] = useState<ReadonlyMap<CellId, PlayerMark>>(() => new Map())
  const [actionLog, setActionLog] = useState<readonly ObservationEntry[]>(() =>
    initialActionLog(puzzle),
  )
  const [tool, setTool] = useState<Tool>('inspect')
  const [selectedRule, setSelectedRule] = useState<string | null>(null)
  const [hoveredCell, setHoveredCell] = useState<CellId | null>(null)
  const [devMode, setDevModeState] = useState(false)
  const [showTarget, setShowTargetState] = useState(false)
  const [failed, setFailed] = useState(false)
  const [hintCount, setHintCount] = useState(0)
  const [inspectCount, setInspectCount] = useState(0)
  const [status, setStatus] = useState<StatusMessage>({
    text: '从公开规则与三只酒瓶开始推理。没有倒计时。',
    kind: 'normal',
  })
  const [hint, setHint] = useState<Hint | null>(null)
  const [result, setResult] = useState<ResultDialogState | null>(null)
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>('board')

  const observations = useMemo(() => {
    return new Map([...revealed].map((id) => [id, puzzle.target[id]] as const))
  }, [puzzle, revealed])

  const analysis = useMemo(() => analyzePuzzle(puzzle, observations), [observations, puzzle])

  const setStatusMessage = useCallback((text: string, kind: StatusKind = 'normal') => {
    setStatus({ text, kind })
  }, [])

  const setDevMode = useCallback((enabled: boolean) => {
    setDevModeState(enabled)
    if (!enabled) setShowTargetState(false)
  }, [])

  const setShowTarget = useCallback(
    (enabled: boolean) => {
      setShowTargetState(devMode && enabled)
    },
    [devMode],
  )

  const setMark = useCallback(
    (cellId: CellId, value: PlayerMark) => {
      if (revealed.has(cellId) || failed) return

      setMarks((current) => {
        const next = new Map(current)
        if (next.get(cellId) === value) next.delete(cellId)
        else next.set(cellId, value)
        return next
      })

      setStatusMessage(
        value === 'guest'
          ? `${cellId} 已切换访客标记。标记只是你的笔记。`
          : `${cellId} 已切换安全笔记。`,
      )
    },
    [failed, revealed, setStatusMessage],
  )

  const inspect = useCallback(
    (cellId: CellId) => {
      if (revealed.has(cellId) || failed) return

      if (marks.get(cellId) === 'guest') {
        setStatusMessage(`${cellId} 已被你标记为访客。先撤销标记，再决定是否调查。`, 'error')
        return
      }

      const kind = puzzle.target[cellId]
      setInspectCount((value) => value + 1)
      setRevealed((current) => new Set(current).add(cellId))
      setActionLog((current) => [
        ...current,
        { id: cellId, kind, initial: false, order: current.length },
      ])

      if (!kindIsInspectable(kind)) {
        setFailed(true)
        setResult({
          kind: 'failure',
          eyebrow: '调查中止',
          title: `${cellId} 中存在访客`,
          body: '规则没有改变；这次调查在执行前并未被公开信息证明安全。失败界面不会揭示另一名访客的位置。',
          stats: [
            { label: '主动调查', value: inspectCount + 1 },
            { label: '提示次数', value: hintCount },
            { label: '触发访客', value: 1 },
          ],
        })
        return
      }

      setMarks((current) => {
        const next = new Map(current)
        next.delete(cellId)
        return next
      })
      setStatusMessage(`${cellId} 揭示为${cellLabels[kind]}。这是新增事实，规则没有变化。`, 'success')
    },
    [failed, hintCount, inspectCount, marks, puzzle, revealed, setStatusMessage],
  )

  const handleCell = useCallback(
    (cellId: CellId) => {
      if (tool === 'guest') {
        setMark(cellId, 'guest')
        return
      }
      if (tool === 'safe') {
        setMark(cellId, 'safe')
        return
      }
      inspect(cellId)
    },
    [inspect, setMark, tool],
  )

  const cycleMark = useCallback(
    (cellId: CellId) => {
      if (revealed.has(cellId) || failed) return

      setMarks((current) => {
        const next = new Map(current)
        const mark = next.get(cellId)
        if (!mark) next.set(cellId, 'guest')
        else if (mark === 'guest') next.set(cellId, 'safe')
        else next.delete(cellId)
        return next
      })
    },
    [failed, revealed],
  )

  const selectRule = useCallback(
    (ruleId: string) => setSelectedRule((current) => (current === ruleId ? null : ruleId)),
    [],
  )

  const highlightedCells = useCallback(
    (cellId: CellId): readonly string[] => {
      const classes: string[] = []
      const rule = puzzle.rules.find((item) => item.id === selectedRule)
      if (!rule) return classes

      if (rule.type === 'globalCount') {
        classes.push('scope-highlight')
        return classes
      }

      const visibleSubjects = [...revealed].filter((id) => puzzle.target[id] === rule.subject)
      if (visibleSubjects.includes(cellId)) classes.push('subject-highlight')
      if (visibleSubjects.some((subject) => neighbors(subject, rule.scope.kind, puzzle.board).includes(cellId))) {
        classes.push('scope-highlight')
      }
      if (hint?.highlight === cellId) classes.push('hint-highlight')

      return classes
    },
    [hint?.highlight, puzzle, revealed, selectedRule],
  )

  const requestHint = useCallback(() => {
    setHintCount((value) => value + 1)
    setHint(createHint(puzzle, revealed, marks, analysis))
  }, [analysis, marks, puzzle, revealed])

  const submitConclusion = useCallback(() => {
    const guestMarks = [...marks.entries()]
      .filter(([, value]) => value === 'guest')
      .map(([id]) => id)
      .sort()
    const targetGuests = Object.entries(puzzle.target)
      .filter(([, kind]) => kind === 'guest')
      .map(([id]) => id)
      .sort()

    if (guestMarks.length !== targetGuests.length) {
      setStatusMessage(`需要标记恰好 ${targetGuests.length} 名访客；当前为 ${guestMarks.length}。`, 'error')
      return
    }

    if (guestMarks.join(',') !== targetGuests.join(',')) {
      setStatusMessage('当前结论不成立。系统不会指出哪一格错误，你可以继续修正。', 'error')
      return
    }

    setResult({
      kind: 'success',
      eyebrow: '调查完成',
      title: '两名访客已经定位',
      body: '规则从未改变。你通过逐步揭示客观物证，把候选危险布局收缩为唯一答案：D1 与 B4。',
      stats: [
        { label: '已揭示格', value: revealed.size },
        { label: '提示次数', value: hintCount },
        { label: '剩余候选布局', value: analysis.layouts.length },
      ],
    })
  }, [analysis.layouts.length, hintCount, marks, puzzle.target, revealed.size, setStatusMessage])

  const reset = useCallback(() => {
    setRevealed(new Set(puzzle.initialReveals))
    setMarks(new Map())
    setActionLog(initialActionLog(puzzle))
    setTool('inspect')
    setSelectedRule(null)
    setHoveredCell(null)
    setShowTargetState(false)
    setFailed(false)
    setHintCount(0)
    setInspectCount(0)
    setHint(null)
    setResult(null)
    setStatusMessage('从公开规则与三只酒瓶开始推理。没有倒计时。')
  }, [puzzle, setStatusMessage])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return
      const key = event.key.toLowerCase()
      if (key === 'f') setTool('guest')
      if (key === 's') setTool('safe')
      if (key === 'i') setTool('inspect')
      if (key === 'h') requestHint()
      if (key === 'escape') {
        setHint(null)
        setResult(null)
        setSelectedRule(null)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [requestHint])

  return {
    puzzle,
    cells,
    revealed,
    marks,
    actionLog,
    observations,
    tool,
    selectedRule,
    hoveredCell,
    devMode,
    showTarget,
    failed,
    hintCount,
    inspectCount,
    analysis,
    status,
    hint,
    result,
    mobilePanel,
    setTool,
    setHoveredCell,
    selectRule,
    highlightedCells,
    handleCell,
    cycleMark,
    requestHint,
    closeHint: () => setHint(null),
    submitConclusion,
    closeResult: () => setResult(null),
    reset,
    setDevMode,
    setShowTarget,
    setMobilePanel,
  }
}

function initialActionLog(puzzle: PuzzleDefinition): readonly ObservationEntry[] {
  return puzzle.initialReveals.map((id, order) => ({
    id,
    kind: puzzle.target[id],
    initial: true,
    order,
  }))
}

export function ruleById(
  rules: readonly RuleDefinition[],
  ruleId: string | null,
): RuleDefinition | null {
  if (!ruleId) return null
  return rules.find((rule) => rule.id === ruleId) ?? null
}

