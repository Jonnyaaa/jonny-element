<script setup lang="ts">
import { JoMessage, JoMessageBox } from "jonny-element";

function openMsgBox() {
  JoMessageBox.confirm(
    "proxy will permanently delete the file. Continue?",
    "Warning",
    {
      type: "warning",
      center: true,
      // 这里展示一下 不用 Promise 写法的时候
      callback(action) {
        if (action === "confirm") {
          JoMessage.info(action);
        } else {
          JoMessage.warning(action as string);
        }
      },
    }
  );
}
</script>

<template>
  <jo-button @click="openMsgBox" plain>Click to open Message Box</jo-button>
</template>