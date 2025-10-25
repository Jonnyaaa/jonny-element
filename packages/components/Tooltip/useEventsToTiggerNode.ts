import { each, isElement } from "lodash-es";
import { onMounted, onUnmounted, watch } from "vue";
import type { ComputedRef, Ref, WatchStopHandle } from "vue";
import type { TooltipProps } from "./types";

// 为触发节点绑定事件的工具函数（适配虚拟触发模式）
export function useEvenstToTiggerNode(
  props: TooltipProps & { virtualTriggering?: boolean },
  triggerNode: ComputedRef<HTMLElement | undefined>,
  events: Ref<Record<string, EventListener>>,
  closeMethod: () => void
) {
  // 监听句柄：用于停止watch监听
  let watchEventsStopHandle: WatchStopHandle | void;
  let watchTriggerNodeStopHandle: WatchStopHandle | void;

  // 事件-处理函数映射表：记录已绑定的事件，用于精准解绑
  const _eventHandleMap = new Map();

  // 绑定事件到虚拟触发节点
  const _bindEventToVirtualTiggerNode = () => {
    const el = triggerNode.value;
    // 仅当节点是合法DOM元素时绑定事件
    isElement(el) &&
      each(events.value, (fn, event) => {
        _eventHandleMap.set(event, fn); // 记录事件映射
        el?.addEventListener(event as keyof HTMLElementEventMap, fn); // 绑定事件
      });
  };

  // 从虚拟触发节点解绑事件
  const _unbindEventToVirtualTiggerNode = () => {
    const el = triggerNode.value;
    // 仅当节点是合法DOM元素时解绑事件
    isElement(el) &&
      each(
        ["mouseenter", "click", "contextmenu"], // 需解绑的事件类型
        (key) =>
          _eventHandleMap.has(key) && // 存在映射时才解绑
          el?.removeEventListener(key, _eventHandleMap.get(key))
      );
  };

  // 组件挂载时初始化监听
  onMounted(() => {
    // 监听触发节点变化：节点更新且虚拟模式开启时，重新绑定事件
    watchTriggerNodeStopHandle = watch(
      triggerNode,
      () => props.virtualTriggering && _bindEventToVirtualTiggerNode(),
      { immediate: true } // 立即执行一次
    );

    // 监听事件集合变化：事件更新且虚拟模式开启时，先解绑再重新绑定
    watchEventsStopHandle = watch(
      events,
      () => {
        if (!props.virtualTriggering) return;
        _unbindEventToVirtualTiggerNode(); // 解绑旧事件
        _bindEventToVirtualTiggerNode(); // 绑定新事件
        closeMethod(); // 关闭浮层避免状态异常
      },
      { deep: true } // 深度监听事件对象内部变化
    );
  });

  // 组件卸载时清理资源
  onUnmounted(() => {
    watchTriggerNodeStopHandle?.(); // 停止节点监听
    watchEventsStopHandle?.(); // 停止事件监听
    _unbindEventToVirtualTiggerNode(); // 解绑所有事件
  });
}

export default useEvenstToTiggerNode;