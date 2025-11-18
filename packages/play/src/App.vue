<script setup lang="ts">
import { reactive } from "vue"

const form = reactive({
  name: "",
  desc: "",
})
</script>

<template>
  <jo-input v-model="form.name" show-password type="password" />
  <jo-input v-model="form.desc" type="textarea" />
</template>