<script setup lang="ts">
import { ref, computed } from 'vue';
import type { ButtonProps, ButtonEmits, ButtonInstance } from './types'
import { throttle } from 'lodash-es'
import ErIcon from "../Icon/Icon.vue";

defineOptions({
  name: 'ErButton',

});
// 定义 props，使用 ButtonProps 类型约束
const props = withDefaults(defineProps<ButtonProps>(), {// withDefaults(...) → 给部分 props 设置默认值
  tag: 'button',// 默认渲染成 <button>
  nativeType: "button",// 默认 button 的原生 type 属性是 "button"
  useThrottle: true,
  throttleDuration: 500
});

const emits = defineEmits<ButtonEmits>();

// 定义 slots（插槽），没传泛型，表示只会有默认插槽
const slots = defineSlots();

// 泛型 <HTMLButtonElement> 表示 ref.value 的类型
const _ref = ref<HTMLButtonElement>();
const iconStyle = computed(() => ({
  marginRight: slots.default ? '6px' : '0'
}))

const handleBtnClick = (e:MouseEvent) => emits("click", e);
const handleBtnClickThrottle = throttle(handleBtnClick, props.throttleDuration);

defineExpose<ButtonInstance>({
  ref: _ref,
})
</script>

<template>
  <component
    ref="_ref"
    class="er-button"
    :is="tag"
    :autofocus="autofocus"
    :type="tag === 'button' ? nativeType : void 0"
    :disabled="disabled || loading ? true : void 0"
    :class="{
      [`er-button--${type}`]: type,// 根据 type 生成类型类，如 er-button--primary
      [`er-button--${size}`]: size,// 根据 size 生成大小类，如 er-button--large
      'is-plain': plain,// 朴素按钮
      'is-round': round,// 圆角按钮
      'is-circle': circle,// 圆形按钮
      'is-disabled': disabled,// 禁用状态
      'is-loading': loading,// 加载中状态
    }"
    @click="
      (e: MouseEvent) =>
      useThrottle ? handleBtnClickThrottle(e) : handleBtnClick(e)
    "
  >
    <template v-if="loading">
      <slot name="loading">
        <er-icon
          class="loading-icon"
          :icon="loadingIcon ?? 'spinner'"
          :style="iconStyle"
          size="1x"
          spin
        />
      </slot>
    </template>
    <er-icon
      v-if="icon && !loading"
      :icon="icon"
      :style="iconStyle"
      size="1x"
    />
    <!-- 默认插槽，显示按钮里的内容 -->
    <slot></slot>
  </component>
</template>

<style scoped>
@import './style.css';
</style>