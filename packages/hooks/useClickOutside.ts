import { type Ref } from 'vue'
import useEventListener from './useEventListener' // 导入通用事件监听钩子

// 监听点击元素外部的钩子
export default function useClickOutside(
  elementRef: Ref<HTMLElement | void>, // 目标元素的Ref（需要监听外部点击的元素）
  callback: (e: MouseEvent) => void // 点击外部的回调
) {
  // 监听document的click事件
  useEventListener(document, 'click', (e: Event) => {
    // 目标元素存在且点击事件有目标时
    if (elementRef.value && e.target) {
      // 检查点击目标是否不在目标元素内部（包含子元素）
      if (!elementRef.value.contains(e.target as HTMLElement)) {
        callback(e as MouseEvent) // 执行回调（传入鼠标事件）
      }
    }
  })
}