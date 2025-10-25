import { onMounted, onBeforeUnmount, watch, isRef, unref, type MaybeRef } from "vue";

// 通用事件监听钩子
export default function useEventListener(
  target: MaybeRef<EventTarget | HTMLElement | void>, // MaybeRef: 可以是Ref或原始值
  event: string, // 事件名称
  handler: (e: Event) => any // 事件处理函数
) {
  // 如果目标是响应式Ref（可能动态变化）
  if (isRef(target)) {
    // 监听Ref变化：旧值移除事件，新值添加事件
    watch(target, (val, oldVal) => {
      oldVal?.removeEventListener(event, handler) // 旧目标存在时移除事件
      val?.addEventListener(event, handler) // 新目标存在时添加事件
    })
  } else {
    // 非响应式目标：组件挂载时添加事件
    onMounted(() => target?.addEventListener(event, handler))
  }

  // 组件卸载前：移除事件监听（无论目标是否为Ref）
  onBeforeUnmount(() => unref(target)?.removeEventListener(event, handler))
}