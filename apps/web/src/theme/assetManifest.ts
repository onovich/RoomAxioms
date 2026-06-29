export type ThemeAssetStatus = 'missing' | 'placeholder' | 'userProvided' | 'approved'

export type ThemeAssetKind =
  | 'logoMark'
  | 'paperTexture'
  | 'panelFrame'
  | 'topbarFrame'
  | 'ruleCardFrame'
  | 'boardFrame'
  | 'boardGridTexture'
  | 'cellUnknownTexture'
  | 'cellMarkedAnomalyOverlay'
  | 'cellMarkedSafeOverlay'
  | 'scopeHighlightOverlay'
  | 'objectIcon'
  | 'characterPortrait'
  | 'characterExpression'
  | 'buttonFrame'
  | 'portrait'
  | 'expression'
  | 'background'
  | 'dialogueFrame'
  | 'boardTheme'
  | 'cellIcon'
  | 'sound'

export const THEME_ASSET_KINDS = [
  'logoMark',
  'paperTexture',
  'panelFrame',
  'topbarFrame',
  'ruleCardFrame',
  'boardFrame',
  'boardGridTexture',
  'cellUnknownTexture',
  'cellMarkedAnomalyOverlay',
  'cellMarkedSafeOverlay',
  'scopeHighlightOverlay',
  'objectIcon',
  'characterPortrait',
  'characterExpression',
  'buttonFrame',
  'portrait',
  'expression',
  'background',
  'dialogueFrame',
  'boardTheme',
  'cellIcon',
  'sound',
] as const satisfies readonly ThemeAssetKind[]

export interface ThemeAssetEntry {
  readonly id: string
  readonly kind: ThemeAssetKind
  readonly status: ThemeAssetStatus
  readonly label: string
  readonly src?: string
  readonly alt?: string
  readonly notes?: string
  readonly source?: ThemeAssetSource
  readonly dimensions?: ThemeAssetDimensions
  readonly safeForPlayerRoute?: boolean
  readonly reviewerNotes?: string
}

export interface ThemeAssetSource {
  readonly label: string
  readonly license: string
  readonly url?: string
  readonly owner?: string
}

export interface ThemeAssetDimensions {
  readonly width?: number
  readonly height?: number
  readonly aspectRatio?: string
}

export interface ThemeAssetManifest {
  readonly id: string
  readonly title: string
  readonly assets: readonly ThemeAssetEntry[]
}

export interface ResolvedThemeAsset {
  readonly requestedId: string
  readonly kind: ThemeAssetKind
  readonly status: ThemeAssetStatus
  readonly label: string
  readonly src?: string
  readonly alt?: string
  readonly placeholder: boolean
  readonly final: boolean
  readonly entry?: ThemeAssetEntry
}

export interface ThemeAssetManifestLeak {
  readonly assetId: string
  readonly kind: ThemeAssetKind
  readonly field:
    | 'id'
    | 'label'
    | 'src'
    | 'alt'
    | 'notes'
    | 'source.label'
    | 'source.license'
    | 'source.url'
    | 'source.owner'
    | 'reviewerNotes'
  readonly term: string
}

