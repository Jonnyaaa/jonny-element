<script setup lang="ts">
import { JoMessageBox, JoMessage } from "jonny-element";

function openAlert() {
  JoMessageBox.alert("This is a message", "Title")
    .then((action) => {
      JoMessage.info(`action: ${action}`);
    })
    .catch((action) => {
      JoMessage.warning(`action: ${action}`);
    });
}
</script>

<template>
  <jo-button @click="openAlert" plain> Click to open the Alert</jo-button>
</template>