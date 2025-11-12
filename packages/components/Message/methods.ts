// API：虚拟节点判断、渲染、创建虚拟节点、浅响应式
import { isVNode, render, h, shallowReactive } from "vue";
import type {
  CreateMessageProps,
  MessageInstance,
  MessageFn,
  Message,
  MessageParams,
  MessageProps,
  MessageHandler,
  MessageType,
} from "./types";
import { messageTypes } from "./types";
import { useId,useZIndex } from "@jonny-element/hooks";
import { isString, findIndex, set, each, get } from "lodash-es";
import MessageConstructor from "./Message.vue";

// let seed = 0;

// 消息实例队列，存储所有正在显示的消息，浅响应式便于监听变化
const instances: MessageInstance[] = shallowReactive([]);
const { nextZIndex } = useZIndex()

export const messageDefaults = {
  type: "info",
  duration: 3000,
  offset: 10,
  transitionName: "fade-up",
};

// 将用户传入的参数（字符串/VNode/配置对象）统一转换为 CreateMessageProps 类型
const normalizedOptions = (opts: MessageParams): CreateMessageProps => {
  const result =
    // 若参数是 空值、VNode或字符串，包装成 { message: ... } 形式
    !opts || isVNode(opts) || isString(opts)
      ? {
        message: opts,
      }
      : opts; // 若参数是对象，直接使用
  return { ...messageDefaults, ...result } as CreateMessageProps;
};

// 关键点：创建消息实例
const createMessage = (props: CreateMessageProps): MessageInstance => {
  // const id = `message_${seed++}`;
  const id = useId().value
  // 创建临时 DOM 容器（用于挂载消息组件）
  const container = document.createElement("div");

  // 定义消息销毁函数（从队列移除并清理 DOM）
  const destory = () => {
    // 找到当前实例在队列中的索引
    const idx = findIndex(instances, { id });
    if (idx === -1) return; // 已销毁则跳过

    // 从实例队列中移除
    instances.splice(idx, 1);
    // 清空容器 DOM（卸载组件）
    render(null, container);
  };

  // 组装完整的组件 props
  const _props: MessageProps = {
    ...props,
    id,
    zIndex: nextZIndex(),
    onDestory: destory,
  };
  // 创建消息组件的虚拟节点
  const vnode = h(MessageConstructor, _props);

  // 将虚拟节点渲染到临时容器，并挂载到 body 上
  render(vnode, container);

  document.body.appendChild(container.firstElementChild!); // 插入页面

  const vm = vnode.component!; // 组件内部实例
  const handler: MessageHandler = {
    close: () => vm.exposed!.close(), // 调用组件暴露的 close 方法
  };

  // 创建消息实例对象
  const instance: MessageInstance = {
    props: _props,
    id,
    vm,
    vnode,
    handler,
  };
  // 将实例添加到队列管理
  instances.push(instance);

  return instance;
};

export function getLastBottomOffset(this: MessageProps) {
  // 查找当前消息实例在实例队列中的索引
  const idx = findIndex(instances, { id: this.id });
  // 如果是第一个消息（索引0）或找不到，返回0（无偏移）
  if (idx <= 0) return 0;

  // 否则返回前一个消息实例的底部偏移量
  return get(instances, [idx - 1, "vm", "exposed", "bottomOffset", "value"]);
}

// 消息主函数
export const message: MessageFn & Partial<Message> = (options = {}) => {
  const normalized = normalizedOptions(options); // 参数标准化
  const instance = createMessage(normalized); // 创建实例

  return instance.handler; // 返回关闭方法
};


export function closeAll(type?: MessageType) {
  each(instances, (instance) => {
    if (type) {
      // 若指定类型，只关闭该类型的消息
      instance.props.type === type && instance.handler.close();
      return;
    }
    // 否则关闭所有消息
    instance.handler.close();
  });
}

// 为 message 函数添加特定类型的快捷方法（如 success/warning 等）
each(messageTypes, (type) => {
  set(message, type, (opts: MessageParams) => {
    const normalized = normalizedOptions(opts);
    return message({ ...normalized, type });
  });
});

// 将 closeAll 方法挂载到 message 上
message.closeAll = closeAll;

export default message as Message;