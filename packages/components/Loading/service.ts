import type { LoadingOptions, LoadingOptionsResolved } from "./types";
import { ref, createApp, reactive, nextTick } from "vue";
import { useZIndex } from "@jonny-element/hooks";
import LoadingComp from "./Loading.vue";
import { defer, delay, isNil, isString } from "lodash-es";

const RELATIVE_CLASS = "jo-loading-parent--relative" as const;
const HIDDEN_CLASS = "jo-loading-parent--hiden" as const;
const LOADING_NUMB_KEY = "jo-loading-numb" as const; // 记录加载实例数量的属性名

// 实例映射表：缓存目标元素与对应的Loading实例（避免重复创建）
const instanceMap: Map<HTMLElement, LoadingInstance> = new Map();
const { nextZIndex } = useZIndex(3000);


/**
 * 创建Loading实例
 * @param opts 解析后的配置项
 * @returns Loading实例对象
 */
function createLoading(opts: LoadingOptionsResolved) {
  // 控制Loading显示状态的响应式变量
  const visible = ref(opts.visible);
  // 离开动画完成标记（避免重复销毁）
  const afterLeaveFlag = ref(false);

  // 处理动画结束后的清理逻辑
  const handleAfterLeave = () => {
    if (!afterLeaveFlag.value) return;
    destory();
  };

  // 响应式数据：合并配置并添加生命周期钩子
  const data = reactive({
    ...opts,
    onAfterLeave: handleAfterLeave, // 传递给组件的动画结束钩子
  });

  /**
   * 设置加载文本
   * @param text 新的文本内容
   */
  const setText = (text: string) => (data.text = text);

  // 销毁Loading实例（内部方法）
  const destory = () => {
    const target = data.parent;
    subtLoadingNumb(target); // 减少目标元素的加载计数

    if (getLoadingNumb(target)) return; // 如果还有其他加载实例，则不清理样式

    // 延迟1ms清理样式（避免动画冲突）
    delay(() => {
      removeRelativeClass(target);
      removeHiddenClass(target);
    }, 1);

    // 从缓存中移除
    instanceMap.delete(target ?? document.body);
    // 移除DOM元素
    vm.$el?.parentNode?.removeChild(vm.$el);
    // 卸载Vue应用
    app.unmount();
  };

  // 动画结束计时器（用于清理）
  let afterLeaveTimer: number;

  // 关闭Loading（对外方法）
  const close = () => {
    // 如果有beforeClose钩子且返回false，则阻止关闭
    if (opts.beforeClose && !opts.beforeClose()) return;

    afterLeaveFlag.value = true; // 标记动画即将结束
    clearTimeout(afterLeaveTimer); // 清除已有计时器
    // 延迟执行销毁（等待过渡动画完成）
    afterLeaveTimer = defer(handleAfterLeave);

    visible.value = false; // 隐藏Loading
    opts.closed?.(); // 执行关闭回调
  };

  // 创建Vue应用实例
  const app = createApp(LoadingComp, {
    ...data,
    zIndex: data.fullscreen ? nextZIndex() : void 0, // 全屏模式使用新层级
    visible, // 传递显示状态
  });

  // 挂载到动态创建的div上
  const vm = app.mount(document.createElement("div"));

  // 返回实例对外接口
  return {
    get $el(): HTMLElement {
      return vm.$el;
    },
    vm, // Vue实例
    close,
    visible,
    setText,
  };
}

/**
 * 解析用户传入的配置项，处理默认值和边界情况
 * @param opts 用户原始配置
 * @returns 解析后的标准配置
 */
function resolveOptions(opts: LoadingOptions): LoadingOptionsResolved {
  let target: HTMLElement;

  // 处理目标元素：字符串则作为选择器查询，否则直接使用
  if (isString(opts.target)) {
    // 选择器查询不到元素时，默认使用body
    target = document.querySelector(opts.target) ?? document.body;
  } else {
    // 非字符串类型（DOM元素/null/undefined），无效值时默认使用body
    target = opts.target || document.body;
  }

  // 返回解析后的完整配置
  return {
    // 父容器：目标是body或指定body选项，则父容器为body，否则为目标元素
    parent: target === document.body || opts.body ? document.body : target,
    background: opts.background ?? "rgba(0, 0, 0, 0.5)", // 默认半透明黑色背景
    spinner: opts.spinner, // 加载图标配置
    text: opts.text, // 加载文本
    // 全屏模式：目标是body且未禁用全屏时启用（默认true）
    fullscreen: target === document.body && (opts.fullscreen ?? true),
    lock: opts.lock ?? false, // 默认不锁定滚动
    visible: opts.visible ?? true, // 默认初始可见
    target, // 原始目标元素
  };
}

