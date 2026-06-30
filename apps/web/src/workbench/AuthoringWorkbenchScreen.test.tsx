import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import AuthoringWorkbenchScreen from './AuthoringWorkbenchScreen'

describe('AuthoringWorkbenchScreen normal UI', () => {
  it('shows the local case-library workflow instead of the old import-first flow', () => {
    const html = renderToStaticMarkup(<AuthoringWorkbenchScreen />)
    const libraryPanel = html.slice(
      html.indexOf('class="case-library-panel"'),
      html.indexOf('class="case-library-group"', html.indexOf('class="case-library-panel"')),
    )
    const boardHeading = html.slice(
      html.indexOf('class="board-heading"'),
      html.indexOf('class="board-size-editor"', html.indexOf('class="board-heading"')),
    )

    expect(html).toContain('案例库')
    expect(html).toContain('草稿')
    expect(html).toContain('已发布')
    expect(html).toContain('内置模板')
    expect(libraryPanel).toContain('aria-label="新建地图"')
    expect(libraryPanel).toContain('aria-label="复制当前为草稿"')
    expect(boardHeading).toContain('aria-label="保存地图"')
    expect(boardHeading).toContain('aria-label="发布地图"')
    expect(boardHeading).toContain('aria-label="重新加载"')
    expect(boardHeading).toContain('aria-label="删除地图"')
    expect(html).not.toContain('class="top-actions"')
    expect(html).not.toContain('本地案例只保存在当前浏览器')
    expect(html).not.toContain('class="case-picker"')
    expect(html).not.toContain('>导入<')
    expect(html).not.toContain('>实验<')
  })

  it('keeps title and difficulty in the topbar without the old metadata form', () => {
    const html = renderToStaticMarkup(<AuthoringWorkbenchScreen />)

    expect(html).toContain('class="workbench-title-row"')
    expect(html).toContain('class="difficulty-chip"')
    expect(html).toContain('aria-label="编辑标题和难度"')
    expect(html).not.toContain('案件信息')
    expect(html).not.toContain('备注')
    expect(html).not.toContain('应用案件信息')
    expect(html).not.toContain('class="metadata-editor"')
    expect(html).not.toContain('案件标题')
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
    expect(html).toContain('空地')
    expect(html).not.toContain('无访客')
    expect(html).not.toContain('class="cell-object-toggles"')
    expect(html).not.toContain('只能作为备注')
    expect(html).not.toContain('不能用于格子或规则')
  })

  it('uses the editable rule-card list as the only normal rule list', () => {
    const html = renderToStaticMarkup(<AuthoringWorkbenchScreen />)

    expect(html).toContain('新建规则')
    expect(html).toContain('aria-label="Edit R1"')
    expect(html).toContain('class="rule-builder-card ')
    expect(html).not.toContain('class="workbench-rule-card')
    expect(html).not.toContain('Rule builder authoring coverage')
    expect(html).not.toContain('结构化编辑')
    expect(html).not.toContain('只读保留')
    expect(html).not.toContain('这一列就是当前地图的规则列表')
  })

  it('keeps normal rule cards compact without duplicate rule sentence paragraphs', () => {
    const html = renderToStaticMarkup(<AuthoringWorkbenchScreen />)
    const firstCard = html.slice(
      html.indexOf('class="rule-builder-card '),
      html.indexOf('class="rule-builder-card ', html.indexOf('class="rule-builder-card ') + 1),
    )

    expect(firstCard).toContain('class="rule-builder-copy-row"')
    expect(firstCard).not.toContain('<p>')
    expect(firstCard).not.toContain('>编辑<')
    expect(firstCard).toContain('aria-label="Edit R1"')
  })

  it('prioritizes rules on the right and keeps diagnostics compact outside that sidebar', () => {
    const html = renderToStaticMarkup(<AuthoringWorkbenchScreen />)

    expect(html).toContain('class="workbench-diagnostics-strip"')
    expect(html).toContain('class="diagnostics-settings-popover"')
    expect(html).toContain('class="panel workbench-panel rule-editor-panel"')
    expect(html.indexOf('rule-editor-panel')).toBeLessThan(html.indexOf('rule-builder-card'))
    expect(html.indexOf('workbench-diagnostics-strip')).toBeLessThan(html.indexOf('workbench-shell'))
  })

  it('removes normal developer debug and schema success surfaces', () => {
    const html = renderToStaticMarkup(<AuthoringWorkbenchScreen />)

    expect(html).not.toContain('Schema OK')
    expect(html).not.toContain('开发者调试')
    expect(html).not.toContain('草稿 JSON')
    expect(html).not.toContain('Rules JSON')
    expect(html).not.toContain('下载当前草稿')
    expect(html).not.toContain('Theme / VN private review')
    expect(html).not.toContain('开发者来源记录')
  })
})
