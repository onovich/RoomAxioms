import { ArrowDown, ArrowUp, Copy, FolderOpen, Pencil, Plus, RotateCcw, Save, Trash2, Upload } from 'lucide-react'
import type { CSSProperties } from 'react'
import { useEffect, useMemo, useState } from 'react'

import { updateDraftJsonText, type WorkbenchDraftState } from '@room-axioms/authoring/drafts'
import type { AuthoringDiagnosticsGroup } from '@room-axioms/authoring/diagnostics'
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
import {
  DEFAULT_OBJECT_TYPE_REGISTRY,
  allCells,
  lineCells,
  neighbors,
  rayCells,
  regionCells,
  sortCellIds,
  type BoardSize,
  type CellId,
  type CellKind,
  type Comparator,
  type CountComparison,
  type CountScopeRef,
  type Direction,
  type LegacyObjectCellKind,
  type LineCountRule,
  type LocalScopeKind,
  type PuzzleDefinition,
  type RegionDefinition,
  type RuleDefinition,
  type StaticLineScope,
  type ScopeOverlapMode,
} from '@room-axioms/domain'

import { DEFAULT_CASE_ID } from '../content/cases'
import { getWorkbenchCaseImportById, workbenchCaseLibrary } from './caseLibrary'
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
  cancelWorkbenchDiagnostics,
  completeWorkbenchDiagnostics,
  createWorkbenchDraftFromPuzzle,
  createWorkbenchDiagnosticsState,
  createWorkbenchDiagnosticsOverview,
  createWorkbenchDiagnosticsGroupDetails,
  createWorkbenchShellModel,
  defaultWorkbenchDiagnosticsCaps,
  diagnosticsReportForState,
  failWorkbenchDiagnostics,
  markWorkbenchDiagnosticsStale,
  patchWorkbenchBoardSize,
  patchWorkbenchMetadata,
  patchWorkbenchRuleBuilderCreateRule,
  patchWorkbenchRuleBuilderDrafts,
  patchWorkbenchRulePresentation,
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
import {
  ALL_WORKBENCH_DIAGNOSTIC_IDS,
  DEFAULT_WORKBENCH_DIAGNOSTIC_IDS,
  runSelectedWorkbenchDiagnostics,
  WORKBENCH_DIAGNOSTIC_OPTIONS,
  type WorkbenchDiagnosticOptionId,
  type WorkbenchDiagnosticProgress,
} from './asyncDiagnostics'

type DraftPatchStatus =
  | { readonly kind: 'idle' }
  | { readonly kind: 'applied'; readonly message: string }
  | { readonly kind: 'rejected'; readonly message: string; readonly issues: readonly string[] }

type LibraryActionStatus =
  | { readonly kind: 'idle' }
  | { readonly kind: 'info' | 'success' | 'error'; readonly message: string }

type RuleDialogState =
  | { readonly kind: 'closed' }
  | { readonly kind: 'create'; readonly form: RuleBuilderCreateForm }
  | { readonly kind: 'edit'; readonly ruleId: string }

