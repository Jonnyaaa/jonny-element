import type { Directive, DirectiveBinding, MaybeRef } from "vue";
import type { LoadingOptions } from "./types";
import { Loading, type LoadingInstance } from "./service";

// 用于在DOM元素上存储Loading实例的唯一键（避免属性冲突）
const INSTANCE_KEY = Symbol("loading");

export interface ElementLoading extends HTMLElement {
  [INSTANCE_KEY]?: {
    instance: LoadingInstance;
    options: LoadingOptions;
  };
}

/**
 * 创建Loading实例（用于指令内部）
 * @param el 绑定指令的DOM元素
 * @param binding Vue指令绑定对象
 */
function createInstance(
  el: ElementLoading,
  binding: DirectiveBinding<boolean>
) {
  // 从元素属性获取配置（如jo-loading-text）
  const getProp = <K extends keyof LoadingOptions>(name: K) =>
    el.getAttribute(`jo-loading-${name}`) as MaybeRef<string>;

  // 从指令修饰符获取配置（如v-loading.fullscreen）
  const getModifier = <K extends keyof LoadingOptions>(name: K) =>
    binding.modifiers[name];

  const fullscreen = getModifier("fullscreen"); // 是否全屏

  // 组装Loading配置
  const options: LoadingOptions = {
    text: getProp("text"),
    spinner: getProp("spinner"),
    background: getProp("background"),
    target: fullscreen ? void 0 : el, // 目标元素（非全屏时为当前元素）
    body: getModifier("body"),
    lock: getModifier("lock"),
    fullscreen,
  };

  // 将实例和配置存储到DOM元素上
  el[INSTANCE_KEY] = {
    options,
    instance: Loading(options), // 创建Loading实例
  };
}

// v-loading指令定义：用于在DOM元素上通过指令方式使用Loading
export const vLoading: Directive<ElementLoading, boolean> = {
  // 元素挂载时触发
  mounted(el, binding) {
    if (binding.value) createInstance(el, binding); // 当指令值为true时创建实例
  },
  // 元素更新时触发
  updated(el, binding) {
    if (binding.oldValue === binding.value) return; // 值未变化则跳过

    // 从false变为true：创建实例
    if (binding.value && !binding.oldValue) {
      createInstance(el, binding);
      return;
    }
    // 从true变为false：关闭实例
    el[INSTANCE_KEY]?.instance.close();
  },
  // 元素卸载时触发
  unmounted(el) {
    el[INSTANCE_KEY]?.instance.close(); // 关闭实例
    el[INSTANCE_KEY] = void 0; // 清理存储的实例
  },
};