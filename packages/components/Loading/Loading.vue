<script setup lang="ts">
import type { LoadingOptions } from "./types";
import { computed, type Ref } from "vue";
import { isString } from "lodash-es";
import JoIcon from "../Icon/Icon.vue";

defineOptions({
  name: "JoLoading",
  inheritAttrs: false,
});

const props = defineProps<LoadingOptions>();

const iconName = computed(() => {
  if (isString(props.spinner)) {
    return props.spinner;
  }
  return "spinner"; // 或者 'circle-notch' 也很好看
});
</script>

<template>
  <transition name="fade-in-linear" @after-leave="onAfterLeave">
    <div
      v-show="(props.visible as Ref).value"
      class="jo-loading jo-loading__mask"
      :class="{ 'is-fullscreen': fullscreen }"
    >
      <div class="jo-loading__spinner">
        <jo-icon v-if="props.spinner !== false" :icon="iconName" spin />
        <p v-if="text" class="jo-loading-text">{{ text }}</p>
      </div>
    </div>
  </transition>
</template>

<style>
@import "./style.css";

/* 动态绑定样式变量（从props获取） */
.jo-loading {
  --jo-loading-bg-color: v-bind(background) !important;
  --jo-loading-z-index: v-bind(zIndex) !important;
}
</style>