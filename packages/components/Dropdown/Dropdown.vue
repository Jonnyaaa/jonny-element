<script setup lang="ts">
import { computed, ref, provide } from "vue";
import { omit, isNil } from "lodash-es";
import { type ButtonInstance, JoButton, JoButtonGroup } from "../Button/index";
import type { TooltipInstance } from "../Tooltip/types";
import type {
  DropdownProps,
  DropdownItemProps,
  DropdownEmits,
  DropdownInstance,
  DropdownContext,
} from "./types";

import { DROPDOWN_CTX_KEY } from "./constants";

import DropdownItem from "./DropdownItem.vue";
import JoTooltip from "../Tooltip/Tooltip.vue";

defineOptions({
  name: "JoDropdown",
  inheritAttrs: false, // 关闭非 props 属性的自动继承（避免透传到根元素）
});
const props = withDefaults(defineProps<DropdownProps>(), {
  hideOnClick: true,
  items: () => [] as DropdownItemProps[],
});
const emits = defineEmits<DropdownEmits>();
const slots = defineSlots();

// 引用依赖组件实例
const tooltipRef = ref<TooltipInstance>();
const triggerRef = ref<ButtonInstance>();

// 分割按钮模式下，Tooltip 的虚拟触发元素
const virtualRef = computed(() => triggerRef.value?.ref ?? void 0);

// 过滤传递给 JoTooltip 的 Props（排除 Dropdown 自身的 Props）
const tooltipProps = computed(() =>
  omit(props, ["items", "hideAfterClick", "size", "type", "splitButton"])
);

// 处理菜单项点击（由 DropdownItem 子组件调用）
function handleItemClick(e: DropdownItemProps) {
  // 若hideOnClick 为 true，点击后隐藏下拉菜单
  props.hideOnClick && tooltipRef.value?.hide();
  // 若菜单项有 command 值，触发 command 事件传递给父组件
  !isNil(e.command) && emits("command", e.command);
}

// 向子组件注入上下文（方法和状态）
provide<DropdownContext>(DROPDOWN_CTX_KEY, {
  handleItemClick,
  size: computed(() => props.size),
});

defineExpose<DropdownInstance>({
  open: () => tooltipRef.value?.show(),
  close: () => tooltipRef.value?.hide(),
});
</script>

<template>
  <div class="jo-dropdown" :class="{ 'is-disabled': props.disabled }">
    <jo-tooltip
      ref="tooltipRef"
      v-bind="tooltipProps"
      :virtual-triggering="splitButton"
      :virtual-ref="virtualRef?.value"
      @visible-change="$emit('visible-change', $event)"
    >
      <jo-button-group
        v-if="splitButton"
        :type="type"
        :size="size"
        :disabled="disabled"
      >
        <jo-button @click="$emit('click', $event)">
          <slot name="default"></slot>
        </jo-button>
        <jo-button ref="triggerRef" icon="angle-down" />
      </jo-button-group>
      <slot name="default" v-else></slot>

      <template #content>
        <div class="jo-dropdown__menu">
          <slot name="dropdown">
            <template v-for="item in items" :key="item.command">
              <dropdown-item v-bind="item" />
            </template>
          </slot>
        </div>
      </template>
    </jo-tooltip>
  </div>
</template>

<style scoped>
@import "./style.css";

:deep(.jo-button-group) {
  & > :last-child {
    padding: 5px 7px;
  }
}
</style>