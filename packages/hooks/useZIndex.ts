// 生成递增的 Z-index 值，避免组件层级冲突，确保后创建的组件始终在视觉上层
import { computed, ref } from "vue";

const zIndex = ref(0)

export default function useZIndex(initVal = 2000) {
  const _initVal = ref(initVal)
  const currentIndex = computed(() => zIndex.value + _initVal.value)

  // 递增方法，全局计数器自增，同时返回新的 Z-index 值
  const nextZIndex = () => {
    zIndex.value += 1
    return currentIndex.value
  }

  return {
    initialValue: _initVal,
    currentIndex,
    nextZIndex
  }
}