<script setup lang="ts">
import type { NotificationProps, NotificationCompInstance } from "./types";
import { computed, onMounted, ref } from "vue";
import { getLastBottomOffset } from "./methods";
import { delay, bind } from "lodash-es";
import { useOffset } from "@jonny-element/hooks";
import { addUnit } from "@jonny-element/utils";
import { typeIconMap, RenderVnode } from "@jonny-element/utils";
import JoIcon from "../Icon/Icon.vue";

defineOptions({ name: "JoNotification" });

const props = withDefaults(defineProps<NotificationProps>(), {
  type: "info",
  duration: 3000,
  offset: 20,
  transitionName: "fade",
  showClose: true,
});

const visible = ref(false);
const notifyRef = ref<HTMLDivElement>();
// div 高度
const boxHeight = ref(0);

const { topOffset, bottomOffset } = useOffset({
  getLastBottomOffset: bind(getLastBottomOffset, props),
  offset: props.offset,
  boxHeight,
});

const iconName = computed(() => typeIconMap.get(props.type) ?? "circle-info");

const customStyle = computed(() => ({
  top: addUnit(topOffset.value),
  zIndex: props.zIndex,
}));

let timer: number;
function startTimer() {
  if (props.duration === 0) return;
  timer = delay(close, props.duration);
}

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

defineExpose<NotificationCompInstance>({
  bottomOffset,
  close,
});
</script>

<template>
  <transition
    :name="`jo-notification-${transitionName}`"
    @after-leave="!visible && onDestory()"
    @enter="boxHeight = notifyRef!.getBoundingClientRect().height"
  >
    <div
      ref="notifyRef"
      class="jo-notification"
      :class="{
        [`jo-notification--${type}`]: type,
        'show-close': showClose,
      }"
      :style="customStyle"
      v-show="visible"
      role="alert"
      @click="onClick"
      @mouseenter="clearTimer"
      @mouseleave="startTimer"
    >
      <jo-icon v-if="iconName" :icon="iconName" class="jo-notification__icon" />

      <div class="jo-notification__text">
        <div class="jo-notification__title">{{ title }}</div>
        <div class="jo-notification__content">
          <slot>
            <render-vnode v-if="message" :vNode="message" />
          </slot>
        </div>
      </div>
      <div class="jo-notification__close" v-if="showClose">
        <jo-icon icon="xmark" @click.stop="close" />
      </div>
    </div>
  </transition>
</template>

<style>
@import './style.css';
</style>