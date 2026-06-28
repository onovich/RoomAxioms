import { describe, expect, it } from 'vitest'

import {
  createEmptyThemePackageDraft,
  evaluateThemePackageDraft,
  REQUIRED_THEME_ASSET_KINDS,
  type ThemePackageDraft,
} from './themePackage.js'

describe('theme package workflow helpers', () => {
  it('creates a complete asset-intake checklist without implying implementation is ready', () => {
    const draft = createEmptyThemePackageDraft()
    const report = evaluateThemePackageDraft(draft)

    expect(draft.assets.map((asset) => asset.kind)).toEqual(REQUIRED_THEME_ASSET_KINDS)
    expect(report.ok).toBe(false)
    expect(report.issues.map((issue) => issue.code)).toEqual(expect.arrayContaining([
      'ASSET_SOURCE_MISSING',
      'ASSET_NOT_APPROVED',
    ]))
  })

  it('passes only when required assets are approved or explicitly deferred and dialogue is secrecy-safe', () => {
    const draft: ThemePackageDraft = {
      ...createEmptyThemePackageDraft(),
      assets: REQUIRED_THEME_ASSET_KINDS.map((kind) => ({
        id: kind,
        kind,
        title: kind,
        status: kind === 'typographyColorNote' ? 'deferred' : 'approved',
        sourcePath: kind === 'typographyColorNote' ? undefined : `art/${kind}.png`,
      })),
      dialogueHooks: [
        {
          id: 'case-004-intro',
          kind: 'caseIntro',
          caseId: 'case-004',
          lines: [
            {
              id: 'line-1',
              speaker: '调查员',
              text: '这间房间的登记表不完整，我们先从公开线索开始。',
              portraitId: 'investigator',
              expressionId: 'neutral',
            },
          ],
        },
      ],
    }
    const report = evaluateThemePackageDraft(draft)

    expect(report).toMatchObject({
      ok: true,
      issues: [],
    })
  })

  it('flags empty dialogue hooks and answer-leaking dialogue text', () => {
    const draft: ThemePackageDraft = {
      ...createEmptyThemePackageDraft(),
      assets: REQUIRED_THEME_ASSET_KINDS.map((kind) => ({
        id: kind,
        kind,
        title: kind,
        status: 'deferred',
      })),
      dialogueHooks: [
        {
          id: 'empty-hook',
          kind: 'tutorial',
          lines: [],
        },
        {
          id: 'leaky-result',
          kind: 'result',
          caseId: 'case-004',
          lines: [
            {
              id: 'leak',
              speaker: '旁白',
              text: '不要在叙事里提前说出答案、目标格或访客布局。',
            },
          ],
        },
      ],
    }
    const report = evaluateThemePackageDraft(draft)

    expect(report.ok).toBe(false)
    expect(report.issues.map((issue) => issue.code)).toEqual(expect.arrayContaining([
      'DIALOGUE_EMPTY',
      'DIALOGUE_SECRET_TERM',
    ]))
    expect(report.issues.find((issue) => issue.code === 'DIALOGUE_SECRET_TERM')?.ref).toBe(
      'dialogue:leaky-result:leak',
    )
  })
})
