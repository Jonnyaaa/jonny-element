import { FORM_CTX_KEY, FORM_ITEM_CTX_KEY } from "./constants";
import {
  computed,
  inject,
  onMounted,
  onUnmounted,
  ref,
  toRef,
  unref,
  watch,
  type MaybeRef,
  type WatchStopHandle,
} from "vue";
import { useId, useProp } from "@jonny-element/hooks";
import type { FormItemContext } from "./types";

export function useFormItem() {
  // 通过FORM_CTX_KEY注入表单上下文，如果没有找到则返回undefined
  const form = inject(FORM_CTX_KEY, void 0);
  const formItem = inject(FORM_ITEM_CTX_KEY, void 0);
  return { form, formItem };
}

/**
 * 用于获取表单禁用状态的钩子（综合考虑多级禁用状态）
 * @param fallback 备选的禁用状态
 * @returns 计算属性，返回是否禁用
 */
export function useFormDisabled(fallback?: MaybeRef<boolean | void>) {
  const disabled = useProp<boolean>("disabled"); // 获取自身disabled属性
  const form = inject(FORM_CTX_KEY, void 0);
  const formItem = inject(FORM_ITEM_CTX_KEY, void 0);

  // 计算最终禁用状态（自身禁用 > 表单项禁用 > 表单禁用 > 备选禁用）
  return computed(
    () =>
      disabled.value ||
      unref(fallback) ||
      form?.disabled ||
      formItem?.disabled ||
      false
  );
}

// 表单项输入组件的通用属性接口
interface UseFormItemInputCommenProps extends Record<string, any> {
  id?: string;
}

/**
 * 用于管理表单项输入框ID的钩子（关联label和input）
 * @param props 组件属性
 * @param formItemContext 表单项上下文
 * @returns 包含inputId的对象
 */
export function useFormItemInputId(
  props: UseFormItemInputCommenProps,
  formItemContext?: FormItemContext
) {
  const inputId = ref<string>(""); // 输入框ID
  let unwatch: WatchStopHandle | void; // 监听函数引用

  onMounted(() => {
    // 监听id属性变化
    unwatch = watch(
      toRef(() => props.id),
      (id) => {
        // 生成新ID（优先使用props.id，否则自动生成）
        const newId = id ?? useId().value;
        if (newId !== inputId.value) {
          // 移除旧ID关联
          inputId.value && formItemContext?.removeInputId(inputId.value);
          // 添加新ID关联
          formItemContext?.addInputId(newId);
          inputId.value = newId;
        }
      },
      {
        immediate: true, // 立即执行一次
      }
    );
  });

  onUnmounted(() => {
    // 停止监听
    unwatch && unwatch();
    // 移除ID关联
    inputId.value && formItemContext?.removeInputId(inputId.value);
  });

  return {
    inputId, // 输入框ID的响应式引用
  };
}