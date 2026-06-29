import {
  exportDraftJson,
  formatDraftJson,
  importPuzzleToDraftState,
  patchDraftAnchors,
  patchDraftBoardSize,
  patchDraftMetadata,
  patchDraftNormalizedTargetCell,
  patchDraftRegions,
  patchDraftRulePresentation,
  patchDraftRules,
  patchDraftTargetCell,
  parseDraftJson,
  toggleDraftInitialReveal,
  type PatchDraftRulePresentationInput,
  type PatchDraftMetadataInput,
  type WorkbenchDraftExportResult,
  type WorkbenchDraftPatchResult,
  type WorkbenchDraftParseResult,
  type WorkbenchDraftState,
} from '@room-axioms/authoring/drafts'
import {
  createRuleBuilderDrafts,
  createRuleBuilderRule,
  exportRuleBuilderDrafts,
  type RuleBuilderCreateInput,
  type RuleBuilderDraft,
} from '@room-axioms/authoring/rule-builder'
import {
  DEFAULT_CAPS,
  evaluateDraftDiagnostics,
  type AuthoringDiagnosticsGroup,
  type AuthoringDiagnosticsItem,
  type AuthoringDraftDiagnosticsInput,
  type AuthoringDraftDiagnosticsReport,
} from '@room-axioms/authoring/diagnostics'
import {
  allCells,
  normalizeLegacyCellKind,
  type AnchorDefinition,
  type BoardSize,
  type CellId,
  type CellKind,
  type NormalizedCellState,
  type PuzzleDefinition,
  type RegionDefinition,
  type RuleDefinition,
} from '@room-axioms/domain'
import type { SchemaIssue } from '@room-axioms/schema'

import type { WorkbenchCaseImport, WorkbenchCaseSource } from './caseLibrary'

export const WORKBENCH_CELL_KIND_OPTIONS: readonly CellKind[] = ['empty', 'bottle', 'bin', 'mirror', 'guest']

export interface WorkbenchCaseOption {
  readonly id: string
  readonly label: string
  readonly difficulty: PuzzleDefinition['metadata']['difficulty']
  readonly source: WorkbenchCaseSource
  readonly sourcePath: string
}

export interface WorkbenchBoardCell {
  readonly id: CellId
  readonly kind: CellKind
  readonly normalized: NormalizedCellState
  readonly initiallyRevealed: boolean
  readonly guestTarget: boolean
}

export interface WorkbenchRuleSummary {
  readonly id: string
  readonly type: PuzzleDefinition['rules'][number]['type']
  readonly title: string
  readonly flavor?: string
}

export interface WorkbenchScopeCollectionsDraft {
  readonly regions: readonly RegionDefinition[]
  readonly anchors: readonly AnchorDefinition[]
}

export interface WorkbenchRulesDraft {
  readonly rules: readonly RuleDefinition[]
}

export interface WorkbenchExportStatus {
  readonly ok: boolean
  readonly fileName: string
  readonly message: string
  readonly issueCount: number
}

export interface WorkbenchShellModel {
  readonly selectedCaseId: string
  readonly draft: WorkbenchDraftState
  readonly parse: WorkbenchDraftParseResult
  readonly exported: WorkbenchDraftExportResult
  readonly exportStatus: WorkbenchExportStatus
  readonly caseOptions: readonly WorkbenchCaseOption[]
  readonly boardCells: readonly WorkbenchBoardCell[]
  readonly ruleSummaries: readonly WorkbenchRuleSummary[]
  readonly ruleBuilderDrafts: readonly RuleBuilderDraft[]
}

export type WorkbenchDiagnosticsState =
  | {
      readonly status: 'idle'
      readonly requestId: number
    }
  | {
      readonly status: 'running'
      readonly requestId: number
      readonly report?: AuthoringDraftDiagnosticsReport
    }
  | {
      readonly status: 'current'
      readonly requestId: number
      readonly report: AuthoringDraftDiagnosticsReport
    }
  | {
      readonly status: 'stale'
      readonly requestId: number
      readonly report: AuthoringDraftDiagnosticsReport
      readonly message: string
    }
  | {
      readonly status: 'unavailable'
      readonly requestId: number
      readonly message: string
    }
  | {
      readonly status: 'failed'
      readonly requestId: number
      readonly message: string
      readonly report?: AuthoringDraftDiagnosticsReport
    }
  | {
      readonly status: 'cancelled'
      readonly requestId: number
      readonly message: string
      readonly report?: AuthoringDraftDiagnosticsReport
    }

