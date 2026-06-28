export type VNTextSpeed = 'instant' | 'normal' | 'slow'

export interface VNPreferences {
  readonly enabled: boolean
  readonly reducedMotion: boolean
  readonly textSpeed: VNTextSpeed
}

export interface VNPreferenceStorage {
  readonly getItem: (key: string) => string | null
  readonly setItem: (key: string, value: string) => void
}

export const VN_PREFERENCES_STORAGE_KEY = 'room-axioms.vn-preferences.v1'

export const DEFAULT_VN_PREFERENCES: VNPreferences = {
  enabled: true,
  reducedMotion: false,
  textSpeed: 'normal',
}

export function normalizeVNPreferences(value: unknown): VNPreferences {
  if (typeof value !== 'object' || value === null) return DEFAULT_VN_PREFERENCES
  const candidate = value as Partial<Record<keyof VNPreferences, unknown>>

  return {
    enabled: typeof candidate.enabled === 'boolean'
      ? candidate.enabled
      : DEFAULT_VN_PREFERENCES.enabled,
    reducedMotion: typeof candidate.reducedMotion === 'boolean'
      ? candidate.reducedMotion
      : DEFAULT_VN_PREFERENCES.reducedMotion,
    textSpeed: isVNTextSpeed(candidate.textSpeed)
      ? candidate.textSpeed
      : DEFAULT_VN_PREFERENCES.textSpeed,
  }
}

export function loadVNPreferences(storage: VNPreferenceStorage | undefined): VNPreferences {
  if (storage === undefined) return DEFAULT_VN_PREFERENCES

  try {
    const raw = storage.getItem(VN_PREFERENCES_STORAGE_KEY)
    if (raw === null) return DEFAULT_VN_PREFERENCES
    return normalizeVNPreferences(JSON.parse(raw))
  } catch {
    return DEFAULT_VN_PREFERENCES
  }
}

export function saveVNPreferences(
  storage: VNPreferenceStorage | undefined,
  preferences: VNPreferences,
): void {
  if (storage === undefined) return

  try {
    storage.setItem(VN_PREFERENCES_STORAGE_KEY, JSON.stringify(preferences))
  } catch {
    // Preference persistence is best-effort and must not block puzzle play.
  }
}

export function vnTextRevealDelayMs(preferences: VNPreferences): number {
  if (preferences.reducedMotion || preferences.textSpeed === 'instant') return 0
  if (preferences.textSpeed === 'slow') return 34
  return 18
}

function isVNTextSpeed(value: unknown): value is VNTextSpeed {
  return value === 'instant' || value === 'normal' || value === 'slow'
}
