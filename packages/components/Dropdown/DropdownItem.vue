<script setup lang="ts">
import { inject, computed } from "vue";
import { DROPDOWN_CTX_KEY } from "./constants";
import { useId } from "@jonny-element/hooks";

import type { DropdownItemProps } from "./types";

defineOptions({
  name: "JoDropdownItem",
});

const props = withDefaults(defineProps<DropdownItemProps>(), {
  disabled: false,
  divided: false,
  command: useId().value,
});

// 从父组件 JoDropdown 注入上下文（包含 handleItemClick 方法和 size 状态）
const ctx = inject(DROPDOWN_CTX_KEY);
// 获取父组件传递的 size
const size = computed(() => ctx?.size.value);

// 菜单项点击事件处理
function handleClick() {
  if (props.disabled) return;
  // 调用父组件注入的 handleItemClick 方法，传递当前菜单项的 props
  ctx?.handleItemClick(props);
}
</script>

<template>
  <li v-if="divided" role="separator" class="divided-placeholder"></li>
  <li
    :id="`dropdown-item-${command ?? useId().value}`"
    :class="{
      'jo-dropdown__item': true,
      ['jo-dropdown__item--' + size]: size,
      'is-disabled': disabled,
      'is-divided': divided,
    }"
    @click="handleClick"
  >
    <slot>
      {{ label }}
    </slot>
  </li>
</template>

<style scoped>
@import "./style.css";
</style>