interface WorkbenchObjectType {
  readonly id: string
  readonly label: string
  readonly legacyKind?: LegacyObjectCellKind
  readonly custom: boolean
}

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
  const [selectedDiagnosticIds, setSelectedDiagnosticIds] = useState<readonly WorkbenchDiagnosticOptionId[]>(
    () => DEFAULT_WORKBENCH_DIAGNOSTIC_IDS,
  )
  const [diagnosticsProgress, setDiagnosticsProgress] = useState<WorkbenchDiagnosticProgress | undefined>()
  const [diagnosticsAbortController, setDiagnosticsAbortController] = useState<AbortController | undefined>()
  const [selectedCellId, setSelectedCellId] = useState<CellId | undefined>()
  const [selectedRuleId, setSelectedRuleId] = useState<string | undefined>()
  const [ruleDialog, setRuleDialog] = useState<RuleDialogState>({ kind: 'closed' })
  const [activeKind, setActiveKind] = useState<CellKind>('empty')
  const [objectTypes, setObjectTypes] = useState<readonly WorkbenchObjectType[]>(() => createInitialObjectTypes())
  const [objectManagerOpen, setObjectManagerOpen] = useState(false)
  const [newObjectLabelText, setNewObjectLabelText] = useState('')
  const [patchStatus, setPatchStatus] = useState<DraftPatchStatus>({ kind: 'idle' })
  const [ruleBuilderPatchStatus, setRuleBuilderPatchStatus] = useState<DraftPatchStatus>({ kind: 'idle' })
  const [rulePatchStatus, setRulePatchStatus] = useState<DraftPatchStatus>({ kind: 'idle' })
  const [metadataPatchStatus, setMetadataPatchStatus] = useState<DraftPatchStatus>({ kind: 'idle' })
  const [boardWidthText, setBoardWidthText] = useState(String(defaultCase.board.width))
  const [boardHeightText, setBoardHeightText] = useState(String(defaultCase.board.height))
  const [ruleTitleText, setRuleTitleText] = useState('')
  const [ruleFlavorText, setRuleFlavorText] = useState('')
  const [metadataTitleText, setMetadataTitleText] = useState(defaultCase.title)
  const [metadataDifficultyText, setMetadataDifficultyText] = useState(String(defaultCase.metadata.difficulty))
  const [metadataEditorOpen, setMetadataEditorOpen] = useState(false)
  const selectedLocalCase = selectedLocalCaseId === undefined
    ? undefined
    : localCases.find((record) => record.localId === selectedLocalCaseId)
  const localGroups = useMemo(() => groupLocalCases(localCases), [localCases])
  const model = useMemo(
    () => createWorkbenchShellModel(workbenchCaseLibrary, selectedCaseId, draft),
    [draft, selectedCaseId],
  )
  const parsedPuzzle = model.parse.ok ? model.parse.puzzle : undefined
  const selectedCell = selectedCellId === undefined
    ? undefined
    : model.boardCells.find((cell) => cell.id === selectedCellId)
  const selectedRule = selectedRuleId === undefined
    ? undefined
    : model.ruleSummaries.find((rule) => rule.id === selectedRuleId)
  const selectedRuleScopeCellSet = useMemo(
    () => new Set(selectedRuleScopeCells(parsedPuzzle, selectedRuleId)),
    [parsedPuzzle, selectedRuleId],
  )
  const kindOptions = workbenchCellKindOptions(parsedPuzzle, selectedCell?.kind ?? activeKind)
  const displayKindLabel = (kind: CellKind): string => kindLabel(kind, objectTypes)

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
    setRuleDialog({ kind: 'closed' })
    setActiveKind('empty')
    setBoardWidthText(puzzle === undefined ? '' : String(puzzle.board.width))
    setBoardHeightText(puzzle === undefined ? '' : String(puzzle.board.height))
    setRuleTitleText('')
    setRuleFlavorText('')
    syncMetadataEditor(puzzle)
    setMetadataEditorOpen(false)
    setPatchStatus({ kind: 'idle' })
    setRuleBuilderPatchStatus({ kind: 'idle' })
    setRulePatchStatus({ kind: 'idle' })
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

  function runDiagnostics(): void {
    if (diagnosticsState.status === 'running') {
      diagnosticsAbortController?.abort()
      setDiagnosticsProgress((current) => current === undefined
        ? undefined
        : { ...current, currentLabel: '正在取消诊断' })
      return
    }

    if (selectedDiagnosticIds.length === 0) {
      setDiagnosticsState((current) => failWorkbenchDiagnostics(
        beginWorkbenchDiagnostics(current),
        current.requestId + 1,
        new Error('请至少选择一项诊断。'),
      ))
      return
    }

    const started = beginWorkbenchDiagnostics(diagnosticsState)
    const requestId = started.requestId
    const caps = diagnosticsCaps
    const localPublishedPuzzles = localGroups.published
      .map((record) => parsePuzzleJson(record.jsonText))
      .filter((puzzle): puzzle is PuzzleDefinition => puzzle !== undefined)
    const comparisonPuzzles = [
      ...workbenchCaseLibrary.map((item) => item.puzzle),
      ...localPublishedPuzzles,
    ]
      .filter((puzzle) => puzzle.id !== parsedPuzzle?.id)
    const controller = new AbortController()
    setDiagnosticsState(started)
    setDiagnosticsAbortController(controller)
    setDiagnosticsProgress({
      completedSteps: 0,
      totalSteps: selectedDiagnosticIds.length + 2,
      currentLabel: '准备诊断草稿',
    })
    void runSelectedWorkbenchDiagnostics({
      draft,
      selectedCaseId,
      selectedIds: selectedDiagnosticIds,
      caps,
      comparisonPuzzles,
      signal: controller.signal,
      onProgress: setDiagnosticsProgress,
    }).then((result) => {
      setDiagnosticsAbortController(undefined)
      setDiagnosticsProgress(undefined)
      setDiagnosticsState((current) => (
        result.status === 'completed'
          ? completeWorkbenchDiagnostics(current, requestId, result.report)
          : cancelWorkbenchDiagnostics(current, requestId, result.report)
      ))
    }).catch((error: unknown) => {
      setDiagnosticsAbortController(undefined)
      setDiagnosticsProgress(undefined)
      setDiagnosticsState((current) => failWorkbenchDiagnostics(current, requestId, error))
    })
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

  function openCreateRuleDialog(): void {
    setRuleDialog({ kind: 'create', form: RULE_CREATE_FORMS[0] })
    setRuleBuilderPatchStatus({ kind: 'idle' })
  }

  function updateCreateRuleForm(form: RuleBuilderCreateForm): void {
    setRuleDialog({ kind: 'create', form })
  }

  function openEditRuleDialog(ruleId: string): void {
    selectRuleById(ruleId)
    setRuleDialog({ kind: 'edit', ruleId })
    setRuleBuilderPatchStatus({ kind: 'idle' })
  }

  function closeRuleDialog(): void {
    setRuleDialog({ kind: 'closed' })
  }

  function createBuilderRuleFromDialog(): void {
    if (ruleDialog.kind !== 'create') return
    createBuilderRule(ruleDialog.form)
    setRuleDialog({ kind: 'closed' })
  }

  function renameWorkbenchObjectType(objectId: string, label: string): void {
    setObjectTypes((current) => current.map((objectType) => (
      objectType.id === objectId
        ? { ...objectType, label }
        : objectType
    )))
  }

  function createCustomObjectType(): void {
    const label = newObjectLabelText.trim()
    if (label.length === 0) return
    const id = createObjectTypeId(label, objectTypes)
    setObjectTypes((current) => [
      ...current,
      {
        id,
        label,
        custom: true,
      },
    ])
    setNewObjectLabelText('')
    setPatchStatus({
      kind: 'applied',
      message: `${label} 已加入规则对象库；后续规则编译会以对象定义为来源。`,
    })
  }

  function deleteCustomObjectType(objectId: string): void {
    setObjectTypes((current) => current.filter((objectType) => objectType.id !== objectId || !objectType.custom))
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
        message: `${selectedCellId} 不能改成${kindLabel(activeKind, objectTypes)}。`,
        issues: patch.issues.map((issue) => `${issue.code}: ${issue.message}`),
      })
      return
    }

    applySuccessfulPatch(patch.state, `${selectedCellId} 已改成${kindLabel(activeKind, objectTypes)}；完整诊断已标记为待重新运行。`)
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
    setRulePatchStatus({
      kind: 'applied',
      message: `${selectedRuleId} 的标题和说明已更新；完整诊断已标记为待重新运行。`,
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

    const parsed = parsePuzzleJson(draft.jsonText)
    const syncedTitle = metadataTitleText.trim()
    if (syncedTitle.length === 0) {
      setMetadataPatchStatus({
        kind: 'rejected',
        message: '标题未应用。',
        issues: ['METADATA_TITLE_INPUT: 案件标题不能为空。'],
      })
      return
    }

    const patch = patchWorkbenchMetadata(draft, {
      title: syncedTitle,
      caseName: syncedTitle,
      difficulty,
      tags: parsed?.metadata.tags ?? ['workbench'],
      status: parsed?.metadata.status ?? 'draft',
      notes: parsed?.metadata.notes,
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
    setMetadataEditorOpen(false)
    setMetadataPatchStatus({
      kind: 'applied',
      message: '标题和难度已更新；完整诊断已标记为待重新运行。',
    })
  }

  function syncMetadataEditor(puzzle: PuzzleDefinition | undefined): void {
    setMetadataTitleText(puzzle?.caseName ?? puzzle?.title ?? '')
    setMetadataDifficultyText(puzzle === undefined ? '' : String(puzzle.metadata.difficulty))
  }

  return (
    <div className="authoring-workbench">
      <header className="workbench-topbar">
        <div className="brand-block">
          <div className="brand-mark">A</div>
          <div className="workbench-title-block">
            <div className="brand">出题工作台 <span>maintainer</span></div>
            {metadataEditorOpen ? (
              <div className="workbench-title-editor" aria-label="编辑案件标题和难度">
                <input
                  type="text"
                  value={metadataTitleText}
                  disabled={parsedPuzzle === undefined}
                  onChange={(event) => setMetadataTitleText(event.target.value)}
                  aria-label="案件标题"
                />
                <select
                  value={metadataDifficultyText}
                  disabled={parsedPuzzle === undefined}
                  onChange={(event) => setMetadataDifficultyText(event.target.value)}
                  aria-label="难度"
                >
                  {[1, 2, 3, 4, 5].map((difficulty) => (
                    <option key={difficulty} value={difficulty}>难度 {difficulty}</option>
                  ))}
                </select>
                <button className="icon-button" type="button" onClick={applyMetadataPatch} disabled={parsedPuzzle === undefined} title="保存标题和难度" aria-label="保存标题和难度">
                  <Save size={15} aria-hidden="true" />
                </button>
                <button className="icon-button" type="button" onClick={() => {
                  syncMetadataEditor(parsedPuzzle)
                  setMetadataEditorOpen(false)
                  setMetadataPatchStatus({ kind: 'idle' })
                }} title="取消编辑" aria-label="取消编辑">
                  <RotateCcw size={15} aria-hidden="true" />
                </button>
              </div>
            ) : (
              <div className="workbench-title-row">
                <div className="case-name">{parsedPuzzle?.caseName ?? parsedPuzzle?.title ?? '未命名草稿'}</div>
                <span className="difficulty-chip">难度 {parsedPuzzle?.metadata.difficulty ?? '-'}</span>
                <button className="icon-button" type="button" onClick={() => setMetadataEditorOpen(true)} title="编辑标题和难度" aria-label="编辑标题和难度">
                  <Pencil size={15} aria-hidden="true" />
                </button>
              </div>
            )}
            <PatchStatus status={metadataPatchStatus} />
          </div>
        </div>
        <div className="top-status-area">
          <LibraryStatusNotice status={libraryStatus} />
        </div>
      </header>

      <section className="workbench-diagnostics-strip" aria-label="诊断">
        <WorkbenchStatus
          puzzle={parsedPuzzle}
          draft={draft}
          localState={selectedLocalCase?.state}
        />
        <div className="diagnostics-strip-controls">
          <button
            className="small-button"
            type="button"
            onClick={runDiagnostics}
          >
            {diagnosticsState.status === 'running' ? '取消诊断' : '运行诊断'}
          </button>
          <details className="diagnostics-settings-popover">
            <summary className="small-button">诊断设置</summary>
            <div className="diagnostics-settings-body">
              <DiagnosticsCapsEditor
                caps={diagnosticsCaps}
                disabled={diagnosticsState.status === 'running'}
                onCapChange={updateDiagnosticsCap}
              />
              <DiagnosticOptionsPanel
                selectedIds={selectedDiagnosticIds}
                disabled={diagnosticsState.status === 'running'}
                onSelectionChange={setSelectedDiagnosticIds}
              />
            </div>
          </details>
        </div>
        <DiagnosticsProgress progress={diagnosticsProgress} />
        <DiagnosticsCompactSummary state={diagnosticsState} parseOk={model.parse.ok} />
      </section>

      <main className="workbench-shell">
        <section className="panel workbench-panel">
          <CaseLibraryPanel
            builtInCases={model.caseOptions}
            localDrafts={localGroups.draft}
            localPublished={localGroups.published}
            selectedBuiltInId={selectedLocalCaseId === undefined ? selectedCaseId : undefined}
            selectedLocalId={selectedLocalCaseId}
            onSelectBuiltIn={loadCase}
            onSelectLocal={loadLocalCase}
            onCreateNew={() => void createNewLocalCase()}
            onCopyCurrent={() => void copySelectedCaseToDraft()}
          />
        </section>

        <section className="board-panel workbench-board-panel">
          <div className="board-heading">
            <div>
              <span className="eyebrow">Board</span>
              <h2>{parsedPuzzle === undefined ? '无有效棋盘' : `${parsedPuzzle.board.width} × ${parsedPuzzle.board.height}`}</h2>
            </div>
            <div className="board-actions" aria-label="地图操作">
              {!model.parse.ok ? <span className="mode-badge error-badge">Schema Error</span> : null}
              <button className="icon-button primary-icon-button" type="button" onClick={() => void saveCurrentCase()} title="保存地图" aria-label="保存地图">
                <Save size={15} aria-hidden="true" />
              </button>
              {selectedLocalCase?.state === 'published' ? (
                <button className="icon-button" type="button" onClick={() => void retractCurrentCase()} title="撤回发布" aria-label="撤回发布">
                  <RotateCcw size={15} aria-hidden="true" />
                </button>
              ) : (
                <button className="icon-button" type="button" onClick={() => void publishCurrentCase()} title="发布地图" aria-label="发布地图">
                  <Upload size={15} aria-hidden="true" />
                </button>
              )}
              <button className="icon-button" type="button" onClick={resetCurrentCase} title="重新加载" aria-label="重新加载">
                <RotateCcw size={15} aria-hidden="true" />
              </button>
              <button className="icon-button danger-action" type="button" onClick={() => void deleteCurrentCase()} title="删除地图" aria-label="删除地图">
                <Trash2 size={15} aria-hidden="true" />
              </button>
            </div>
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
              style={{
                '--workbench-board-width': parsedPuzzle.board.width,
                '--workbench-board-max-size': `${(parsedPuzzle.board.width * 74) + ((parsedPuzzle.board.width - 1) * 7)}px`,
              } as CSSProperties}
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
                    selectedRuleScopeCellSet.has(cell.id) ? 'rule-scope-preview' : '',
                  ].filter(Boolean).join(' ')}
                  onClick={() => selectBoardCell(cell)}
                  aria-pressed={selectedCellId === cell.id}
                  aria-label={`${cell.id} ${displayKindLabel(cell.kind)}${cell.initiallyRevealed ? '，初始揭示' : ''}`}
                >
                  <span className="coord">{cell.id}</span>
                  <b>{displayKindLabel(cell.kind)}</b>
                  {cell.initiallyRevealed ? <small>初始</small> : null}
                </button>
              ))}
            </div>
          )}
          <CellFactEditor
            selectedCell={selectedCell}
            activeKind={activeKind}
            kindOptions={kindOptions}
            objectTypes={objectTypes}
            objectManagerOpen={objectManagerOpen}
            newObjectLabelText={newObjectLabelText}
            patchStatus={patchStatus}
            canPatch={parsedPuzzle !== undefined && selectedCell !== undefined}
            onKindChange={setActiveKind}
            onManageObjects={() => setObjectManagerOpen(true)}
            onCloseObjectManager={() => setObjectManagerOpen(false)}
            onObjectLabelChange={renameWorkbenchObjectType}
            onNewObjectLabelChange={setNewObjectLabelText}
            onCreateObject={createCustomObjectType}
            onDeleteObject={deleteCustomObjectType}
            onApply={applyTargetCellPatch}
            onToggleInitialReveal={toggleInitialRevealForSelectedCell}
          />
        </section>

        <aside className="panel workbench-panel rule-editor-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Rules</span>
              <h2>规则编辑</h2>
            </div>
          </div>
          <RuleExpressionBuilder
            drafts={model.ruleBuilderDrafts}
            selectedRuleId={selectedRuleId}
            patchStatus={ruleBuilderPatchStatus}
            onSelectRuleId={selectRuleById}
            onEditRule={openEditRuleDialog}
            onDuplicateRule={duplicateBuilderRule}
            onRemoveRule={removeBuilderRule}
            onMoveRule={moveBuilderRule}
            onCreateRule={openCreateRuleDialog}
          />
          <RuleDialog
            state={ruleDialog}
            drafts={model.ruleBuilderDrafts}
            selectedRule={selectedRule}
            titleText={ruleTitleText}
            flavorText={ruleFlavorText}
            rulePatchStatus={rulePatchStatus}
            ruleBuilderPatchStatus={ruleBuilderPatchStatus}
            allowedKinds={parsedPuzzle?.allowedKinds ?? []}
            regionOptions={parsedPuzzle?.regions ?? []}
            onCreateFormChange={updateCreateRuleForm}
            onCreate={createBuilderRuleFromDialog}
            onUpdateRule={updateBuilderRule}
            onTitleChange={setRuleTitleText}
            onFlavorChange={setRuleFlavorText}
            onApplyPresentation={applyRulePresentationPatch}
            onClose={closeRuleDialog}
          />
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
  onSelectBuiltIn,
  onSelectLocal,
  onCreateNew,
  onCopyCurrent,
}: {
  readonly builtInCases: ReturnType<typeof createWorkbenchShellModel>['caseOptions']
  readonly localDrafts: readonly WorkbenchLocalCaseRecord[]
  readonly localPublished: readonly WorkbenchLocalCaseRecord[]
  readonly selectedBuiltInId: string | undefined
  readonly selectedLocalId: string | undefined
  readonly onSelectBuiltIn: (caseId: string) => void
  readonly onSelectLocal: (record: WorkbenchLocalCaseRecord) => void
  readonly onCreateNew: () => void
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
        <div className="case-library-actions">
          <button className="icon-button" type="button" onClick={onCreateNew} title="新建地图" aria-label="新建地图">
            <Plus size={15} aria-hidden="true" />
          </button>
          <button className="icon-button copy-current-button" type="button" onClick={onCopyCurrent} title="复制当前为草稿" aria-label="复制当前为草稿">
            <Copy size={15} aria-hidden="true" />
          </button>
          <FolderOpen size={18} aria-hidden="true" />
        </div>
      </div>
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
  objectTypes,
  objectManagerOpen,
  newObjectLabelText,
  patchStatus,
  canPatch,
  onKindChange,
  onManageObjects,
  onCloseObjectManager,
  onObjectLabelChange,
  onNewObjectLabelChange,
  onCreateObject,
  onDeleteObject,
  onApply,
  onToggleInitialReveal,
}: {
  readonly selectedCell: WorkbenchBoardCell | undefined
  readonly activeKind: CellKind
  readonly kindOptions: readonly CellKind[]
  readonly objectTypes: readonly WorkbenchObjectType[]
  readonly objectManagerOpen: boolean
  readonly newObjectLabelText: string
  readonly patchStatus: DraftPatchStatus
  readonly canPatch: boolean
  readonly onKindChange: (kind: CellKind) => void
  readonly onManageObjects: () => void
  readonly onCloseObjectManager: () => void
  readonly onObjectLabelChange: (objectId: string, label: string) => void
  readonly onNewObjectLabelChange: (value: string) => void
  readonly onCreateObject: () => void
  readonly onDeleteObject: (objectId: string) => void
  readonly onApply: () => void
  readonly onToggleInitialReveal: () => void
}) {
  return (
    <section className="cell-editor" aria-label="目标格编辑">
      <div>
        <span className="eyebrow">Cell facts</span>
        <h3>{selectedCell === undefined ? '选择一个格子' : `${selectedCell.id} · ${kindLabel(selectedCell.kind, objectTypes)}`}</h3>
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
          格子内容
          <select
            value={activeKind}
            disabled={!canPatch}
            onChange={(event) => {
              if (event.target.value === '__manage__') {
                onManageObjects()
                return
              }
              onKindChange(event.target.value as CellKind)
            }}
          >
            {kindOptions.map((kind) => (
              <option key={kind} value={kind}>{kindLabel(kind, objectTypes)}</option>
            ))}
            <option value="__manage__">管理物体...</option>
          </select>
        </label>
        <button className="small-button" type="button" onClick={onApply} disabled={!canPatch}>
          应用内容
        </button>
        <button className="small-button" type="button" onClick={onToggleInitialReveal} disabled={!canPatch}>
          {selectedCell?.initiallyRevealed ? '取消初始' : '设为初始'}
        </button>
        <button className="small-button" type="button" onClick={onManageObjects}>
          管理物体
        </button>
      </div>
      {objectManagerOpen ? (
        <ObjectManagerPanel
          objectTypes={objectTypes}
          newObjectLabelText={newObjectLabelText}
          onObjectLabelChange={onObjectLabelChange}
          onNewObjectLabelChange={onNewObjectLabelChange}
          onCreateObject={onCreateObject}
          onDeleteObject={onDeleteObject}
          onClose={onCloseObjectManager}
        />
      ) : null}
      <PatchStatus status={patchStatus} />
    </section>
  )
}

