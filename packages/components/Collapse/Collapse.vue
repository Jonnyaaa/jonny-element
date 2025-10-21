<script setup lang="ts">
import type { CollapseProps, CollapseEmits, CollapseItemName } from './types';
import { ref, provide, watch } from 'vue';
import { COLLAPSE_CTX_KEY } from './constants';

// 指定组件名称
defineOptions({
  name: "JoCollapse",
});
const props = defineProps<CollapseProps>();// 声明组件接收的属性
const emits = defineEmits<CollapseEmits>();// 声明组件触发的事件
const activeNames = ref(props.modelValue);

if (props.accordion && activeNames.value.length > 1) {
  console.warn("accordion mode should only have one active item");
}

// 处理子项点击事件（供子组件调用）
function handleItemClick(item: CollapseItemName){
  // 复制当前展开状态
  let _activeNames = [...activeNames.value];

  // 手风琴模式处理
  // 手风琴模式规则：同一时间最多只能展开一个子项，点击新项时自动关闭其他项
  if (props.accordion) {
    _activeNames = [_activeNames[0] === item ? "" : item];
    // 调用 updateActiveNames 同步新状态
    updateActiveNames(_activeNames);
    return;
  }

  // 查找当前点击项在展开数组中的索引
  const index = _activeNames.indexOf(item);
  // 判断是否已展开
  if (index > -1) {
     // 已展开 → 从数组中移除（关闭当前项）
    _activeNames.splice(index, 1);
  } else {
    // 未展开 → 添加到数组中（展开当前项）
    _activeNames.push(item);
  }
  updateActiveNames(_activeNames);
}

// 更新展开状态并通知父组件
function updateActiveNames(newNames: CollapseItemName[]) {
  activeNames.value = newNames; // 更新内部响应式状态
  emits("update:modelValue", newNames); // 触发 v-model 双向绑定更新
  emits("change", newNames); // 触发 change 事件，通知父组件状态变化
}

// 监听父组件传入的状态变化
watch(
  () => props.modelValue,
  (newNames) => updateActiveNames(newNames)
);

// 提供上下文给子组件
provide(COLLAPSE_CTX_KEY, {
  activeNames, // 共享当前展开的子项状态
  handleItemClick, // 共享子项点击的处理方法
});
</script>

<template>
  <div class="jo-collapse">
    <slot></slot>
  </div>
</template>

<style scoped>
@import './style.css';
</style>