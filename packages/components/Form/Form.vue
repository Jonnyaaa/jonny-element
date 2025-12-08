<script setup lang="ts">
import type {
  FormProps,
  FormEmits,
  FormItemContext,
  FormContext,
  FormInstance,
} from "./types";

import { FORM_CTX_KEY } from "./constants";
import { reactive, toRefs, provide } from "vue";
import { each, filter, includes, size } from "lodash-es";
// 导入验证库的错误类型
import type { ValidateFieldsError } from "async-validator";

defineOptions({ name: "JoForm" });
const props = withDefaults(defineProps<FormProps>(), {
  showMessage: true,
  hideRequiredAsterisk: false,
  requiredAsteriskPosition: "left",
  labelPosition: "right",
});
const emits = defineEmits<FormEmits>();

// 存储所有注册到当前表单的表单项上下文（FormItem组件的实例信息）
const fields: FormItemContext[] = [];

/**
 * 执行指定表单项的验证逻辑
 * @param fields 需要验证的表单项数组（默认验证所有）
 * @returns 验证结果Promise（成功返回true，失败reject错误信息）
 */
async function doValidateField(fields: FormItemContext[] = []) {
  // 存储所有验证错误
  let validateErrors: ValidateFieldsError = {};
  // 遍历每个表单项，执行其验证方法
  for (const field of fields) {
    try {
      // 调用表单项自身的validate方法（无特定触发方式）
      await field.validate("");
    } catch (error) {
      // 收集验证错误（合并多个表单项的错误）
      validateErrors = {
        ...validateErrors,
        ...(error as ValidateFieldsError),
      };
    }
  }
  // 若没有错误，返回验证成功
  if (!size(Object.keys(validateErrors))) return true;
  // 有错误时，返回错误信息
  return Promise.reject(validateErrors);
}

/**
 * 向表单注册一个表单项
 * @param field 表单项上下文（由FormItem组件提供）
 */
const addField: FormContext["addField"] = function (field) {
  // 只有带prop的表单项才需要注册（prop用于关联表单数据）
  if (!field.prop) return;
  fields.push(field);
};

// 从表单中移除一个表单项（通常在表单项卸载时调用）
const removeField: FormContext["removeField"] = function (field) {
  if (!field.prop) return;
  // 从数组中删除指定表单项
  fields.splice(fields.indexOf(field), 1);
};

/**
 * 验证整个表单的所有表单项
 * @param callback 验证完成后的回调函数
 * @returns 验证结果Promise
 */
const validate: FormInstance["validate"] = async function (callback) {
  // 调用validateField，传入空数组表示验证所有表单项
  return validateField([], callback);
};

/**
 * 验证指定的表单项（通过keys筛选）
 * @param keys 需要验证的表单项prop数组（空数组验证所有）
 * @param callback 验证完成后的回调函数
 * @returns 验证结果Promise
 */
const validateField: FormInstance["validateField"] = async function (
  keys,
  callback
) {
  try {
    // 筛选需要验证的表单项并执行验证
    const result = await doValidateField(filterFields(fields, keys));
    if (result === true) {
      // 验证成功，调用回调
      callback?.(result);
    }
    return result;
  } catch (error) {
    // 处理验证失败的情况
    if (error instanceof Error) throw error;
    const invalidFields = error as ValidateFieldsError;
    callback?.(false, invalidFields);
    return Promise.reject(invalidFields);
  }
};

/**
 * 重置指定的表单项（恢复初始值并清除验证状态）
 * @param keys 需要重置的表单项prop数组（空数组重置所有）
 */
const resetFields: FormInstance["resetFields"] = function (keys) {
  // 筛选需要重置的表单项，逐个调用其resetField方法
  each(filterFields(fields, keys), (field) => field.resetField());
};

// 清除指定表单项的验证状态（不改变值，只清除错误信息）
const clearValidate: FormInstance["clearValidate"] = function (keys) {
  // 筛选目标表单项，逐个调用其clearValidate方法
  each(filterFields(fields, keys), (field) => field.clearValidate());
};

/**
 * 根据prop筛选表单项
 * @param fields 所有表单项数组
 * @param keys 需要筛选的prop数组
 * @returns 筛选后的表单项数组（若keys为空则返回所有）
 */
function filterFields(fields: FormItemContext[], keys: string[] = []) {
  return size(keys)
    ? filter(fields, (field) => includes(keys, field.prop))
    : fields;
}

// 构建表单上下文（提供给子组件FormItem使用）
const formCtx: FormContext = reactive({
  ...toRefs(props),
  emits,
  addField,
  removeField,
});

// 向所有子组件提供表单上下文（通过依赖注入）
provide<FormContext>(FORM_CTX_KEY, formCtx);

// 暴露表单实例方法，供外部组件调用
defineExpose<FormInstance>({
  validate,
  validateField,
  resetFields,
  clearValidate,
});
</script>

<template>
  <!-- 表单容器，使用slot接收所有表单项 -->
  <form class="jo-form">
    <slot></slot>
  </form>
</template>