export type WorkbenchDiagnosticsOverviewTone = 'pass' | 'info' | 'warning' | 'fail'

export interface WorkbenchDiagnosticsOverviewMetric {
  readonly id: string
  readonly label: string
  readonly value: string
  readonly tone: WorkbenchDiagnosticsOverviewTone
  readonly detail?: string
}

export interface WorkbenchDiagnosticsOverview {
  readonly metrics: readonly WorkbenchDiagnosticsOverviewMetric[]
  readonly capWarnings: readonly string[]
  readonly techniqueIds: readonly string[]
}

export interface WorkbenchDiagnosticsItemDetail {
  readonly code: string
  readonly severity: AuthoringDiagnosticsItem['severity']
  readonly message: string
  readonly refs: readonly string[]
  readonly hiddenRefCount: number
}

export interface WorkbenchDiagnosticsGroupDetail {
  readonly id: AuthoringDiagnosticsGroup['id']
  readonly title: string
  readonly status: AuthoringDiagnosticsGroup['status']
  readonly items: readonly WorkbenchDiagnosticsItemDetail[]
  readonly hiddenItemCount: number
}

export type WorkbenchDiagnosticsCaps = Required<NonNullable<AuthoringDraftDiagnosticsInput['caps']>>

export function createWorkbenchDraftFromPuzzle(puzzle: PuzzleDefinition): WorkbenchDraftState {
  return importPuzzleToDraftState(puzzle, {
    label: puzzle.id,
  })
}

export function createWorkbenchShellModel(
  cases: readonly WorkbenchCaseImport[],
  selectedCaseId: string,
  draft: WorkbenchDraftState,
): WorkbenchShellModel {
  const parse = parseDraftJson(draft.jsonText)
  const exported = exportDraftJson(draft)

  return {
    selectedCaseId,
    draft,
    parse,
    exported,
    exportStatus: exportStatus(exported, selectedCaseId),
    caseOptions: cases.map(caseOption),
    boardCells: parse.ok ? boardCells(parse.puzzle) : [],
    ruleSummaries: parse.ok ? parse.puzzle.rules.map(ruleSummary) : [],
    ruleBuilderDrafts: parse.ok ? createRuleBuilderDrafts(parse.puzzle) : [],
  }
}

export function evaluateWorkbenchDiagnostics(
  draft: WorkbenchDraftState,
  selectedCaseId: string,
  caps: WorkbenchDiagnosticsCaps = defaultWorkbenchDiagnosticsCaps(),
  comparisonPuzzles: readonly PuzzleDefinition[] = [],
): AuthoringDraftDiagnosticsReport | undefined {
  const parsedDraft = parseDraftJsonValue(draft.jsonText)
  if (parsedDraft === undefined) return undefined

  return evaluateDraftDiagnostics({
    draft: parsedDraft,
    sourcePath: `<workbench:${selectedCaseId}>`,
    caps,
    comparisonPuzzles,
  })
}

export function defaultWorkbenchDiagnosticsCaps(): WorkbenchDiagnosticsCaps {
  return { ...DEFAULT_CAPS }
}

export function createWorkbenchDiagnosticsState(): WorkbenchDiagnosticsState {
  return {
    status: 'idle',
    requestId: 0,
  }
}

export function beginWorkbenchDiagnostics(
  state: WorkbenchDiagnosticsState,
): WorkbenchDiagnosticsState {
  const previousReport = diagnosticsReportForState(state)

  return {
    status: 'running',
    requestId: state.requestId + 1,
    ...(previousReport === undefined ? {} : { report: previousReport }),
  }
}

