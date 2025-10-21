import type { Ref } from "vue"
export type CollapseItemName = string | number

// 折叠面板
export interface CollapseProps {
  modelValue: CollapseItemName[] // 用于双向绑定的展开状态值
  accordion?: boolean // 控制是否为 “手风琴模式”
}

// 子组件
export interface CollapseItemProps {
  name: CollapseItemName
  title?: string
  disabled?: boolean
}

// 组件的事件
// 函数重载类型接口（多函数类型）
export interface CollapseEmits {
  (e: "update:modelValue", value: CollapseItemName[]): void // 用于支持 v-model 双向绑定的事件
  (e: "change", value: CollapseItemName[]): void // 展开状态变化时触发的事件
}

// 折叠面板（Collapse）与子项（CollapseItem）之间共享的上下文类型
export interface CollapseContext {
  activeNames: Ref<CollapseItemName[]>; // 当前所有展开的子项名称集合
  handleItemClick(name: CollapseItemName): void; // 处理子项点击事件的回调函数
}