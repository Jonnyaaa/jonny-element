<script lang="ts" setup>
import { ref } from "vue";

const disabled = ref(false);
</script>

<template>
  <jo-tooltip
    :disabled="disabled"
    content="click to close tooltip function"
    placement="bottom"
  >
    <jo-button @click="disabled = !disabled"
      >click to {{ disabled ? "active" : "close" }} tooltip function</jo-button
    >
  </jo-tooltip>
</template>