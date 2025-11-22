import type { ComputedRef } from "vue";

export type SwitchValueType = boolean | string | number;

export interface SwitchProps {
  modelValue: SwitchValueType;
  disabled?: boolean;
  activeText?: string;
  inactiveText?: string;
  activeValue?: SwitchValueType;
  inactiveValue?: SwitchValueType;
  name?: string;
  id?: string;
  size?: "small" | "large";
}

export interface SwitchEmits {
  // 更新绑定值的事件
  (e: "update:modelValue", value: SwitchValueType): void;
  // 状态改变时的事件
  (e: "change", value: SwitchValueType): void;
}

export interface SwitchInstance {
  focus(): void;
  checked: ComputedRef<boolean>;
}