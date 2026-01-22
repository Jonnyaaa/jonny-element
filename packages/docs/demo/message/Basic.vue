<script lang="ts" setup>
import { h } from "vue";
import { JoMessage } from "jonny-element";

const open = () => {
  JoMessage("This is a message.");
};

const openVn = () => {
  JoMessage({
    message: h("p", { style: "line-height: 1; font-size: 14px" }, [
      h("span", null, "Message can be "),
      h("i", { style: "color: teal" }, "VNode"),
    ]),
  });
};
</script>

<template>
  <jo-button :plain="true" @click="open">Show message</jo-button>
  <jo-button :plain="true" @click="openVn">VNode</jo-button>
</template>