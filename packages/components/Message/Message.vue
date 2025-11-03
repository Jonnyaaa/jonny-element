<script setup lang="ts">
import type { MessageProps } from "./types";
import { computed, onMounted, ref } from "vue";
import { delay } from "lodash-es";
import { typeIconMap, RenderVnode } from "@jonny-element/utils";

defineOptions({ name: "JoMessage" });

const props = withDefaults(defineProps<MessageProps>(), {
  type: "info",
  duration: 3000,
  offset: 10,
  transitionName: "fade-up",
});

const visible = ref(false);
const messageRef = ref<HTMLDivElement>();
// 根据消息类型计算对应的图标名称
const iconName = computed(() => typeIconMap.get(props.type) ?? "circle-info");

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

onMounted(() => {
  visible.value = true;
  startTimer();
});

defineExpose({
  close
})
</script>

<template>
  <Transition :name="transitionName" @after-leave="!visible && onDestory()">
    <div
      ref="messageRef"
      class="jo-message"
      :class="{
        [`jo-message--${type}`]: type,
        'is-close': showClose,
        'text-center': center,
      }"
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