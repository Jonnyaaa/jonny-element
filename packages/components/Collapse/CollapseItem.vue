<script setup lang="ts">
import type { CollapseItemProps } from './types';
import { inject, computed } from 'vue';
import { COLLAPSE_CTX_KEY } from './constants';
import JoIcon from '../Icon/Icon.vue'

defineOptions({
  name: "JoCollapseItem"
});
const props = defineProps<CollapseItemProps>();// 声明组件接收的属性
const ctx = inject(COLLAPSE_CTX_KEY, void(0)); // 接收父组件共享的上下文
// 计算自身是否处于展开状态
const isActive = computed(() => ctx?.activeNames.value?.includes(props.name));

// 处理子项点击事件
function handleClick() {
  if (props.disabled) return;
  ctx?.handleItemClick(props.name)
}
</script>

<template>
  <!-- 折叠项根容器，根据禁用状态添加样式 -->
  <div
    class="jo-collapse-item"
    :class="{
      'is-disabled': disabled,
    }"
  >
    <!-- 标题区域（可点击切换展开/折叠） -->
    <div
      class="jo-collapse-item__header"
      :id="`item-header-${name}`"
      :class="{
        'is-disabled': disabled,
        'is-active': isActive,
      }"
      @click="handleClick"
    >
      <!-- 标题文本区域，支持自定义插槽 -->
      <span class="jo-collapse-item__title">
        <slot name="title"><!-- 命名插槽：允许自定义标题内容 -->
          {{ title }}
        </slot>
      </span>
      <jo-icon icon="angle-right" class="header-angle" />
    </div>
    <!-- 内容区域（仅在展开状态显示） -->
    <div class="jo-collapse-item__wapper" v-show="isActive">
      <div class="jo-collapse-item__content" :id="`item-content-${name}`">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import './style.css';
</style>