export const DEFAULT_THEME_ASSET_MANIFEST: ThemeAssetManifest = {
  id: 'unregistered-scene-placeholder',
  title: 'Unregistered Scene placeholder manifest',
  assets: [
    {
      id: 'investigator',
      kind: 'portrait',
      status: 'userProvided',
      label: 'Temporary investigator normal bust',
      src: `${import.meta.env.BASE_URL}theme/portraits/phase-35/investigator-normal.png`,
      alt: 'Temporary investigator bust portrait',
      notes: 'Temporary Phase 35 sample bust. Not final approved art.',
      source: {
        label: 'Local Phase 35 sample context',
        license: 'Temporary user-provided project reference; not approved final art.',
        owner: 'Project owner',
      },
      dimensions: { width: 1086, height: 1448, aspectRatio: '543:724' },
      safeForPlayerRoute: true,
    },
    {
      id: 'dispatcher',
      kind: 'portrait',
      status: 'userProvided',
      label: 'Temporary dispatcher normal bust',
      src: `${import.meta.env.BASE_URL}theme/portraits/phase-35/dispatcher-normal.png`,
      alt: 'Temporary dispatcher bust portrait',
      notes: 'Temporary Phase 35 sample bust. Not final approved art.',
      source: {
        label: 'Local Phase 35 sample context',
        license: 'Temporary user-provided project reference; not approved final art.',
        owner: 'Project owner',
      },
      dimensions: { width: 1086, height: 1448, aspectRatio: '543:724' },
      safeForPlayerRoute: true,
    },
    {
      id: 'investigator-thinking',
      kind: 'portrait',
      status: 'userProvided',
      label: 'Temporary investigator thinking bust',
      src: `${import.meta.env.BASE_URL}theme/portraits/phase-35/investigator-thinking.png`,
      alt: 'Temporary investigator thinking bust portrait',
      notes: 'Temporary Phase 35 sample bust. Not final approved art.',
      source: {
        label: 'Local Phase 35 sample context',
        license: 'Temporary user-provided project reference; not approved final art.',
        owner: 'Project owner',
      },
      dimensions: { width: 1086, height: 1448, aspectRatio: '543:724' },
      safeForPlayerRoute: true,
    },
    {
      id: 'dispatcher-sensing',
      kind: 'portrait',
      status: 'userProvided',
      label: 'Temporary dispatcher sensing bust',
      src: `${import.meta.env.BASE_URL}theme/portraits/phase-35/dispatcher-sensing.png`,
      alt: 'Temporary dispatcher sensing bust portrait',
      notes: 'Temporary Phase 35 sample bust. Not final approved art.',
      source: {
        label: 'Local Phase 35 sample context',
        license: 'Temporary user-provided project reference; not approved final art.',
        owner: 'Project owner',
      },
      dimensions: { width: 1086, height: 1449 },
      safeForPlayerRoute: true,
    },
    {
      id: 'neutral',
      kind: 'expression',
      status: 'placeholder',
      label: 'Neutral expression placeholder',
    },
    {
      id: 'field-office',
      kind: 'background',
      status: 'placeholder',
      label: 'Field office placeholder background',
    },
    {
      id: 'dialogue-default',
      kind: 'dialogueFrame',
      status: 'placeholder',
      label: 'Default dialogue frame placeholder',
    },
    {
      id: 'brand-mark',
      kind: 'logoMark',
      status: 'placeholder',
      label: 'Unregistered Scene logo mark placeholder',
      dimensions: { aspectRatio: '1:1' },
    },
    {
      id: 'case-paper',
      kind: 'paperTexture',
      status: 'placeholder',
      label: 'Case paper texture placeholder',
    },
    {
      id: 'main-panel-frame',
      kind: 'panelFrame',
      status: 'placeholder',
      label: 'Main panel frame placeholder',
    },
    {
      id: 'case-topbar-frame',
      kind: 'topbarFrame',
      status: 'placeholder',
      label: 'Top bar frame placeholder',
    },
    {
      id: 'rule-card-frame',
      kind: 'ruleCardFrame',
      status: 'placeholder',
      label: 'Rule card frame placeholder',
    },
    {
      id: 'scene-board-frame',
      kind: 'boardFrame',
      status: 'placeholder',
      label: 'Scene map frame placeholder',
    },
    {
      id: 'scene-board-grid',
      kind: 'boardGridTexture',
      status: 'placeholder',
      label: 'Scene map grid texture placeholder',
    },
    {
      id: 'unknown-cell',
      kind: 'cellUnknownTexture',
      status: 'placeholder',
      label: 'Unknown area texture placeholder',
    },
    {
      id: 'anomaly-mark-overlay',
      kind: 'cellMarkedAnomalyOverlay',
      status: 'placeholder',
      label: 'Anomaly mark overlay placeholder',
    },
    {
      id: 'surveyable-mark-overlay',
      kind: 'cellMarkedSafeOverlay',
      status: 'placeholder',
      label: 'Surveyable mark overlay placeholder',
    },
    {
      id: 'scope-highlight-overlay',
      kind: 'scopeHighlightOverlay',
      status: 'placeholder',
      label: 'Public rule scope highlight placeholder',
    },
    {
      id: 'bottle-icon',
      kind: 'objectIcon',
      status: 'placeholder',
      label: 'Bottle icon placeholder',
    },
    {
      id: 'bin-icon',
      kind: 'objectIcon',
      status: 'placeholder',
      label: 'Bin icon placeholder',
    },
    {
      id: 'mirror-icon',
      kind: 'objectIcon',
      status: 'placeholder',
      label: 'Mirror icon placeholder',
    },
    {
      id: 'investigator',
      kind: 'characterPortrait',
      status: 'placeholder',
      label: 'Investigator character portrait placeholder',
    },
    {
      id: 'dispatcher',
      kind: 'characterPortrait',
      status: 'placeholder',
      label: 'Dispatcher character portrait placeholder',
    },
    {
      id: 'neutral',
      kind: 'characterExpression',
      status: 'placeholder',
      label: 'Neutral character expression placeholder',
    },
    {
      id: 'paper-button',
      kind: 'buttonFrame',
      status: 'placeholder',
      label: 'Paper button frame placeholder',
    },
    {
      id: 'current-board',
      kind: 'boardTheme',
      status: 'placeholder',
      label: 'Current board visual fallback',
    },
    {
      id: 'current-cell-icons',
      kind: 'cellIcon',
      status: 'placeholder',
      label: 'Current cell icon fallback',
    },
  ],
}

