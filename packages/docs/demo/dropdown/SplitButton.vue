<script setup lang="ts">
import { type DropdownItemProps, JoMessage } from "jonny-element";

const items: DropdownItemProps[] = [
  { command: "1", label: "Action 1" },
  { command: "2", label: "Action 2" },
  { command: "3", label: "Action 3", disabled: true },
  { command: "4", label: "Action 4", divided: true },
];

function handleClick() {
  JoMessage.info("button click");
}
</script>

<template>
  <div class="row">
    <jo-dropdown :items="items">
      <jo-button type="primary">
        Dropdown List
        <jo-icon icon="angle-down" style="margin-left: 8px" />
      </jo-button>
    </jo-dropdown>
    <jo-dropdown
      :items="items"
      type="primary"
      @click="handleClick"
      split-button
    >
      Dropdown List
    </jo-dropdown>
  </div>
</template>

<style scoped>
.row div {
  margin-right: 16px;
}
</style>