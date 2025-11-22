<script setup lang="ts">
import { ref } from "vue";
import { JoLoading } from "jonny-element";

const loading = ref(false);
const switchVal = ref(1);

/**
 * 方式1：通过指令（v-loading）打开Loading
 * 核心逻辑：修改响应式变量触发指令状态变更，2秒后自动关闭
 */
function openLoading1() {
  // 将loading状态设为true，触发v-loading指令显示全屏Loading
  loading.value = true;
  // 模拟异步操作（如接口请求），2秒后关闭Loading
  setTimeout(() => {
    loading.value = false;
  }, 2000);
}

/**
 * 方式2：通过服务（service）方式打开Loading
 * 核心逻辑：调用Loading服务创建实例，手动控制关闭时机
 */
function openLoading2() {
  // 调用Loading服务创建全屏Loading实例，并配置自定义参数
  const _loading = JoLoading.service({
    lock: true,
    spinner: "circle-notch",
    text: "加载中...",
    background: "rgba(255,255,255,0.5)",
  });
  // 模拟异步操作完成，2秒后调用实例的close方法关闭Loading
  setTimeout(() => {
    _loading.close();
  }, 2000);
}
</script>

<template>
  <jo-button
    v-loading.fullscreen.lock="loading"
    type="primary"
    @click="openLoading1"
  >
    As a directive
  </jo-button>
  <jo-button type="primary" @click="openLoading2"> As a service </jo-button>
  <jo-switch v-model="switchVal" size="small" :active-value="0" :inactive-value="1" />
  {{ switchVal }}
</template>