<script lang="ts" setup>
import { JoNotification } from "jonny-element";

const open1 = () => {
  JoNotification({
    title: "Success",
    message: "This is a success message",
    type: "success",
  });
};

const open2 = () => {
  JoNotification({
    title: "Warning",
    message: "This is a warning message",
    type: "warning",
  });
};

const open3 = () => {
  JoNotification({
    title: "Info",
    message: "This is an info message",
    type: "info",
  });
};

const open4 = () => {
  JoNotification({
    title: "Error",
    message: "This is an error message",
    type: "danger",
  });
};
</script>

<template>
  <jo-button plain @click="open1"> Success </jo-button>
  <jo-button plain @click="open2"> Warning </jo-button>
  <jo-button plain @click="open3"> Info </jo-button>
  <jo-button plain @click="open4"> Error </jo-button>
</template>