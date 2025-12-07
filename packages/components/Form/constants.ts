import type { InjectionKey } from "vue";
import type { FormContext, FormItemContext } from "./types";

// 表单上下文的依赖注入键
export const FORM_CTX_KEY: InjectionKey<FormContext> = Symbol("formContext");
// 表单项上下文的依赖注入键
export const FORM_ITEM_CTX_KEY: InjectionKey<FormItemContext> =
  Symbol("formItemContext");