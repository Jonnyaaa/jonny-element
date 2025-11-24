<script setup lang="ts">
import type {
  SelectProps,
  SelectEmits,
  SelectContext,
  SelectInstance,
  SelectStates,
  SelectOptionProps,
} from "./types";
import type { TooltipInstance } from "../Tooltip/types";
import type { InputInstance } from "../Input/types";

import {
  computed,
  ref,
  reactive,
  provide,
  watch,
  nextTick,
  type VNode,
} from "vue";
import { useId, useFocusController, useClickOutside } from "@jonny-element/hooks";
import { POPPER_OPTIONS, SELECT_CTX_KEY } from "./constants";
import { each, eq, filter, find, get, size, noop, isFunction } from "lodash-es";

import JoOption from "./Option.vue";
import JoTooltip from "../Tooltip/Tooltip.vue";
import JoInput from "../Input/Input.vue";
import JoIcon from "../Icon/Icon.vue";

defineOptions({ name: "JoSelect" });

const props = withDefaults(defineProps<SelectProps>(), {
  options: () => [],
});
const emits = defineEmits<SelectEmits>();
const slots = defineSlots();

const selectRef = ref<HTMLElement>();
const tooltipRef = ref<TooltipInstance>();
const inputRef = ref<InputInstance>();

// 下拉框是否可见
const isDropdownVisible = ref(false);

// 根据模型值查找初始选项
const initialOption = findOption(props.modelValue);

const selectStates = reactive<SelectStates>({
  inputValue: initialOption?.label ?? "",
  selectedOption: initialOption,
  mouseHover: false,
  loading: false,
  highlightedIndex: -1,
});

const isDisabled = computed(() => props.disabled);
// 计算子选项（仅筛选出JoOption类型的子元素）
const children = computed(() =>
  filter(slots?.default?.(), (child) => eq(child.type, JoOption))
);
// 计算是否有子选项
const hasChildren = computed(() => size(children.value) > 0);
// 计算是否显示清除按钮
const showClear = computed(
  () =>
    props.clearable && selectStates.mouseHover && selectStates.inputValue !== ""
);

const highlightedLine = computed(() => {
  let result: SelectOptionProps | void;
  if (hasChildren.value) {
    // 有子选项时从子元素中获取
    const node = children.value[selectStates.highlightedIndex];
    result = node?.props?.value;
  } else {
    // 无子选项时从options中获取
    result = props.options[selectStates.highlightedIndex];
  }

  return result;
});

const inputId = useId().value;
const {
  wrapperRef: inputWrapperRef,
  isFocused,
  handleBlur,
  handleFocus,
} = useFocusController(inputRef);

useClickOutside(selectRef, (e) => handleClickOutside(e));
const focus: SelectInstance["focus"] = function () {
  inputRef.value?.focus();
};

const blur: SelectInstance["blur"] = function () {
  handleClickOutside();
};

function handleClickOutside(e?: Event) {
  if (isFocused.value) {
    nextTick(() => handleBlur(new FocusEvent("focus", e)));
  }
}

// 控制下拉框显示/隐藏
function controlVisible(visible: boolean) {
  if (!tooltipRef.value) return;
  // 调用tooltip的显示/隐藏方法
  get(tooltipRef, ["value", visible ? "show" : "hide"])?.();
  isDropdownVisible.value = visible;
  emits("visible-change", visible); // 触发可见性变化事件

  selectStates.highlightedIndex = -1;
}

// 切换下拉框显示状态
function toggleVisible() {
  if (isDisabled.value) return;
  console.log("toggleVisible");
  controlVisible(!isDropdownVisible.value);
}

// 处理清除
function handleClear() {
  inputRef.value?.clear();
  selectStates.inputValue = "";
  selectStates.selectedOption = null;

  emits("clear");
  // 触发change和更新模型值事件
  each(["change", "update:modelValue"], (k) => emits(k as any, ""));
}

// 根据值查找选项
function findOption(value: string) {
  return find(props.options, (opt) => opt.value === value);
}

// 处理选择选项
function handleSelect(opt: SelectOptionProps) {
  if (opt.disabled) return;

  selectStates.inputValue = opt.label;
  selectStates.selectedOption = opt;
  each(["change", "update:modelValue"], (k) => emits(k as any, opt.value));
  controlVisible(false);
  inputRef.value?.focus();
}

// 渲染标签
function renderLabel(opt: SelectOptionProps): VNode | string {
  if (isFunction(props.renderLabel)) {
    return props.renderLabel(opt);
  }
  return opt.label;
}

// 设置选中项
function setSelected() {
  const opt = findOption(props.modelValue);
  if (!opt) return;
  selectStates.inputValue = opt.label;
  selectStates.selectedOption = opt;
}

// 监听模型值变化，更新选中状态
watch(
  () => props.modelValue,
  () => {
    // 表单校验 逻辑 change
    setSelected();
  }
);

// 提供选择器上下文
provide<SelectContext>(SELECT_CTX_KEY, {
  handleSelect,
  selectStates,
  renderLabel,
  highlightedLine,
});

defineExpose<SelectInstance>({
  focus,
  blur,
});
</script>

<template>
  <div
    ref="selectRef"
    class="jo-select"
    :class="{
      'is-disabled': isDisabled,
    }"
    @click.stop="toggleVisible"
    @mouseenter="selectStates.mouseHover = true"
    @mouseleave="selectStates.mouseHover = false"
  >
    <jo-tooltip
      ref="tooltipRef"
      placement="bottom-start"
      :poppjo-options="POPPER_OPTIONS"
      @click-outside="controlVisible(false)"
      manual
    >
      <template #default> <!-- 触发元素 -->
        <div ref="inputWrapperRef">
          <jo-input
            ref="inputRef"
            v-model="selectStates.inputValue"
            :id="inputId"
            :disabled="isDisabled"
            :placeholder="placeholder"
            :readonly="!filterable || !isDropdownVisible"
            @focus="handleFocus"
            @blur="handleBlur"
          >
            <template #suffix> <!-- 后缀图标 -->
              <jo-icon
                v-if="showClear"
                icon="circle-xmark"
                class="jo-input__clear"
                @click.stop="handleClear"
                @mousedown.prevent="noop"
              />
              <jo-icon
                v-else
                class="header-angle"
                icon="angle-down"
                :class="{ 'is-active': isDropdownVisible }"
              />
            </template>
          </jo-input>
        </div>
      </template>
      <template #content> <!-- 下拉内容 -->
        <ul class="jo-select__menu">
          <template v-if="!hasChildren"> <!-- 无自定义子选项时渲染options -->
            <jo-option
              v-for="item in options"
              :key="item.value"
              v-bind="item"
            />
          </template>
          <template v-else> <!-- 有自定义子选项时渲染插槽 -->
            <slot name="default"></slot>
          </template>
        </ul>
      </template>
    </jo-tooltip>
  </div>
</template>

<style scoped>
@import './style.css';
</style>