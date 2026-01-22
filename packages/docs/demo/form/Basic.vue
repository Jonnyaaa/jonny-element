<script lang="ts" setup>
import { reactive, ref } from "vue";
import { JoMessage } from "jonny-element";

const form = reactive({
  name: "",
  region: "",
  delivery: false,
  desc: "",
});

const options = ref([
  { value: "beijing", label: "Zone One" },
  { value: "shanghai", label: "Zone Two" },
]);

const onSubmit = () => {
  JoMessage.success("submit!");
};
</script>

<template>
  <jo-form :model="form">
    <jo-form-item label="Activity name">
      <jo-input v-model="form.name" />
    </jo-form-item>
    <jo-form-item label="Activity zone">
      <jo-select
        v-model="form.region"
        placeholder="please select your zone"
        :options="options"
      />
    </jo-form-item>
    <jo-form-item label="Instant delivery">
      <jo-switch v-model="form.delivery" />
    </jo-form-item>
    <jo-form-item label="Activity form">
      <jo-input v-model="form.desc" type="textarea" />
    </jo-form-item>
    <jo-form-item>
      <jo-button type="primary" @click="onSubmit">Create</jo-button>
      <jo-button>Cancel</jo-button>
    </jo-form-item>
  </jo-form>
</template>