export function completeWorkbenchDiagnostics(
  state: WorkbenchDiagnosticsState,
  requestId: number,
  report: AuthoringDraftDiagnosticsReport | undefined,
): WorkbenchDiagnosticsState {
  if (state.status !== 'running' || state.requestId !== requestId) return state
  if (report === undefined) {
    return {
      status: 'unavailable',
      requestId,
      message: 'JSON draft must parse before full diagnostics can run.',
    }
  }

  return {
    status: 'current',
    requestId,
    report,
  }
}

export function failWorkbenchDiagnostics(
  state: WorkbenchDiagnosticsState,
  requestId: number,
  error: unknown,
): WorkbenchDiagnosticsState {
  if (state.status !== 'running' || state.requestId !== requestId) return state

  return {
    status: 'failed',
    requestId,
    message: error instanceof Error ? error.message : 'Diagnostics failed.',
    ...(state.report === undefined ? {} : { report: state.report }),
  }
}

export function cancelWorkbenchDiagnostics(
  state: WorkbenchDiagnosticsState,
  requestId: number,
  report: AuthoringDraftDiagnosticsReport | undefined,
): WorkbenchDiagnosticsState {
  if (state.status !== 'running' || state.requestId !== requestId) return state

  return {
    status: 'cancelled',
    requestId,
    message: report === undefined ? '诊断已取消。' : '诊断已取消；已保留完成的部分结果。',
    ...(report === undefined ? {} : { report }),
  }
}

export function markWorkbenchDiagnosticsStale(
  state: WorkbenchDiagnosticsState,
  message = 'Draft changed after diagnostics ran. Re-run diagnostics before trusting these results.',
): WorkbenchDiagnosticsState {
  const report = diagnosticsReportForState(state)
  if (report === undefined) {
    return {
      status: 'idle',
      requestId: state.requestId,
    }
  }

  return {
    status: 'stale',
    requestId: state.requestId,
    report,
    message,
  }
}

export function diagnosticsReportForState(
  state: WorkbenchDiagnosticsState,
): AuthoringDraftDiagnosticsReport | undefined {
  switch (state.status) {
    case 'current':
    case 'running':
    case 'stale':
    case 'failed':
    case 'cancelled':
      return state.report
    case 'idle':
    case 'unavailable':
      return undefined
  }
}

