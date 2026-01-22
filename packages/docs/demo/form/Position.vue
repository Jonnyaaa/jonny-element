<script lang="ts" setup>
import { reactive, ref } from "vue";
import { JoMessage, type FormProps } from "jonny-element";

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
const labelPosition = ref<FormProps["labelPosition"]>("right");

const onSubmit = () => {
  JoMessage.success("submit");
};
</script>

<template>
  <jo-button-group size="small">
    <jo-button
      @click="labelPosition = 'left'"
      :type="labelPosition === 'left' ? 'primary' : 'info'"
      >Left</jo-button
    >
    <jo-button
      @click="labelPosition = 'right'"
      :type="labelPosition === 'right' ? 'primary' : 'info'"
      >Right</jo-button
    >
    <jo-button
      @click="labelPosition = 'top'"
      :type="labelPosition === 'top' ? 'primary' : 'info'"
      >Top</jo-button
    >
  </jo-button-group>
  <div style="margin: 20px"></div>
  <jo-form :model="form" :label-position="labelPosition">
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