import { describe, expect, it } from 'vitest'

import {
  SCENE_DEPARTMENT,
  SCENE_TITLE,
  sanitizePlayerRuleCopy,
  sceneCellLabels,
  sceneKindLabel,
  sceneKindUnit,
  scenePanels,
  sceneToolLabels,
} from './vocabulary'

describe('Unregistered Scene vocabulary', () => {
  it('maps the internal guest kind to player-facing anomaly wording', () => {
    expect(SCENE_TITLE).toBe('未登记现场')
    expect(SCENE_DEPARTMENT).toBe('非常规赔案调查部')
    expect(sceneCellLabels.guest).toBe('异常区域')
    expect(sceneKindLabel('guest')).toBe('异常区域')
    expect(sceneKindUnit('guest')).toBe('处')
    expect(sceneToolLabels.guest).toBe('标注异常')
    expect(scenePanels.partnerReview).toBe('搭档复核')
  })

  it('removes legacy guest wording from player rule copy', () => {
    expect(sanitizePlayerRuleCopy('每面镜子周围一圈里，必有 1 名访客。')).toBe(
      '每面镜子周围一圈里，必有 1 处异常区域。',
    )
    expect(sanitizePlayerRuleCopy('没有未登记访客。')).toBe('没有异常区域。')
  })
})