export function createWorkbenchDiagnosticsOverview(
  report: AuthoringDraftDiagnosticsReport | undefined,
): WorkbenchDiagnosticsOverview | undefined {
  if (report === undefined) return undefined

  const validation = report.validation
  const proof = validation.proof
  const initialLayouts = validation.initialGuestLayouts
  const difficulty = validation.difficultyReview
  const quality = report.quality
  const copyWarningCount = report.copyWarnings.length
  const cloneStatus = report.cloneRisk?.status

  return {
    metrics: [
      {
        id: 'recommendation',
        label: '建议',
        value: recommendationLabel(validation.recommendation),
        tone: recommendationTone(validation.recommendation),
        detail: statusLabel(report.status),
      },
      {
        id: 'candidate-layouts',
        label: '候选布局',
        value: initialLayouts === undefined
          ? '未评估'
          : initialLayouts.greaterThan === undefined
            ? String(initialLayouts.count)
            : `>${initialLayouts.greaterThan}`,
        tone: initialLayouts === undefined
          ? 'info'
          : initialLayouts.stats.truncated || initialLayouts.greaterThan !== undefined
            ? 'warning'
            : initialLayouts.count > 0
              ? 'pass'
              : 'fail',
        detail: initialLayouts === undefined
          ? '草稿需要先通过 schema。'
          : `节点 ${initialLayouts.stats.nodeCount}，传播 ${initialLayouts.stats.propagationCount}`,
      },
      {
        id: 'proof',
        label: '人类证明',
        value: proof === undefined ? '未评估' : `${proof.waveCount} 波 / ${proof.deductionCount} 步`,
        tone: proof === undefined
          ? 'info'
          : proof.noGuess && proof.humanExplainable && proof.guestLayoutUniqueAtEnd
            ? 'pass'
            : 'fail',
        detail: proof === undefined
          ? '草稿需要先通过 schema。'
          : `${proof.techniqueIds.length} 类技术；最终访客 ${proof.finalGuestCells?.join(', ') ?? '未定'}`,
      },
      {
        id: 'quality',
        label: '质量门',
        value: quality === undefined ? '未评估' : gateLabel(quality.degeneracy.status),
        tone: quality === undefined ? 'info' : gateTone(quality.degeneracy.status),
        detail: quality === undefined
          ? '草稿需要先通过 schema。'
          : `${quality.effectiveBoard.irrelevantCells.length} 个无效格；${quality.ruleContribution.results.filter((result) => result.status === 'redundant').length} 条冗余嫌疑`,
      },
      {
        id: 'clone-risk',
        label: '克隆风险',
        value: cloneStatus === undefined ? '未比较' : cloneRiskLabel(cloneStatus),
        tone: cloneStatus === undefined ? 'info' : cloneRiskTone(cloneStatus),
        detail: cloneStatus === undefined
          ? '本次诊断未提供对照谜题。'
          : `${report.cloneRisk?.hardFailureCount ?? 0} 个硬失败，${report.cloneRisk?.reviewerBlockingCount ?? 0} 个复核阻断`,
      },
      {
        id: 'difficulty',
        label: '难度',
        value: difficulty === undefined ? '未评估' : difficultyBucketLabel(difficulty.recommendedBucket),
        tone: difficulty === undefined ? 'info' : 'warning',
        detail: difficulty === undefined
          ? '草稿需要先通过 schema。'
          : `未校准；${difficulty.proofWaveCount} 波，${difficulty.deductionCount} 步，${difficulty.materialRuleFamilyCount} 个有效规则族`,
      },
      {
        id: 'copy',
        label: '文案警告',
        value: String(copyWarningCount),
        tone: copyWarningCount === 0 ? 'pass' : 'warning',
        detail: copyWarningCount === 0 ? '没有发现内部术语或高亮依赖警告。' : '需要复核玩家是否能只靠文本理解规则。',
      },
      {
        id: 'performance',
        label: '上限/截断',
        value: report.performance.truncated ? `${report.performance.capWarnings.length} 项` : '清晰',
        tone: report.performance.truncated ? 'warning' : 'pass',
        detail: report.performance.truncated
          ? report.performance.capWarnings.join(', ')
          : `caps ${validation.caps.maxNodes}/${validation.caps.maxModels}/${validation.caps.maxGuestLayouts}`,
      },
    ],
    capWarnings: report.performance.capWarnings,
    techniqueIds: proof?.techniqueIds ?? [],
  }
}

export function createWorkbenchDiagnosticsGroupDetails(
  report: AuthoringDraftDiagnosticsReport | undefined,
  options: {
    readonly maxItemsPerGroup?: number
    readonly maxRefsPerItem?: number
  } = {},
): readonly WorkbenchDiagnosticsGroupDetail[] {
  if (report === undefined) return []

  const maxItemsPerGroup = options.maxItemsPerGroup ?? 6
  const maxRefsPerItem = options.maxRefsPerItem ?? 6

  return report.groups.map((group) => {
    const visibleItems = group.items.slice(0, maxItemsPerGroup)

    return {
      id: group.id,
      title: group.title,
      status: group.status,
      items: visibleItems.map((item) => {
        const refs = item.refs ?? []

        return {
          code: item.code,
          severity: item.severity,
          message: item.message,
          refs: refs.slice(0, maxRefsPerItem),
          hiddenRefCount: Math.max(0, refs.length - maxRefsPerItem),
        }
      }),
      hiddenItemCount: Math.max(0, group.items.length - maxItemsPerGroup),
    }
  })
}

export function patchWorkbenchTargetCell(
  draft: WorkbenchDraftState,
  cellId: CellId,
  kind: CellKind,
): WorkbenchDraftPatchResult {
  return patchDraftTargetCell(draft, cellId, kind)
}

