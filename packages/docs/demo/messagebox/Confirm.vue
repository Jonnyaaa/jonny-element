<script setup lang="ts">
import { JoMessageBox, JoMessage } from "jonny-element";

function openConfirm() {
  JoMessageBox.confirm("proxy will permanently delete the file. Continue?", "Warning", { type: "warning" })
    .then((action) => {
      JoMessage.info(`action: ${action}`);
    })
    .catch((action) => {
      JoMessage.warning(`action: ${action}`);
    });
}
</script>

<template>
  <jo-button @click="openConfirm" plain> Click to open the Confirm</jo-button>
</template>