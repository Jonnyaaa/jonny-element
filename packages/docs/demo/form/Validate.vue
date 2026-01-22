<script lang="ts" setup>
import { reactive, ref } from "vue";
import { JoMessage, type FormInstance } from "jonny-element";

const formRef = ref<FormInstance>();
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

const rules = reactive({
  name: [
    { required: true, message: "请输入活动名称", trigger: "blur" },
    { min: 3, max: 5, message: "长度在 3 到 5 个字符", trigger: "blur" },
  ],
  region: [{ required: true, message: "请选择活动区域", trigger: "change" }],
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
    <jo-form-item label="Activity zone" prop="region">
      <jo-select
        v-model="form.region"
        placeholder="please select your zone"
        :options="options"
      />
    </jo-form-item>
    <jo-form-item label="Instant delivery" prop="delivery">
      <jo-switch v-model="form.delivery" />
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