// 为目标元素添加相对定位类（确保Loading可相对定位）
function addRelativeClass(target: HTMLElement = document.body) {
  target.classList.add(RELATIVE_CLASS);
}

// 移除目标元素的相对定位类
function removeRelativeClass(target: HTMLElement = document.body) {
  target.classList.remove(RELATIVE_CLASS);
}

// 为目标元素添加隐藏滚动类（锁定时使用）
function addHiddenClass(target: HTMLElement = document.body) {
  target.classList.add(HIDDEN_CLASS);
}

// 移除目标元素的隐藏滚动类
function removeHiddenClass(target: HTMLElement = document.body) {
  target.classList.remove(HIDDEN_CLASS);
}

/**
 * 获取目标元素上的加载计数（用于管理多个Loading实例）
 * @param target 目标元素，默认body
 * @returns 计数字符串或null
 */
function getLoadingNumb(target: HTMLElement = document.body) {
  return target.getAttribute(LOADING_NUMB_KEY);
}

// 移除目标元素上的加载计数属性
function removeLoadingNumb(target: HTMLElement = document.body) {
  target.removeAttribute(LOADING_NUMB_KEY);
}

// 增加目标元素的加载计数（创建实例时调用）
function addLoadingNumb(target: HTMLElement = document.body) {
  const numb = getLoadingNumb(target) ?? "0"; // 默认为0
  // 计数+1并更新属性
  target.setAttribute(LOADING_NUMB_KEY, `${Number.parseInt(numb) + 1}`);
}

// 减少目标元素的加载计数（关闭实例时调用）
function subtLoadingNumb(target: HTMLElement = document.body) {
  const numb = getLoadingNumb(target);
  if (numb) {
    const newNumb = Number.parseInt(numb) - 1;
    // 计数为0时移除属性，否则更新计数
    if (newNumb === 0) {
      removeLoadingNumb(target);
    } else {
      target.setAttribute(LOADING_NUMB_KEY, `${newNumb}`);
    }
  }
}

/**
 * 根据配置为目标元素添加相应的样式类
 * @param options 加载配置
 * @param parent 父容器元素，默认body
 */
function addClass(
  options: LoadingOptions,
  parent: HTMLElement = document.body
) {
  // 锁定时添加隐藏滚动类，否则移除
  if (options.lock) {
    addHiddenClass(parent);
  } else {
    removeHiddenClass(parent);
  }
  // 添加相对定位类（确保Loading能相对父容器定位）
  addRelativeClass(parent);
}

// 全屏Loading实例缓存（确保全局唯一）
let fullscreenInstance: LoadingInstance | null = null;

// 导出Loading实例类型（基于createLoading的返回值）
export type LoadingInstance = ReturnType<typeof createLoading>;


/**
 * 创建Loading服务的入口函数
 * @param options 加载配置项
 * @returns Loading实例
 */
export function Loading(options: LoadingOptions = {}): LoadingInstance {
  const resolved = resolveOptions(options); // 解析配置
  const target = resolved.parent ?? document.body;

  // 全屏模式下复用已有实例
  if (resolved.fullscreen && !isNil(fullscreenInstance)) {
    return fullscreenInstance;
  }

  // 增加目标元素的加载计数
  addLoadingNumb(resolved?.parent);
  if (instanceMap.has(target)) {
    return instanceMap.get(target)!;
  }

  // 创建新的Loading实例
  const instance = createLoading({
    ...resolved,
    // 扩展closed回调：执行用户传入的closed，并清理全屏实例缓存
    closed: () => {
      resolved.closed?.(); // 执行用户的closed回调

      if (resolved.fullscreen) {
        fullscreenInstance = null; // 全屏实例关闭后清空缓存
      }
    },
  });

  // 添加样式类
  addClass(options, resolved?.parent);

  // 将Loading元素添加到父容器
  resolved.parent?.appendChild(instance.$el);

  // 下一帧更新可见性（确保DOM已挂载，避免动画问题）
  nextTick(() => (instance.visible.value = !!resolved.visible));

  // 缓存全屏实例
  if (resolved.fullscreen) {
    fullscreenInstance = instance;
  }

  // 缓存实例到映射表
  instanceMap.set(target, instance);
  return instance;
}