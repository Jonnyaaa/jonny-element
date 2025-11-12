<script setup lang="ts">
import type { MessageProps, MessageCompInstance } from "./types";
import { computed, onMounted, ref, watch } from "vue";
import { getLastBottomOffset } from "./methods";
import { delay, bind } from "lodash-es";
import { useOffset, useEventListener } from "@jonny-element/hooks";
import { typeIconMap, RenderVnode, addUnit } from "@jonny-element/utils";
import JoIcon from "../Icon/Icon.vue"

defineOptions({ name: "JoMessage" });

const props = withDefaults(defineProps<MessageProps>(), {
  type: "info",
  duration: 3000,
  offset: 10,
  transitionName: "fade-up",
});

const visible = ref(false);
const messageRef = ref<HTMLDivElement>();

// 记录消息盒子的高度，用于计算多个消息的偏移位置
const boxHeight = ref(0)

const { topOffset, bottomOffset } = useOffset({
  getLastBottomOffset: bind(getLastBottomOffset, props),
  offset: props.offset,
  boxHeight
})

// 根据消息类型计算对应的图标名称
const iconName = computed(() => typeIconMap.get(props.type) ?? "circle-info");

const customStyle = computed(() => ({
  top: addUnit(topOffset.value)
}))

// 存储定时器 ID，用于清除计时
let timer: number;

// 启动 自动关闭计时器
function startTimer() {
  if (props.duration === 0) return;
  // 延迟 props.duration 毫秒后执行 close 方法（自动关闭）
  timer = delay(close, props.duration);
}

// 清除定时器（鼠标悬停时暂停自动关闭）
function clearTimer() {
  clearTimeout(timer);
}

function close() {
  visible.value = false;
}

watch(visible, (val) => {
  if (!val) boxHeight.value = -props.offset // 使得退出的动画更加流畅
})

useEventListener(document, "keydown", (e: Event) => {
  const { code } = e as KeyboardEvent
  if (code === 'Escape') close()
})

onMounted(() => {
  visible.value = true;
  startTimer();
});

defineExpose<MessageCompInstance>({
  close,
  bottomOffset
})
</script>

<template>
  <Transition
    :name="transitionName"
    @enter="boxHeight = messageRef!.getBoundingClientRect().height"
    @after-leave="!visible && onDestory()"
  >
    <div
      ref="messageRef"
      class="jo-message"
      :class="{
        [`jo-message--${type}`]: type,
        'is-close': showClose,
        'text-center': center,
      }"
      :style="customStyle"
      v-show="visible"
      role="alert"
      @mouseenter="clearTimer"
      @mouseleave="startTimer"
    >
      <jo-icon class="jo-message__icon" :icon="iconName" />
      <div class="jo-message__content">
        <slot>
          <render-vnode v-if="message" :vNode="message" />
        </slot>
      </div>
      <div class="jo-message__close" v-if="showClose">
        <jo-icon icon="xmark" @click.stop="close" />
      </div>
    </div>
  </Transition>
</template>

<style>
@import "./style.css";
</style>