<script setup lang="ts">
import type { TooltipProps, TooltipEmits, TooltipInstance } from './types';
import { createPopper, type Instance } from "@popperjs/core"; // 导入Popper.js用于定位
import { bind, debounce, isNil, type DebouncedFunc } from 'lodash-es'; // 工具函数：防抖、绑定上下文等
import { computed, ref, watch, watchEffect, onUnmounted, type Ref } from 'vue'
import { useClickOutside } from '@jonny-element/hooks' // 自定义钩子：监听点击外部事件

defineOptions({
  name: "JoTooltip"
})

// 定义组件属性（Props），并设置默认值
const props = withDefaults(defineProps<TooltipProps>(), {
  placement: "bottom", // 默认定位方向：底部
  trigger: "hover", // 默认触发方式：鼠标悬浮
  transition: "fade", // 默认过渡动画：淡入淡出
  showTimeout: 0,
  hideTimeout: 200
})

// 定义组件事件
const emits = defineEmits<TooltipEmits>();
const visible = ref(false) // 控制Tooltip显示/隐藏的状态

// 存储事件监听器的响应式对象（分别对应不同节点的事件）
const events: Ref<Record<string, EventListener>> = ref({}) // 触发元素（trigger）的事件
const outerEvents: Ref<Record<string, EventListener>> = ref({}) // 容器元素的事件
const dropdownEvents: Ref<Record<string, EventListener>> = ref({}) // 弹窗元素的事件

// 元素引用（用于获取DOM节点）
const containerNode = ref<HTMLElement>() // 容器节点
const popperNode = ref<HTMLElement>() // 弹窗节点（Tooltip内容）
const triggerNode = ref<HTMLElement>() // 触发节点（绑定事件的元素）

// 计算Popper.js的配置项（合并默认配置和用户传入的配置）
const popperOptions = computed(() => ({
  placements: props.placement, // 定位方向
  modifiers: [
    {
      name: "offset", // 偏移修饰符
      options: {
        offset: [0, 9] // 偏移量：x=0, y=9（与触发元素的距离）
      }
    }
  ],
  ...props.popperOptions // 合并用户自定义配置
}))

// 计算显示延迟（仅hover触发时生效）
const openDelay = computed(() =>
  props.trigger === "hover" ? props.showTimeout : 0
)
// 计算隐藏延迟（仅hover触发时生效）
const closeDelay = computed(() =>
  props.trigger === "hover" ? props.hideTimeout : 0
)

// 创建一个映射表（Map），用于存储不同触发方式对应的事件绑定策略
const triggerStrategyMap: Map<string, () => void> = new Map();

// 为"hover"触发方式注册策略：鼠标悬浮时的事件绑定逻辑
triggerStrategyMap.set("hover", () => {
  events.value["mouseenter"] = openFinal;
  outerEvents.value["mouseleave"] = closeFinal;
  dropdownEvents.value["mouseenter"] = openFinal;
});
triggerStrategyMap.set("click", () => {
  events.value["click"] = togglePopper;
});
triggerStrategyMap.set("contextmenu", () => {
  events.value["contextmenu"] = (e) => {
    e.preventDefault();
    openFinal();
  };
});

// 声明防抖函数变量（用于控制显示/隐藏的延迟执行）
let openDebounce: DebouncedFunc<() => void> | void
let closeDebounce: DebouncedFunc<() => void> | void

// 最终执行显示的函数（取消隐藏防抖，执行显示防抖）
function openFinal() {
  closeDebounce?.cancel() // 取消可能存在的隐藏延迟
  openDebounce?.() // 执行显示延迟
}

function closeFinal() {
  openDebounce?.cancel()
  closeDebounce?.()
}

// 切换Tooltip显示状态（显示→隐藏/隐藏→显示）
function togglePopper() {
  visible.value ? closeFinal() : openFinal();
}

// 设置显示状态并触发事件
function setVisible(val: boolean) {
  if (props.disabled) return // 禁用状态下不执行
  visible.value = val
  emits("visible-change", val) // 触发状态变化事件
}

// 根据触发方式绑定事件监听器
function attachEvents() {
  if (props.disabled || props.manual) return; // 禁用或手动控制时不自动绑定事件

  triggerStrategyMap.get(props.trigger)?.();
}

