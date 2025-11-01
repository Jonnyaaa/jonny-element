// 生成唯一 ID 的工具函数 
import { type Ref, computed } from "vue";

const defaultIdInjection = {
  prefix: Math.floor(Math.random() * 10000), // 随机前缀（0-9999 之间的整数）
  current: 0, // 自增计数器
};

export function useId(namespace: string = "jo"): Ref<string> {
  const idRef = computed(
    () =>
      `${namespace}-${defaultIdInjection.prefix}-${defaultIdInjection.current++}`
  );
  return idRef;
}

export default useId;