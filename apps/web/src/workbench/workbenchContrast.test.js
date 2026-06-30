import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const appCss = readFileSync(new URL('../App.css', import.meta.url), 'utf8')
const workbenchCss = appCss.slice(appCss.indexOf('.authoring-workbench'))

describe('workbench contrast CSS', () => {
  it('sets explicit high-contrast foregrounds on user-reported workbench surfaces', () => {
    expect(workbenchCss).toMatch(/\.authoring-workbench\s*{[^}]*color: var\(--workbench-ink\)/s)
    expect(workbenchCss).toMatch(/\.authoring-workbench \.ghost-button,[^}]*color: var\(--workbench-ink\)/s)
    expect(workbenchCss).toMatch(/\.workbench-cell\s*{[^}]*color: var\(--workbench-ink\)/s)
    expect(workbenchCss).toMatch(/\.workbench-cell b\s*{[^}]*color: var\(--workbench-ink\)/s)
    expect(workbenchCss).toMatch(/\.workbench-status-grid dd\s*{[^}]*color: var\(--workbench-ink\)/s)
    expect(workbenchCss).toMatch(/\.diagnostics-metric\s*{[^}]*color: var\(--workbench-ink\)/s)
  })

  it('does not use the old low-contrast blue workbench text tokens', () => {
    expect(workbenchCss).not.toMatch(/var\(--info(?:-soft)?\)/)
    expect(workbenchCss).not.toContain('#173042')
    expect(workbenchCss).not.toContain('#5885a6')
    expect(workbenchCss).not.toContain('#dcefff')
    expect(workbenchCss).not.toContain('#3a5d78')
    expect(workbenchCss).not.toContain('#c6dbec')
    expect(workbenchCss).not.toContain('#101719')
    expect(workbenchCss).not.toContain('#4f7895')
    expect(workbenchCss).not.toContain('#e5f5ff')
    expect(workbenchCss).not.toContain('#243238')
  })

  it('keeps representative workbench foreground/background pairs readable', () => {
    expect(contrastRatio('#f4efe3', '#101414')).toBeGreaterThanOrEqual(7)
    expect(contrastRatio('#c9c7bc', '#101414')).toBeGreaterThanOrEqual(7)
    expect(contrastRatio('#f0d9a2', '#332b1d')).toBeGreaterThanOrEqual(7)
    expect(contrastRatio('#f4efe3', '#2f3324')).toBeGreaterThanOrEqual(7)
    expect(contrastRatio('#ffe0dd', '#442322')).toBeGreaterThanOrEqual(7)
  })
})

function contrastRatio(foreground, background) {
  const lighter = Math.max(relativeLuminance(foreground), relativeLuminance(background))
  const darker = Math.min(relativeLuminance(foreground), relativeLuminance(background))
  return (lighter + 0.05) / (darker + 0.05)
}

function relativeLuminance(hex) {
  const [r, g, b] = hexToRgb(hex).map((channel) => {
    const value = channel / 255
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function hexToRgb(hex) {
  return [
    Number.parseInt(hex.slice(1, 3), 16),
    Number.parseInt(hex.slice(3, 5), 16),
    Number.parseInt(hex.slice(5, 7), 16),
  ]
}
