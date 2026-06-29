import { ArrowDown, ArrowUp, Copy, FileDown, FolderOpen, Plus, RotateCcw, Save, Trash2, Upload } from 'lucide-react'
import type { CSSProperties } from 'react'
import { useEffect, useMemo, useState } from 'react'

import { updateDraftJsonText, type WorkbenchDraftState } from '@room-axioms/authoring/drafts'
import type { AuthoringDiagnosticsGroup, AuthoringDraftDiagnosticsReport } from '@room-axioms/authoring/diagnostics'
import {
  duplicateRuleBuilderDraft,
  moveRuleBuilderDraft,
  type RuleBuilderCreateForm,
  type RuleBuilderDraft,
  updateRuleBuilderComparison,
  updateRuleBuilderConditionalClause,
  updateRuleBuilderDirectCount,
  updateRuleBuilderDirectTarget,
  updateRuleBuilderForEachScopeKind,
  updateRuleBuilderForEachSubject,
  updateRuleBuilderLineOrigin,
  updateRuleBuilderLineScope,
  updateRuleBuilderOverlapMode,
  updateRuleBuilderRegionId,
} from '@room-axioms/authoring/rule-builder'
import type {
  BoardSize,
  CellId,
  CellKind,
  Comparator,
  CountComparison,
  Direction,
  LineCountRule,
  LocalScopeKind,
  PuzzleDefinition,
  RegionDefinition,
  StaticLineScope,
  ScopeOverlapMode,
} from '@room-axioms/domain'

import { DEFAULT_CASE_ID } from '../content/cases'
import { createThemeAssetReviewReport, type ThemeAssetReviewReport } from '../theme/assetReview'
import { DEFAULT_THEME_ASSET_MANIFEST } from '../theme/assetManifest'
import { STATIC_DIALOGUE_SCENES } from '../vn/dialogue'
import { getWorkbenchCaseImportById, workbenchCaseLibrary, type WorkbenchCaseSource } from './caseLibrary'
import {
  createBlankLocalCaseFromTemplate,
  createBrowserLocalCaseStore,
  createLocalCaseFromTemplate,
  groupLocalCases,
  publishLocalCase,
  retractLocalCase,
  saveLocalCaseDraft,
  type WorkbenchLocalCaseRecord,
  type WorkbenchLocalCaseState,
} from './localCaseLibrary'
import {
  beginWorkbenchDiagnostics,
  completeWorkbenchDiagnostics,
  createWorkbenchDraftFromPuzzle,
  createWorkbenchDiagnosticsState,
  createWorkbenchDiagnosticsOverview,
  createWorkbenchDiagnosticsGroupDetails,
  createWorkbenchRulesJson,
  createWorkbenchScopeCollectionsJson,
  createWorkbenchShellModel,
  defaultWorkbenchDiagnosticsCaps,
  diagnosticsReportForState,
  evaluateWorkbenchDiagnostics,
  failWorkbenchDiagnostics,
  markWorkbenchDiagnosticsStale,
  patchWorkbenchBoardSize,
  patchWorkbenchMetadata,
  patchWorkbenchRuleBuilderCreateRule,
  patchWorkbenchRuleBuilderDrafts,
  patchWorkbenchRulePresentation,
  patchWorkbenchRulesJson,
  patchWorkbenchScopeCollectionsJson,
  patchWorkbenchTargetCell,
  toggleWorkbenchInitialReveal,
  workbenchCellKindOptions,
  type WorkbenchBoardCell,
  type WorkbenchDiagnosticsGroupDetail,
  type WorkbenchDiagnosticsOverview,
  type WorkbenchDiagnosticsCaps,
  type WorkbenchDiagnosticsState,
  type WorkbenchRuleSummary,
} from './model'

type DraftPatchStatus =
  | { readonly kind: 'idle' }
  | { readonly kind: 'applied'; readonly message: string }
  | { readonly kind: 'rejected'; readonly message: string; readonly issues: readonly string[] }

type LibraryActionStatus =
  | { readonly kind: 'idle' }
  | { readonly kind: 'info' | 'success' | 'error'; readonly message: string }

const METADATA_STATUSES = ['draft', 'validated', 'published', 'deprecated'] as const
const RULE_BUILDER_KIND_OPTIONS: readonly CellKind[] = ['empty', 'bottle', 'bin', 'mirror', 'guest']
const COMPARATOR_OPS: readonly Comparator['op'][] = ['eq', 'neq', 'gt', 'gte', 'lt', 'lte']
const COMPARISON_OPS: readonly CountComparison['op'][] = ['eq', 'neq', 'gt', 'gte', 'lt', 'lte']
const OVERLAP_MODES: readonly ScopeOverlapMode[] = ['intersection', 'union', 'leftOnly', 'rightOnly']
const DIRECTION_OPTIONS: readonly Direction[] = ['north', 'south', 'east', 'west']
const RULE_CREATE_FORMS: readonly RuleBuilderCreateForm[] = [
  'globalCount',
  'forEachCount',
  'rowCount',
  'columnCount',
  'cornersCount',
  'regionCount',
  'edgeCount',
  'interiorCount',
  'lineOfSightExists',
  'lineOfSightNone',
]

