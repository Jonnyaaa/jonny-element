import type { InjectionKey } from "vue"; // 导入注入键类型
import type { SelectContext } from "./types";

// 定义选择器上下文的注入键
export const SELECT_CTX_KEY: InjectionKey<SelectContext> = Symbol("selectContext");

// 定义popper配置选项
export const POPPER_OPTIONS: any = {
  modifiers: [
    {
      name: "offset", // 偏移修饰符
      options: {
        offset: [0, 9],
      },
    },
    {
      name: "sameWidth", // 相同宽度修饰符
      enabled: true,
      fn: ({ state }: { state: any }) => {
        // 设置popper宽度与参考元素相同
        state.styles.popper.width = `${state.rects.reference.width}px`;
      },
      phase: "beforeWrite",
      requires: ["computeStyles"],
    },
  ],
} as const;