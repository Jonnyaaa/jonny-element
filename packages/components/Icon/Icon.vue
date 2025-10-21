<script setup lang="ts">
import type { IconProps } from "./types";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { omit } from "lodash-es";
import { computed } from "vue";

defineOptions({
  name: "JoIcon",
  inheritAttrs: false,// 避免父组件传递的 class、style 等属性直接绑定到最外层 <i>，改为手动处理
});

const props = defineProps<IconProps>();// 使用 <script setup> 的语法糖定义 props
const filterProps = computed(() => omit(props, ["type", "color"]));
// type和color字段是自定义扩展的，不属于FontAwesome官方的props,所以用omit把它们剔除掉，得到一个新的对象
const customStyles = computed(() => ({ color: props.color ?? void 0 }));// 用来设置自定义颜色
</script>

<template>
  <i
    class="jo-icon"
    :class="[`jo-icon-${props.type}`]"
    :style="customStyles"
    v-bind="$attrs"
  >
    <font-awesome-icon v-bind="filterProps" />
    <!-- 渲染图标，接收所有 Font Awesome 官方支持的 props -->
  </i>
</template>

<style>
@import "./style.css";
</style>