export function patchWorkbenchNormalizedTargetCell(
  draft: WorkbenchDraftState,
  cellId: CellId,
  cell: NormalizedCellState,
): WorkbenchDraftPatchResult {
  return patchDraftNormalizedTargetCell(draft, cellId, cell)
}

export function patchWorkbenchBoardSize(
  draft: WorkbenchDraftState,
  board: BoardSize,
): WorkbenchDraftPatchResult {
  return patchDraftBoardSize(draft, board)
}

export function toggleWorkbenchInitialReveal(
  draft: WorkbenchDraftState,
  cellId: CellId,
): WorkbenchDraftPatchResult {
  return toggleDraftInitialReveal(draft, cellId)
}

export function patchWorkbenchRulePresentation(
  draft: WorkbenchDraftState,
  input: PatchDraftRulePresentationInput,
): WorkbenchDraftPatchResult {
  return patchDraftRulePresentation(draft, input)
}

export function patchWorkbenchMetadata(
  draft: WorkbenchDraftState,
  input: PatchDraftMetadataInput,
): WorkbenchDraftPatchResult {
  return patchDraftMetadata(draft, input)
}

export function createWorkbenchScopeCollectionsJson(
  puzzle: PuzzleDefinition | undefined,
): string {
  return formatDraftJson({
    regions: puzzle?.regions ?? [],
    anchors: puzzle?.anchors ?? [],
  })
}

export function patchWorkbenchScopeCollectionsJson(
  draft: WorkbenchDraftState,
  jsonText: string,
): WorkbenchDraftPatchResult {
  const parsed = parseScopeCollectionsJson(jsonText)
  if (!parsed.ok) {
    return {
      ok: false,
      state: draft,
      issues: parsed.issues,
    }
  }

  const regionsPatch = patchDraftRegions(draft, parsed.value.regions)
  if (!regionsPatch.ok) return regionsPatch

  const anchorsPatch = patchDraftAnchors(regionsPatch.state, parsed.value.anchors)
  if (!anchorsPatch.ok) {
    return {
      ok: false,
      state: draft,
      issues: anchorsPatch.issues,
    }
  }

  return anchorsPatch
}

export function createWorkbenchRulesJson(
  puzzle: PuzzleDefinition | undefined,
): string {
  return formatDraftJson({
    rules: puzzle?.rules ?? [],
  })
}

export function patchWorkbenchRulesJson(
  draft: WorkbenchDraftState,
  jsonText: string,
): WorkbenchDraftPatchResult {
  const parsed = parseRulesJson(jsonText)
  if (!parsed.ok) {
    return {
      ok: false,
      state: draft,
      issues: parsed.issues,
    }
  }

  return patchDraftRules(draft, parsed.value.rules)
}

export function patchWorkbenchRuleBuilderDrafts(
  draft: WorkbenchDraftState,
  ruleDrafts: readonly RuleBuilderDraft[],
): WorkbenchDraftPatchResult {
  return patchDraftRules(draft, exportRuleBuilderDrafts(ruleDrafts))
}

export function patchWorkbenchRuleBuilderCreateRule(
  draft: WorkbenchDraftState,
  input: RuleBuilderCreateInput,
): WorkbenchDraftPatchResult {
  const parse = parseDraftJson(draft.jsonText)
  if (!parse.ok) {
    return {
      ok: false,
      state: draft,
      issues: parse.issues,
    }
  }

  const created = createRuleBuilderRule(parse.puzzle, input)
  const regions = mergeRegions(parse.puzzle.regions ?? [], created.regions)
  const regionsPatch = patchDraftRegions(draft, regions)
  if (!regionsPatch.ok) return regionsPatch

  return patchDraftRules(regionsPatch.state, [...regionsPatch.puzzle.rules, created.rule])
}

export function workbenchCellKindOptions(
  puzzle: PuzzleDefinition | undefined,
  currentKind: CellKind | undefined,
): readonly CellKind[] {
  const available = new Set<CellKind>(puzzle?.allowedKinds ?? WORKBENCH_CELL_KIND_OPTIONS)
  if (currentKind !== undefined) available.add(currentKind)

  return WORKBENCH_CELL_KIND_OPTIONS.filter((kind) => available.has(kind))
}