function ObjectManagerPanel({
  objectTypes,
  newObjectLabelText,
  onObjectLabelChange,
  onNewObjectLabelChange,
  onCreateObject,
  onDeleteObject,
  onClose,
}: {
  readonly objectTypes: readonly WorkbenchObjectType[]
  readonly newObjectLabelText: string
  readonly onObjectLabelChange: (objectId: string, label: string) => void
  readonly onNewObjectLabelChange: (value: string) => void
  readonly onCreateObject: () => void
  readonly onDeleteObject: (objectId: string) => void
  readonly onClose: () => void
}) {
  return (
    <section className="object-manager" aria-label="物体管理">
      <div className="object-manager-heading">
        <div>
          <h3>管理物体</h3>
          <p>这里维护的是规则对象库。物体应当可以被格子和规则共同引用；若某种对象暂时不能编译，诊断应明确指出兼容性缺口。</p>
        </div>
        <button className="small-button" type="button" onClick={onClose}>收起</button>
      </div>
      <div className="object-manager-list">
        {objectTypes.map((objectType) => (
          <article key={objectType.id} className="object-manager-row">
            <label>
              显示名称
              <input
                type="text"
                value={objectType.label}
                onChange={(event) => onObjectLabelChange(objectType.id, event.target.value)}
              />
            </label>
            <span>{objectType.custom ? '新物体' : '内置物体'}</span>
            <button
              className="small-button"
              type="button"
              disabled={!objectType.custom}
              onClick={() => onDeleteObject(objectType.id)}
            >
              删除
            </button>
            {objectType.custom ? null : (
              <small>内置物体正在被现有案例引用，可以改显示名称；删除需要先确认没有规则或格子使用它。</small>
            )}
          </article>
        ))}
      </div>
      <div className="object-manager-create">
        <label>
          新物体名称
          <input
            type="text"
            value={newObjectLabelText}
            onChange={(event) => onNewObjectLabelChange(event.target.value)}
            placeholder="例如：钥匙、血迹、相机"
          />
        </label>
        <button className="small-button" type="button" onClick={onCreateObject}>
          创建
        </button>
      </div>
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

function RuleExpressionBuilder({
  drafts,
  selectedRuleId,
  patchStatus,
  onSelectRuleId,
  onEditRule,
  onDuplicateRule,
  onRemoveRule,
  onMoveRule,
  onCreateRule,
}: {
  readonly drafts: readonly RuleBuilderDraft[]
  readonly selectedRuleId: string | undefined
  readonly patchStatus: DraftPatchStatus
  readonly onSelectRuleId: (ruleId: string) => void
  readonly onEditRule: (ruleId: string) => void
  readonly onDuplicateRule: (ruleId: string) => void
  readonly onRemoveRule: (ruleId: string) => void
  readonly onMoveRule: (ruleId: string, direction: -1 | 1) => void
  readonly onCreateRule: () => void
}) {
  const editableCount = drafts.filter((draft) => draft.support === 'editable').length

  return (
    <section className="workbench-section rule-expression-builder">
      <div className="rule-builder-heading">
        <div>
          <h3>规则</h3>
        </div>
        <span>{editableCount} / {drafts.length} 可编辑</span>
      </div>
      <button className="primary-button rule-builder-new-button" type="button" onClick={onCreateRule}>
        <Plus size={16} aria-hidden="true" />
        新建规则
      </button>
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
                {draft.support !== 'editable' ? (
                  <span className="rule-builder-support readonly">暂不能编辑这种定则</span>
                ) : null}
                <div className="rule-builder-actions" aria-label={`${draft.id} rule actions`}>
                  <button
                    type="button"
                    title="编辑"
                    aria-label={`Edit ${draft.id}`}
                    disabled={draft.support !== 'editable'}
                    onClick={() => onEditRule(draft.id)}
                  >
                    <Pencil size={14} aria-hidden="true" />
                  </button>
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
              </div>
              <div className="rule-builder-copy-row">
                <span className="rule-builder-family">{ruleBuilderFamilyLabel(draft.family)}</span>
                <strong>{draft.generatedText.flavor}</strong>
              </div>
              {draft.generatedText.warnings.length === 0 ? null : (
                <ul className="rule-builder-warnings">
                  {draft.generatedText.warnings.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
              )}
              {draft.unsupportedReason === undefined ? null : (
                <small>暂时不能用结构化控件编辑这种规则；请保留或删除。</small>
              )}
            </div>
          ))}
        </div>
      )}
      <PatchStatus status={patchStatus} />
    </section>
  )
}

