<script lang="ts" setup>
import { JoMessage } from "jonny-element";

const open1 = () => {
  JoMessage("This is a message.");
};
const open2 = () => {
  JoMessage({
    message: "Congrats, this is a success message.",
    type: "success",
  });
};
const open3 = () => {
  JoMessage({
    message: "Warning, this is a warning message.",
    type: "warning",
  });
};
const open4 = () => {
  JoMessage.error("Oops, this is a error message.");
};
</script>

<template>
  <jo-button :plain="true" @click="open2">Success</jo-button>
  <jo-button :plain="true" @click="open3">Warning</jo-button>
  <jo-button :plain="true" @click="open1">Message</jo-button>
  <jo-button :plain="true" @click="open4">Error</jo-button>
</template>