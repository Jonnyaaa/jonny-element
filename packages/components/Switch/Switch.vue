<script setup lang="ts">
import type { SwitchProps, SwitchEmits, SwitchInstance } from "./types";
import { ref, computed, onMounted, watch } from "vue";
import { useId } from "@jonny-element/hooks";

defineOptions({ name: "JoSwitch", inheritAttrs: false });
const props = withDefaults(defineProps<SwitchProps>(), {
  activeValue: true, // 开启状态默认值为true
  inactiveValue: false,
});

const emits = defineEmits<SwitchEmits>();
const isDisabled = computed(() => props.disabled);

const innerValue = ref(props.modelValue); // 内部值的响应式变量
const inputRef = ref<HTMLInputElement>(); // input元素的引用
const inputId = useId().value; // 获取唯一ID用于input元素
// 计算属性：是否选中（内部值是否等于开启状态值）
const checked = computed(() => innerValue.value === props.activeValue);

const focus: SwitchInstance["focus"] = function () {
  inputRef.value?.focus();
};

// 处理状态改变的方法
function handleChange() {
  if (isDisabled.value) return;

  // 计算新值：当前选中则切换为关闭值，否则切换为开启值
  const newVal = checked.value ? props.inactiveValue : props.activeValue;

  // 更新内部值
  innerValue.value = newVal;

  emits("update:modelValue", newVal);
  emits("change", newVal);
}

// 组件挂载后执行
onMounted(() => {
  // 初始化input的checked状态
  inputRef.value!.checked = checked.value;
});

// 监听选中状态的变化
watch(checked, (val) => {
  // 更新input的checked状态
  inputRef.value!.checked = val;
  // 预留 form 校验
});

defineExpose<SwitchInstance>({
  checked,
  focus,
});
</script>

<template>
  <div
    class="jo-switch"
    :class="{
      [`jo-switch--${size}`]: size,
      'is-disabled': isDisabled,
      'is-checked': checked,
    }"
    @click="handleChange"
  >
    <!-- 原生input复选框（用于表单交互和无障碍访问） -->
    <input
      class="jo-switch__input"
      type="checkbox"
      role="switch"
      ref="inputRef"
      :id="inputId"
      :name="name"
      :disabled="isDisabled"
      :checked="checked"
      @keydown.enter="handleChange"
    />
    <div class="jo-switch__core">
      <div class="jo-switch__core-inner">
        <span
          v-if="activeText || inactiveText"
          class="jo-switch__core-inner-text"
        >
          {{ checked ? activeText : inactiveText }}
        </span>
      </div>
      <div class="jo-switch__core-action"></div>
    </div>
  </div>
</template>

<style>
@import "./style.css";
</style>