import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { allCells, lineCells, neighbors, rayCells, regionCells } from '@room-axioms/domain'
import { cellLabels } from '../data/case004'
import type { AnalysisResult } from '../logic/analysis'
import { createHint, kindIsInspectable, type Hint } from '../logic/hints'
import {
  initialActionLogForTarget,
  observationForTargetCell,
  observationMapForRevealed,
  targetGuestCells,
  targetKindForDeveloperOverlay,
} from '../logic/targetAccess'
import { createRuntimeAnalysisFacade, type RuntimeFacadeSnapshot } from '../runtime/facade'
import {
  createHintDialogueScene,
  staticDialogueSceneByCategory,
  type DialogueScene,
  type DialogueSceneCategory,
} from '../vn/dialogue'
import { nextDialogueLineIndex } from '../vn/dialogueNavigation'
import {
  loadVNPreferences,
  saveVNPreferences,
  type VNPreferences,
  type VNTextSpeed,
} from '../vn/preferences'
import type {
  AnalysisStatus,
  RuntimeAnalysis,
  RuntimeAnalysisError,
  RuntimeHint,
  RuntimeAnalysisWarning,
  RuntimeWorkerResponse,
} from '../runtime/contracts'
import type {
  CellId,
  CellKind,
  Observation,
  ObservationEntry,
  PlayerMark,
  PuzzleDefinition,
  RuleDefinition,
} from '@room-axioms/domain'
import type { SolverStats } from '@room-axioms/solver'
import type { Tool } from '../view/types'

type StatusKind = 'normal' | 'success' | 'error'
type ResultKind = 'success' | 'failure'
type MobilePanel = 'rules' | 'board' | 'evidence'

export type GuestConclusionEvaluation =
  | { readonly kind: 'incomplete'; readonly required: number; readonly marked: number }
  | { readonly kind: 'incorrect' }
  | { readonly kind: 'correct' }

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

