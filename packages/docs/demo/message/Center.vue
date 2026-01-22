<script lang="ts" setup>
import { JoMessage } from "jonny-element";

const openCenter = () => {
  JoMessage({
    showClose: true,
    message: "Centered text",
    center: true
  });
};
</script>

<template>
  <jo-button plain @click="openCenter">Centered text</jo-button>
</template>