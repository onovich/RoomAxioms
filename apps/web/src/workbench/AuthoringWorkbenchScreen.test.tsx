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
    expect(html).toContain('新建')
    expect(html).toContain('保存')
    expect(html).toContain('发布')
    expect(html).toContain('删除')
    expect(html).not.toContain('class="case-picker"')
    expect(html).not.toContain('>导入<')
    expect(html).not.toContain('>实验<')
  })
})
