<script setup lang="ts">
import { JoButton, JoPopconfirm } from "jonny-element";

function confirm() {
  console.log("confirm");
}

function cancel() {
  console.log("cancel");
}
</script>

<template>
  <jo-popconfirm title="确定删除吗？" @confirm="confirm" @cancel="cancel">
    <jo-button type="primary" size="small">test</jo-button>
  </jo-popconfirm>
</template>