function caseOption(item: WorkbenchCaseImport): WorkbenchCaseOption {
  const puzzle = item.puzzle

  return {
    id: puzzle.id,
    label: puzzle.caseName ?? puzzle.title,
    difficulty: puzzle.metadata.difficulty,
    source: item.source,
    sourcePath: item.sourcePath,
  }
}

function exportStatus(exported: WorkbenchDraftExportResult, selectedCaseId: string): WorkbenchExportStatus {
  if (!exported.ok) {
    return {
      ok: false,
      fileName: `${selectedCaseId}-invalid-draft.json`,
      message: 'JSON 当前无效，修复解析或 schema 问题后才能导出。',
      issueCount: exported.issues.length,
    }
  }

  return {
    ok: true,
    fileName: `${exported.puzzle?.id ?? selectedCaseId}-workbench-draft.json`,
    message: '导出只生成本地 JSON，不会写入 content/cases 或玩家选择器。',
    issueCount: 0,
  }
}

function parseDraftJsonValue(jsonText: string): unknown | undefined {
  try {
    return JSON.parse(jsonText) as unknown
  } catch {
    return undefined
  }
}

function boardCells(puzzle: PuzzleDefinition): readonly WorkbenchBoardCell[] {
  const revealed = new Set<CellId>(puzzle.initialReveals)

  return allCells(puzzle.board).map((id) => ({
    id,
    kind: puzzle.target[id],
    normalized: normalizeLegacyCellKind(puzzle.target[id]),
    initiallyRevealed: revealed.has(id),
    guestTarget: puzzle.target[id] === 'guest',
  }))
}

function ruleSummary(rule: PuzzleDefinition['rules'][number]): WorkbenchRuleSummary {
  return {
    id: rule.id,
    type: rule.type,
    title: rule.presentation.title,
    ...(rule.presentation.flavor === undefined ? {} : { flavor: rule.presentation.flavor }),
  }
}

function recommendationLabel(recommendation: AuthoringDraftDiagnosticsReport['validation']['recommendation']): string {
  switch (recommendation) {
    case 'ready-for-experimental-review':
      return '可进入私下复核'
    case 'repair-schema':
      return '修 schema'
    case 'repair-target-rules':
      return '修目标/规则'
    case 'repair-initial-satisfiability':
      return '修初始可满足性'
    case 'repair-proof':
      return '修证明链'
    case 'repair-final-uniqueness':
      return '修最终唯一性'
    case 'raise-caps-or-simplify':
      return '提高上限或简化'
  }
}

function recommendationTone(
  recommendation: AuthoringDraftDiagnosticsReport['validation']['recommendation'],
): WorkbenchDiagnosticsOverviewTone {
  switch (recommendation) {
    case 'ready-for-experimental-review':
      return 'pass'
    case 'raise-caps-or-simplify':
      return 'warning'
    case 'repair-schema':
    case 'repair-target-rules':
    case 'repair-initial-satisfiability':
    case 'repair-proof':
    case 'repair-final-uniqueness':
      return 'fail'
  }
}

function statusLabel(status: AuthoringDraftDiagnosticsReport['status']): string {
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
      return '需要复核'
    case 'valid-ready-for-private-review':
      return '可私下复核'
  }
}

function gateLabel(status: 'pass' | 'warning' | 'fail'): string {
  switch (status) {
    case 'pass':
      return '通过'
    case 'warning':
      return '需复核'
    case 'fail':
      return '失败'
  }
}

function gateTone(status: 'pass' | 'warning' | 'fail'): WorkbenchDiagnosticsOverviewTone {
  switch (status) {
    case 'pass':
      return 'pass'
    case 'warning':
      return 'warning'
    case 'fail':
      return 'fail'
  }
}

function cloneRiskLabel(status: NonNullable<AuthoringDraftDiagnosticsReport['cloneRisk']>['status']): string {
  switch (status) {
    case 'pass':
      return '通过'
    case 'reviewer-blocking':
      return '复核阻断'
    case 'fail':
      return '失败'
  }
}

