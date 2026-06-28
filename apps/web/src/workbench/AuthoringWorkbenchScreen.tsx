import { FileDown, FolderOpen, RotateCcw } from 'lucide-react'
import type { CSSProperties } from 'react'
import { useMemo, useState } from 'react'

import { updateDraftJsonText, type WorkbenchDraftState } from '@room-axioms/authoring/drafts'
import type { AuthoringDiagnosticsGroup, AuthoringDraftDiagnosticsReport } from '@room-axioms/authoring/diagnostics'
import type { RuleBuilderDraft } from '@room-axioms/authoring/rule-builder'
import type { BoardSize, CellId, CellKind, PuzzleDefinition } from '@room-axioms/domain'

import { DEFAULT_CASE_ID } from '../content/cases'
import { getWorkbenchCaseImportById, workbenchCaseLibrary, type WorkbenchCaseSource } from './caseLibrary'
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

const METADATA_STATUSES = ['draft', 'validated', 'published', 'deprecated'] as const

export default function AuthoringWorkbenchScreen() {
  const defaultCase = getWorkbenchCaseImportById(DEFAULT_CASE_ID).puzzle
  const [selectedCaseId, setSelectedCaseId] = useState(DEFAULT_CASE_ID)
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
  const kindOptions = workbenchCellKindOptions(parsedPuzzle, selectedCell?.kind ?? activeKind)

  function loadCase(caseId: string): void {
    const item = getWorkbenchCaseImportById(caseId)
    setSelectedCaseId(caseId)
    setDraft(createWorkbenchDraftFromPuzzle(item.puzzle))
    setDiagnosticsState(createWorkbenchDiagnosticsState())
    setSelectedCellId(undefined)
    setSelectedRuleId(undefined)
    setActiveKind('empty')
    setBoardWidthText(String(item.puzzle.board.width))
    setBoardHeightText(String(item.puzzle.board.height))
    setRuleTitleText('')
    setRuleFlavorText('')
    syncMetadataEditor(item.puzzle)
    setRulesJsonText(createWorkbenchRulesJson(item.puzzle))
    setScopeCollectionsText(createWorkbenchScopeCollectionsJson(item.puzzle))
    setPatchStatus({ kind: 'idle' })
    setRulePatchStatus({ kind: 'idle' })
    setRulesPatchStatus({ kind: 'idle' })
    setScopePatchStatus({ kind: 'idle' })
    setMetadataPatchStatus({ kind: 'idle' })
  }

  function resetCurrentCase(): void {
    loadCase(selectedCaseId)
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
            <div className="case-name">{parsedPuzzle?.caseName ?? parsedPuzzle?.title ?? 'JSON draft'}</div>
          </div>
        </div>
        <label className="case-picker">
          导入
          <select value={selectedCaseId} onChange={(event) => loadCase(event.target.value)}>
            {model.caseOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {sourceLabel(option.source)} · {option.id} · 难度 {option.difficulty} · {option.label}
              </option>
            ))}
          </select>
        </label>
        <div className="top-actions">
          <button className="ghost-button" type="button" onClick={resetCurrentCase}>
            <RotateCcw size={16} aria-hidden="true" />
            重载
          </button>
          <a
            className="primary-button"
            href={model.exported.ok ? draftDownloadHref(model.exported.jsonText) : undefined}
            download={model.exportStatus.fileName}
            aria-disabled={!model.exported.ok}
          >
            <FileDown size={16} aria-hidden="true" />
            导出 JSON
          </a>
        </div>
      </header>

      <main className="workbench-shell">
        <section className="panel workbench-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Import</span>
              <h2>草稿</h2>
            </div>
            <FolderOpen size={18} aria-hidden="true" />
          </div>
          <textarea
            className="draft-json-editor"
            spellCheck={false}
            value={draft.jsonText}
            onChange={(event) => updateDraftText(event.target.value)}
            aria-label="Draft JSON"
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
          <WorkbenchStatus puzzle={parsedPuzzle} draft={draft} exportOk={model.exported.ok} />
          <ImportExportSummary
            selectedOption={model.caseOptions.find((option) => option.id === selectedCaseId)}
            exportStatus={model.exportStatus}
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
            onSelectRuleId={selectRuleById}
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
          <section className="workbench-section">
            <h3>导出</h3>
            <pre className="export-preview">{model.exported.ok ? model.exported.jsonText : 'JSON 当前无效'}</pre>
          </section>
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
          <select
            value={activeKind}
            onChange={(event) => onKindChange(event.target.value as CellKind)}
            disabled={!canPatch}
          >
            {kindOptions.map((kind) => (
              <option key={kind} value={kind}>{kindLabel(kind)}</option>
            ))}
          </select>
        </label>
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

function RuleExpressionBuilder({
  drafts,
  selectedRuleId,
  onSelectRuleId,
}: {
  readonly drafts: readonly RuleBuilderDraft[]
  readonly selectedRuleId: string | undefined
  readonly onSelectRuleId: (ruleId: string) => void
}) {
  const editableCount = drafts.filter((draft) => draft.support === 'editable').length

  return (
    <section className="workbench-section rule-expression-builder">
      <div className="rule-builder-heading">
        <div>
          <h3>规则表达式</h3>
          <p>从规则结构生成中文说明；只读规则会保留原始 JSON，不做有损改写。</p>
        </div>
        <span>{editableCount} / {drafts.length} editable</span>
      </div>
      {drafts.length === 0 ? (
        <p className="rule-builder-empty">当前草稿没有可显示的规则表达式。</p>
      ) : (
        <div className="rule-builder-list">
          {drafts.map((draft, index) => (
            <button
              key={draft.id}
              className={`rule-builder-card ${selectedRuleId === draft.id ? 'selected' : ''}`}
              type="button"
              onClick={() => onSelectRuleId(draft.id)}
              aria-pressed={selectedRuleId === draft.id}
            >
              <div className="rule-builder-card-head">
                <b>{index + 1}. {draft.id}</b>
                <span className={`rule-builder-support ${draft.support}`}>
                  {draft.support === 'editable' ? '结构化编辑' : '只读保留'}
                </span>
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
            </button>
          ))}
        </div>
      )}
    </section>
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
      return '已发布'
    case 'experimental':
      return '实验'
  }
}

function WorkbenchStatus({
  puzzle,
  draft,
  exportOk,
}: {
  readonly puzzle: PuzzleDefinition | undefined
  readonly draft: WorkbenchDraftState
  readonly exportOk: boolean
}) {
  return (
    <dl className="workbench-status-grid">
      <div>
        <dt>草稿</dt>
        <dd>{draft.dirty ? '已修改' : '未修改'}</dd>
      </div>
      <div>
        <dt>Schema</dt>
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
      <div>
        <dt>导出</dt>
        <dd>{exportOk ? '可用' : '不可用'}</dd>
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
