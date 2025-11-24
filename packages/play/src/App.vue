<script setup lang="ts">
import { ref } from "vue";
const options = ref([
  { value: "beijing", label: "Beijing" },
  { value: "shanghai", label: "Shanghai" },
]);
const value = ref("");
</script>

<template>
  <jo-select v-model="value" :options="options" clearable />
</template>