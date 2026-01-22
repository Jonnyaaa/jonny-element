<script lang="ts" setup>
import {JoNotification} from 'jonny-element'

const open = () => {
  JoNotification.success({
    title: 'Info',
    message: 'This is a message without close button',
    showClose: false,
  })
}
</script>

<template>
  <jo-button plain @click="open"> Hide close button </jo-button>
</template>