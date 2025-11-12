<script setup lang="ts">
import { h } from "vue";
import { JoNotification } from "jonny-element";

function openNotify1() {
  JoNotification({
    title: "Title",
    message: h("i", { style: "color:teal" }, "This is a remider"),
    position:'bottom-right'
  })
}

function openNotify2() {
  JoNotification({
    title: "Prompt",
    message: "This is a message that does not auto close",
    duration: 0,
    position:'top-left'
  });
}
</script>

<template>
  <jo-button @click="openNotify1" plain>Closes automatically</jo-button>
  <jo-button @click="openNotify2" plain>Won't closes automatically</jo-button>
</template>