export interface DialogueDialogState {
  readonly scene: DialogueScene
  readonly lineIndex: number
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
  readonly analysisLayoutCountText: string
  readonly analysisStatus: AnalysisStatus
  readonly analysisError: RuntimeAnalysisError | null
  readonly analysisWarnings: readonly RuntimeAnalysisWarning[]
  readonly analysisRequestId: number | null
  readonly runtimeAnalysis: RuntimeAnalysis | null
  readonly targetGuestCount: number
  readonly status: StatusMessage
  readonly hint: Hint | null
  readonly result: ResultDialogState | null
  readonly dialogue: DialogueDialogState | null
  readonly vnPreferences: VNPreferences
  readonly mobilePanel: MobilePanel
  readonly observedKind: (cellId: CellId) => CellKind | null
  readonly developerTargetKind: (cellId: CellId) => CellKind | null
  readonly setTool: (tool: Tool) => void
  readonly setHoveredCell: (cellId: CellId | null) => void
  readonly selectRule: (ruleId: string) => void
  readonly highlightedCells: (cellId: CellId) => readonly string[]
  readonly handleCell: (cellId: CellId) => void
  readonly cycleMark: (cellId: CellId) => void
  readonly requestHint: () => void
  readonly closeHint: () => void
  readonly advanceDialogue: () => void
  readonly closeDialogue: () => void
  readonly skipDialogue: () => void
  readonly replayCaseIntro: () => void
  readonly setVNEnabled: (enabled: boolean) => void
  readonly setVNReducedMotion: (enabled: boolean) => void
  readonly setVNTextSpeed: (speed: VNTextSpeed) => void
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
    initialActionLogForTarget(puzzle),
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
    text: initialStatusText(),
    kind: 'normal',
  })
  const [hint, setHint] = useState<Hint | null>(null)
  const [result, setResult] = useState<ResultDialogState | null>(null)
  const [dialogue, setDialogue] = useState<DialogueDialogState | null>(null)
  const [vnPreferences, setVNPreferences] = useState<VNPreferences>(() =>
    loadVNPreferences(browserPreferenceStorage()),
  )
  const shownDialogueCategories = useRef<Set<DialogueSceneCategory>>(new Set())
  const dialogueFocusReturnRef = useRef<HTMLElement | null>(null)
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>('board')
  const [analysis, setAnalysis] = useState<AnalysisResult>(() => emptyAnalysis())
  const [runtimeAnalysis, setRuntimeAnalysis] = useState<RuntimeAnalysis | null>(null)
  const [analysisSnapshot, setAnalysisSnapshot] = useState<RuntimeFacadeSnapshot>(() =>
    idleRuntimeSnapshot(),
  )
  const runtimeFacade = useMemo(
    () =>
      createRuntimeAnalysisFacade({
        onResponse: (response) => {
          setAnalysisSnapshot(snapshotFromResponse(response))
          if (response.status === 'ready') {
            setRuntimeAnalysis(response.analysis)
            setAnalysis(analysisResultFromRuntime(response.analysis))
          } else {
            setRuntimeAnalysis(null)
          }
        },
      }),
    [],
  )
  const targetGuests = useMemo(() => targetGuestCells(puzzle), [puzzle])

  const observations = useMemo(() => {
    return observationMapForRevealed(puzzle, revealed)
  }, [puzzle, revealed])

  useEffect(() => {
    const requestId = runtimeFacade.submit({
      kind: 'ANALYZE_STATE',
      puzzle,
      observations: observationsFromMap(observations),
      mode: devMode ? 'developer' : 'player',
      options: {
        includeNoGuessReport: devMode,
      },
    })

    return () => {
      runtimeFacade.cancel(requestId)
    }
  }, [devMode, observations, puzzle, runtimeFacade])

  const setStatusMessage = useCallback((text: string, kind: StatusKind = 'normal') => {
    setStatus({ text, kind })
  }, [])

  const restoreDialogueFocus = useCallback(() => {
    const target = dialogueFocusReturnRef.current
    dialogueFocusReturnRef.current = null
    if (target === null || !target.isConnected) return
    window.setTimeout(() => target.focus(), 0)
  }, [])

  const closeDialogue = useCallback(() => {
    setDialogue(null)
    restoreDialogueFocus()
  }, [restoreDialogueFocus])

  const updateVNPreferences = useCallback((next: VNPreferences) => {
    setVNPreferences(next)
    saveVNPreferences(browserPreferenceStorage(), next)
    if (!next.enabled) {
      setDialogue(null)
      restoreDialogueFocus()
    }
  }, [restoreDialogueFocus])

  const setVNEnabled = useCallback((enabled: boolean) => {
    updateVNPreferences({ ...vnPreferences, enabled })
  }, [updateVNPreferences, vnPreferences])

  const setVNReducedMotion = useCallback((enabled: boolean) => {
    updateVNPreferences({ ...vnPreferences, reducedMotion: enabled })
  }, [updateVNPreferences, vnPreferences])

  const setVNTextSpeed = useCallback((textSpeed: VNTextSpeed) => {
    updateVNPreferences({ ...vnPreferences, textSpeed })
  }, [updateVNPreferences, vnPreferences])

  const openDialogueScene = useCallback((scene: DialogueScene | null, options: { readonly force?: boolean } = {}) => {
    if (scene === null || (!vnPreferences.enabled && !options.force)) return
    if (!options.force && shownDialogueCategories.current.has(scene.category)) return
    shownDialogueCategories.current.add(scene.category)
    if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
      dialogueFocusReturnRef.current = document.activeElement
    }
    setDialogue({ scene, lineIndex: 0 })
  }, [vnPreferences.enabled])

  useEffect(() => {
    openDialogueScene(staticDialogueSceneByCategory('caseIntro'))
  }, [openDialogueScene])

  const advanceDialogue = useCallback(() => {
    setDialogue((current) => {
      if (current === null) return null
      const nextIndex = nextDialogueLineIndex(current.scene, current.lineIndex)
      if (nextIndex === null) return null
      return {
        scene: current.scene,
        lineIndex: nextIndex,
      }
    })
  }, [])

  const replayCaseIntro = useCallback(() => {
    openDialogueScene(staticDialogueSceneByCategory('caseIntro'), { force: true })
  }, [openDialogueScene])

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

  const observedKind = useCallback(
    (cellId: CellId) => observations.get(cellId) ?? null,
    [observations],
  )

  const developerTargetKind = useCallback(
    (cellId: CellId) => {
      if (!devMode || !showTarget || revealed.has(cellId)) return null
      return targetKindForDeveloperOverlay(puzzle, cellId)
    },
    [devMode, puzzle, revealed, showTarget],
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
      if (value === 'guest') openDialogueScene(staticDialogueSceneByCategory('firstAnomalyMark'))
    },
    [failed, openDialogueScene, revealed, setStatusMessage],
  )

  const inspect = useCallback(
    (cellId: CellId) => {
      if (revealed.has(cellId) || failed) return

      if (marks.get(cellId) === 'guest') {
        setStatusMessage(`${cellId} 已被你标记为访客。先撤销标记，再决定是否调查。`, 'error')
        return
      }

      const { kind } = observationForTargetCell(puzzle, cellId)
      setInspectCount((value) => value + 1)
      setHint(null)
      setRevealed((current) => new Set(current).add(cellId))
      setActionLog((current) => [
        ...current,
        { id: cellId, kind, initial: false, order: current.length },
      ])

      if (!kindIsInspectable(kind)) {
        setFailed(true)
        setResult({
          kind: 'failure',
          eyebrow: '调查失败',
          title: `${cellId} 是访客`,
          body: '这里有访客。你可以重开再试。',
          stats: [
            { label: '主动调查', value: inspectCount + 1 },
            { label: '提示次数', value: hintCount },
            { label: '触发访客', value: 1 },
          ],
        })
        openDialogueScene(staticDialogueSceneByCategory('failure'))
        return
      }

      setMarks((current) => {
        const next = new Map(current)
        next.delete(cellId)
        return next
      })
      setStatusMessage(`${cellId} 是${cellLabels[kind]}。`, 'success')
      openDialogueScene(staticDialogueSceneByCategory('firstSafeInspect'))
    },
    [failed, hintCount, inspectCount, marks, openDialogueScene, puzzle, revealed, setStatusMessage],
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
      if (marks.get(cellId) === undefined) openDialogueScene(staticDialogueSceneByCategory('firstAnomalyMark'))
    },
    [failed, marks, openDialogueScene, revealed],
  )

  const selectRule = useCallback(
    (ruleId: string) => {
      setSelectedRule((current) => (current === ruleId ? null : ruleId))
      openDialogueScene(staticDialogueSceneByCategory('firstRuleSelect'))
    },
    [openDialogueScene],
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

      if (rule.type === 'regionCount') {
        const region = puzzle.regions?.find((candidate) => candidate.id === rule.regionId)
        if (region !== undefined && regionCells(region, puzzle.board).includes(cellId)) {
          classes.push('scope-highlight')
        }
        if (hint?.highlight === cellId) classes.push('hint-highlight')
        return classes
      }

      if (rule.type === 'lineCount') {
        let lineScopeCells: readonly CellId[] = []
        switch (rule.scope.kind) {
          case 'row':
          case 'column':
            lineScopeCells = lineCells(rule.scope, puzzle.board)
            break
          case 'ray': {
            const stopAtKinds = rule.scope.stopAtKinds ?? []
            lineScopeCells = rule.origin === undefined
              ? []
              : rayCells(rule.origin, rule.scope.direction, puzzle.board, {
                  stopCells: allCells(puzzle.board).filter((id) => {
                    const kind = observations.get(id)
                    return kind !== undefined && stopAtKinds.includes(kind)
                  }),
                })
            break
          }
        }
        if (lineScopeCells.includes(cellId)) classes.push('scope-highlight')
        if (hint?.highlight === cellId) classes.push('hint-highlight')
        return classes
      }

      if (rule.type === 'anchorCount') {
        const anchor = puzzle.anchors?.find((candidate) => candidate.id === rule.anchorId)
        const visibleAnchors = anchor === undefined
          ? []
          : [...revealed].filter((id) => observations.get(id) === anchor.subject)
        if (visibleAnchors.includes(cellId)) classes.push('subject-highlight')
        if (rule.scope.kind === 'orthogonal' || rule.scope.kind === 'adjacent') {
          const scopeKind = rule.scope.kind
          if (visibleAnchors.some((anchorCell) => neighbors(anchorCell, scopeKind, puzzle.board).includes(cellId))) {
            classes.push('scope-highlight')
          }
        }
        if (hint?.highlight === cellId) classes.push('hint-highlight')
        return classes
      }

      if (rule.type === 'recordSet') {
        if (hint?.highlight === cellId) classes.push('hint-highlight')
        return classes
      }

      if (
        rule.type === 'scopeOverlapCount' ||
        rule.type === 'comparativeCount' ||
        rule.type === 'conditionalCount'
      ) {
        if (hint?.highlight === cellId) classes.push('hint-highlight')
        return classes
      }

      const visibleSubjects = [...revealed].filter((id) => observations.get(id) === rule.subject)
      if (visibleSubjects.includes(cellId)) classes.push('subject-highlight')
      if (visibleSubjects.some((subject) => neighbors(subject, rule.scope.kind, puzzle.board).includes(cellId))) {
        classes.push('scope-highlight')
      }
      if (hint?.highlight === cellId) classes.push('hint-highlight')

      return classes
    },
    [hint?.highlight, observations, puzzle, revealed, selectedRule],
  )

  const requestHint = useCallback(() => {
    const nextHint = createHint(puzzle, currentRuntimeHint(analysisSnapshot.status, runtimeAnalysis))
    setHintCount((value) => value + 1)
    setHint(nextHint)
    openDialogueScene(createHintDialogueScene(nextHint))
  }, [analysisSnapshot.status, openDialogueScene, puzzle, runtimeAnalysis])

  const submitConclusion = useCallback(() => {
    const guestMarks = [...marks.entries()]
      .filter(([, value]) => value === 'guest')
      .map(([id]) => id)
      .sort()
    const conclusion = evaluateGuestConclusion(targetGuests, guestMarks)

    if (conclusion.kind === 'incomplete') {
      setStatusMessage(`需要标出 ${conclusion.required} 名访客；现在标了 ${conclusion.marked} 名。`, 'error')
      return
    }

    if (conclusion.kind === 'incorrect') {
      setStatusMessage('这个答案不对。你可以继续改笔记。', 'error')
      return
    }

    setResult({
      kind: 'success',
      eyebrow: '调查完成',
      title: `${targetGuests.length} 名访客已经定位`,
      body: `你找到了所有访客：${guestMarks.join('、')}。`,
      stats: [
        { label: '访客标记', value: guestMarks.length },
        { label: '主动调查', value: inspectCount },
        { label: '提示次数', value: hintCount },
      ],
    })
    openDialogueScene(staticDialogueSceneByCategory('success'))
  }, [hintCount, inspectCount, marks, openDialogueScene, setStatusMessage, targetGuests])

  const reset = useCallback(() => {
    setRevealed(new Set(puzzle.initialReveals))
    setMarks(new Map())
    setActionLog(initialActionLogForTarget(puzzle))
    setTool('inspect')
    setSelectedRule(null)
    setHoveredCell(null)
    setShowTargetState(false)
    setFailed(false)
    setHintCount(0)
    setInspectCount(0)
    setHint(null)
    setResult(null)
    setDialogue(null)
    setStatusMessage(initialStatusText())
    restoreDialogueFocus()
  }, [puzzle, restoreDialogueFocus, setStatusMessage])

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
        closeDialogue()
        setSelectedRule(null)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [closeDialogue, requestHint])

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
    analysisLayoutCountText: layoutCountText(analysis),
    analysisStatus: analysisSnapshot.status,
    analysisError: analysisSnapshot.error,
    analysisWarnings: runtimeAnalysis?.warnings ?? [],
    analysisRequestId: analysisSnapshot.requestId,
    runtimeAnalysis,
    targetGuestCount: targetGuests.length,
    status,
    hint,
    result,
    dialogue,
    vnPreferences,
    mobilePanel,
    observedKind,
    developerTargetKind,
    setTool,
    setHoveredCell,
    selectRule,
    highlightedCells,
    handleCell,
    cycleMark,
    requestHint,
    closeHint: () => setHint(null),
    advanceDialogue,
    closeDialogue,
    skipDialogue: closeDialogue,
    replayCaseIntro,
    setVNEnabled,
    setVNReducedMotion,
    setVNTextSpeed,
    submitConclusion,
    closeResult: () => {
      setResult(null)
      setDialogue(null)
    },
    reset,
    setDevMode,
    setShowTarget,
    setMobilePanel,
  }
}

