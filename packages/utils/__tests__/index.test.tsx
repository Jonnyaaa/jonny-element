import { describe, expect, it } from "vitest";
import { each } from "lodash-es";

import {
  debugWarn,
  throwError,
  withInstall,
  makeInstaller,
  typeIconMap
} from '..'

describe('utils/index', () => {
  // 验证debugWarn函数是否被正确导出
  it ('debugWarn should be exported', () => {
    // 断言：debugWarn必须被定义（即存在且非undefined）
    // 目的：确保该工具函数在模块中正常导出，避免引用时出现"未定义"错误
    expect(debugWarn).toBeDefined()
  })
  it ('throwError should be exported', () => {
    expect(throwError).toBeDefined()
  })
  it ('withInstall should be exported', () => {
    expect(withInstall).toBeDefined()
  })
  it ('makeInstaller should be exported', () => {
    expect(makeInstaller).toBeDefined()
  })
  // 验证typeIconMap的映射关系是否正确
  it ('typeIconMap should be worked', () => {
    expect(typeIconMap).toBeDefined()
    // 遍历多组测试数据，验证每种类型对应的图标是否正确
    each([
      ["info", "circle-info"],
      ["success", "check-circle"],
      ["warning", "circle-exclamation"],
      ["danger", "circle-xmark"],
      ["error", "circle-xmark"],
    ], ([type, icon]) => {
      // 断言：从typeIconMap中获取type对应的图标，必须等于预期的icon
      // 目的：确保组件（如Alert、Message）使用类型时能正确匹配图标，避免UI显示错误
      expect(typeIconMap.get(type)).toBe(icon);
    }
    )
  })
})