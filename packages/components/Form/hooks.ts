import { FORM_CTX_KEY, FORM_ITEM_CTX_KEY } from "./constants";
import { inject } from "vue";

export function useFormItem() {
  // 通过FORM_CTX_KEY注入表单上下文，如果没有找到则返回undefined
  const form = inject(FORM_CTX_KEY, void 0);
  const formItem = inject(FORM_ITEM_CTX_KEY, void 0);
  return { form, formItem };
}