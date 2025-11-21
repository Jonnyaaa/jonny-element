import type {
  MessageBoxAction,
  MessageBoxOptions,
  MessageBoxData,
  MessageBoxCallback,
  MessageBoxProps,
  IJoMessageBox,
} from "./types";
import type { ComponentPublicInstance, VNode, VNodeProps, Ref } from "vue";
import { createVNode, isVNode, ref, render, nextTick } from "vue";
import {
  isString,
  isFunction,
  each,
  set,
  isObject,
  isUndefined,
  assign,
} from "lodash-es";

import MessageBoxConstructor from "./MessageBox.vue";

const messageInstanceMap = new Map<
  ComponentPublicInstance<{ doClose: () => void }>,
  {
    options: MessageBoxOptions;
    callback: MessageBoxCallback | void;
    resolve: (res: any) => void;
    reject: (res: any) => void;
  }
>();


/**
 * 初始化弹窗组件实例，将组件渲染到指定DOM容器
 * @param props 弹窗组件完整Props（用户配置+内置方法）
 * @param container 渲染容器（空div）
 * @returns Vue组件内部实例
 */
function initInstance(props: MessageBoxProps, container: HTMLElement) {
  const visible = ref(false);
  // 判断消息内容是否为VNode或返回VNode的函数
  const isVNodeMsg = isFunction(props?.message) || isVNode(props?.message);

  const genDefaultSlot = (msg: VNode | (() => VNode)) =>
    // 函数式VNode直接返回，否则包装为函数
    isFunction(msg) ? msg : () => msg;

  // 创建弹窗组件的虚拟节点
  const vnode = createVNode(
    MessageBoxConstructor,
    {
      ...props,
      visible,
    } as VNodeProps,
    isVNodeMsg ? { default: genDefaultSlot(props.message as VNode) } : void 0
  );

  render(vnode, container);
  document.body.appendChild(container.firstElementChild!);
  // 返回组件内部实例（供后续获取proxy）
  return vnode.component;
}

/**
 * 创建弹窗实例，注入内置方法，控制弹窗生命周期
 * @param options 用户传入的弹窗配置项
 * @returns 弹窗组件公共实例
 */
function createMessage(options: MessageBoxOptions) {
  const container = document.createElement("div");
  const props: MessageBoxProps = {
    ...options,
    doClose: () => {
      vm.visible.value = false;
    },
    doAction: (action: MessageBoxAction, inputVal: string) => {
      const currentMsg = messageInstanceMap.get(vm);
      let resolve:
        | MessageBoxAction
        | { value: string; action: MessageBoxAction };

      nextTick(() => vm.doClose());

      if (options.showInput) {
        resolve = { value: inputVal, action };
      } else {
        resolve = action;
      }
      if (options.callback) {
        options.callback(resolve);
        return;
      }
      if (action === "cancel" || action === "close") {
        currentMsg?.reject(action);
        return;
      }
      currentMsg?.resolve(resolve);
    },
    destroy: () => {
      render(null, container);
      messageInstanceMap.delete(vm);
    },
  };

  const instance = initInstance(props as MessageBoxProps, container);
  const vm = instance?.proxy as ComponentPublicInstance<{
    doClose: () => void;
    visible: Ref<boolean>;
  }>;

  vm.visible.value = true;
  return vm;
}

async function MessageBox(options: MessageBoxOptions): Promise<MessageBoxData>;
/**
 * MessageBox主函数：函数式调用入口，兼容多格式传参 + Promise封装
 * @param options 弹窗配置项/字符串/VNode
 * @returns Promise<any> 弹窗操作结果
 */
function MessageBox(options: MessageBoxOptions | string | VNode): Promise<any> {
  let callback: MessageBoxCallback | void;
  if (isString(options) || isVNode(options)) {
    options = {
      message: options,
    };
  } else {
    callback = options.callback;
  }
  return new Promise((resolve, reject) => {
    const instance = createMessage(options);
    messageInstanceMap.set(instance, { options, callback, resolve, reject });
  });
}

const MESSAGE_BOX_VARIANTS = ["alert", "confirm", "prompt"] as const;
const MESSAGE_BOX_DEFAULT_OPTS: Record<
  (typeof MESSAGE_BOX_VARIANTS)[number],
  Partial<MessageBoxOptions>
> = {
  alert: { closeOnClickModal: false },
  confirm: { showCancelButton: true },
  prompt: { showCancelButton: true, showInput: true },
};

each(MESSAGE_BOX_VARIANTS, (type) =>
  set(MessageBox, type, messageBoxFactory(type))
);

/**
 * 快捷方法工厂函数：生成对应类型的弹窗调用逻辑
 * @param boxType 弹窗类型（alert/confirm/prompt）
 * @returns 快捷调用函数
 */
function messageBoxFactory(boxType: (typeof MESSAGE_BOX_VARIANTS)[number]) {
  return (
    message: string | VNode,
    title: string | MessageBoxOptions,
    options: MessageBoxOptions
  ) => {
    let titleOrOpts = "";
    if (isObject(title)) {
      options = title as MessageBoxOptions;
      titleOrOpts = "";
    } else if (isUndefined(title)) {
      titleOrOpts = "";
    } else {
      titleOrOpts = title as string;
    }

    return MessageBox(
      assign(
        {
          title: titleOrOpts,
          message,
          type: "",
          boxType,
          ...MESSAGE_BOX_DEFAULT_OPTS[boxType],
        },
        options
      )
    );
  };
}

set(MessageBox, "close", () => {
  messageInstanceMap.forEach((_, vm) => {
    vm.doClose();
  });
  messageInstanceMap.clear();
});

export default MessageBox as IJoMessageBox;