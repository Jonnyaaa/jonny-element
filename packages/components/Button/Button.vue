<script setup lang="ts">
import { ref, computed, inject } from 'vue';
import type { ButtonProps, ButtonEmits, ButtonInstance } from './types'
import { throttle } from 'lodash-es'
import { BUTTON_GROUP_CTX_KEY } from './contants'
import JoIcon from "../Icon/Icon.vue";

defineOptions({
  name: 'JoButton',

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
const ctx = inject(BUTTON_GROUP_CTX_KEY, void 0)

// 泛型 <HTMLButtonElement> 表示 ref.value 的类型
const _ref = ref<HTMLButtonElement>();
const size = computed(() => ctx?.size ?? props?.size ?? "")
const type = computed(() => ctx?.type ?? props?.type ?? "")
const disabled = computed(() => ctx?.disabled || props?.disabled || false)

const iconStyle = computed(() => ({
  marginRight: slots.default ? '6px' : '0'
}))

const handleBtnClick = (e:MouseEvent) => emits("click", e);
const handleBtnClickThrottle = throttle(
  handleBtnClick, 
  props.throttleDuration,
  { trailing: false }
);

defineExpose<ButtonInstance>({
  ref: _ref,
})
</script>

<template>
  <component
    ref="_ref"
    class="jo-button"
    :is="tag"
    :autofocus="autofocus"
    :type="tag === 'button' ? nativeType : void 0"
    :disabled="disabled || loading ? true : void 0"
    :class="{
      [`jo-button--${type}`]: type,// 根据 type 生成类型类，如 jo-button--primary
      [`jo-button--${size}`]: size,// 根据 size 生成大小类，如 jo-button--large
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
        <jo-icon
          class="loading-icon"
          :icon="loadingIcon ?? 'spinner'"
          :style="iconStyle"
          size="1x"
          spin
        />
      </slot>
    </template>
    <jo-icon
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