const PLACEHOLDER_LABELS = {
  logoMark: 'Missing logo mark placeholder',
  paperTexture: 'Missing paper texture placeholder',
  panelFrame: 'Missing panel frame placeholder',
  topbarFrame: 'Missing top bar frame placeholder',
  ruleCardFrame: 'Missing rule card frame placeholder',
  boardFrame: 'Missing board frame placeholder',
  boardGridTexture: 'Missing board grid texture placeholder',
  cellUnknownTexture: 'Missing unknown area texture placeholder',
  cellMarkedAnomalyOverlay: 'Missing anomaly mark overlay placeholder',
  cellMarkedSafeOverlay: 'Missing surveyable mark overlay placeholder',
  scopeHighlightOverlay: 'Missing public rule scope highlight placeholder',
  objectIcon: 'Missing object icon placeholder',
  characterPortrait: 'Missing character portrait placeholder',
  characterExpression: 'Missing character expression placeholder',
  buttonFrame: 'Missing button frame placeholder',
  portrait: 'Missing portrait placeholder',
  expression: 'Missing expression placeholder',
  background: 'Missing background placeholder',
  dialogueFrame: 'Missing dialogue frame placeholder',
  boardTheme: 'Current board visual fallback',
  cellIcon: 'Current cell icon fallback',
  sound: 'Silent sound placeholder',
} as const satisfies Record<ThemeAssetKind, string>

const FORBIDDEN_ASSET_TERMS = [
  'answer',
  'candidate',
  'forced',
  'proof',
  'solver',
  'target',
  'target-answer',
  'targetAnswer',
  'targetGuest',
  'guest-layout',
  'guestLayout',
] as const

export function resolveThemeAsset(
  manifest: ThemeAssetManifest,
  kind: ThemeAssetKind,
  assetId: string | undefined,
): ResolvedThemeAsset {
  const requestedId = assetId ?? ''
  const entry = manifest.assets.find((candidate) => (
    candidate.kind === kind && candidate.id === requestedId
  ))

  if (entry === undefined) {
    return {
      requestedId,
      kind,
      status: 'missing',
      label: PLACEHOLDER_LABELS[kind],
      placeholder: true,
      final: false,
    }
  }

  return {
    requestedId,
    kind,
    status: entry.status,
    label: entry.label,
    ...(entry.src === undefined ? {} : { src: entry.src }),
    ...(entry.alt === undefined ? {} : { alt: entry.alt }),
    placeholder: entry.status === 'missing' || entry.status === 'placeholder',
    final: entry.status === 'approved',
    entry,
  }
}

export function assetEntriesByKind(
  manifest: ThemeAssetManifest,
  kind: ThemeAssetKind,
): readonly ThemeAssetEntry[] {
  return manifest.assets.filter((asset) => asset.kind === kind)
}

export function isFinalThemeAsset(asset: ResolvedThemeAsset | ThemeAssetEntry): boolean {
  return asset.status === 'approved'
}

export function isPlaceholderLikeThemeAsset(asset: ResolvedThemeAsset | ThemeAssetEntry): boolean {
  return asset.status === 'missing' || asset.status === 'placeholder'
}

export function findThemeAssetManifestLeaks(
  manifest: ThemeAssetManifest,
): readonly ThemeAssetManifestLeak[] {
  const leaks: ThemeAssetManifestLeak[] = []

  for (const asset of manifest.assets) {
    const fields: readonly {
      readonly field: ThemeAssetManifestLeak['field']
      readonly value: string | undefined
    }[] = [
      { field: 'id', value: asset.id },
      { field: 'label', value: asset.label },
      { field: 'src', value: asset.src },
      { field: 'alt', value: asset.alt },
      { field: 'notes', value: asset.notes },
      { field: 'source.label', value: asset.source?.label },
      { field: 'source.license', value: asset.source?.license },
      { field: 'source.url', value: asset.source?.url },
      { field: 'source.owner', value: asset.source?.owner },
      { field: 'reviewerNotes', value: asset.reviewerNotes },
    ]

    for (const { field, value } of fields) {
      if (value === undefined) continue
      collectFieldLeaks(leaks, asset, field, value)
    }
  }

  return leaks
}

function collectFieldLeaks(
  leaks: ThemeAssetManifestLeak[],
  asset: ThemeAssetEntry,
  field: ThemeAssetManifestLeak['field'],
  value: string,
): void {
  const normalized = value.toLowerCase()
  for (const term of FORBIDDEN_ASSET_TERMS) {
    if (normalized.includes(term.toLowerCase())) {
      leaks.push({
        assetId: asset.id,
        kind: asset.kind,
        field,
        term,
      })
    }
  }
}