function browserPreferenceStorage(): Storage | undefined {
  if (typeof window === 'undefined') return undefined
  return window.localStorage
}

function observationsFromMap(observations: ReadonlyMap<CellId, CellKind>): readonly Observation[] {
  return [...observations.entries()].map(([cellId, kind]) => ({ cellId, kind }))
}

function currentRuntimeHint(
  status: AnalysisStatus,
  runtimeAnalysis: RuntimeAnalysis | null,
): RuntimeHint | null {
  if (status !== 'ready' || runtimeAnalysis === null) return null
  if (
    runtimeAnalysis.warnings.some(
      (warning) => warning.code === 'SOLVER_TRUNCATED' || warning.code === 'STATE_UNSAT',
    )
  ) {
    return null
  }

  return runtimeAnalysis.hint
}

function layoutCountText(analysis: AnalysisResult): string {
  const prefix = analysis.layoutCountGreaterThan === undefined ? '' : '>'
  return `${prefix}${analysis.layoutCount}`
}

function analysisResultFromRuntime(runtimeAnalysis: RuntimeAnalysis): AnalysisResult {
  const layoutCount = runtimeAnalysis.candidateGuestLayouts

  return {
    layouts: legacyLayoutSummary(layoutCount, runtimeAnalysis.uniqueGuestCells),
    layoutCount,
    ...(runtimeAnalysis.candidateGuestLayoutsGreaterThan === undefined
      ? {}
      : { layoutCountGreaterThan: runtimeAnalysis.candidateGuestLayoutsGreaterThan }),
    binCandidates: runtimeAnalysis.binCandidates,
    forcedSafe: runtimeAnalysis.forcedSafe,
    forcedGuests: runtimeAnalysis.forcedGuests,
    unique: runtimeAnalysis.guestLayoutUnique,
    satisfiable: runtimeAnalysis.satisfiable,
    truncated: runtimeAnalysis.stats.solver.truncated,
    stats: runtimeAnalysis.stats.solver,
    elapsed: runtimeAnalysis.stats.elapsedMs,
  }
}

