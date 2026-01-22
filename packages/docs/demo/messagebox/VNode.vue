<script setup lang="ts">
import { h, ref } from "vue";
import { JoMessageBox, JoSwitch, type SwitchValueType } from "jonny-element";

function open1() {
  JoMessageBox({
    title: "Message",
    message: h("p", null, [
      h("span", null, "Message can be "),
      h("i", { style: "color: teal" }, "VNode"),
    ]),
  });
}

function open2() {
  const checked = ref<SwitchValueType>(false);
  JoMessageBox({
    title: "Message",
    message: () =>
      h(JoSwitch, {
        modelValue: checked.value,
        "onUpdate:modelValue": (val: SwitchValueType) => {
          checked.value = val;
        },
      }),
  });
}
</script>

<template>
  <jo-button @click="open1" plain>Common VNode</jo-button>
  <jo-button @click="open2" plain>Dynamic props</jo-button>
</template>