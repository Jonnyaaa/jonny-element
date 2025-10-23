<script setup lang="ts">
import type { AlertProps, AlertEmits, AlertInstance } from "./types";
import { typeIconMap } from "@jonny-element/utils";
import { computed, ref } from "vue";

import JoIcon from "../Icon/Icon.vue";

defineOptions({
  name: "JoAlert",
});

// 用 defineProps + 类型约束定义属性，withDefaults 设置默认值
const props = withDefaults(defineProps<AlertProps>(), {
  effect: "light",
  type: "info",
  closable: true,
});

const emits = defineEmits<AlertEmits>(); // 约束组件只能触发 "close" 事件
const slots = defineSlots(); // 获取父组件传递的插槽内容（用于判断是否有默认插槽）

const visible = ref(true) // 控制组件显示/隐藏的响应式变量（默认显示）

// 根据 props.type 动态获取图标名称
const iconName = computed(() => typeIconMap.get(props.type) ?? "circle-info");
// 判断是否有描述内容（要么传了 description 属性，要么有默认插槽）
const withDescription = computed(() => props.description || slots.default);

function close() {
  visible.value = false;
  emits("close");
}

function open() {
  visible.value = true;
}
// 将 open/close 方法暴露给父组件，父组件可通过 ref 调用
defineExpose<AlertInstance>({
  close,
  open,
})
</script>

<template>
  <!-- 过渡动画容器 -->
  <transition name="jo-alert-fade">
    <div
      v-show="visible"
      class="jo-alert"
      role="alert"
      :class="{
        [`jo-alert__${type}`]: type,
        [`jo-alert__${effect}`]: effect,
        'text-center': center,
      }"
    >
    <!-- 组件内容 -->
      <!-- 类型图标（条件渲染） -->
      <jo-icon
        v-if="showIcon"
        class="jo-alert__icon"
        :class="{ 'big-icon': withDescription }"
        :icon="iconName"
      />
      <!-- 内容区域（标题 + 描述 + 关闭按钮） -->
      <div class="jo-alert__content">
        <span
          class="jo-alert__title"
          :class="{ 'with-desc': withDescription }"
          :style="{ display: center && !showIcon ? 'flow' : 'inline' }"
        >
          <slot name="title">{{ title }}</slot>
        </span>
        <p class="jo-alert__description">
          <slot>{{ description }}</slot>
        </p>
        <div class="jo-alert__close" v-if="closable">
          <jo-icon @click.stop="close" icon="xmark" />
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
@import './style.css';
</style>