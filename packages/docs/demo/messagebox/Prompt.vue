<script setup lang="ts">
import { JoMessageBox, JoMessage } from "jonny-element";

function openConfirm() {
  JoMessageBox.prompt("Place input your name", "Tip", { type: "info" })
    .then(({ value }) => {
      JoMessage.info(`your name is: ${value}`);
    })
    .catch((action) => {
      JoMessage.warning(`action: ${action}`);
    });
}
</script>

<template>
  <jo-button @click="openConfirm" plain> Click to open the Confirm</jo-button>
</template>