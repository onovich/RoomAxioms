import { describe, expect, it } from 'vitest'

import {
  DEFAULT_VN_PREFERENCES,
  VN_PREFERENCES_STORAGE_KEY,
  loadVNPreferences,
  normalizeVNPreferences,
  saveVNPreferences,
  vnTextRevealDelayMs,
  type VNPreferenceStorage,
} from './preferences'

describe('VN preferences', () => {
  it('normalizes unknown values without leaking puzzle state', () => {
    expect(normalizeVNPreferences({ enabled: false, reducedMotion: true, textSpeed: 'slow' })).toEqual({
      enabled: false,
      reducedMotion: true,
      textSpeed: 'slow',
    })
    expect(normalizeVNPreferences({ enabled: 'yes', textSpeed: 'target-answer' })).toEqual(
      DEFAULT_VN_PREFERENCES,
    )
  })

  it('loads and saves through harmless local storage fields', () => {
    const values = new Map<string, string>()
    const storage: VNPreferenceStorage = {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => {
        values.set(key, value)
      },
    }

    saveVNPreferences(storage, { enabled: false, reducedMotion: true, textSpeed: 'instant' })

    expect(values.get(VN_PREFERENCES_STORAGE_KEY)).toBe(
      '{"enabled":false,"reducedMotion":true,"textSpeed":"instant"}',
    )
    expect(loadVNPreferences(storage)).toEqual({
      enabled: false,
      reducedMotion: true,
      textSpeed: 'instant',
    })
  })

  it('maps reduced motion and instant text to no reveal delay', () => {
    expect(vnTextRevealDelayMs({ enabled: true, reducedMotion: true, textSpeed: 'slow' })).toBe(0)
    expect(vnTextRevealDelayMs({ enabled: true, reducedMotion: false, textSpeed: 'instant' })).toBe(0)
    expect(vnTextRevealDelayMs({ enabled: true, reducedMotion: false, textSpeed: 'slow' })).toBeGreaterThan(
      vnTextRevealDelayMs(DEFAULT_VN_PREFERENCES),
    )
  })
})