// Popper实例（用于管理弹窗定位）
let popperInstance: null | Instance;

// 销毁Popper实例（清理定位逻辑）
function destroyPopperInstance() {
  if (isNil(popperInstance)) return;

  popperInstance.destroy(); // 销毁实例
  popperInstance = null;
}

// 重置事件监听器（先清空再重新绑定）
function resetEvents() {
  events.value = {};
  outerEvents.value = {};
  dropdownEvents.value = {};

  attachEvents();
}

// 暴露给外部的实例方法（符合TooltipInstance接口）
const show: TooltipInstance["show"] = openFinal;
const hide: TooltipInstance["hide"] = function () {
  openDebounce?.cancel();
  setVisible(false);
}

// 监听显示状态变化：显示时创建Popper实例（定位弹窗）
watch(
  visible,
  (val) => {
    if (!val) return; // 隐藏状态不处理
    // 触发节点和弹窗节点都存在时，创建Popper实例
    if (triggerNode.value && popperNode.value) {
      popperInstance = createPopper(
        triggerNode.value, // 参考元素（触发节点）
        popperNode.value, // 浮动元素（弹窗节点）
        popperOptions.value // 配置项
      );
    }
  },
  { flush: "post" } // 确保DOM更新后执行（避免节点未渲染）
)

// 监听manual属性变化：手动控制模式切换时重置事件
watch(
  () => props.manual,
  (isManual) => {
    if (isManual) {
      resetEvents(); // 手动模式：清空事件
      return;
    }
    attachEvents(); // 非手动模式：重新绑定事件
  }
)

// 监听trigger属性变化：触发方式改变时重置状态和事件
watch(
  () => props.trigger,
  (val, oldVal) => {
    if (val === oldVal) return;
    openDebounce?.cancel();
    visible.value = false; // 重置显示状态
    emits("visible-change", false); // 触发状态变化事件
    resetEvents();
  }
)

// 响应式副作用：初始化防抖函数和事件
watchEffect(() => {
  if (!props.manual) {
    attachEvents(); // 非手动模式：绑定事件
  }
  // 创建显示防抖函数（延迟setVisible(true)）
  openDebounce = debounce(bind(setVisible, null, true), openDelay.value);
  closeDebounce = debounce(bind(setVisible, null, false), closeDelay.value);
})

// 监听点击外部事件：点击容器外时隐藏Tooltip（非hover和非手动模式）
useClickOutside(containerNode, () => {
  emits("click-outside"); // 触发点击外部事件
  if (props.trigger === "hover" || props.manual) return; // hover或手动模式不处理

  visible.value && closeFinal(); // 显示状态时执行隐藏
})

// 组件卸载时清理Popper实例
onUnmounted(() => {
  destroyPopperInstance();
})

// 暴露组件实例方法（供外部通过ref调用）
defineExpose<TooltipInstance>({
  show,
  hide,
})
</script>

<template>
  <!-- 容器节点：绑定容器事件 -->
  <div class="jo-tooltip" ref="containerNode" v-on="outerEvents">
    <!-- 触发节点：非虚拟触发时显示，绑定触发事件 -->
    <div
      class="jo-tooltip__trigger"
      ref="triggerNode"
      v-on="events"
      v-if="!virtualTriggering"
    >
      <slot></slot><!-- 触发元素的内容（默认插槽） -->
    </div>
    <!-- 虚拟触发时显示的插槽（用于自定义触发逻辑） -->
    <slot name="default" v-else></slot>

    <!-- 弹窗过渡动画：离开后销毁Popper实例 -->
    <transition :name="transition" @after-leave="destroyPopperInstance">
      <!-- 弹窗节点：显示时渲染，绑定弹窗事件 -->
      <div
        class="jo-tooltip__popper"
        ref="popperNode"
        v-on="dropdownEvents"
        v-if="visible"
      >
        <!-- 弹窗内容插槽（默认显示content属性） -->
        <slot name="content">
          {{ content }}
        </slot>
        <!-- Popper箭头（用于指向触发元素） -->
        <div id="arrow" data-popper-arrow></div>
      </div>
    </transition>
  </div>
</template>