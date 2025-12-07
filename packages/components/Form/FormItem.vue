<script setup lang="ts">
import type {
  FormItemContext,
  FormItemProps,
  FormValidateFailuer,
  FormValidateCallback,
  ValidateStatus,
  FormItemInstance,
  FormItemRule,
} from "./types";

// 导入异步验证库，用于表单验证逻辑
import Schema, { type RuleItem } from "async-validator";
// 导入上下文键，用于依赖注入
import { FORM_CTX_KEY, FORM_ITEM_CTX_KEY } from "./constants";
import {
  inject,
  onMounted,
  ref,
  reactive,
  toRefs,
  computed,
  onUnmounted,
  type Ref,
  provide,
} from "vue";
import {
  isNil,
  get,
  isString,
  size,
  filter,
  map,
  includes,
  keys,
  isArray,
  cloneDeep,
} from "lodash-es";
// 导入nextTick，用于等待DOM更新
import { nextTick } from "process";

defineOptions({ name: "JoFormItem" });

const props = withDefaults(defineProps<FormItemProps>(), {
  required: void 0,
  showMessage: true,
});
const slots = defineSlots();
// 从父级表单注入表单上下文（包含表单的模型、规则等）
const ctx = inject(FORM_CTX_KEY);

// 表单项验证状态（初始/成功/错误/验证中）
const validateStatus: Ref<ValidateStatus> = ref("init");
const errMsg = ref("");

/**
 * 根据属性名从目标对象中获取值
 * @param target 目标对象（通常是表单的model）
 * @returns 属性对应的值，若不存在则返回null
 */
const getValByProp = (target: Record<string, any> | void) => {
  if (target && props.prop && !isNil(get(target, props.prop))) {
    return get(target, props.prop); // 使用lodash的get安全获取嵌套属性
  }
  return null;
};

const isDisabled = computed(() => ctx?.disabled || props.disabled);

// 获取当前表单项对应的值（从表单的model中读取）
const innerVal = computed(() => {
  const model = ctx?.model; // 从表单上下文获取整个表单的模型数据
  return getValByProp(model);
});

// 将prop转换为字符串（支持数组形式的prop，如['user', 'name']转为'user.name'）
const propString = computed(() => {
  if (!props.prop) return "";
  return isString(props.prop) ? props.prop : props.prop.join(".");
});

/**
 * 计算属性：整合表单项的验证规则
 * 规则来源：1. 自身props.rules 2. 表单上下文的rules 3. 处理required属性
 */
const itemRules = computed(() => {
  const { required } = props;
  const rules: FormItemRule[] = [];

  // 1. 添加自身定义的rules
  if (props.rules) {
    rules.push(...props.rules);
  }

  // 2. 添加表单上下文的rules中对应当前prop的规则
  const formRules = ctx?.rules;
  if (formRules && props.prop) {
    const _rules = getValByProp(formRules); // 从表单规则中获取当前prop的规则
    if (_rules) {
      rules.push(..._rules);
    }
  }

  // 3. 处理required属性（若设置了required，合并到现有规则中）
  if (!isNil(required)) {
    // 筛选出已包含required的规则
    const requiredRules = filter(
      map(rules, (rule, i) => [rule, i]),
      (item: [FormItemRule, number]) => includes(keys(item[0]), "required")
    );

    if (size(requiredRules)) {
      // 若已有包含required的规则，更新其required值
      for (const item of requiredRules) {
        const [rule, i] = item as [FormItemRule, number];
        if (rule.required === required) continue;
        rules[i] = { ...rule, required };
      }
    } else {
      // 若没有包含required的规则，新增一条required规则
      rules.push({ required });
    }
  }

  return rules;
});

// 初始值（用于重置功能）
let initialVal: any = null;
// 是否正在重置状态
let isResetting: boolean = false;

/**
 * 根据触发方式（如blur/change）筛选有效的验证规则
 * @param trigger 触发方式（如"blur"、"change"）
 * @returns 符合触发条件的规则数组
 */
function getTriggeredRules(trigger: string) {
  const rules = itemRules.value;
  if (!rules) return [];
  return filter(rules, (r) => {
    if (!r?.trigger || !trigger) return true; // 无触发条件或无指定trigger时，规则始终有效
    if (isArray(r.trigger)) {
      return r.trigger.includes(trigger); // 数组形式的trigger包含当前触发方式
    }
    return r.trigger === trigger; // 字符串形式的trigger与当前触发方式一致
  }).map(({ trigger, ...rule }) => rule as RuleItem); // 移除trigger属性，符合async-validator要求
}

