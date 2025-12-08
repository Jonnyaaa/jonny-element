<script setup lang="ts">
import { reactive, ref } from "vue";
import { JoMessage, type FormInstance } from "Jonny-element";
const formRef = ref<FormInstance>();
const form = reactive({
  name: "",
  desc: "",
});

const rules = reactive({
  name: [{ required: true, message: "请输入活动名称", trigger: "blur" }],
  desc: [{ required: true, message: "请填写活动形式", trigger: "blur" }],
});

const onSubmit = () => {
  formRef.value?.validate().then((valid) => {
    if (valid) {
      JoMessage.success("submit!");
    }
  });
};

const onReset = () => {
  formRef.value?.resetFields();
};
</script>

<template>
  <jo-form ref="formRef" :model="form" :rules="rules">
    <jo-form-item label="Activity name" prop="name">
      <jo-input v-model="form.name" />
    </jo-form-item>
    <jo-form-item label="Activity form" prop="desc">
      <jo-input v-model="form.desc" type="textarea" />
    </jo-form-item>
    <jo-form-item>
      <jo-button type="primary" @click="onSubmit">Create</jo-button>
      <jo-button @click="onReset">Reset</jo-button>
    </jo-form-item>
  </jo-form>
</template>