function RuleDialog({
  state,
  drafts,
  selectedRule,
  titleText,
  flavorText,
  rulePatchStatus,
  ruleBuilderPatchStatus,
  allowedKinds,
  regionOptions,
  onCreateFormChange,
  onCreate,
  onUpdateRule,
  onTitleChange,
  onFlavorChange,
  onApplyPresentation,
  onClose,
}: {
  readonly state: RuleDialogState
  readonly drafts: readonly RuleBuilderDraft[]
  readonly selectedRule: WorkbenchRuleSummary | undefined
  readonly titleText: string
  readonly flavorText: string
  readonly rulePatchStatus: DraftPatchStatus
  readonly ruleBuilderPatchStatus: DraftPatchStatus
  readonly allowedKinds: readonly CellKind[]
  readonly regionOptions: readonly RegionDefinition[]
  readonly onCreateFormChange: (form: RuleBuilderCreateForm) => void
  readonly onCreate: () => void
  readonly onUpdateRule: (ruleId: string, updater: (draft: RuleBuilderDraft) => RuleBuilderDraft) => void
  readonly onTitleChange: (value: string) => void
  readonly onFlavorChange: (value: string) => void
  readonly onApplyPresentation: () => void
  readonly onClose: () => void
}) {
  if (state.kind === 'closed') return null
  const draft = state.kind === 'edit'
    ? drafts.find((candidate) => candidate.id === state.ruleId)
    : undefined

  return (
    <div className="rule-dialog-backdrop" role="presentation">
      <section className="rule-dialog" role="dialog" aria-modal="true" aria-label={state.kind === 'create' ? '新建规则' : '编辑规则'}>
        <div className="rule-dialog-heading">
          <div>
            <h3>{state.kind === 'create' ? '新建规则' : `编辑规则 ${state.ruleId}`}</h3>
            <p>选择模板和参数后，工作台会生成可读规则句子；保存前仍会走 schema、求解和证明诊断。</p>
          </div>
          <button className="small-button" type="button" onClick={onClose}>关闭</button>
        </div>
        {state.kind === 'create' ? (
          <div className="rule-dialog-body">
            <label>
              规则模板
              <select
                value={state.form}
                onChange={(event) => onCreateFormChange(event.target.value as RuleBuilderCreateForm)}
              >
                {RULE_CREATE_FORMS.map((form) => (
                  <option key={form} value={form}>{ruleCreateFormLabel(form)}</option>
                ))}
              </select>
            </label>
            <p className="rule-dialog-preview">将创建：{ruleCreateFormLabel(state.form)}。创建后可继续编辑对象、范围和数量。</p>
            <div className="rule-dialog-actions">
              <button className="primary-button" type="button" onClick={onCreate}>创建规则</button>
              <button className="small-button" type="button" onClick={onClose}>取消</button>
            </div>
            <PatchStatus status={ruleBuilderPatchStatus} />
          </div>
        ) : draft === undefined ? (
          <div className="rule-dialog-body">
            <p className="rule-builder-empty">没有找到这条规则，请关闭后重新选择。</p>
          </div>
        ) : (
          <div className="rule-dialog-body">
            <strong>{draft.generatedText.title}</strong>
            <p className="rule-dialog-preview">{draft.generatedText.flavor}</p>
            {draft.support === 'editable' ? (
              <RuleBuilderControls
                draft={draft}
                allowedKinds={allowedKinds}
                regionOptions={regionOptions}
                onUpdate={(updater) => onUpdateRule(draft.id, updater)}
              />
            ) : (
              <p className="rule-builder-empty">暂时不能用结构化控件编辑这种规则；可以保留、复制或删除。</p>
            )}
            <RuleCopyEditor
              selectedRule={selectedRule}
              titleText={titleText}
              flavorText={flavorText}
              patchStatus={rulePatchStatus}
              canPatch={selectedRule !== undefined}
              onTitleChange={onTitleChange}
              onFlavorChange={onFlavorChange}
              onApply={onApplyPresentation}
            />
            <PatchStatus status={ruleBuilderPatchStatus} />
          </div>
        )}
      </section>
    </div>
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

function createInitialObjectTypes(): readonly WorkbenchObjectType[] {
  return DEFAULT_OBJECT_TYPE_REGISTRY.objectTypes.map((objectType) => ({
    id: objectType.id,
    label: objectType.label.zhHans,
    ...(objectType.legacyKind === undefined ? {} : { legacyKind: objectType.legacyKind }),
    custom: false,
  }))
}

function createObjectTypeId(label: string, existingTypes: readonly WorkbenchObjectType[]): string {
  const base = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'custom-object'
  const existing = new Set(existingTypes.map((objectType) => objectType.id))
  let candidate = base
  let suffix = 2
  while (existing.has(candidate)) {
    candidate = `${base}-${suffix}`
    suffix += 1
  }

  return candidate
}

function parsePuzzleJson(jsonText: string): PuzzleDefinition | undefined {
  try {
    return JSON.parse(jsonText) as PuzzleDefinition
  } catch {
    return undefined
  }
}

function selectedRuleScopeCells(
  puzzle: PuzzleDefinition | undefined,
  ruleId: string | undefined,
): readonly CellId[] {
  if (puzzle === undefined || ruleId === undefined) return []
  const rule = puzzle.rules.find((candidate) => candidate.id === ruleId)
  if (rule === undefined) return []

  return scopePreviewCellsForRule(rule, puzzle)
}

function scopePreviewCellsForRule(rule: RuleDefinition, puzzle: PuzzleDefinition): readonly CellId[] {
  const cells = new Set<CellId>()

  switch (rule.type) {
    case 'globalCount':
      return allCells(puzzle.board)
    case 'forEachCount':
      for (const [cellId, kind] of Object.entries(puzzle.target)) {
        if (kind !== rule.subject) continue
        cells.add(cellId)
        for (const neighbor of neighbors(cellId, rule.scope.kind, puzzle.board)) cells.add(neighbor)
      }
      return sortCellIds(cells, puzzle.board)
    case 'regionCount': {
      const region = (puzzle.regions ?? []).find((candidate) => candidate.id === rule.regionId)
      return region === undefined ? [] : regionCells(region, puzzle.board)
    }
    case 'lineCount':
      return lineScopePreviewCells(rule.origin, rule.scope, puzzle)
    case 'scopeOverlapCount':
      return combineScopePreviewCells(rule.left, rule.right, rule.mode, puzzle)
    case 'comparativeCount':
      return sortCellIds([
        ...countScopePreviewCells(rule.left, puzzle),
        ...countScopePreviewCells(rule.right, puzzle),
      ], puzzle.board)
    case 'conditionalCount':
      return sortCellIds([
        ...countScopePreviewCells(rule.condition.scope, puzzle),
        ...countScopePreviewCells(rule.then.scope, puzzle),
      ], puzzle.board)
    case 'anchorCount':
    case 'recordSet':
      return []
  }
}

function countScopePreviewCells(scope: CountScopeRef, puzzle: PuzzleDefinition): readonly CellId[] {
  switch (scope.kind) {
    case 'global':
      return allCells(puzzle.board)
    case 'region': {
      const region = (puzzle.regions ?? []).find((candidate) => candidate.id === scope.regionId)
      return region === undefined ? [] : regionCells(region, puzzle.board)
    }
    case 'line':
      return lineScopePreviewCells(scope.origin, scope.scope, puzzle)
  }
}

function combineScopePreviewCells(
  left: CountScopeRef,
  right: CountScopeRef,
  mode: ScopeOverlapMode,
  puzzle: PuzzleDefinition,
): readonly CellId[] {
  const leftCells = new Set(countScopePreviewCells(left, puzzle))
  const rightCells = new Set(countScopePreviewCells(right, puzzle))

  switch (mode) {
    case 'intersection':
      return sortCellIds([...leftCells].filter((cellId) => rightCells.has(cellId)), puzzle.board)
    case 'union':
      return sortCellIds([...leftCells, ...rightCells], puzzle.board)
    case 'leftOnly':
      return sortCellIds([...leftCells].filter((cellId) => !rightCells.has(cellId)), puzzle.board)
    case 'rightOnly':
      return sortCellIds([...rightCells].filter((cellId) => !leftCells.has(cellId)), puzzle.board)
  }
}

function lineScopePreviewCells(
  origin: CellId | undefined,
  scope: StaticLineScope | Extract<LineCountRule['scope'], { readonly kind: 'ray' }>,
  puzzle: PuzzleDefinition,
): readonly CellId[] {
  if (scope.kind === 'ray') {
    return origin === undefined ? [] : rayCells(origin, scope.direction, puzzle.board)
  }

  return lineCells(scope, puzzle.board)
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
    <details className="workbench-section diagnostics-caps-editor">
      <summary>高级诊断范围</summary>
      <p>通常不用改。只有诊断提示“检查不完整”时，再临时调高这些上限。</p>
      <div className="diagnostics-caps-grid">
        <DiagnosticsCapInput
          label="求解器尝试次数"
          value={caps.maxNodes}
          disabled={disabled}
          onChange={(value) => onCapChange('maxNodes', value)}
        />
        <DiagnosticsCapInput
          label="可能现场数量"
          value={caps.maxModels}
          disabled={disabled}
          onChange={(value) => onCapChange('maxModels', value)}
        />
        <DiagnosticsCapInput
          label="可能异常区域分布"
          value={caps.maxGuestLayouts}
          disabled={disabled}
          onChange={(value) => onCapChange('maxGuestLayouts', value)}
        />
        <DiagnosticsCapInput
          label="剩余候选答案"
          value={caps.candidateLayoutCap}
          disabled={disabled}
          onChange={(value) => onCapChange('candidateLayoutCap', value)}
        />
      </div>
    </details>
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

function DiagnosticOptionsPanel({
  selectedIds,
  disabled,
  onSelectionChange,
}: {
  readonly selectedIds: readonly WorkbenchDiagnosticOptionId[]
  readonly disabled: boolean
  readonly onSelectionChange: (ids: readonly WorkbenchDiagnosticOptionId[]) => void
}) {
  const selected = new Set(selectedIds)

  function toggle(id: WorkbenchDiagnosticOptionId): void {
    if (disabled) return
    const next = selected.has(id)
      ? selectedIds.filter((candidate) => candidate !== id)
      : [...selectedIds, id]
    onSelectionChange(next)
  }

  return (
    <section className="workbench-section diagnostic-options-panel">
      <div className="diagnostic-options-heading">
        <h3>选择诊断</h3>
        <button
          className="small-button"
          type="button"
          disabled={disabled}
          onClick={() => onSelectionChange(
            selectedIds.length === ALL_WORKBENCH_DIAGNOSTIC_IDS.length
              ? []
              : ALL_WORKBENCH_DIAGNOSTIC_IDS,
          )}
        >
          {selectedIds.length === ALL_WORKBENCH_DIAGNOSTIC_IDS.length ? '清空' : '全选'}
        </button>
      </div>
      <div className="diagnostic-option-list">
        {WORKBENCH_DIAGNOSTIC_OPTIONS.map((option) => (
          <label key={option.id} className="diagnostic-option">
            <input
              type="checkbox"
              checked={selected.has(option.id)}
              disabled={disabled}
              onChange={() => toggle(option.id)}
            />
            <span>
              <b>{option.label}</b>
              <small>{option.description}</small>
            </span>
          </label>
        ))}
      </div>
    </section>
  )
}

function DiagnosticsProgress({ progress }: { readonly progress: WorkbenchDiagnosticProgress | undefined }) {
  if (progress === undefined) return null
  const percent = progress.totalSteps <= 0
    ? 0
    : Math.round((progress.completedSteps / progress.totalSteps) * 100)

  return (
    <div className="diagnostics-progress" role="status" aria-live="polite">
      <div className="diagnostics-progress-copy">
        <b>{progress.currentLabel}</b>
        <span>{percent}%</span>
      </div>
      <div className="diagnostics-progress-track" aria-hidden="true">
        <span style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}

function DiagnosticsCompactSummary({
  state,
  parseOk,
}: {
  readonly state: WorkbenchDiagnosticsState
  readonly parseOk: boolean
}) {
  const report = diagnosticsReportForState(state)

  return (
    <div className="diagnostics-compact-summary">
      <DiagnosticsStateNotice state={state} parseOk={parseOk} />
      <DiagnosticsOverview overview={createWorkbenchDiagnosticsOverview(report)} />
      {report === undefined ? null : (
        <details className="diagnostics-result-popover">
          <summary className="small-button">诊断结果</summary>
          <div className="diagnostics-result-body">
            <div className="diagnostics-group-list">
              {createWorkbenchDiagnosticsGroupDetails(report).map((group) => (
                <DiagnosticsGroupDetailCard key={group.id} group={group} />
              ))}
            </div>
          </div>
        </details>
      )}
    </div>
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
              <span>{item.message}</span>
            </div>
            {item.refs.length === 0 && item.hiddenRefCount === 0 ? null : (
              <details className="diagnostics-technical-details">
                <summary>技术细节</summary>
                <div className="diagnostics-refs" aria-label={`${item.code} refs`}>
                  <code>{item.code}</code>
                  {item.refs.map((ref) => (
                    <code key={`${item.code}:${ref}`}>{ref}</code>
                  ))}
                  {item.hiddenRefCount === 0 ? null : <em>+{item.hiddenRefCount}</em>}
                </div>
              </details>
            )}
          </li>
        ))}
      </ul>
      {group.hiddenItemCount === 0 ? null : (
        <p className="diagnostics-overflow">还有 {group.hiddenItemCount} 条诊断未显示；可在开发者维护区查看完整结构。</p>
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
    case 'cancelled':
      return {
        kind: 'warning',
        message: state.message,
      }
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

function IssueList({ issues }: { readonly issues: readonly string[] }) {
  return (
    <ul className="workbench-issues">
      {issues.map((issue) => (
        <li key={issue}>{issue}</li>
      ))}
    </ul>
  )
}

function kindLabel(kind: CellKind, objectTypes: readonly WorkbenchObjectType[] = createInitialObjectTypes()): string {
  const objectType = objectTypes.find((candidate) => candidate.legacyKind === kind)
  if (objectType !== undefined) return objectType.label

  switch (kind) {
    case 'empty':
      return '空地'
    case 'guest':
      return '异常区域'
    case 'bottle':
    case 'bin':
    case 'mirror':
      return kind
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
