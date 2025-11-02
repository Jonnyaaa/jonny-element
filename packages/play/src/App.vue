<script setup lang="ts">
import { ja, ko, en, zhCn, zhTw, JoConfigProvider } from "jonny-element";
import { get } from "lodash-es";
import { computed, ref } from "vue";

const language = ref("");
const langMap = {
  ja,
  ko,
  en,
  zhCn,
  zhTw,
} as const;
const locale = computed(() => get(langMap, language.value));
const changelang = () => {
  const l = ["zhCn", "zhTw", "ko", "en", "ja"];
  language.value = l[(l.indexOf(language.value) + 1) % l.length];
};
</script>

<template>
  <jo-button @click="changelang" type="info" style="margin-right: 20px"
    >change language</jo-button
  >
  <jo-config-provider :locale="locale">
    <jo-popconfirm title="Are you shure to delete this item?">
      <jo-button>Delete</jo-button>
    </jo-popconfirm>
  </jo-config-provider>
</template>