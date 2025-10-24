import { describe, expect, it, vi } from "vitest"

import { throwError, debugWarn } from '../error'

describe('error', () => {
  it('throwError should be worked', () => {
    // 断言：调用 throwError('scope', 'msg') 时，会抛出特定格式的错误
    expect(() => {
      throwError('scope', 'msg')
    }).toThrowError('[scope]:msg')
  })
  it('debugWarn should be worked', () => {
    // 监视 console.warn 方法，并替换为一个空实现（避免实际打印警告）
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => { })
    // 调用 debugWarn 两次，测试不同参数
    debugWarn('scope', 'msg')
    debugWarn(new SyntaxError('custom error'))
    // 断言 console.warn 的调用记录是否符合预期
    expect(warn.mock.calls).toMatchInlineSnapshot(`
      [
        [
          [JoUIError: [scope]:msg],
        ],
        [
          [SyntaxError: custom error],
        ],
      ]
    `)
  })
})