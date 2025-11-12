// 偏移量计算工具函数，核心作用是根据 “基础偏移量、自身高度、上一个元素的底部偏移量”，动态计算当前元素的顶部和底部偏移量，常用于组件堆叠布局
import { type Ref, computed } from 'vue'

interface UseOffsetOptions {
  offset: number; // 基础偏移量，元素之间的间距
  boxHeight: Ref<number>; // 当前元素的高度
  getLastBottomOffset(): number; // 获取上一个元素的底部偏移量
}

interface UseOffsetResult {
  topOffset: Ref<number>; // 当前元素的顶部偏移量
  bottomOffset: Ref<number> // 当前元素的底部偏移量
}

export function useOffset(opts: UseOffsetOptions): UseOffsetResult {
  const lastBottomOffset = computed(() => opts.getLastBottomOffset())

  // 当前元素的顶部偏移量 = 基础偏移量 + 上一个元素的底部偏移量
  const topOffset = computed(() => opts.offset + lastBottomOffset.value)

  // 当前元素的底部偏移量 = 自身顶部偏移量 + 自身高度
  const bottomOffset = computed(() => topOffset.value + opts.boxHeight.value)

  return {
    topOffset,
    bottomOffset
  }
}

export default useOffset