export default function AuthoringWorkbenchScreen() {
  const defaultCase = getWorkbenchCaseImportById(DEFAULT_CASE_ID).puzzle
  const localCaseStore = useMemo(() => createBrowserLocalCaseStore(), [])
  const [selectedCaseId, setSelectedCaseId] = useState(DEFAULT_CASE_ID)
  const [selectedLocalCaseId, setSelectedLocalCaseId] = useState<string | undefined>()
  const [localCases, setLocalCases] = useState<readonly WorkbenchLocalCaseRecord[]>([])
  const [libraryStatus, setLibraryStatus] = useState<LibraryActionStatus>({ kind: 'idle' })
  const [draft, setDraft] = useState<WorkbenchDraftState>(() => createWorkbenchDraftFromPuzzle(defaultCase))
  const [diagnosticsState, setDiagnosticsState] = useState<WorkbenchDiagnosticsState>(
    () => createWorkbenchDiagnosticsState(),
  )
  const [diagnosticsCaps, setDiagnosticsCaps] = useState<WorkbenchDiagnosticsCaps>(
    () => defaultWorkbenchDiagnosticsCaps(),
  )
  const [selectedCellId, setSelectedCellId] = useState<CellId | undefined>()
  const [selectedRuleId, setSelectedRuleId] = useState<string | undefined>()
  const [activeKind, setActiveKind] = useState<CellKind>('empty')
  const [patchStatus, setPatchStatus] = useState<DraftPatchStatus>({ kind: 'idle' })
  const [ruleBuilderPatchStatus, setRuleBuilderPatchStatus] = useState<DraftPatchStatus>({ kind: 'idle' })
  const [rulePatchStatus, setRulePatchStatus] = useState<DraftPatchStatus>({ kind: 'idle' })
  const [rulesPatchStatus, setRulesPatchStatus] = useState<DraftPatchStatus>({ kind: 'idle' })
  const [scopePatchStatus, setScopePatchStatus] = useState<DraftPatchStatus>({ kind: 'idle' })
  const [metadataPatchStatus, setMetadataPatchStatus] = useState<DraftPatchStatus>({ kind: 'idle' })
  const [boardWidthText, setBoardWidthText] = useState(String(defaultCase.board.width))
  const [boardHeightText, setBoardHeightText] = useState(String(defaultCase.board.height))
  const [ruleTitleText, setRuleTitleText] = useState('')
  const [ruleFlavorText, setRuleFlavorText] = useState('')
  const [metadataTitleText, setMetadataTitleText] = useState(defaultCase.title)
  const [metadataCaseNameText, setMetadataCaseNameText] = useState(defaultCase.caseName ?? '')
  const [metadataDifficultyText, setMetadataDifficultyText] = useState(String(defaultCase.metadata.difficulty))
  const [metadataTagsText, setMetadataTagsText] = useState(defaultCase.metadata.tags.join(', '))
  const [metadataStatusText, setMetadataStatusText] = useState<string>(defaultCase.metadata.status)
  const [metadataNotesText, setMetadataNotesText] = useState(defaultCase.metadata.notes ?? '')
  const [rulesJsonText, setRulesJsonText] = useState(() => createWorkbenchRulesJson(defaultCase))
  const [scopeCollectionsText, setScopeCollectionsText] = useState(() => createWorkbenchScopeCollectionsJson(defaultCase))
  const selectedLocalCase = selectedLocalCaseId === undefined
    ? undefined
    : localCases.find((record) => record.localId === selectedLocalCaseId)
  const localGroups = useMemo(() => groupLocalCases(localCases), [localCases])
  const model = useMemo(
    () => createWorkbenchShellModel(workbenchCaseLibrary, selectedCaseId, draft),
    [draft, selectedCaseId],
  )
  const themeReview = useMemo(
    () => createThemeAssetReviewReport(DEFAULT_THEME_ASSET_MANIFEST, STATIC_DIALOGUE_SCENES),
    [],
  )
  const parsedPuzzle = model.parse.ok ? model.parse.puzzle : undefined
  const selectedCell = selectedCellId === undefined
    ? undefined
    : model.boardCells.find((cell) => cell.id === selectedCellId)
  const selectedRule = selectedRuleId === undefined
    ? undefined
    : model.ruleSummaries.find((rule) => rule.id === selectedRuleId)
  const kindOptions = workbenchCellKindOptions(parsedPuzzle, selectedCell?.kind ?? activeKind)

  useEffect(() => {
    let cancelled = false
    localCaseStore.loadAll()
      .then((records) => {
        if (!cancelled) setLocalCases(records)
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setLibraryStatus({
            kind: 'error',
            message: error instanceof Error ? error.message : '本地案例库读取失败。',
          })
        }
      })

    return () => {
      cancelled = true
    }
  }, [localCaseStore])

  function loadCase(caseId: string): void {
    if (!confirmDiscardUnsavedChanges()) return
    const item = getWorkbenchCaseImportById(caseId)
    setSelectedLocalCaseId(undefined)
    setSelectedCaseId(caseId)
    applyLoadedDraft(createWorkbenchDraftFromPuzzle(item.puzzle), item.puzzle)
    setLibraryStatus({
      kind: 'info',
      message: '已载入内置模板；保存时会复制为本地草稿，不会改动仓库案例。',
    })
  }

  function loadLocalCase(record: WorkbenchLocalCaseRecord): void {
    if (!confirmDiscardUnsavedChanges()) return
    const nextDraft = updateDraftJsonText(createWorkbenchDraftFromPuzzle(defaultCase), record.jsonText)
    const puzzle = parsePuzzleJson(record.jsonText)
    setSelectedLocalCaseId(record.localId)
    setSelectedCaseId(record.localId)
    applyLoadedDraft(nextDraft, puzzle)
    setLibraryStatus({
      kind: 'info',
      message: `${record.state === 'published' ? '已发布' : '草稿'}案例已载入。`,
    })
  }

  function applyLoadedDraft(nextDraft: WorkbenchDraftState, puzzle: PuzzleDefinition | undefined): void {
    setDraft(nextDraft)
    setDiagnosticsState(createWorkbenchDiagnosticsState())
    setSelectedCellId(undefined)
    setSelectedRuleId(undefined)
    setActiveKind('empty')
    setBoardWidthText(puzzle === undefined ? '' : String(puzzle.board.width))
    setBoardHeightText(puzzle === undefined ? '' : String(puzzle.board.height))
    setRuleTitleText('')
    setRuleFlavorText('')
    syncMetadataEditor(puzzle)
    setRulesJsonText(createWorkbenchRulesJson(puzzle))
    setScopeCollectionsText(createWorkbenchScopeCollectionsJson(puzzle))
    setPatchStatus({ kind: 'idle' })
    setRuleBuilderPatchStatus({ kind: 'idle' })
    setRulePatchStatus({ kind: 'idle' })
    setRulesPatchStatus({ kind: 'idle' })
    setScopePatchStatus({ kind: 'idle' })
    setMetadataPatchStatus({ kind: 'idle' })
  }

  function resetCurrentCase(): void {
    if (selectedLocalCase !== undefined) {
      loadLocalCase(selectedLocalCase)
      return
    }

    loadCase(selectedCaseId)
  }

  async function createNewLocalCase(): Promise<void> {
    if (!confirmDiscardUnsavedChanges()) return
    const record = createBlankLocalCaseFromTemplate(defaultCase, {
      localId: createLocalCaseId(),
    })
    await localCaseStore.put(record)
    await refreshLocalCases()
    loadLocalCase(record)
    setLibraryStatus({ kind: 'success', message: '新草稿已创建并保存在本地浏览器。' })
  }

  async function copySelectedCaseToDraft(): Promise<void> {
    if (parsedPuzzle === undefined) {
      setLibraryStatus({ kind: 'error', message: '当前案例无效，不能复制为本地草稿。' })
      return
    }

    const record = createLocalCaseFromTemplate(parsedPuzzle, {
      localId: createLocalCaseId(),
      title: `${parsedPuzzle.caseName ?? parsedPuzzle.title} 副本`,
    })
    await localCaseStore.put(record)
    await refreshLocalCases()
    loadLocalCase(record)
    setLibraryStatus({ kind: 'success', message: '已复制为本地草稿；内置模板保持不变。' })
  }

  async function saveCurrentCase(): Promise<void> {
    if (parsedPuzzle === undefined) {
      setLibraryStatus({ kind: 'error', message: '当前草稿还不能解析，暂时不能保存。' })
      return
    }

    if (selectedLocalCase === undefined) {
      const record = createLocalCaseFromTemplate(parsedPuzzle, {
        localId: createLocalCaseId(),
        title: parsedPuzzle.caseName ?? parsedPuzzle.title,
      })
      await localCaseStore.put(record)
      await refreshLocalCases()
      setSelectedLocalCaseId(record.localId)
      setSelectedCaseId(record.localId)
      setDraft(updateDraftJsonText(draft, record.jsonText))
      setLibraryStatus({ kind: 'success', message: '内置模板已复制并保存为本地草稿。' })
      return
    }

    const result = saveLocalCaseDraft(selectedLocalCase, draft)
    if (!result.ok) {
      setLibraryStatus({ kind: 'error', message: result.message })
      return
    }

    await localCaseStore.put(result.record)
    await refreshLocalCases()
    setLibraryStatus({ kind: 'success', message: '本地案例已保存。' })
  }

  async function publishCurrentCase(): Promise<void> {
    const record = await saveLocalCaseBeforeStateChange()
    if (record === undefined) return

    const published = publishLocalCase(record)
    await localCaseStore.put(published)
    await refreshLocalCases()
    setLibraryStatus({ kind: 'success', message: '已移入本地“已发布”。这不会提交到仓库。' })
  }

  async function retractCurrentCase(): Promise<void> {
    if (selectedLocalCase === undefined) {
      setLibraryStatus({ kind: 'error', message: '内置模板不能撤回；请先复制成本地草稿。' })
      return
    }

    const retracted = retractLocalCase(selectedLocalCase)
    await localCaseStore.put(retracted)
    await refreshLocalCases()
    setLibraryStatus({ kind: 'success', message: '已撤回到本地草稿。' })
  }

  async function deleteCurrentCase(): Promise<void> {
    if (selectedLocalCase === undefined) {
      setLibraryStatus({ kind: 'error', message: '内置模板不能删除；只能复制或参考。' })
      return
    }

    if (!globalThis.confirm(`删除本地案例“${selectedLocalCase.title}”？此操作只影响当前浏览器。`)) return
    await localCaseStore.delete(selectedLocalCase.localId)
    await refreshLocalCases()
    setSelectedLocalCaseId(undefined)
    loadCase(DEFAULT_CASE_ID)
    setLibraryStatus({ kind: 'success', message: '本地案例已删除；仓库内置案例未受影响。' })
  }

  async function saveLocalCaseBeforeStateChange(): Promise<WorkbenchLocalCaseRecord | undefined> {
    if (selectedLocalCase === undefined) {
      await saveCurrentCase()
      const records = await localCaseStore.loadAll()
      const newest = records[0]
      if (newest !== undefined) setLocalCases(records)
      return newest
    }

    const result = saveLocalCaseDraft(selectedLocalCase, draft)
    if (!result.ok) {
      setLibraryStatus({ kind: 'error', message: result.message })
      return undefined
    }

    return result.record
  }

  async function refreshLocalCases(): Promise<readonly WorkbenchLocalCaseRecord[]> {
    const records = await localCaseStore.loadAll()
    setLocalCases(records)
    return records
  }

  function confirmDiscardUnsavedChanges(): boolean {
    if (!draft.dirty) return true
    return globalThis.confirm('当前草稿有未保存修改。继续切换会丢失这些修改，是否继续？')
  }

  function updateDraftText(jsonText: string): void {
    setDraft(updateDraftJsonText(draft, jsonText))
    setDiagnosticsState((current) => markWorkbenchDiagnosticsStale(current))
    setSelectedCellId(undefined)
    setSelectedRuleId(undefined)
    setActiveKind('empty')
    setBoardWidthText('')
    setBoardHeightText('')
    setRuleTitleText('')
    setRuleFlavorText('')
    syncMetadataEditor(undefined)
    setRulesJsonText('')
    setScopeCollectionsText('')
    setPatchStatus({ kind: 'idle' })
    setRuleBuilderPatchStatus({ kind: 'idle' })
    setRulePatchStatus({ kind: 'idle' })
    setRulesPatchStatus({ kind: 'idle' })
    setScopePatchStatus({ kind: 'idle' })
    setMetadataPatchStatus({ kind: 'idle' })
  }

  function runDiagnostics(): void {
    const started = beginWorkbenchDiagnostics(diagnosticsState)
    const requestId = started.requestId
    const caps = diagnosticsCaps
    const comparisonPuzzles = workbenchCaseLibrary
      .map((item) => item.puzzle)
      .filter((puzzle) => puzzle.id !== parsedPuzzle?.id)
    setDiagnosticsState(started)
    globalThis.setTimeout(() => {
      try {
        const report = evaluateWorkbenchDiagnostics(draft, selectedCaseId, caps, comparisonPuzzles)
        setDiagnosticsState((current) => completeWorkbenchDiagnostics(current, requestId, report))
      } catch (error) {
        setDiagnosticsState((current) => failWorkbenchDiagnostics(current, requestId, error))
      }
    }, 0)
  }

  function updateDiagnosticsCap(field: keyof WorkbenchDiagnosticsCaps, value: number): void {
    if (!Number.isInteger(value) || value < 1) return
    setDiagnosticsCaps((current) => ({
      ...current,
      [field]: value,
    }))
    setDiagnosticsState((current) => markWorkbenchDiagnosticsStale(
      current,
      'Diagnostics caps changed. Re-run diagnostics before trusting these results.',
    ))
  }

  function selectBoardCell(cell: WorkbenchBoardCell): void {
    setSelectedCellId(cell.id)
    setActiveKind(cell.kind)
    setPatchStatus({ kind: 'idle' })
  }

  function selectRule(rule: WorkbenchRuleSummary): void {
    setSelectedRuleId(rule.id)
    setRuleTitleText(rule.title)
    setRuleFlavorText(rule.flavor ?? '')
    setRulePatchStatus({ kind: 'idle' })
  }

  function selectRuleById(ruleId: string): void {
    const rule = model.ruleSummaries.find((candidate) => candidate.id === ruleId)
    if (rule !== undefined) selectRule(rule)
  }

  function applyRuleBuilderDraftsPatch(
    ruleDrafts: readonly RuleBuilderDraft[],
    message: string,
    nextSelectedRuleId: string | undefined = selectedRuleId,
  ): void {
    const patch = patchWorkbenchRuleBuilderDrafts(draft, ruleDrafts)
    if (!patch.ok) {
      setRuleBuilderPatchStatus({
        kind: 'rejected',
        message: '规则表达式未应用。',
        issues: patch.issues.map((issue) => `${issue.code}: ${issue.message}`),
      })
      return
    }

    const nextRule = nextSelectedRuleId === undefined
      ? undefined
      : patch.puzzle.rules.find((rule) => rule.id === nextSelectedRuleId)
    setDraft(patch.state)
    setDiagnosticsState((current) => markWorkbenchDiagnosticsStale(current))
    setRulesJsonText(createWorkbenchRulesJson(patch.puzzle))
    setRuleBuilderPatchStatus({ kind: 'applied', message })

    if (nextRule === undefined) {
      setSelectedRuleId(undefined)
      setRuleTitleText('')
      setRuleFlavorText('')
      setRulePatchStatus({ kind: 'idle' })
      return
    }

    setSelectedRuleId(nextRule.id)
    setRuleTitleText(nextRule.presentation.title)
    setRuleFlavorText(nextRule.presentation.flavor ?? '')
    setRulePatchStatus({ kind: 'idle' })
  }

  function duplicateBuilderRule(ruleId: string): void {
    const index = model.ruleBuilderDrafts.findIndex((candidate) => candidate.id === ruleId)
    const source = model.ruleBuilderDrafts[index]
    if (source === undefined) return

    const nextId = nextRuleDuplicateId(model.ruleBuilderDrafts, ruleId)
    const nextDrafts = [...model.ruleBuilderDrafts]
    nextDrafts.splice(index + 1, 0, duplicateRuleBuilderDraft(source, nextId))
    applyRuleBuilderDraftsPatch(nextDrafts, `${ruleId} 已复制为 ${nextId}。`, nextId)
  }

  function removeBuilderRule(ruleId: string): void {
    const index = model.ruleBuilderDrafts.findIndex((candidate) => candidate.id === ruleId)
    if (index < 0) return

    const nextDrafts = model.ruleBuilderDrafts.filter((candidate) => candidate.id !== ruleId)
    const nextSelectedRuleId = selectedRuleId === ruleId
      ? nextDrafts[Math.min(index, nextDrafts.length - 1)]?.id
      : selectedRuleId
    applyRuleBuilderDraftsPatch(nextDrafts, `${ruleId} 已从草稿规则列表移除。`, nextSelectedRuleId)
  }

  function moveBuilderRule(ruleId: string, direction: -1 | 1): void {
    const index = model.ruleBuilderDrafts.findIndex((candidate) => candidate.id === ruleId)
    if (index < 0) return

    const nextIndex = index + direction
    const nextDrafts = moveRuleBuilderDraft(model.ruleBuilderDrafts, index, nextIndex)
    applyRuleBuilderDraftsPatch(nextDrafts, `${ruleId} 已调整顺序。`, ruleId)
  }

  function updateBuilderRule(
    ruleId: string,
    updater: (draft: RuleBuilderDraft) => RuleBuilderDraft,
  ): void {
    const index = model.ruleBuilderDrafts.findIndex((candidate) => candidate.id === ruleId)
    const source = model.ruleBuilderDrafts[index]
    if (source === undefined) return

    const next = updater(source)
    if (next === source) return
    const nextDrafts = [...model.ruleBuilderDrafts]
    nextDrafts[index] = next
    applyRuleBuilderDraftsPatch(nextDrafts, `${ruleId} 已从结构化控件更新。`, ruleId)
  }

  function createBuilderRule(form: RuleBuilderCreateForm): void {
    const patch = patchWorkbenchRuleBuilderCreateRule(draft, { form })
    if (!patch.ok) {
      setRuleBuilderPatchStatus({
        kind: 'rejected',
        message: '新规则未创建。',
        issues: patch.issues.map((issue) => `${issue.code}: ${issue.message}`),
      })
      return
    }

    const nextRule = patch.puzzle.rules[patch.puzzle.rules.length - 1]
    setDraft(patch.state)
    setDiagnosticsState((current) => markWorkbenchDiagnosticsStale(current))
    setRulesJsonText(createWorkbenchRulesJson(patch.puzzle))
    setScopeCollectionsText(createWorkbenchScopeCollectionsJson(patch.puzzle))
    setSelectedRuleId(nextRule?.id)
    setRuleTitleText(nextRule?.presentation.title ?? '')
    setRuleFlavorText(nextRule?.presentation.flavor ?? '')
    setRuleBuilderPatchStatus({
      kind: 'applied',
      message: `${ruleCreateFormLabel(form)} 已加入草稿；请重新运行诊断。`,
    })
    setRulePatchStatus({ kind: 'idle' })
  }

  function applyTargetCellPatch(): void {
    if (selectedCellId === undefined) return

    const patch = patchWorkbenchTargetCell(draft, selectedCellId, activeKind)
    if (!patch.ok) {
      setPatchStatus({
        kind: 'rejected',
        message: `${selectedCellId} 不能改成${kindLabel(activeKind)}。`,
        issues: patch.issues.map((issue) => `${issue.code}: ${issue.message}`),
      })
      return
    }

    applySuccessfulPatch(patch.state, `${selectedCellId} 已改成${kindLabel(activeKind)}；完整诊断已标记为待重新运行。`)
  }

  function toggleInitialRevealForSelectedCell(): void {
    if (selectedCellId === undefined) return

    const patch = toggleWorkbenchInitialReveal(draft, selectedCellId)
    if (!patch.ok) {
      setPatchStatus({
        kind: 'rejected',
        message: `${selectedCellId} 的初始揭示切换被拒绝。`,
        issues: patch.issues.map((issue) => `${issue.code}: ${issue.message}`),
      })
      return
    }

    const becameRevealed = patch.puzzle.initialReveals.includes(selectedCellId)
    applySuccessfulPatch(
      patch.state,
      `${selectedCellId} 已${becameRevealed ? '加入' : '移出'}初始揭示；完整诊断已标记为待重新运行。`,
    )
  }

  function applyBoardSizePatch(): void {
    const board = parseBoardSize(boardWidthText, boardHeightText)
    if (board === undefined) {
      setPatchStatus({
        kind: 'rejected',
        message: '棋盘尺寸未应用。',
        issues: ['BOARD_SIZE_INPUT: 宽和高必须是 1 到 26 之间的整数。'],
      })
      return
    }

    const patch = patchWorkbenchBoardSize(draft, board)
    if (!patch.ok) {
      setPatchStatus({
        kind: 'rejected',
        message: `${board.width} × ${board.height} 的棋盘尺寸被拒绝。`,
        issues: patch.issues.map((issue) => `${issue.code}: ${issue.message}`),
      })
      return
    }

    if (selectedCellId !== undefined && !patch.puzzle.target[selectedCellId]) {
      setSelectedCellId(undefined)
      setActiveKind('empty')
    }
    setBoardWidthText(String(patch.puzzle.board.width))
    setBoardHeightText(String(patch.puzzle.board.height))
    setRulesJsonText(createWorkbenchRulesJson(patch.puzzle))
    setScopeCollectionsText(createWorkbenchScopeCollectionsJson(patch.puzzle))
    applySuccessfulPatch(patch.state, `棋盘尺寸已改为 ${board.width} × ${board.height}；完整诊断已标记为待重新运行。`)
  }

  function applySuccessfulPatch(nextDraft: WorkbenchDraftState, message: string): void {
    setDraft(nextDraft)
    setDiagnosticsState((current) => markWorkbenchDiagnosticsStale(current))
    setPatchStatus({ kind: 'applied', message })
  }

  function applyRulePresentationPatch(): void {
    if (selectedRuleId === undefined) return

    const patch = patchWorkbenchRulePresentation(draft, {
      ruleId: selectedRuleId,
      title: ruleTitleText,
      flavor: ruleFlavorText.trim() === '' ? undefined : ruleFlavorText,
    })
    if (!patch.ok) {
      setRulePatchStatus({
        kind: 'rejected',
        message: `${selectedRuleId} 的规则文案未应用。`,
        issues: patch.issues.map((issue) => `${issue.code}: ${issue.message}`),
      })
      return
    }

    const nextRule = patch.puzzle.rules.find((rule) => rule.id === selectedRuleId)
    setDraft(patch.state)
    setDiagnosticsState((current) => markWorkbenchDiagnosticsStale(current))
    setRuleTitleText(nextRule?.presentation.title ?? ruleTitleText)
    setRuleFlavorText(nextRule?.presentation.flavor ?? '')
    setRulesJsonText(createWorkbenchRulesJson(patch.puzzle))
    setRulePatchStatus({
      kind: 'applied',
      message: `${selectedRuleId} 的标题和说明已更新；完整诊断已标记为待重新运行。`,
    })
  }

  function resetRulesEditor(): void {
    setRulesJsonText(createWorkbenchRulesJson(parsedPuzzle))
    setRulesPatchStatus({ kind: 'idle' })
  }

  function applyRulesPatch(): void {
    const patch = patchWorkbenchRulesJson(draft, rulesJsonText)
    if (!patch.ok) {
      setRulesPatchStatus({
        kind: 'rejected',
        message: '规则结构 JSON 未应用。',
        issues: patch.issues.map((issue) => `${issue.code}: ${issue.message}`),
      })
      return
    }

    const nextSelectedRule = selectedRuleId === undefined
      ? undefined
      : patch.puzzle.rules.find((rule) => rule.id === selectedRuleId)
    setDraft(patch.state)
    setDiagnosticsState((current) => markWorkbenchDiagnosticsStale(current))
    setRulesJsonText(createWorkbenchRulesJson(patch.puzzle))
    setRulesPatchStatus({
      kind: 'applied',
      message: '规则结构已更新；完整诊断已标记为待重新运行。',
    })

    if (selectedRuleId !== undefined && nextSelectedRule === undefined) {
      setSelectedRuleId(undefined)
      setRuleTitleText('')
      setRuleFlavorText('')
      setRulePatchStatus({ kind: 'idle' })
      return
    }

    if (nextSelectedRule !== undefined) {
      setRuleTitleText(nextSelectedRule.presentation.title)
      setRuleFlavorText(nextSelectedRule.presentation.flavor ?? '')
    }
  }

  function resetScopeCollectionsEditor(): void {
    setScopeCollectionsText(createWorkbenchScopeCollectionsJson(parsedPuzzle))
    setScopePatchStatus({ kind: 'idle' })
  }

  function applyScopeCollectionsPatch(): void {
    const patch = patchWorkbenchScopeCollectionsJson(draft, scopeCollectionsText)
    if (!patch.ok) {
      setScopePatchStatus({
        kind: 'rejected',
        message: '区域与参照物集合未应用。',
        issues: patch.issues.map((issue) => `${issue.code}: ${issue.message}`),
      })
      return
    }

    setDraft(patch.state)
    setDiagnosticsState((current) => markWorkbenchDiagnosticsStale(current))
    setScopeCollectionsText(createWorkbenchScopeCollectionsJson(patch.puzzle))
    setScopePatchStatus({
      kind: 'applied',
      message: '区域与参照物集合已更新；完整诊断已标记为待重新运行。',
    })
  }

  function applyMetadataPatch(): void {
    const difficulty = Number(metadataDifficultyText)
    if (!isMetadataDifficulty(difficulty)) {
      setMetadataPatchStatus({
        kind: 'rejected',
        message: '难度未应用。',
        issues: ['METADATA_DIFFICULTY_INPUT: 难度必须是 1 到 5。'],
      })
      return
    }

    if (!isMetadataStatus(metadataStatusText)) {
      setMetadataPatchStatus({
        kind: 'rejected',
        message: '状态未应用。',
        issues: ['METADATA_STATUS_INPUT: 状态必须是 draft、validated、published 或 deprecated。'],
      })
      return
    }

    const tags = metadataTagsText
      .split(/[\n,]/)
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)
    if (tags.length === 0) {
      setMetadataPatchStatus({
        kind: 'rejected',
        message: '标签未应用。',
        issues: ['METADATA_TAGS_INPUT: 至少需要一个非空标签。'],
      })
      return
    }

    const patch = patchWorkbenchMetadata(draft, {
      title: metadataTitleText,
      caseName: metadataCaseNameText.trim() === '' ? undefined : metadataCaseNameText,
      difficulty,
      tags,
      status: metadataStatusText,
      notes: metadataNotesText.trim() === '' ? undefined : metadataNotesText,
    })
    if (!patch.ok) {
      setMetadataPatchStatus({
        kind: 'rejected',
        message: '元数据未应用。',
        issues: patch.issues.map((issue) => `${issue.code}: ${issue.message}`),
      })
      return
    }

    setDraft(patch.state)
    setDiagnosticsState((current) => markWorkbenchDiagnosticsStale(current))
    syncMetadataEditor(patch.puzzle)
    setMetadataPatchStatus({
      kind: 'applied',
      message: '标题、难度、标签和备注已更新；完整诊断已标记为待重新运行。',
    })
  }

  function syncMetadataEditor(puzzle: PuzzleDefinition | undefined): void {
    setMetadataTitleText(puzzle?.title ?? '')
    setMetadataCaseNameText(puzzle?.caseName ?? '')
    setMetadataDifficultyText(puzzle === undefined ? '' : String(puzzle.metadata.difficulty))
    setMetadataTagsText(puzzle?.metadata.tags.join(', ') ?? '')
    setMetadataStatusText(puzzle?.metadata.status ?? 'draft')
    setMetadataNotesText(puzzle?.metadata.notes ?? '')
  }

  return (
    <div className="authoring-workbench">
      <header className="workbench-topbar">
        <div className="brand-block">
          <div className="brand-mark">A</div>
          <div>
            <div className="brand">出题工作台 <span>maintainer</span></div>
            <div className="case-name">{parsedPuzzle?.caseName ?? parsedPuzzle?.title ?? '未命名草稿'}</div>
          </div>
        </div>
        <div className="top-actions">
          <button className="ghost-button" type="button" onClick={() => void createNewLocalCase()}>
            <Plus size={16} aria-hidden="true" />
            新建
          </button>
          <button className="primary-button" type="button" onClick={() => void saveCurrentCase()}>
            <Save size={16} aria-hidden="true" />
            保存
          </button>
          {selectedLocalCase?.state === 'published' ? (
            <button className="ghost-button" type="button" onClick={() => void retractCurrentCase()}>
              <RotateCcw size={16} aria-hidden="true" />
              撤回
            </button>
          ) : (
            <button className="ghost-button" type="button" onClick={() => void publishCurrentCase()}>
              <Upload size={16} aria-hidden="true" />
              发布
            </button>
          )}
          <button className="ghost-button" type="button" onClick={resetCurrentCase}>
            <RotateCcw size={16} aria-hidden="true" />
            重载
          </button>
          <button className="ghost-button danger-action" type="button" onClick={() => void deleteCurrentCase()}>
            <Trash2 size={16} aria-hidden="true" />
            删除
          </button>
        </div>
      </header>

      <main className="workbench-shell">
        <section className="panel workbench-panel">
          <CaseLibraryPanel
            builtInCases={model.caseOptions}
            localDrafts={localGroups.draft}
            localPublished={localGroups.published}
            selectedBuiltInId={selectedLocalCaseId === undefined ? selectedCaseId : undefined}
            selectedLocalId={selectedLocalCaseId}
            status={libraryStatus}
            onSelectBuiltIn={loadCase}
            onSelectLocal={loadLocalCase}
            onCopyCurrent={() => void copySelectedCaseToDraft()}
          />
        </section>

        <section className="board-panel workbench-board-panel">
          <div className="board-heading">
            <div>
              <span className="eyebrow">Board</span>
              <h2>{parsedPuzzle === undefined ? '无有效棋盘' : `${parsedPuzzle.board.width} × ${parsedPuzzle.board.height}`}</h2>
            </div>
            <span className={model.parse.ok ? 'mode-badge success-badge' : 'mode-badge error-badge'}>
              {model.parse.ok ? 'Schema OK' : 'Schema Error'}
            </span>
          </div>
          <BoardSizeEditor
            widthText={boardWidthText}
            heightText={boardHeightText}
            disabled={parsedPuzzle === undefined}
            onWidthChange={setBoardWidthText}
            onHeightChange={setBoardHeightText}
            onApply={applyBoardSizePatch}
          />
          {parsedPuzzle === undefined ? (
            <IssueList issues={model.parse.issues.map((issue) => `${issue.code}: ${issue.message}`)} />
          ) : (
            <div
              className="workbench-board"
              style={{ '--workbench-board-width': parsedPuzzle.board.width } as CSSProperties}
            >
              {model.boardCells.map((cell) => (
                <button
                  type="button"
                  key={cell.id}
                  className={[
                    'workbench-cell',
                    cell.initiallyRevealed ? 'revealed' : '',
                    cell.guestTarget ? 'guest-target' : '',
                    selectedCellId === cell.id ? 'selected' : '',
                  ].filter(Boolean).join(' ')}
                  onClick={() => selectBoardCell(cell)}
                  aria-pressed={selectedCellId === cell.id}
                  aria-label={`${cell.id} ${kindLabel(cell.kind)}${cell.initiallyRevealed ? '，初始揭示' : ''}`}
                >
                  <span className="coord">{cell.id}</span>
                  <b>{kindLabel(cell.kind)}</b>
                  {cell.initiallyRevealed ? <small>初始</small> : null}
                </button>
              ))}
            </div>
          )}
          <CellFactEditor
            selectedCell={selectedCell}
            activeKind={activeKind}
            kindOptions={kindOptions}
            patchStatus={patchStatus}
            canPatch={parsedPuzzle !== undefined && selectedCell !== undefined}
            onKindChange={setActiveKind}
            onApply={applyTargetCellPatch}
            onToggleInitialReveal={toggleInitialRevealForSelectedCell}
          />
        </section>

        <aside className="panel workbench-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Diagnostics</span>
              <h2>检查</h2>
            </div>
            <button
              className="small-button"
              type="button"
              onClick={runDiagnostics}
              disabled={diagnosticsState.status === 'running'}
            >
              {diagnosticsState.status === 'running' ? '诊断中' : '运行诊断'}
            </button>
          </div>
          <WorkbenchStatus
            puzzle={parsedPuzzle}
            draft={draft}
            localState={selectedLocalCase?.state}
          />
          <DiagnosticsCapsEditor
            caps={diagnosticsCaps}
            disabled={diagnosticsState.status === 'running'}
            onCapChange={updateDiagnosticsCap}
          />
          <DiagnosticsSummary state={diagnosticsState} parseOk={model.parse.ok} />
          <section className="workbench-section">
            <h3>规则</h3>
            <div className="workbench-rule-list">
              {model.ruleSummaries.map((rule) => (
                <RuleSummary
                  key={rule.id}
                  rule={rule}
                  selected={selectedRuleId === rule.id}
                  onSelect={selectRule}
                />
              ))}
            </div>
          </section>
          <RuleExpressionBuilder
            drafts={model.ruleBuilderDrafts}
            selectedRuleId={selectedRuleId}
            patchStatus={ruleBuilderPatchStatus}
            allowedKinds={parsedPuzzle?.allowedKinds ?? []}
            regionOptions={parsedPuzzle?.regions ?? []}
            onSelectRuleId={selectRuleById}
            onDuplicateRule={duplicateBuilderRule}
            onRemoveRule={removeBuilderRule}
            onMoveRule={moveBuilderRule}
            onUpdateRule={updateBuilderRule}
            onCreateRule={createBuilderRule}
          />
          <RuleCopyEditor
            selectedRule={selectedRule}
            titleText={ruleTitleText}
            flavorText={ruleFlavorText}
            patchStatus={rulePatchStatus}
            canPatch={parsedPuzzle !== undefined && selectedRule !== undefined}
            onTitleChange={setRuleTitleText}
            onFlavorChange={setRuleFlavorText}
            onApply={applyRulePresentationPatch}
          />
          <MetadataEditor
            titleText={metadataTitleText}
            caseNameText={metadataCaseNameText}
            difficultyText={metadataDifficultyText}
            tagsText={metadataTagsText}
            statusText={metadataStatusText}
            notesText={metadataNotesText}
            patchStatus={metadataPatchStatus}
            canPatch={parsedPuzzle !== undefined}
            onTitleChange={setMetadataTitleText}
            onCaseNameChange={setMetadataCaseNameText}
            onDifficultyChange={setMetadataDifficultyText}
            onTagsChange={setMetadataTagsText}
            onStatusChange={setMetadataStatusText}
            onNotesChange={setMetadataNotesText}
            onApply={applyMetadataPatch}
          />
          <details className="workbench-section workbench-debug-details">
            <summary>开发者调试</summary>
            <div className="workbench-debug-body">
              <ImportExportSummary
                selectedOption={model.caseOptions.find((option) => option.id === selectedCaseId)}
                exportStatus={model.exportStatus}
              />
              <ThemeVNReviewSummary report={themeReview} />
              <label className="debug-json-label">
                草稿 JSON
                <textarea
                  className="draft-json-editor"
                  spellCheck={false}
                  value={draft.jsonText}
                  onChange={(event) => updateDraftText(event.target.value)}
                  aria-label="Draft JSON"
                />
              </label>
              <RulesJsonEditor
                jsonText={rulesJsonText}
                patchStatus={rulesPatchStatus}
                canPatch={parsedPuzzle !== undefined}
                onJsonTextChange={setRulesJsonText}
                onReset={resetRulesEditor}
                onApply={applyRulesPatch}
              />
              <ScopeCollectionsEditor
                jsonText={scopeCollectionsText}
                patchStatus={scopePatchStatus}
                canPatch={parsedPuzzle !== undefined}
                onJsonTextChange={setScopeCollectionsText}
                onReset={resetScopeCollectionsEditor}
                onApply={applyScopeCollectionsPatch}
              />
              <a
                className="small-button"
                href={model.exported.ok ? draftDownloadHref(model.exported.jsonText) : undefined}
                download={model.exportStatus.fileName}
                aria-disabled={!model.exported.ok}
              >
                <FileDown size={16} aria-hidden="true" />
                导出 JSON
              </a>
              <pre className="export-preview">{model.exported.ok ? model.exported.jsonText : 'JSON 当前无效'}</pre>
            </div>
          </details>
        </aside>
      </main>
    </div>
  )
}