/**
 * 执行验证逻辑
 * @param rules 待验证的规则数组
 * @returns 验证结果Promise（成功resolve，失败reject）
 */
async function doValidate(rules: RuleItem[]) {
  const modleName = propString.value; // 表单字段名（用于构建验证schema）
  const validator = new Schema({ [modleName]: rules }); // 创建验证器
  return validator
    .validate({ [modleName]: innerVal.value }, { firstFields: true }) // 验证当前值，只返回第一个错误
    .then(() => {
      // 验证成功
      validateStatus.value = "success";
      // 通知表单上下文验证结果
      ctx?.emits("validate", props, true, "");
      return true;
    })
    .catch((err: FormValidateFailuer) => {
      // 验证失败
      const { errors } = err;
      validateStatus.value = "error";
      // 提取错误信息
      errMsg.value = errors && size(errors) > 0 ? errors[0].message ?? "" : "";
      // 通知表单上下文验证结果
      ctx?.emits("validate", props, false, errMsg.value);
      return Promise.reject(err);
    });
}

/**
 * 暴露给外部的验证方法
 * @param trigger 触发方式
 * @param callback 验证完成后的回调
 * @returns 验证结果（布尔值或Promise）
 */
const validate: FormItemInstance["validate"] = async function (
  trigger: string,
  callback?: FormValidateCallback
) {
  // 若正在重置、无prop或禁用状态，不执行验证
  if (isResetting || !props.prop || isDisabled.value) return false;

  // 若验证状态无效，直接回调失败
  if (!validateStatus.value) {
    callback?.(false);
    return false;
  }

  // 获取符合当前触发方式的规则
  const rules = getTriggeredRules(trigger);
  if (!size(rules)) {
    // 无规则时视为验证通过
    callback?.(true);
    return true;
  }

  // 执行验证
  validateStatus.value = "validating"; // 标记为验证中状态
  return doValidate(rules)
    .then(() => {
      callback?.(true);
      return true;
    })
    .catch((err: FormValidateFailuer) => {
      const { fields } = err;
      callback?.(false, fields);
      return Promise.reject(fields);
    });
};

// 重置表单项（恢复初始值并清除验证状态）
const resetField: FormItemInstance["resetField"] = function () {
  const model = ctx?.model;
  if (model && propString.value && !isNil(get(model, propString.value))) {
    isResetting = true; // 标记为重置中
    // 恢复初始值（深拷贝避免引用问题）
    model[propString.value] = cloneDeep(initialVal);
  }
  // 等待DOM更新后清除验证状态
  nextTick(() => clearValidate());
};

// 清除验证状态（重置为初始状态，清空错误信息）
const clearValidate: FormItemInstance["clearValidate"] = function () {
  validateStatus.value = "init";
  errMsg.value = "";
  isResetting = false; // 重置状态结束
};

// 构建表单项上下文（提供给子组件使用）
const formItemCtx: FormItemContext = reactive({
  ...toRefs(props), // 将props转为响应式ref
  disabled: isDisabled.value,
  validate, // 验证方法
  resetField, // 重置方法
  clearValidate, // 清除验证状态方法
  addInputId: () => {},
  removeInputId: () => {},
});

// 组件挂载后执行
onMounted(() => {
  if (!props.prop) return;
  // 将当前表单项注册到表单上下文
  ctx?.addField(formItemCtx);
  // 记录初始值（用于后续重置）
  initialVal = innerVal.value;
});

// 组件卸载前执行
onUnmounted(() => {
  if (!props.prop) return;
  // 从表单上下文移除当前表单项
  ctx?.removeField(formItemCtx);
});

// 向下级组件提供当前表单项的上下文
provide<FormItemContext>(FORM_ITEM_CTX_KEY, formItemCtx);

// 暴露组件实例方法（供外部调用）
defineExpose<FormItemInstance>({
  validateMessage: errMsg,
  validateStatus,
  validate,
  resetField,
  clearValidate, // 清除验证状态方法
});
</script>

<template>
  <div class="jo-form-item">
    <div class="jo-form-item__content">
      <!-- 表单项内容插槽 -->
      <slot></slot>
      <div class="jo-form-item_error-msg" v-if="validateStatus === 'error'">
        <template v-if="ctx?.showMessage && showMessage">
          <!-- 错误信息插槽，默认显示errMsg -->
          <slot name="error" :error="errMsg">{{ errMsg }}</slot>
        </template>
      </div>
    </div>
  </div>
</template>