<script setup lang="ts">
import { ref } from "vue";
const options = ref([
  { value: "beijing", label: "Beijing" },
  { value: "shanghai", label: "Shanghai" },
  { value: "shenzhen", label: "Shenzhen", disabled: true },
  { value: "hangzhou", label: "Hangzhou" },
]);
const value = ref("");
</script>

<template>
  <jo-select v-model="value" filterable clearable>
    <jo-option value="beijing" label="Beijing" />
    <jo-option value="shanghai" label="Shanghai" />
    <jo-option value="shenzhen" label="Shenzhen" disabled />
    <jo-option value="hangzhou" label="Hangzhou" />
  </jo-select>
</template>