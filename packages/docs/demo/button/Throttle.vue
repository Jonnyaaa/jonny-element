<script setup>
function handleBtnClick() {
  console.log("btn click");
}
</script>

<template>
  <p>
    <jo-button @click="handleBtnClick"> with throttle</jo-button>
    <jo-button :use-throttle="false" @click="handleBtnClick"
      >without throttle</jo-button
    >
  </p>
</template>
