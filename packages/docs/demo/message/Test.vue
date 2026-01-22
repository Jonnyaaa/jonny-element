<script lang="ts" setup>
import { JoMessage } from "jonny-element";

const open1 = () => {
  JoMessage({
    message: "Congrats, this is a success message.",
    type: "success",
  });
};
const open2 = () => {
  JoMessage.success("Congrats, this is a success message.");
};
</script>
<template>
  <div>
    <jo-button @click="open1">插件式调用</jo-button>
    <jo-button @click="open2">函数式调用</jo-button>
    <jo-button @click="$message.success('Congrats, this is a success message.')"
      >全局方法调用</jo-button
    >
  </div>
</template>