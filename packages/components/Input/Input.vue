<script setup lang="ts">
import { ref, computed, watch, useAttrs, shallowRef, nextTick } from "vue";
import { useFocusController, useId } from "@jonny-element/hooks";
import { useFormItem } from "../Form";
import { each, noop } from "lodash-es";
import type { InputProps, InputEmits, InputInstance } from "./types";

import Icon from "../Icon/Icon.vue";
import { debugWarn } from "@jonny-element/utils";

defineOptions({
  name: "JoInput",
  inheritAttrs: false, // 关闭原生属性自动继承，由v-bind="attrs"手动控制
});

const props = withDefaults(defineProps<InputProps>(), {
  type: "text",
  autocomplete: "off",
});

const emits = defineEmits<InputEmits>();

const innerValue = ref(props.modelValue);
const pwdVisible = ref(false);

const inputRef = shallowRef<HTMLInputElement>();
const textareaRef = shallowRef<HTMLTextAreaElement>();

const { formItem } = useFormItem();
const _ref = computed(() => inputRef.value || textareaRef.value);

// 获取父组件传递的非Props属性（如style、class等原生属性）
const attrs = useAttrs();
const isDisabled = computed(() => props.disabled);

// 计算属性：是否显示清除按钮
// 条件：开启clearable + 输入框有值 + 未禁用 + 已聚焦
const showClear = computed(
  () =>
    props.clearable &&
    !!innerValue.value && // 非空校验（转换为布尔值）
    !isDisabled.value &&
    isFocused.value
);

// 计算属性：是否显示密码切换图标
// 条件：类型为password + 开启showPassword + 未禁用 + 输入框有值
const showPwdArea = computed(
  () =>
    props.type === "password" &&
    props.showPassword &&
    !isDisabled.value &&
    !!innerValue.value
);

const { wrapperRef, isFocused, handleFocus, handleBlur } = useFocusController(
  _ref,
  {
    afterBlur() {
      // form 校验
      formItem?.validate("blur").catch((err) => debugWarn(err));
    },
  }
);

const clear: InputInstance["clear"] = function () {
  innerValue.value = "";
  each(["input", "change", "update:modelValue"], (e) => emits(e as any, ""));
  emits("clear");
  // 清空表单校验
  formItem?.clearValidate();
};
const focus: InputInstance["focus"] = async function () {
  await nextTick();
  _ref.value?.focus();
};

const blur: InputInstance["blur"] = function () {
  _ref.value?.blur();
};

const select: InputInstance["select"] = function () {
  _ref.value?.select();
};

function handleInput() {
  emits("update:modelValue", innerValue.value);
  emits("input", innerValue.value);
}

function handleChange() {
  emits("change", innerValue.value);
}

function togglePwdVisible() {
  pwdVisible.value = !pwdVisible.value;
}

watch(
  () => props.modelValue,
  (newVal) => {
    innerValue.value = newVal;
    // 表单校验出发
    formItem?.validate("change").catch((err) => debugWarn(err));
  }
);

defineExpose<InputInstance>({
  ref: _ref,
  focus,
  blur,
  select,
  clear,
});
</script>

<template>
  <div
    class="jo-input"
    :class="{
      [`jo-input--${type}`]: type,
      [`jo-input--${size}`]: size,
      'is-disabled': isDisabled,
      'is-prepend': $slots.prepend,
      'is-append': $slots.append,
      'is-prefix': $slots.prefix,
      'is-suffix': $slots.suffix,
      'is-focus': isFocused,
    }"
  >
    <template v-if="type !== 'textarea'">
      <div v-if="$slots.prepend" class="jo-input__prepend">
        <slot name="prepend"></slot>
      </div>
      <div class="jo-input__wrapper" ref="wrapperRef">
        <span v-if="$slots.prefix" class="jo-input__prefix">
          <slot name="prefix"></slot>
        </span>
        <input
          class="jo-input__inner"
          ref="inputRef"
          :id="useId().value"
          :type="showPassword ? (pwdVisible ? 'text' : 'password') : type"
          :disabled="isDisabled"
          :readonly="readonly"
          :autocomplete="autocomplete"
          :placeholder="placeholder"
          :autofocus="autofocus"
          :form="form"
          v-model="innerValue"
          v-bind="attrs"
          @input="handleInput"
          @change="handleChange"
          @focus="handleFocus"
          @blur="handleBlur"
        />
        <span
          v-if="$slots.suffix || showClear || showPwdArea"
          class="jo-input__suffix"
        >
          <slot name="suffix"></slot>
          <Icon
            icon="circle-xmark"
            v-if="showClear"
            class="jo-input__clear"
            @click="clear"
            @mousedown.prevent="noop"
          />
          <Icon
            icon="eye"
            class="jo-input__password"
            v-if="showPwdArea && pwdVisible"
            @click="togglePwdVisible"
          />
          <Icon
            icon="eye-slash"
            class="jo-input__password"
            v-if="showPwdArea && !pwdVisible"
            @click="togglePwdVisible"
          />
        </span>
      </div>
      <div v-if="$slots.append" class="jo-input__append">
        <slot name="append"></slot>
      </div>
    </template>
    <template v-else>
      <textarea
        class="jo-textarea__wrapper"
        ref="textareaRef"
        :id="useId().value"
        :disabled="isDisabled"
        :readonly="readonly"
        :autocomplete="autocomplete"
        :placeholder="placeholder"
        :autofocus="autofocus"
        :form="form"
        v-model="innerValue"
        v-bind="attrs"
        @input="handleInput"
        @change="handleChange"
        @focus="handleFocus"
        @blur="handleBlur"
      ></textarea>
    </template>
  </div>
</template>

<style>
@import "./style.css";
</style>