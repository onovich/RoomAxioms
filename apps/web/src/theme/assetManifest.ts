export type ThemeAssetStatus = 'missing' | 'placeholder' | 'userProvided' | 'approved'

export type ThemeAssetKind =
  | 'portrait'
  | 'expression'
  | 'background'
  | 'dialogueFrame'
  | 'boardTheme'
  | 'cellIcon'
  | 'sound'

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
      status: 'placeholder',
      label: 'Investigator placeholder portrait',
      alt: 'Neutral investigator portrait placeholder',
    },
    {
      id: 'dispatcher',
      kind: 'portrait',
      status: 'placeholder',
      label: 'Dispatcher placeholder portrait',
      alt: 'Neutral dispatcher portrait placeholder',
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