function legacyLayoutSummary(
  count: number,
  uniqueGuestCells: readonly CellId[] | null,
): readonly (readonly CellId[])[] {
  if (count === 1 && uniqueGuestCells !== null) return [uniqueGuestCells]
  return Array.from({ length: count }, () => [])
}

function emptyAnalysis(): AnalysisResult {
  return {
    layouts: [],
    layoutCount: 0,
    binCandidates: [],
    forcedSafe: [],
    forcedGuests: [],
    unique: false,
    satisfiable: false,
    truncated: false,
    stats: zeroStats(),
    elapsed: 0,
  }
}

function idleRuntimeSnapshot(): RuntimeFacadeSnapshot {
  return {
    requestId: null,
    status: 'idle',
    analysis: null,
    error: null,
  }
}

function snapshotFromResponse(response: RuntimeWorkerResponse): RuntimeFacadeSnapshot {
  switch (response.status) {
    case 'loading':
      return {
        requestId: response.requestId,
        status: 'loading',
        analysis: null,
        error: null,
      }
    case 'ready':
      return {
        requestId: response.requestId,
        status: 'ready',
        analysis: response.analysis,
        error: null,
      }
    case 'error':
      return {
        requestId: response.requestId,
        status: 'error',
        analysis: null,
        error: response.error,
      }
    case 'stale':
      return {
        requestId: response.requestId,
        status: 'stale',
        analysis: null,
        error: null,
      }
  }
}

function zeroStats(): SolverStats {
  return {
    nodeCount: 0,
    propagationCount: 0,
    truncated: false,
  }
}

export function ruleById(
  rules: readonly RuleDefinition[],
  ruleId: string | null,
): RuleDefinition | null {
  if (!ruleId) return null
  return rules.find((rule) => rule.id === ruleId) ?? null
}

export function evaluateGuestConclusion(
  targetGuestCells: readonly CellId[],
  markedGuestCells: readonly CellId[],
): GuestConclusionEvaluation {
  if (markedGuestCells.length !== targetGuestCells.length) {
    return {
      kind: 'incomplete',
      required: targetGuestCells.length,
      marked: markedGuestCells.length,
    }
  }

  return markedGuestCells.join(',') === targetGuestCells.join(',')
    ? { kind: 'correct' }
    : { kind: 'incorrect' }
}

function initialStatusText(): string {
  return '选择格子调查，或先做访客/安全笔记。'
}
