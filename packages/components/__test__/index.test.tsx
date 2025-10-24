import type { Plugin } from "vue";
import { describe, it, expect } from "vitest";

// 从当前目录的上级导入需要测试的组件
import {
  JoButton,
  JoButtonGroup, 
  JoIcon, 
  JoCollapse, 
  JoCollapseItem, 
  JoAlert,
} from "..";

import { get, map } from "lodash-es"

// 将组件数组断言为 Plugin[] 类型（符合 Vue 插件规范）
// 这一步确保后续测试中，TypeScript 不会因为 “组件可能不满足 Plugin 类型” 而报错
const comps = [
  JoButton,
  JoButtonGroup,
  JoIcon,
  JoCollapse,
  JoCollapseItem,
  JoAlert,
 ] as Plugin[];

 describe("components/index", () => {
  // 使用 it.each 动态生成测试用例
  it.each(map(comps, (c) => [get(c, "name") ?? "", c]))( // 生成测试数据：将组件数组映射为 [组件名称, 组件本身] 的二维数组
    "%s should be exported", // 测试用例名称模板："%s should be exported"（%s 会被替换为组件名称）
    (_, component) => { // 测试函数：接收 [组件名称, 组件本身] 作为参数
      expect(component).toBeDefined()
      expect(component.install).toBeDefined()
    }
  )
 })