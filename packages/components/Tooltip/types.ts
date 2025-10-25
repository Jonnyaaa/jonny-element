import type { Placement, Options } from "@popperjs/core"

export interface TooltipProps {
  content?: string
  trigger?: 'hover' | 'click' |'contextmenu'
  placement?: Placement // Tooltip 相对于目标元素的「定位方向」
  manual?: boolean // 是否开启「手动控制显隐」
  disabled?: boolean // 是否「禁用 Tooltip」
  popperOptions?: Partial<Options>
  transition?: string // Tooltip 显隐时的「过渡动画类名」
  showTimeout?: number
  hideTimeout?: number
}

// 组件的输出事件，外部组件可通过监听这些事件执行自定义逻辑
export interface TooltipEmits {
  (e: "visible-change", value: boolean): void
  (e: "click-outside"): void
}

// 组件的实例方法
export interface TooltipInstance {
  show(): void // 手动触发 Tooltip 显示
  hide(): void
}