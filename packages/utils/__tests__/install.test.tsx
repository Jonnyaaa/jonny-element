import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, createApp } from "vue";

import { withInstall } from "../install";

// 定义一个基础 App 组件
const AppComp = defineComponent({
  setup() {
    return () => <div>App</div> // JSX 语法：渲染一个显示 "App" 的 div
  }
})

const compA = withInstall(defineComponent({
  name: 'CompA',
  setup() {
    return () => <div>CompA</div>
  }
}))

const compB = withInstall(defineComponent({
  name: 'CompB',
  setup() {
    return () => <div>CompB</div>
  }
}))

describe('install', () => {
  it('withInstall should be worked', () => {
    // 挂载一个空的 div 作为测试容器
    const wrapper = mount(() => <div id="app"></div>)
    // 创建 Vue 应用实例，并注册 compA、compB，最后挂载到测试容器
    const app = createApp(AppComp)

    app.use(compA).mount(wrapper.element)

    // 断言验证
    expect(compA.install).toBeDefined()
    expect(compB.install).toBeDefined()
    expect(app._context.components['CompA']).toBeTruthy() // 验证 compA 能被找到（已注册）
    expect(app._context.components['CompB']).toBeFalsy()
  })
})