function BoardSizeEditor({
  widthText,
  heightText,
  disabled,
  onWidthChange,
  onHeightChange,
  onApply,
}: {
  readonly widthText: string
  readonly heightText: string
  readonly disabled: boolean
  readonly onWidthChange: (value: string) => void
  readonly onHeightChange: (value: string) => void
  readonly onApply: () => void
}) {
  return (
    <section className="board-size-editor" aria-label="棋盘尺寸">
      <label>
        宽
        <input
          type="number"
          min="1"
          max="26"
          value={widthText}
          disabled={disabled}
          onChange={(event) => onWidthChange(event.target.value)}
        />
      </label>
      <label>
        高
        <input
          type="number"
          min="1"
          max="26"
          value={heightText}
          disabled={disabled}
          onChange={(event) => onHeightChange(event.target.value)}
        />
      </label>
      <button className="small-button" type="button" onClick={onApply} disabled={disabled}>
        应用尺寸
      </button>
    </section>
  )
}

function CaseLibraryPanel({
  builtInCases,
  localDrafts,
  localPublished,
  selectedBuiltInId,
  selectedLocalId,
  status,
  onSelectBuiltIn,
  onSelectLocal,
  onCopyCurrent,
}: {
  readonly builtInCases: ReturnType<typeof createWorkbenchShellModel>['caseOptions']
  readonly localDrafts: readonly WorkbenchLocalCaseRecord[]
  readonly localPublished: readonly WorkbenchLocalCaseRecord[]
  readonly selectedBuiltInId: string | undefined
  readonly selectedLocalId: string | undefined
  readonly status: LibraryActionStatus
  readonly onSelectBuiltIn: (caseId: string) => void
  readonly onSelectLocal: (record: WorkbenchLocalCaseRecord) => void
  readonly onCopyCurrent: () => void
}) {
  const shippedTemplates = builtInCases.filter((item) => item.source === 'shipped')

  return (
    <div className="case-library-panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">Library</span>
          <h2>案例库</h2>
        </div>
        <FolderOpen size={18} aria-hidden="true" />
      </div>
      <p className="case-library-note">
        本地案例只保存在当前浏览器；内置案例只能作为模板复制，不会被删除或改写。
      </p>
      <button className="small-button copy-current-button" type="button" onClick={onCopyCurrent}>
        <Copy size={15} aria-hidden="true" />
        复制当前为草稿
      </button>
      <LibraryStatusNotice status={status} />
      <CaseLibraryGroup
        title="草稿"
        emptyText="还没有本地草稿。"
        records={localDrafts}
        selectedLocalId={selectedLocalId}
        onSelectLocal={onSelectLocal}
      />
      <CaseLibraryGroup
        title="已发布"
        emptyText="还没有本地已发布案例。"
        records={localPublished}
        selectedLocalId={selectedLocalId}
        onSelectLocal={onSelectLocal}
      />
      <section className="case-library-group">
        <h3>内置模板</h3>
        <div className="case-library-list">
          {shippedTemplates.map((item) => (
            <button
              key={item.id}
              className={`case-library-item ${selectedBuiltInId === item.id ? 'selected' : ''}`}
              type="button"
              onClick={() => onSelectBuiltIn(item.id)}
              aria-pressed={selectedBuiltInId === item.id}
            >
              <b>{item.label}</b>
              <span>难度 {item.difficulty} · 只读模板</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}

function CaseLibraryGroup({
  title,
  emptyText,
  records,
  selectedLocalId,
  onSelectLocal,
}: {
  readonly title: string
  readonly emptyText: string
  readonly records: readonly WorkbenchLocalCaseRecord[]
  readonly selectedLocalId: string | undefined
  readonly onSelectLocal: (record: WorkbenchLocalCaseRecord) => void
}) {
  return (
    <section className="case-library-group">
      <h3>{title}</h3>
      {records.length === 0 ? (
        <p className="case-library-empty">{emptyText}</p>
      ) : (
        <div className="case-library-list">
          {records.map((record) => (
            <button
              key={record.localId}
              className={`case-library-item ${selectedLocalId === record.localId ? 'selected' : ''}`}
              type="button"
              onClick={() => onSelectLocal(record)}
              aria-pressed={selectedLocalId === record.localId}
            >
              <b>{record.caseName ?? record.title}</b>
              <span>{formatLocalCaseTime(record.updatedAt)}</span>
            </button>
          ))}
        </div>
      )}
    </section>
  )
}

function LibraryStatusNotice({ status }: { readonly status: LibraryActionStatus }) {
  if (status.kind === 'idle') return null

  return (
    <div className={`library-status ${status.kind}`}>
      {status.message}
    </div>
  )
}

function CellFactEditor({
  selectedCell,
  activeKind,
  kindOptions,
  patchStatus,
  canPatch,
  onKindChange,
  onApply,
  onToggleInitialReveal,
}: {
  readonly selectedCell: WorkbenchBoardCell | undefined
  readonly activeKind: CellKind
  readonly kindOptions: readonly CellKind[]
  readonly patchStatus: DraftPatchStatus
  readonly canPatch: boolean
  readonly onKindChange: (kind: CellKind) => void
  readonly onApply: () => void
  readonly onToggleInitialReveal: () => void
}) {
  return (
    <section className="cell-editor" aria-label="目标格编辑">
      <div>
        <span className="eyebrow">Cell facts</span>
        <h3>{selectedCell === undefined ? '选择一个格子' : `${selectedCell.id} · ${kindLabel(selectedCell.kind)}`}</h3>
        <p>
          {selectedCell === undefined
            ? '点击棋盘格后可修改目标对象；修改只进入当前草稿。'
            : selectedCell.initiallyRevealed
              ? '这个格子是初始揭示，改成访客会被语义检查拒绝。'
              : '修改目标对象后，需要重新运行完整诊断。'}
        </p>
      </div>
      <div className="cell-editor-controls">
        <label>
          对象
          <input
            type="checkbox"
            checked={activeKind === 'guest'}
            onChange={(event) => onKindChange(event.target.checked ? 'guest' : 'empty')}
            disabled={!canPatch}
          />
        </label>
        <div className="cell-object-toggles" aria-label="Objects">
          {kindOptions.filter((kind) => kind !== 'empty' && kind !== 'guest').map((kind) => (
            <label key={kind}>
              {kindLabel(kind)}
              <input
                type="checkbox"
                checked={activeKind === kind}
                disabled={!canPatch || activeKind === 'guest'}
                onChange={(event) => onKindChange(event.target.checked ? kind : 'empty')}
              />
            </label>
          ))}
        </div>
        <button className="small-button" type="button" onClick={onApply} disabled={!canPatch}>
          应用对象
        </button>
        <button className="small-button" type="button" onClick={onToggleInitialReveal} disabled={!canPatch}>
          {selectedCell?.initiallyRevealed ? '取消初始' : '设为初始'}
        </button>
      </div>
      <PatchStatus status={patchStatus} />
    </section>
  )
}

function PatchStatus({ status }: { readonly status: DraftPatchStatus }) {
  if (status.kind === 'idle') return null

  return (
    <div className={`patch-status ${status.kind}`}>
      <b>{status.message}</b>
      {status.kind === 'rejected' ? <IssueList issues={status.issues} /> : null}
    </div>
  )
}

function nextRuleDuplicateId(drafts: readonly RuleBuilderDraft[], ruleId: string): string {
  const usedIds = new Set(drafts.map((draft) => draft.id))
  let suffix = 2
  let candidate = `${ruleId}-copy`
  while (usedIds.has(candidate)) {
    candidate = `${ruleId}-copy-${suffix}`
    suffix += 1
  }
  return candidate
}

function parseNonNegativeInteger(text: string): number | undefined {
  const value = Number(text)
  if (!Number.isInteger(value) || value < 0) return undefined
  return value
}

function parsePositiveInteger(text: string): number | undefined {
  const value = Number(text)
  if (!Number.isInteger(value) || value < 1) return undefined
  return value
}

function comparatorOpLabel(op: Comparator['op']): string {
  switch (op) {
    case 'eq':
      return '恰好'
    case 'neq':
      return '不是'
    case 'gt':
      return '多于'
    case 'gte':
      return '至少'
    case 'lt':
      return '少于'
    case 'lte':
      return '至多'
  }
}

function directionLabel(direction: Direction): string {
  switch (direction) {
    case 'north':
      return '向上'
    case 'south':
      return '向下'
    case 'east':
      return '向右'
    case 'west':
      return '向左'
  }
}

function ruleCreateFormLabel(form: RuleBuilderCreateForm): string {
  switch (form) {
    case 'globalCount':
      return '全局数量'
    case 'forEachCount':
      return '每个对象周围/方向邻格'
    case 'regionCount':
      return '已有区域数量'
    case 'rowCount':
      return '第 N 行数量'
    case 'columnCount':
      return '第 N 列数量'
    case 'cornersCount':
      return '四个角落数量'
    case 'edgeCount':
      return '外圈边缘数量'
    case 'interiorCount':
      return '内侧区域数量'
    case 'lineOfSightExists':
      return '视线可见至少一个对象'
    case 'lineOfSightNone':
      return '视线内没有对象'
  }
}

function overlapModeLabel(mode: ScopeOverlapMode): string {
  switch (mode) {
    case 'intersection':
      return '共同部分'
    case 'union':
      return '合并范围'
    case 'leftOnly':
      return '只在左侧'
    case 'rightOnly':
      return '只在右侧'
  }
}

function RuleBuilderCoverage() {
  const rows: readonly {
    readonly label: string
    readonly status: 'authorable' | 'blocked'
    readonly detail: string
  }[] = [
    {
      label: '全局、行、列、已有区域、四角、边缘、内侧数量',
      status: 'authorable',
      detail: '通过结构化控件创建；四角/边缘/内侧会先物化为 generated region，再交给 schema 校验。',
    },
    {
      label: '局部上下左右/周围一圈/单方向邻格',
      status: 'authorable',
      detail: '支持存在、没有、恰好、至少、至多等数量谓词；目标和参照物都从 allowedKinds 选择。',
    },
    {
      label: '视线正向/负向可见',
      status: 'authorable',
      detail: '通过 lineCount ray 表达；起点格和方向可编辑，至少 1 表示可见，恰好 0 表示不可见。',
    },
    {
      label: 'all / 全部都是',
      status: 'blocked',
      detail: '当前 DSL 需要先安全展开为固定范围大小；控件阻塞该谓词，避免生成证明/求解器不一致的规则。',
    },
    {
      label: '对象组、任意物件、距离、first-visible、任意两类对象相对关系',
      status: 'blocked',
      detail: '表达式模型可记录方向，但当前 schema/proof promotion gate 尚未完整支持，保留为一等阻塞说明。',
    },
  ]

  return (
    <div className="rule-builder-coverage" aria-label="Rule builder authoring coverage">
      {rows.map((row) => (
        <article key={row.label} className={`rule-builder-coverage-item ${row.status}`}>
          <b>{row.label}</b>
          <span>{row.status === 'authorable' ? '可结构化创建' : '已阻塞'}</span>
          <p>{row.detail}</p>
        </article>
      ))}
    </div>
  )
}

function RuleExpressionBuilder({
  drafts,
  selectedRuleId,
  patchStatus,
  allowedKinds,
  regionOptions,
  onSelectRuleId,
  onDuplicateRule,
  onRemoveRule,
  onMoveRule,
  onUpdateRule,
  onCreateRule,
}: {
  readonly drafts: readonly RuleBuilderDraft[]
  readonly selectedRuleId: string | undefined
  readonly patchStatus: DraftPatchStatus
  readonly allowedKinds: readonly CellKind[]
  readonly regionOptions: readonly RegionDefinition[]
  readonly onSelectRuleId: (ruleId: string) => void
  readonly onDuplicateRule: (ruleId: string) => void
  readonly onRemoveRule: (ruleId: string) => void
  readonly onMoveRule: (ruleId: string, direction: -1 | 1) => void
  readonly onUpdateRule: (ruleId: string, updater: (draft: RuleBuilderDraft) => RuleBuilderDraft) => void
  readonly onCreateRule: (form: RuleBuilderCreateForm) => void
}) {
  const editableCount = drafts.filter((draft) => draft.support === 'editable').length

  return (
    <section className="workbench-section rule-expression-builder">
      <div className="rule-builder-heading">
        <div>
          <h3>规则表达式</h3>
          <p>从结构化控件生成中文说明；不可安全表达的形式会在这里显示阻塞原因，不要求作者手写规则 JSON。</p>
        </div>
        <span>{editableCount} / {drafts.length} editable</span>
      </div>
      <div className="rule-builder-create">
        <label>
          新增规则
          <select
            defaultValue=""
            onChange={(event) => {
              if (event.target.value === '') return
              onCreateRule(event.target.value as RuleBuilderCreateForm)
              event.currentTarget.value = ''
            }}
          >
            <option value="" disabled>选择结构化规则...</option>
            {RULE_CREATE_FORMS.map((form) => (
              <option key={form} value={form}>{ruleCreateFormLabel(form)}</option>
            ))}
          </select>
        </label>
      </div>
      <RuleBuilderCoverage />
      {drafts.length === 0 ? (
        <p className="rule-builder-empty">当前草稿没有可显示的规则表达式。</p>
      ) : (
        <div className="rule-builder-list">
          {drafts.map((draft, index) => (
            <div
              key={draft.id}
              className={`rule-builder-card ${selectedRuleId === draft.id ? 'selected' : ''}`}
            >
              <div className="rule-builder-card-head">
                <button
                  className="rule-builder-select"
                  type="button"
                  onClick={() => onSelectRuleId(draft.id)}
                  aria-pressed={selectedRuleId === draft.id}
                >
                  <b>{index + 1}. {draft.id}</b>
                </button>
                <span className={`rule-builder-support ${draft.support}`}>
                  {draft.support === 'editable' ? '结构化编辑' : '只读保留'}
                </span>
              </div>
              <div className="rule-builder-actions" aria-label={`${draft.id} rule actions`}>
                <button
                  type="button"
                  title="上移"
                  aria-label={`Move ${draft.id} up`}
                  disabled={index === 0}
                  onClick={() => onMoveRule(draft.id, -1)}
                >
                  <ArrowUp size={14} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  title="下移"
                  aria-label={`Move ${draft.id} down`}
                  disabled={index === drafts.length - 1}
                  onClick={() => onMoveRule(draft.id, 1)}
                >
                  <ArrowDown size={14} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  title="复制"
                  aria-label={`Duplicate ${draft.id}`}
                  onClick={() => onDuplicateRule(draft.id)}
                >
                  <Copy size={14} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  title="删除"
                  aria-label={`Remove ${draft.id}`}
                  onClick={() => onRemoveRule(draft.id)}
                >
                  <Trash2 size={14} aria-hidden="true" />
                </button>
              </div>
              <span className="rule-builder-family">{ruleBuilderFamilyLabel(draft.family)}</span>
              <strong>{draft.generatedText.title}</strong>
              <p>{draft.generatedText.flavor}</p>
              {draft.generatedText.warnings.length === 0 ? null : (
                <ul className="rule-builder-warnings">
                  {draft.generatedText.warnings.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
              )}
              {draft.unsupportedReason === undefined ? null : (
                <small>{draft.unsupportedReason}</small>
              )}
              {draft.support === 'editable' && selectedRuleId === draft.id ? (
                <RuleBuilderControls
                  draft={draft}
                  allowedKinds={allowedKinds}
                  regionOptions={regionOptions}
                  onUpdate={(updater) => onUpdateRule(draft.id, updater)}
                />
              ) : null}
            </div>
          ))}
        </div>
      )}
      <PatchStatus status={patchStatus} />
    </section>
  )
}

function RuleBuilderControls({
  draft,
  allowedKinds,
  regionOptions,
  onUpdate,
}: {
  readonly draft: RuleBuilderDraft
  readonly allowedKinds: readonly CellKind[]
  readonly regionOptions: readonly RegionDefinition[]
  readonly onUpdate: (updater: (draft: RuleBuilderDraft) => RuleBuilderDraft) => void
}) {
  const kindOptions = allowedKinds.length === 0 ? RULE_BUILDER_KIND_OPTIONS : allowedKinds
  const rule = draft.rule

  switch (rule.type) {
    case 'globalCount':
      return (
        <div className="rule-builder-controls">
          <KindSelect
            label="对象"
            value={rule.target}
            options={kindOptions}
            onChange={(target) => onUpdate((current) => updateRuleBuilderDirectTarget(current, target))}
          />
          <ComparatorFields
            label="数量"
            count={rule.count}
            onChange={(count) => onUpdate((current) => updateRuleBuilderDirectCount(current, count))}
          />
        </div>
      )
    case 'forEachCount':
      return (
        <div className="rule-builder-controls">
          <KindSelect
            label="参照物"
            value={rule.subject}
            options={kindOptions.filter((kind) => kind !== 'empty')}
            onChange={(subject) => onUpdate((current) => updateRuleBuilderForEachSubject(current, subject))}
          />
          <label>
            邻域
            <select
              value={rule.scope.kind}
              onChange={(event) => onUpdate((current) => (
                updateRuleBuilderForEachScopeKind(current, event.target.value as LocalScopeKind)
              ))}
            >
              <option value="orthogonal">上下左右邻格</option>
              <option value="adjacent">周围一圈</option>
              <option value="north">north cell</option>
              <option value="south">south cell</option>
              <option value="east">east cell</option>
              <option value="west">west cell</option>
            </select>
          </label>
          <KindSelect
            label="对象"
            value={rule.target}
            options={kindOptions}
            onChange={(target) => onUpdate((current) => updateRuleBuilderDirectTarget(current, target))}
          />
          <ComparatorFields
            label="数量"
            count={rule.count}
            onChange={(count) => onUpdate((current) => updateRuleBuilderDirectCount(current, count))}
          />
        </div>
      )
    case 'regionCount':
      return (
        <div className="rule-builder-controls">
          <label>
            区域
            <select
              value={rule.regionId}
              onChange={(event) => onUpdate((current) => updateRuleBuilderRegionId(current, event.target.value))}
            >
              {regionOptions.map((region) => (
                <option key={region.id} value={region.id}>{region.id} · {region.title}</option>
              ))}
            </select>
          </label>
          <KindSelect
            label="对象"
            value={rule.target}
            options={kindOptions}
            onChange={(target) => onUpdate((current) => updateRuleBuilderDirectTarget(current, target))}
          />
          <ComparatorFields
            label="数量"
            count={rule.count}
            onChange={(count) => onUpdate((current) => updateRuleBuilderDirectCount(current, count))}
          />
        </div>
      )
    case 'scopeOverlapCount':
      return (
        <div className="rule-builder-controls">
          <label>
            组合
            <select
              value={rule.mode}
              onChange={(event) => onUpdate((current) => (
                updateRuleBuilderOverlapMode(current, event.target.value as ScopeOverlapMode)
              ))}
            >
              {OVERLAP_MODES.map((mode) => (
                <option key={mode} value={mode}>{overlapModeLabel(mode)}</option>
              ))}
            </select>
          </label>
          <KindSelect
            label="对象"
            value={rule.target}
            options={kindOptions}
            onChange={(target) => onUpdate((current) => updateRuleBuilderDirectTarget(current, target))}
          />
          <ComparatorFields
            label="数量"
            count={rule.count}
            onChange={(count) => onUpdate((current) => updateRuleBuilderDirectCount(current, count))}
          />
        </div>
      )
    case 'comparativeCount':
      return (
        <div className="rule-builder-controls">
          <KindSelect
            label="对象"
            value={rule.target}
            options={kindOptions}
            onChange={(target) => onUpdate((current) => updateRuleBuilderDirectTarget(current, target))}
          />
          <ComparisonFields
            comparison={rule.comparison}
            onChange={(comparison) => onUpdate((current) => updateRuleBuilderComparison(current, comparison))}
          />
        </div>
      )
    case 'conditionalCount':
      return (
        <div className="rule-builder-controls conditional-controls">
          <ConditionalClauseFields
            label="如果"
            clause={rule.condition}
            kindOptions={kindOptions}
            onChange={(patch) => onUpdate((current) => updateRuleBuilderConditionalClause(current, 'condition', patch))}
          />
          <ConditionalClauseFields
            label="则"
            clause={rule.then}
            kindOptions={kindOptions}
            onChange={(patch) => onUpdate((current) => updateRuleBuilderConditionalClause(current, 'then', patch))}
          />
        </div>
      )
    case 'lineCount':
      return (
        <div className="rule-builder-controls">
          <LineScopeFields
            rule={rule}
            onScopeChange={(scope) => onUpdate((current) => updateRuleBuilderLineScope(current, scope))}
            onOriginChange={(origin) => onUpdate((current) => updateRuleBuilderLineOrigin(current, origin))}
          />
          <KindSelect
            label="对象"
            value={rule.target}
            options={kindOptions}
            onChange={(target) => onUpdate((current) => updateRuleBuilderDirectTarget(current, target))}
          />
          <ComparatorFields
            label="数量"
            count={rule.count}
            onChange={(count) => onUpdate((current) => updateRuleBuilderDirectCount(current, count))}
          />
        </div>
      )
    case 'anchorCount':
    case 'recordSet':
      return null
  }
}

function LineScopeFields({
  rule,
  onScopeChange,
  onOriginChange,
}: {
  readonly rule: LineCountRule
  readonly onScopeChange: (scope: LineCountRule['scope']) => void
  readonly onOriginChange: (origin: CellId) => void
}) {
  const scopeKind = rule.scope.kind === 'ray' ? 'ray' : rule.scope.kind
  const rayScope = rule.scope.kind === 'ray' ? rule.scope : undefined
  const staticScope = rayScope === undefined ? rule.scope as StaticLineScope : undefined
  const activeRayScope: Extract<LineCountRule['scope'], { readonly kind: 'ray' }> = rayScope ?? {
    kind: 'ray',
    direction: 'east',
  }

  return (
    <fieldset className="rule-builder-fieldset line-scope-fields">
      <legend>范围</legend>
      <label>
        类型
        <select
          value={scopeKind}
          onChange={(event) => {
            const next = event.target.value
            if (next === 'row' || next === 'column') {
              onScopeChange({ kind: next, index: 0 })
            } else {
              onScopeChange({ kind: 'ray', direction: 'east' })
            }
          }}
        >
          <option value="row">第 N 行</option>
          <option value="column">第 N 列</option>
          <option value="ray">从格子出发的视线</option>
        </select>
      </label>
      {staticScope !== undefined ? (
        <label>
          序号
          <input
            type="number"
            min={1}
            step={1}
            value={staticScope.index + 1}
            onChange={(event) => {
              const value = parsePositiveInteger(event.target.value)
              if (value !== undefined) onScopeChange({ ...staticScope, index: value - 1 })
            }}
          />
        </label>
      ) : (
        <>
          <label>
            起点格
            <input
              type="text"
              value={rule.origin ?? ''}
              placeholder="A1"
              onChange={(event) => onOriginChange(event.target.value.trim().toUpperCase())}
            />
          </label>
          <label>
            方向
            <select
              value={activeRayScope.direction}
              onChange={(event) => onScopeChange({
                ...activeRayScope,
                direction: event.target.value as Direction,
              })}
            >
              {DIRECTION_OPTIONS.map((direction) => (
                <option key={direction} value={direction}>{directionLabel(direction)}</option>
              ))}
            </select>
          </label>
        </>
      )}
    </fieldset>
  )
}

function KindSelect({
  label,
  value,
  options,
  onChange,
}: {
  readonly label: string
  readonly value: CellKind
  readonly options: readonly CellKind[]
  readonly onChange: (kind: CellKind) => void
}) {
  return (
    <label>
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value as CellKind)}>
        {options.map((kind) => (
          <option key={kind} value={kind}>{kindLabel(kind)}</option>
        ))}
      </select>
    </label>
  )
}

function ComparatorFields({
  label,
  count,
  onChange,
}: {
  readonly label: string
  readonly count: Comparator
  readonly onChange: (count: Comparator) => void
}) {
  return (
    <fieldset className="rule-builder-fieldset">
      <legend>{label}</legend>
      <select value={count.op} onChange={(event) => onChange({ op: event.target.value as Comparator['op'], value: count.value })}>
        {COMPARATOR_OPS.map((op) => (
          <option key={op} value={op}>{comparatorOpLabel(op)}</option>
        ))}
      </select>
      <input
        type="number"
        min={0}
        step={1}
        value={count.value}
        onChange={(event) => {
          const value = parseNonNegativeInteger(event.target.value)
          if (value !== undefined) onChange({ op: count.op, value })
        }}
      />
    </fieldset>
  )
}

function ComparisonFields({
  comparison,
  onChange,
}: {
  readonly comparison: CountComparison
  readonly onChange: (comparison: CountComparison) => void
}) {
  return (
    <fieldset className="rule-builder-fieldset">
      <legend>比较</legend>
      <select
        value={comparison.op}
        onChange={(event) => onChange({ ...comparison, op: event.target.value as CountComparison['op'] })}
      >
        {COMPARISON_OPS.map((op) => (
          <option key={op} value={op}>{comparatorOpLabel(op)}</option>
        ))}
      </select>
      <input
        type="number"
        min={0}
        step={1}
        value={comparison.offset ?? 0}
        onChange={(event) => {
          const value = parseNonNegativeInteger(event.target.value)
          if (value !== undefined) onChange({ ...comparison, offset: value === 0 ? undefined : value })
        }}
        aria-label="Comparison offset"
      />
    </fieldset>
  )
}

function ConditionalClauseFields({
  label,
  clause,
  kindOptions,
  onChange,
}: {
  readonly label: string
  readonly clause: Extract<RuleBuilderDraft['rule'], { readonly type: 'conditionalCount' }>['condition']
  readonly kindOptions: readonly CellKind[]
  readonly onChange: (patch: Parameters<typeof updateRuleBuilderConditionalClause>[2]) => void
}) {
  return (
    <fieldset className="rule-builder-fieldset conditional-clause">
      <legend>{label}</legend>
      <KindSelect
        label="对象"
        value={clause.target}
        options={kindOptions}
        onChange={(target) => onChange({ target })}
      />
      <ComparatorFields
        label="数量"
        count={clause.count}
        onChange={(count) => onChange({ count })}
      />
    </fieldset>
  )
}

function RuleCopyEditor({
  selectedRule,
  titleText,
  flavorText,
  patchStatus,
  canPatch,
  onTitleChange,
  onFlavorChange,
  onApply,
}: {
  readonly selectedRule: WorkbenchRuleSummary | undefined
  readonly titleText: string
  readonly flavorText: string
  readonly patchStatus: DraftPatchStatus
  readonly canPatch: boolean
  readonly onTitleChange: (value: string) => void
  readonly onFlavorChange: (value: string) => void
  readonly onApply: () => void
}) {
  return (
    <section className="workbench-section rule-copy-editor">
      <h3>{selectedRule === undefined ? '规则文案' : `${selectedRule.id} · ${ruleTypeLabel(selectedRule.type)}`}</h3>
      <label>
        标题
        <input
          type="text"
          value={titleText}
          disabled={!canPatch}
          onChange={(event) => onTitleChange(event.target.value)}
          placeholder="选择一条规则后编辑标题"
        />
      </label>
      <label>
        说明
        <textarea
          value={flavorText}
          disabled={!canPatch}
          onChange={(event) => onFlavorChange(event.target.value)}
          placeholder="可留空；这里写给玩家看的自然语言说明"
        />
      </label>
      <button className="small-button" type="button" onClick={onApply} disabled={!canPatch}>
        应用文案
      </button>
      <PatchStatus status={patchStatus} />
    </section>
  )
}

function MetadataEditor({
  titleText,
  caseNameText,
  difficultyText,
  tagsText,
  statusText,
  notesText,
  patchStatus,
  canPatch,
  onTitleChange,
  onCaseNameChange,
  onDifficultyChange,
  onTagsChange,
  onStatusChange,
  onNotesChange,
  onApply,
}: {
  readonly titleText: string
  readonly caseNameText: string
  readonly difficultyText: string
  readonly tagsText: string
  readonly statusText: string
  readonly notesText: string
  readonly patchStatus: DraftPatchStatus
  readonly canPatch: boolean
  readonly onTitleChange: (value: string) => void
  readonly onCaseNameChange: (value: string) => void
  readonly onDifficultyChange: (value: string) => void
  readonly onTagsChange: (value: string) => void
  readonly onStatusChange: (value: string) => void
  readonly onNotesChange: (value: string) => void
  readonly onApply: () => void
}) {
  return (
    <section className="workbench-section metadata-editor">
      <h3>案件信息</h3>
      <label>
        标题
        <input
          type="text"
          value={titleText}
          disabled={!canPatch}
          onChange={(event) => onTitleChange(event.target.value)}
          placeholder="给作者和导出文件识别用的标题"
        />
      </label>
      <label>
        案件名
        <input
          type="text"
          value={caseNameText}
          disabled={!canPatch}
          onChange={(event) => onCaseNameChange(event.target.value)}
          placeholder="可留空；留空时使用标题"
        />
      </label>
      <div className="metadata-editor-row">
        <label>
          难度
          <select
            value={difficultyText}
            disabled={!canPatch}
            onChange={(event) => onDifficultyChange(event.target.value)}
          >
            {[1, 2, 3, 4, 5].map((difficulty) => (
              <option key={difficulty} value={difficulty}>{difficulty}</option>
            ))}
          </select>
        </label>
        <label>
          状态
          <select
            value={statusText}
            disabled={!canPatch}
            onChange={(event) => onStatusChange(event.target.value)}
          >
            {METADATA_STATUSES.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </label>
      </div>
      <label>
        标签
        <input
          type="text"
          value={tagsText}
          disabled={!canPatch}
          onChange={(event) => onTagsChange(event.target.value)}
          placeholder="用逗号分隔；不会写入玩家选择器"
        />
      </label>
      <label>
        备注
        <textarea
          value={notesText}
          disabled={!canPatch}
          onChange={(event) => onNotesChange(event.target.value)}
          placeholder="记录作者判断、限制或不推广理由"
        />
      </label>
      <button className="small-button" type="button" onClick={onApply} disabled={!canPatch}>
        应用案件信息
      </button>
      <PatchStatus status={patchStatus} />
    </section>
  )
}

function RulesJsonEditor({
  jsonText,
  patchStatus,
  canPatch,
  onJsonTextChange,
  onReset,
  onApply,
}: {
  readonly jsonText: string
  readonly patchStatus: DraftPatchStatus
  readonly canPatch: boolean
  readonly onJsonTextChange: (value: string) => void
  readonly onReset: () => void
  readonly onApply: () => void
}) {
  return (
    <details className="workbench-section rules-json-editor">
      <summary>Debug / export: rules JSON</summary>
      <div className="rules-json-editor-body">
      <h3>规则结构 JSON</h3>
      <p>编辑完整 rules 数组；支持当前所有规则族。schema 会复验类型、引用和字段。</p>
      <textarea
        value={jsonText}
        spellCheck={false}
        disabled={!canPatch}
        onChange={(event) => onJsonTextChange(event.target.value)}
        aria-label="Rules JSON"
      />
      <div className="rules-editor-actions">
        <button className="small-button" type="button" onClick={onReset} disabled={!canPatch}>
          从草稿重载
        </button>
        <button className="small-button" type="button" onClick={onApply} disabled={!canPatch}>
          应用规则
        </button>
      </div>
      <PatchStatus status={patchStatus} />
      </div>
    </details>
  )
}

function ScopeCollectionsEditor({
  jsonText,
  patchStatus,
  canPatch,
  onJsonTextChange,
  onReset,
  onApply,
}: {
  readonly jsonText: string
  readonly patchStatus: DraftPatchStatus
  readonly canPatch: boolean
  readonly onJsonTextChange: (value: string) => void
  readonly onReset: () => void
  readonly onApply: () => void
}) {
  return (
    <section className="workbench-section scope-collections-editor">
      <h3>区域 / 参照物</h3>
      <p>编辑 regions 与 anchors 集合；规则引用是否仍然有效会由 schema 复验。</p>
      <textarea
        value={jsonText}
        spellCheck={false}
        disabled={!canPatch}
        onChange={(event) => onJsonTextChange(event.target.value)}
        aria-label="Regions and anchors JSON"
      />
      <div className="scope-editor-actions">
        <button className="small-button" type="button" onClick={onReset} disabled={!canPatch}>
          从草稿重载
        </button>
        <button className="small-button" type="button" onClick={onApply} disabled={!canPatch}>
          应用集合
        </button>
      </div>
      <PatchStatus status={patchStatus} />
    </section>
  )
}

function parseBoardSize(widthText: string, heightText: string): BoardSize | undefined {
  const width = Number(widthText)
  const height = Number(heightText)
  if (!Number.isInteger(width) || !Number.isInteger(height)) return undefined
  if (width < 1 || width > 26 || height < 1 || height > 26) return undefined

  return { width, height }
}

function createLocalCaseId(): string {
  const randomPart = Math.random().toString(36).slice(2, 8)
  return `local-${Date.now().toString(36)}-${randomPart}`
}

function parsePuzzleJson(jsonText: string): PuzzleDefinition | undefined {
  try {
    return JSON.parse(jsonText) as PuzzleDefinition
  } catch {
    return undefined
  }
}

function formatLocalCaseTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '保存时间未知'

  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function isMetadataDifficulty(value: number): value is PuzzleDefinition['metadata']['difficulty'] {
  return value === 1 || value === 2 || value === 3 || value === 4 || value === 5
}

function isMetadataStatus(value: string): value is PuzzleDefinition['metadata']['status'] {
  return METADATA_STATUSES.some((status) => status === value)
}

function ImportExportSummary({
  selectedOption,
  exportStatus,
}: {
  readonly selectedOption: ReturnType<typeof createWorkbenchShellModel>['caseOptions'][number] | undefined
  readonly exportStatus: ReturnType<typeof createWorkbenchShellModel>['exportStatus']
}) {
  return (
    <section className="workbench-section">
      <h3>导入 / 导出</h3>
      <dl className="import-export-grid">
        <div>
          <dt>来源</dt>
          <dd>{selectedOption === undefined ? '未知' : sourceLabel(selectedOption.source)}</dd>
        </div>
        <div>
          <dt>路径</dt>
          <dd>{selectedOption?.sourcePath ?? '手写 JSON'}</dd>
        </div>
        <div>
          <dt>文件名</dt>
          <dd>{exportStatus.fileName}</dd>
        </div>
        <div>
          <dt>状态</dt>
          <dd>{exportStatus.issueCount > 0 ? `${exportStatus.message} (${exportStatus.issueCount})` : exportStatus.message}</dd>
        </div>
      </dl>
    </section>
  )
}

function ThemeVNReviewSummary({ report }: { readonly report: ThemeAssetReviewReport }) {
  const issueCount = report.intakeIssues.length + report.manifestLeaks.length + report.dialogueLeaks.length

  return (
    <section className="workbench-section theme-vn-review">
      <h3>Theme / VN private review</h3>
      <dl className="import-export-grid">
        <div>
          <dt>Manifest</dt>
          <dd>{report.manifestId}</dd>
        </div>
        <div>
          <dt>Placeholders</dt>
          <dd>{report.placeholderAssetIds.length}</dd>
        </div>
        <div>
          <dt>Pending</dt>
          <dd>{report.pendingApprovalAssetIds.length}</dd>
        </div>
        <div>
          <dt>Approved</dt>
          <dd>{report.approvedAssetIds.length}</dd>
        </div>
        <div>
          <dt>Dialogue scenes</dt>
          <dd>{report.dialogueCategories.length}</dd>
        </div>
        <div>
          <dt>Review issues</dt>
          <dd>{issueCount}</dd>
        </div>
      </dl>
      <p>
        Placeholder art is intentional until user-provided assets pass source,
        license, dimension, and player-route safety review.
      </p>
    </section>
  )
}

function DiagnosticsCapsEditor({
  caps,
  disabled,
  onCapChange,
}: {
  readonly caps: WorkbenchDiagnosticsCaps
  readonly disabled: boolean
  readonly onCapChange: (field: keyof WorkbenchDiagnosticsCaps, value: number) => void
}) {
  return (
    <section className="workbench-section diagnostics-caps-editor">
      <h3>诊断上限</h3>
      <p>这些上限只影响本次 workbench 诊断；如果结果出现截断，请提高上限或简化草稿后重跑。</p>
      <div className="diagnostics-caps-grid">
        <DiagnosticsCapInput
          label="节点"
          value={caps.maxNodes}
          disabled={disabled}
          onChange={(value) => onCapChange('maxNodes', value)}
        />
        <DiagnosticsCapInput
          label="模型"
          value={caps.maxModels}
          disabled={disabled}
          onChange={(value) => onCapChange('maxModels', value)}
        />
        <DiagnosticsCapInput
          label="访客布局"
          value={caps.maxGuestLayouts}
          disabled={disabled}
          onChange={(value) => onCapChange('maxGuestLayouts', value)}
        />
        <DiagnosticsCapInput
          label="候选计数"
          value={caps.candidateLayoutCap}
          disabled={disabled}
          onChange={(value) => onCapChange('candidateLayoutCap', value)}
        />
      </div>
    </section>
  )
}

function DiagnosticsCapInput({
  label,
  value,
  disabled,
  onChange,
}: {
  readonly label: string
  readonly value: number
  readonly disabled: boolean
  readonly onChange: (value: number) => void
}) {
  return (
    <label>
      {label}
      <input
        type="number"
        min="1"
        step="1"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  )
}

function DiagnosticsSummary({
  state,
  parseOk,
}: {
  readonly state: WorkbenchDiagnosticsState
  readonly parseOk: boolean
}) {
  const report = diagnosticsReportForState(state)
  if (report === undefined) {
    return (
      <section className="workbench-section">
        <h3>诊断</h3>
        <DiagnosticsStateNotice state={state} parseOk={parseOk} />
      </section>
    )
  }

  return (
    <section className="workbench-section">
      <h3>诊断 · {diagnosticsStatusText(report.status)}</h3>
      <DiagnosticsStateNotice state={state} parseOk={parseOk} />
      <DiagnosticsOverview overview={createWorkbenchDiagnosticsOverview(report)} />
      <div className="diagnostics-group-list">
        {createWorkbenchDiagnosticsGroupDetails(report).map((group) => (
          <DiagnosticsGroupDetailCard key={group.id} group={group} />
        ))}
      </div>
    </section>
  )
}

function DiagnosticsGroupDetailCard({
  group,
}: {
  readonly group: WorkbenchDiagnosticsGroupDetail
}) {
  return (
    <article className={`diagnostics-group ${group.status}`}>
      <div className="diagnostics-group-heading">
        <b>{diagnosticsTitle(group.title)}</b>
        <span>{diagnosticsStatusLabel(group.status)}</span>
      </div>
      <ul>
        {group.items.map((item) => (
          <li key={`${group.id}:${item.code}:${item.message}`} className={`diagnostics-item ${item.severity}`}>
            <div className="diagnostics-item-copy">
              <strong>{item.code}</strong>
              <span>{item.message}</span>
            </div>
            {item.refs.length === 0 && item.hiddenRefCount === 0 ? null : (
              <div className="diagnostics-refs" aria-label={`${item.code} refs`}>
                {item.refs.map((ref) => (
                  <code key={`${item.code}:${ref}`}>{ref}</code>
                ))}
                {item.hiddenRefCount === 0 ? null : <em>+{item.hiddenRefCount}</em>}
              </div>
            )}
          </li>
        ))}
      </ul>
      {group.hiddenItemCount === 0 ? null : (
        <p className="diagnostics-overflow">还有 {group.hiddenItemCount} 条诊断未显示；请导出 JSON 或运行 CLI 查看完整报告。</p>
      )}
    </article>
  )
}

function DiagnosticsOverview({
  overview,
}: {
  readonly overview: WorkbenchDiagnosticsOverview | undefined
}) {
  if (overview === undefined) return null

  return (
    <div className="diagnostics-overview">
      {overview.metrics.map((metric) => (
        <article key={metric.id} className={`diagnostics-metric ${metric.tone}`}>
          <span>{metric.label}</span>
          <strong>{metric.value}</strong>
          {metric.detail === undefined ? null : <small>{metric.detail}</small>}
        </article>
      ))}
    </div>
  )
}

function DiagnosticsStateNotice({
  state,
  parseOk,
}: {
  readonly state: WorkbenchDiagnosticsState
  readonly parseOk: boolean
}) {
  const notice = diagnosticsStateNotice(state, parseOk)
  if (notice === undefined) return null

  return (
    <div className={`diagnostics-state ${notice.kind}`}>
      {notice.message}
    </div>
  )
}

function diagnosticsStateNotice(
  state: WorkbenchDiagnosticsState,
  parseOk: boolean,
): { readonly kind: 'info' | 'warning' | 'error'; readonly message: string } | undefined {
  switch (state.status) {
    case 'idle':
      return {
        kind: parseOk ? 'info' : 'error',
        message: parseOk
          ? '尚未运行完整诊断。点击“运行诊断”查看正确性、证明、质量、难度、文案和性能分组。'
          : 'JSON 当前无法解析，修复格式后再运行完整诊断。',
      }
    case 'running':
      return {
        kind: 'info',
        message: state.report === undefined
          ? '诊断正在运行。'
          : '诊断正在运行；下方暂时显示上一次结果。',
      }
    case 'current':
      return undefined
    case 'stale':
      return {
        kind: 'warning',
        message: state.message,
      }
    case 'unavailable':
      return {
        kind: 'error',
        message: state.message,
      }
    case 'failed':
      return {
        kind: 'error',
        message: `诊断运行失败：${state.message}`,
      }
  }
}

function diagnosticsStatusText(status: AuthoringDraftDiagnosticsReport['status']): string {
  switch (status) {
    case 'invalid-draft':
      return '草稿无效'
    case 'valid-unsatisfiable':
      return '不可满足'
    case 'valid-not-unique':
      return '未唯一'
    case 'valid-not-human-explainable':
      return '证明不足'
    case 'valid-degenerate':
      return '退化'
    case 'valid-review-needed':
      return '需复核'
    case 'valid-ready-for-private-review':
      return '可进入私下复核'
  }
}

function sourceLabel(source: WorkbenchCaseSource): string {
  switch (source) {
    case 'shipped':
      return '内置模板'
    case 'experimental':
      return '内置参考'
  }
}

function WorkbenchStatus({
  puzzle,
  draft,
  localState,
}: {
  readonly puzzle: PuzzleDefinition | undefined
  readonly draft: WorkbenchDraftState
  readonly localState: WorkbenchLocalCaseState | undefined
}) {
  return (
    <dl className="workbench-status-grid">
      <div>
        <dt>修改</dt>
        <dd>{draft.dirty ? '已修改' : '未修改'}</dd>
      </div>
      <div>
        <dt>草稿状态</dt>
        <dd>{localState === undefined ? '内置模板' : localState === 'published' ? '已发布' : '草稿'}</dd>
      </div>
      <div>
        <dt>结构检查</dt>
        <dd>{puzzle === undefined ? '失败' : '通过'}</dd>
      </div>
      <div>
        <dt>初始观察</dt>
        <dd>{puzzle?.initialReveals.length ?? 0}</dd>
      </div>
      <div>
        <dt>规则数</dt>
        <dd>{puzzle?.rules.length ?? 0}</dd>
      </div>
    </dl>
  )
}

function diagnosticsTitle(title: string): string {
  switch (title) {
    case 'Blocking Errors':
      return '阻塞错误'
    case 'Correctness':
      return '正确性'
    case 'Human Proof':
      return '人类证明'
    case 'Quality Gates':
      return '质量门'
    case 'Clone Risk':
      return '克隆风险'
    case 'Difficulty':
      return '难度'
    case 'Copy Warnings':
      return '文案警告'
    case 'Performance And Caps':
      return '性能与上限'
    default:
      return title
  }
}

function diagnosticsStatusLabel(status: AuthoringDiagnosticsGroup['status']): string {
  switch (status) {
    case 'pass':
      return '通过'
    case 'info':
      return '信息'
    case 'warning':
      return '需复核'
    case 'fail':
      return '失败'
    case 'skipped':
      return '跳过'
  }
}

function RuleSummary({
  rule,
  selected,
  onSelect,
}: {
  readonly rule: WorkbenchRuleSummary
  readonly selected: boolean
  readonly onSelect: (rule: WorkbenchRuleSummary) => void
}) {
  return (
    <button
      className={`workbench-rule-card ${selected ? 'selected' : ''}`}
      type="button"
      onClick={() => onSelect(rule)}
      aria-pressed={selected}
    >
      <div>
        <b>{rule.id} · {rule.title}</b>
        <span>{ruleTypeLabel(rule.type)}</span>
      </div>
      {rule.flavor === undefined ? null : <p>{rule.flavor}</p>}
    </button>
  )
}

function IssueList({ issues }: { readonly issues: readonly string[] }) {
  return (
    <ul className="workbench-issues">
      {issues.map((issue) => (
        <li key={issue}>{issue}</li>
      ))}
    </ul>
  )
}

function draftDownloadHref(jsonText: string): string {
  return `data:application/json;charset=utf-8,${encodeURIComponent(jsonText)}`
}

function kindLabel(kind: CellKind): string {
  switch (kind) {
    case 'empty':
      return '无访客'
    case 'bottle':
      return '酒瓶'
    case 'bin':
      return '垃圾桶'
    case 'mirror':
      return '镜子'
    case 'guest':
      return '访客'
  }
}

function ruleBuilderFamilyLabel(type: RuleBuilderDraft['family']): string {
  switch (type) {
    case 'globalCount':
      return '全局数量'
    case 'forEachCount':
      return '局部邻格'
    case 'regionCount':
      return '区域数量'
    case 'lineCount':
      return '视线数量'
    case 'anchorCount':
      return '参照物数量'
    case 'recordSet':
      return '污染记录'
    case 'scopeOverlapCount':
      return '范围重叠'
    case 'comparativeCount':
      return '数量比较'
    case 'conditionalCount':
      return '条件数量'
  }
}

function ruleTypeLabel(type: WorkbenchRuleSummary['type']): string {
  switch (type) {
    case 'globalCount':
      return '全局数量'
    case 'forEachCount':
      return '邻域计数'
    case 'regionCount':
      return '区域计数'
    case 'lineCount':
      return '视线计数'
    case 'anchorCount':
      return '参照物计数'
    case 'recordSet':
      return '污染记录'
    case 'scopeOverlapCount':
      return '范围重叠计数'
    case 'comparativeCount':
      return '两组数量比较'
    case 'conditionalCount':
      return '条件数量线索'
  }
}
