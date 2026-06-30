import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import AuthoringWorkbenchScreen from './AuthoringWorkbenchScreen'

describe('AuthoringWorkbenchScreen normal UI', () => {
  it('shows the local case-library workflow instead of the old import-first flow', () => {
    const html = renderToStaticMarkup(<AuthoringWorkbenchScreen />)

    expect(html).toContain('案例库')
    expect(html).toContain('草稿')
    expect(html).toContain('已发布')
    expect(html).toContain('内置模板')
    expect(html).toContain('新建地图')
    expect(html).toContain('保存地图')
    expect(html).toContain('发布地图')
    expect(html).toContain('删除地图')
    expect(html).not.toContain('class="case-picker"')
    expect(html).not.toContain('>导入<')
    expect(html).not.toContain('>实验<')
  })

  it('keeps normal case metadata to one title field without tags or status controls', () => {
    const html = renderToStaticMarkup(<AuthoringWorkbenchScreen />)

    expect(html).toContain('案件标题')
    expect(html).not.toContain('<label>案件名')
    expect(html).not.toContain('<label>标签')
    expect(html).not.toContain('<label>状态')
  })

  it('keeps low-level diagnostic caps behind advanced plain-language details', () => {
    const html = renderToStaticMarkup(<AuthoringWorkbenchScreen />)

    expect(html).toContain('高级诊断范围')
    expect(html).toContain('求解器尝试次数')
    expect(html).toContain('可能现场数量')
    expect(html).not.toContain('>节点<')
    expect(html).not.toContain('>模型<')
    expect(html).not.toContain('>候选计数<')
  })

  it('uses a cell object dropdown with an object-manager path', () => {
    const html = renderToStaticMarkup(<AuthoringWorkbenchScreen />)

    expect(html).toContain('格子内容')
    expect(html).toContain('管理物体')
    expect(html).toContain('<option value="__manage__">管理物体...</option>')
    expect(html).not.toContain('class="cell-object-toggles"')
  })
})