function cloneRiskTone(
  status: NonNullable<AuthoringDraftDiagnosticsReport['cloneRisk']>['status'],
): WorkbenchDiagnosticsOverviewTone {
  switch (status) {
    case 'pass':
      return 'pass'
    case 'reviewer-blocking':
      return 'warning'
    case 'fail':
      return 'fail'
  }
}

function difficultyBucketLabel(
  bucket: NonNullable<AuthoringDraftDiagnosticsReport['validation']['difficultyReview']>['recommendedBucket'],
): string {
  switch (bucket) {
    case 'tutorial-or-baseline':
      return '基础/教学'
    case 'target-4':
      return '目标 4'
    case 'super-hard-6-7':
      return '超难 6-7'
  }
}

function parseScopeCollectionsJson(jsonText: string): {
  readonly ok: true
  readonly value: WorkbenchScopeCollectionsDraft
} | {
  readonly ok: false
  readonly issues: readonly SchemaIssue[]
} {
  let parsed: unknown
  try {
    parsed = JSON.parse(jsonText) as unknown
  } catch (error) {
    return {
      ok: false,
      issues: [scopeIssue(
        'SCOPE_COLLECTIONS_JSON_PARSE_FAILED',
        [],
        error instanceof Error ? error.message : 'Unable to parse scope collections JSON.',
      )],
    }
  }

  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return {
      ok: false,
      issues: [scopeIssue('SCOPE_COLLECTIONS_JSON_INVALID', [], 'Scope collections JSON must be an object.')],
    }
  }

  const collections = parsed as Partial<WorkbenchScopeCollectionsDraft>
  const issues: SchemaIssue[] = []
  if (!Array.isArray(collections.regions)) {
    issues.push(scopeIssue('SCOPE_COLLECTIONS_REGIONS_INVALID', ['regions'], 'regions must be an array.'))
  }
  if (!Array.isArray(collections.anchors)) {
    issues.push(scopeIssue('SCOPE_COLLECTIONS_ANCHORS_INVALID', ['anchors'], 'anchors must be an array.'))
  }
  if (issues.length > 0) return { ok: false, issues }

  return {
    ok: true,
    value: {
      regions: collections.regions as readonly RegionDefinition[],
      anchors: collections.anchors as readonly AnchorDefinition[],
    },
  }
}

function parseRulesJson(jsonText: string): {
  readonly ok: true
  readonly value: WorkbenchRulesDraft
} | {
  readonly ok: false
  readonly issues: readonly SchemaIssue[]
} {
  let parsed: unknown
  try {
    parsed = JSON.parse(jsonText) as unknown
  } catch (error) {
    return {
      ok: false,
      issues: [rulesIssue(
        'RULES_JSON_PARSE_FAILED',
        [],
        error instanceof Error ? error.message : 'Unable to parse rules JSON.',
      )],
    }
  }

  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return {
      ok: false,
      issues: [rulesIssue('RULES_JSON_INVALID', [], 'Rules JSON must be an object.')],
    }
  }

  const rulesDraft = parsed as Partial<WorkbenchRulesDraft>
  if (!Array.isArray(rulesDraft.rules)) {
    return {
      ok: false,
      issues: [rulesIssue('RULES_JSON_RULES_INVALID', ['rules'], 'rules must be an array.')],
    }
  }

  return {
    ok: true,
    value: {
      rules: rulesDraft.rules as readonly RuleDefinition[],
    },
  }
}

function mergeRegions(
  current: readonly RegionDefinition[],
  generated: readonly RegionDefinition[],
): readonly RegionDefinition[] {
  if (generated.length === 0) return current
  const byId = new Map(current.map((region) => [region.id, region]))
  for (const region of generated) byId.set(region.id, region)
  return [...byId.values()]
}

function scopeIssue(
  code: string,
  path: readonly (string | number)[],
  message: string,
): SchemaIssue {
  return { code, path, message }
}

function rulesIssue(
  code: string,
  path: readonly (string | number)[],
  message: string,
): SchemaIssue {
  return { code, path, message }
}
