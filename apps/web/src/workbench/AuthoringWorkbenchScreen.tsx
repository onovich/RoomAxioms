import { FileDown, FolderOpen, RotateCcw } from 'lucide-react'
import type { CSSProperties } from 'react'
import { useMemo, useState } from 'react'

import { updateDraftJsonText, type WorkbenchDraftState } from '@room-axioms/authoring/drafts'
import type { CellKind, PuzzleDefinition } from '@room-axioms/domain'

import { contentCases, DEFAULT_CASE_ID, getCaseById } from '../content/cases'
import {
  createWorkbenchDraftFromPuzzle,
  createWorkbenchShellModel,
  type WorkbenchRuleSummary,
} from './model'

export function AuthoringWorkbenchScreen() {
  const [selectedCaseId, setSelectedCaseId] = useState(DEFAULT_CASE_ID)
  const [draft, setDraft] = useState<WorkbenchDraftState>(() => createWorkbenchDraftFromPuzzle(getCaseById(DEFAULT_CASE_ID)))
  const model = useMemo(
    () => createWorkbenchShellModel(contentCases, selectedCaseId, draft),
    [draft, selectedCaseId],
  )
  const parsedPuzzle = model.parse.ok ? model.parse.puzzle : undefined

  function loadCase(caseId: string): void {
    const puzzle = getCaseById(caseId)
    setSelectedCaseId(caseId)
    setDraft(createWorkbenchDraftFromPuzzle(puzzle))
  }

  function resetCurrentCase(): void {
    loadCase(selectedCaseId)
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
                {option.id} · 难度 {option.difficulty} · {option.label}
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
            download={`${parsedPuzzle?.id ?? 'room-axioms-draft'}.json`}
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
            onChange={(event) => setDraft(updateDraftJsonText(draft, event.target.value))}
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
          {parsedPuzzle === undefined ? (
            <IssueList issues={model.parse.issues.map((issue) => `${issue.code}: ${issue.message}`)} />
          ) : (
            <div
              className="workbench-board"
              style={{ '--workbench-board-width': parsedPuzzle.board.width } as CSSProperties}
            >
              {model.boardCells.map((cell) => (
                <div
                  key={cell.id}
                  className={[
                    'workbench-cell',
                    cell.initiallyRevealed ? 'revealed' : '',
                    cell.guestTarget ? 'guest-target' : '',
                  ].filter(Boolean).join(' ')}
                >
                  <span className="coord">{cell.id}</span>
                  <b>{kindLabel(cell.kind)}</b>
                  {cell.initiallyRevealed ? <small>初始</small> : null}
                </div>
              ))}
            </div>
          )}
        </section>

        <aside className="panel workbench-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Diagnostics</span>
              <h2>检查</h2>
            </div>
          </div>
          <WorkbenchStatus puzzle={parsedPuzzle} draft={draft} exportOk={model.exported.ok} />
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
