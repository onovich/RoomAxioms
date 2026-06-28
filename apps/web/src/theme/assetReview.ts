import {
  findDialogueSceneLeaks,
  type DialogueLeak,
  type DialogueScene,
  type DialogueSceneCategory,
} from '../vn/dialogue'
import {
  findThemeAssetManifestLeaks,
  type ThemeAssetEntry,
  type ThemeAssetKind,
  type ThemeAssetManifest,
  type ThemeAssetManifestLeak,
  type ThemeAssetStatus,
} from './assetManifest'

export type ThemeAssetIntakeIssueCode =
  | 'SRC_REQUIRED'
  | 'SOURCE_REQUIRED'
  | 'LICENSE_REQUIRED'
  | 'DIMENSIONS_REQUIRED'
  | 'PLAYER_ROUTE_APPROVAL_REQUIRED'
  | 'SECRECY_LEAK'

export interface ThemeAssetIntakeIssue {
  readonly code: ThemeAssetIntakeIssueCode
  readonly assetId: string
  readonly kind: ThemeAssetKind
  readonly message: string
}

export interface ThemeAssetReviewReport {
  readonly manifestId: string
  readonly statusCounts: Readonly<Record<ThemeAssetStatus, number>>
  readonly kindCounts: Readonly<Record<ThemeAssetKind, number>>
  readonly placeholderAssetIds: readonly string[]
  readonly pendingApprovalAssetIds: readonly string[]
  readonly approvedAssetIds: readonly string[]
  readonly dialogueCategories: readonly DialogueSceneCategory[]
  readonly manifestLeaks: readonly ThemeAssetManifestLeak[]
  readonly dialogueLeaks: readonly DialogueLeak[]
  readonly intakeIssues: readonly ThemeAssetIntakeIssue[]
  readonly fallbackNotes: readonly string[]
}

export function createThemeAssetReviewReport(
  manifest: ThemeAssetManifest,
  scenes: readonly DialogueScene[],
): ThemeAssetReviewReport {
  return {
    manifestId: manifest.id,
    statusCounts: countAssetsByStatus(manifest.assets),
    kindCounts: countAssetsByKind(manifest.assets),
    placeholderAssetIds: manifest.assets
      .filter((asset) => asset.status === 'missing' || asset.status === 'placeholder')
      .map((asset) => asset.id),
    pendingApprovalAssetIds: manifest.assets
      .filter((asset) => asset.status === 'userProvided')
      .map((asset) => asset.id),
    approvedAssetIds: manifest.assets
      .filter((asset) => asset.status === 'approved')
      .map((asset) => asset.id),
    dialogueCategories: scenes.map((scene) => scene.category),
    manifestLeaks: findThemeAssetManifestLeaks(manifest),
    dialogueLeaks: findDialogueSceneLeaks(scenes),
    intakeIssues: validateThemeAssetIntake(manifest),
    fallbackNotes: manifest.assets
      .filter((asset) => asset.status === 'missing' || asset.status === 'placeholder')
      .map((asset) => `${asset.kind}:${asset.id} uses ${asset.status} fallback`),
  }
}

export function validateThemeAssetIntake(
  manifest: ThemeAssetManifest,
): readonly ThemeAssetIntakeIssue[] {
  const issues: ThemeAssetIntakeIssue[] = []

  for (const asset of manifest.assets) {
    if (asset.status !== 'userProvided' && asset.status !== 'approved') continue
    if (asset.src === undefined || asset.src.trim().length === 0) {
      issues.push(createIssue(asset, 'SRC_REQUIRED', 'User-provided or approved assets need a src.'))
    }
    if (asset.source?.label === undefined || asset.source.label.trim().length === 0) {
      issues.push(createIssue(asset, 'SOURCE_REQUIRED', 'Asset source or provenance is required.'))
    }
    if (asset.source?.license === undefined || asset.source.license.trim().length === 0) {
      issues.push(createIssue(asset, 'LICENSE_REQUIRED', 'Asset license or ownership note is required.'))
    }
    if (!hasDimensions(asset)) {
      issues.push(createIssue(asset, 'DIMENSIONS_REQUIRED', 'Asset dimensions or aspect ratio are required.'))
    }
    if (asset.status === 'approved' && asset.safeForPlayerRoute !== true) {
      issues.push(createIssue(
        asset,
        'PLAYER_ROUTE_APPROVAL_REQUIRED',
        'Approved assets must be explicitly safe for the player route.',
      ))
    }
  }

  for (const leak of findThemeAssetManifestLeaks(manifest)) {
    issues.push({
      code: 'SECRECY_LEAK',
      assetId: leak.assetId,
      kind: leak.kind,
      message: `Manifest field ${leak.field} contains forbidden term ${leak.term}.`,
    })
  }

  return issues
}

function hasDimensions(asset: ThemeAssetEntry): boolean {
  if (asset.dimensions === undefined) return false
  if (asset.dimensions.aspectRatio !== undefined && asset.dimensions.aspectRatio.trim().length > 0) {
    return true
  }
  return Number.isFinite(asset.dimensions.width) && Number.isFinite(asset.dimensions.height)
}

function createIssue(
  asset: ThemeAssetEntry,
  code: ThemeAssetIntakeIssueCode,
  message: string,
): ThemeAssetIntakeIssue {
  return {
    code,
    assetId: asset.id,
    kind: asset.kind,
    message,
  }
}

function countAssetsByStatus(
  assets: readonly ThemeAssetEntry[],
): Readonly<Record<ThemeAssetStatus, number>> {
  const counts: Record<ThemeAssetStatus, number> = {
    missing: 0,
    placeholder: 0,
    userProvided: 0,
    approved: 0,
  }
  for (const asset of assets) counts[asset.status] += 1
  return counts
}

function countAssetsByKind(
  assets: readonly ThemeAssetEntry[],
): Readonly<Record<ThemeAssetKind, number>> {
  const counts: Record<ThemeAssetKind, number> = {
    portrait: 0,
    expression: 0,
    background: 0,
    dialogueFrame: 0,
    boardTheme: 0,
    cellIcon: 0,
    sound: 0,
  }
  for (const asset of assets) counts[asset.kind] += 1
  return counts
}
