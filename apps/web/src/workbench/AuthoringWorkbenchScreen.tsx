import { FileDown, FolderOpen, RotateCcw } from 'lucide-react'
import type { CSSProperties } from 'react'
import { useMemo, useState } from 'react'

import { updateDraftJsonText, type WorkbenchDraftState } from '@room-axioms/authoring/drafts'
import type { AuthoringDiagnosticsGroup, AuthoringDraftDiagnosticsReport } from '@room-axioms/authoring/diagnostics'
import type { BoardSize, CellId, CellKind, PuzzleDefinition } from '@room-axioms/domain'

import { DEFAULT_CASE_ID } from '../content/cases'
import { getWorkbenchCaseImportById, workbenchCaseLibrary, type WorkbenchCaseSource } from './caseLibrary'
import {
  createWorkbenchDraftFromPuzzle,
  createWorkbenchShellModel,
  evaluateWorkbenchDiagnostics,
  patchWorkbenchBoardSize,
  patchWorkbenchTargetCell,
  toggleWorkbenchInitialReveal,
  workbenchCellKindOptions,
  type WorkbenchBoardCell,
  type WorkbenchRuleSummary,
} from './model'

type DraftPatchStatus =
  | { readonly kind: 'idle' }
  | { readonly kind: 'applied'; readonly message: string }
  | { readonly kind: 'rejected'; readonly message: string; readonly issues: readonly string[] }

export default function AuthoringWorkbenchScreen() {
  const defaultCase = getWorkbenchCaseImportById(DEFAULT_CASE_ID).puzzle
  const [selectedCaseId, setSelectedCaseId] = useState(DEFAULT_CASE_ID)
  const [draft, setDraft] = useState<WorkbenchDraftState>(() => createWorkbenchDraftFromPuzzle(defaultCase))
  const [diagnostics, setDiagnostics] = useState<AuthoringDraftDiagnosticsReport | undefined>()
  const [selectedCellId, setSelectedCellId] = useState<CellId | undefined>()
  const [activeKind, setActiveKind] = useState<CellKind>('empty')
  const [patchStatus, setPatchStatus] = useState<DraftPatchStatus>({ kind: 'idle' })
  const [boardWidthText, setBoardWidthText] = useState(String(defaultCase.board.width))
  const [boardHeightText, setBoardHeightText] = useState(String(defaultCase.board.height))
  const model = useMemo(
    () => createWorkbenchShellModel(workbenchCaseLibrary, selectedCaseId, draft),
    [draft, selectedCaseId],
  )
  const parsedPuzzle = model.parse.ok ? model.parse.puzzle : undefined
  const selectedCell = selectedCellId === undefined
    ? undefined
    : model.boardCells.find((cell) => cell.id === selectedCellId)
  const kindOptions = workbenchCellKindOptions(parsedPuzzle, selectedCell?.kind ?? activeKind)

  function loadCase(caseId: string): void {
    const item = getWorkbenchCaseImportById(caseId)
    setSelectedCaseId(caseId)
    setDraft(createWorkbenchDraftFromPuzzle(item.puzzle))
    setDiagnostics(undefined)
    setSelectedCellId(undefined)
    setActiveKind('empty')
    setBoardWidthText(String(item.puzzle.board.width))
    setBoardHeightText(String(item.puzzle.board.height))
    setPatchStatus({ kind: 'idle' })
  }

  function resetCurrentCase(): void {
    loadCase(selectedCaseId)
  }

  function updateDraftText(jsonText: string): void {
    setDraft(updateDraftJsonText(draft, jsonText))
    setDiagnostics(undefined)
    setSelectedCellId(undefined)
    setActiveKind('empty')
    setBoardWidthText('')
    setBoardHeightText('')
    setPatchStatus({ kind: 'idle' })
  }

  function runDiagnostics(): void {
    setDiagnostics(evaluateWorkbenchDiagnostics(draft, selectedCaseId))
  }

  function selectBoardCell(cell: WorkbenchBoardCell): void {
    setSelectedCellId(cell.id)
    setActiveKind(cell.kind)
    setPatchStatus({ kind: 'idle' })
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
    applySuccessfulPatch(patch.state, `棋盘尺寸已改为 ${board.width} × ${board.height}；完整诊断已标记为待重新运行。`)
  }

  function applySuccessfulPatch(nextDraft: WorkbenchDraftState, message: string): void {
    setDraft(nextDraft)
    setDiagnostics(undefined)
    setPatchStatus({ kind: 'applied', message })
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
            <button className="small-button" type="button" onClick={runDiagnostics}>
              运行诊断
            </button>
          </div>
          <WorkbenchStatus puzzle={parsedPuzzle} draft={draft} exportOk={model.exported.ok} />
          <ImportExportSummary
            selectedOption={model.caseOptions.find((option) => option.id === selectedCaseId)}
            exportStatus={model.exportStatus}
          />
          <DiagnosticsSummary report={diagnostics} parseOk={model.parse.ok} />
          <section className="workbench-section">
            <h3>规则</h3>
            <div className="workbench-rule-list">
              {model.ruleSummaries.map((rule) => (
                <RuleSummary key={rule.id} rule={rule} />
              ))}
            </div>
          </section>
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

function parseBoardSize(widthText: string, heightText: string): BoardSize | undefined {
  const width = Number(widthText)
  const height = Number(heightText)
  if (!Number.isInteger(width) || !Number.isInteger(height)) return undefined
  if (width < 1 || width > 26 || height < 1 || height > 26) return undefined

  return { width, height }
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

function DiagnosticsSummary({
  report,
  parseOk,
}: {
  readonly report: AuthoringDraftDiagnosticsReport | undefined
  readonly parseOk: boolean
}) {
  if (report === undefined) {
    return (
      <section className="workbench-section">
        <h3>诊断</h3>
        <IssueList issues={[
          parseOk
            ? '尚未运行完整诊断。点击“运行诊断”查看正确性、证明、质量、难度、文案和性能分组。'
            : 'JSON 当前无法解析，修复格式后再运行完整诊断。',
        ]} />
      </section>
    )
  }

  return (
    <section className="workbench-section">
      <h3>诊断 · {diagnosticsStatusText(report.status)}</h3>
      <div className="diagnostics-group-list">
        {report.groups.map((group) => (
          <article key={group.id} className={`diagnostics-group ${group.status}`}>
            <div className="diagnostics-group-heading">
              <b>{diagnosticsTitle(group.title)}</b>
              <span>{diagnosticsStatusLabel(group.status)}</span>
            </div>
            <ul>
              {group.items.slice(0, 3).map((item) => (
                <li key={`${group.id}:${item.code}:${item.message}`}>
                  <strong>{item.code}</strong>
                  <span>{item.message}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  )
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

function RuleSummary({ rule }: { readonly rule: WorkbenchRuleSummary }) {
  return (
    <article className="workbench-rule-card">
      <div>
        <b>{rule.id} · {rule.title}</b>
        <span>{ruleTypeLabel(rule.type)}</span>
      </div>
      {rule.flavor === undefined ? null : <p>{rule.flavor}</p>}
    </article>
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
