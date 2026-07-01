import { describe, expect, it } from 'vitest'

import {
  REQUIRED_DIALOGUE_CATEGORIES,
  STATIC_DIALOGUE_SCENES,
  createHintDialogueScene,
  dialogueCategoriesPresent,
  findDialogueSceneLeaks,
  missingDialogueCategories,
  type DialogueScene,
} from './dialogue'

describe('VN dialogue scene contracts', () => {
  it('provides static non-final scenes for intro, tutorials, failure, and success', () => {
    expect(dialogueCategoriesPresent(STATIC_DIALOGUE_SCENES)).toEqual([
      'caseIntro',
      'failure',
      'firstAnomalyMark',
      'firstRuleSelect',
      'firstSafeInspect',
      'success',
    ])
    expect(STATIC_DIALOGUE_SCENES.every((scene) => scene.dismissible)).toBe(true)
    expect(STATIC_DIALOGUE_SCENES.every((scene) => scene.lines.length > 0)).toBe(true)
  })

  it('creates hint dialogue only from an existing hint payload', () => {
    expect(createHintDialogueScene(null)).toBeNull()

    const scene = createHintDialogueScene({
      title: '数量已经够了',
      conclusion: '这一格可以调查。',
      premises: ['用到公开规则 R1'],
      reasoning: '这一步不用猜。',
    })

    expect(scene).toMatchObject({
      id: 'hint-wrap',
      category: 'hint',
      dismissible: true,
    })
    expect(scene?.lines.map((line) => line.id)).toEqual([
      'hint-wrap-title',
      'hint-wrap-conclusion',
      'hint-wrap-premises',
      'hint-wrap-reasoning',
    ])
  })

  it('covers every required trigger category when the dynamic hint wrapper exists', () => {
    const hintScene = createHintDialogueScene({
      title: '数量已经够了',
      conclusion: '下一步可以继续调查。',
      premises: ['只使用已公开信息。'],
      reasoning: '这一步不用猜。',
    })
    if (hintScene === null) throw new Error('Expected hint scene.')

    expect(missingDialogueCategories([...STATIC_DIALOGUE_SCENES, hintScene])).toEqual([])
    expect(REQUIRED_DIALOGUE_CATEGORIES).toHaveLength(7)
  })

  it('assigns protagonist and assistant portrait slots for VN event coverage', () => {
    const linesByCategory = new Map(
      STATIC_DIALOGUE_SCENES.map((scene) => [scene.category, scene.lines]),
    )

    expect(linesByCategory.get('caseIntro')?.map((line) => [line.portraitId, line.portraitSlot])).toEqual([
      ['dispatcher', 'right'],
      ['investigator-thinking', 'left'],
    ])
    expect(linesByCategory.get('firstRuleSelect')?.[0]).toMatchObject({
      portraitId: 'dispatcher-sensing',
      portraitSlot: 'right',
    })
    expect(linesByCategory.get('firstSafeInspect')?.[0]).toMatchObject({
      portraitId: 'investigator',
      portraitSlot: 'left',
    })
    expect(linesByCategory.get('firstAnomalyMark')?.[0]).toMatchObject({
      portraitId: 'dispatcher-sensing',
      portraitSlot: 'right',
    })
    expect(linesByCategory.get('failure')?.[0]).toMatchObject({
      portraitId: 'dispatcher',
      portraitSlot: 'right',
    })
    expect(linesByCategory.get('success')?.[0]).toMatchObject({
      portraitId: 'investigator',
      portraitSlot: 'left',
    })
  })

  it('keeps partner sense-rule dialogue on the assistant sensing portrait slot', () => {
    const scene = createHintDialogueScene({
      title: '数量已经足够',
      conclusion: '下一步可以继续调查。',
      premises: ['只使用已经公开的信息。'],
      reasoning: '这一段只作为搭档感应定则包装。',
    })

    expect(scene).not.toBeNull()
    expect(scene?.category).toBe('hint')
    expect(scene?.lines.every((line) => line.portraitId === 'dispatcher-sensing')).toBe(true)
    expect(scene?.lines.every((line) => line.portraitSlot === 'right')).toBe(true)
  })

  it('keeps static dialogue free of target, candidate, forced, solver, proof, and coordinate leaks', () => {
    expect(findDialogueSceneLeaks(STATIC_DIALOGUE_SCENES)).toEqual([])
  })

  it('reports forbidden terms and answer-like coordinates in ordinary dialogue data', () => {
    const badScene: DialogueScene = {
      id: 'target-answer-test',
      category: 'caseIntro',
      title: 'Target answer scene',
      dismissible: true,
      assetRefs: [{ kind: 'background', id: 'forced-candidate-bg' }],
      lines: [
        {
          id: 'bad-line',
          speaker: '求解器',
          text: 'A1 is the target answer from proof internals.',
        },
      ],
    }

    expect(findDialogueSceneLeaks([badScene])).toEqual([
      expect.objectContaining({ field: 'id', term: 'answer' }),
      expect.objectContaining({ field: 'id', term: 'target' }),
      expect.objectContaining({ field: 'title', term: 'answer' }),
      expect.objectContaining({ field: 'title', term: 'target' }),
      expect.objectContaining({ field: 'asset', term: 'candidate' }),
      expect.objectContaining({ field: 'asset', term: 'forced' }),
      expect.objectContaining({ field: 'speaker', term: '求解器' }),
      expect.objectContaining({ field: 'text', term: 'answer' }),
      expect.objectContaining({ field: 'text', term: 'proof' }),
      expect.objectContaining({ field: 'text', term: 'target' }),
      expect.objectContaining({ field: 'text', term: 'cell-coordinate' }),
    ])
  })
})
