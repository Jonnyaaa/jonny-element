<script setup lang="ts">
import type {
  SelectProps,
  SelectEmits,
  SelectContext,
  SelectInstance,
  SelectStates,
  SelectOptionProps,
} from "./types";
import type { TooltipInstance } from "../Tooltip/types";
import type { InputInstance } from "../Input/types";

import {
  h,
  computed,
  ref,
  reactive,
  provide,
  watch,
  nextTick,
  type VNode,
  onMounted,
} from "vue";
import { useId, useFocusController, useClickOutside } from "@jonny-element/hooks";
import { POPPER_OPTIONS, SELECT_CTX_KEY } from "./constants";
import {
  each,
  eq,
  filter,
  find,
  get,
  size,
  noop,
  isFunction,
  map,
  assign,
  isNil,
  isBoolean,
  includes,
  debounce,
} from "lodash-es";

import useKeyMap from "./useKeyMap";

import JoOption from "./Option.vue";
import JoTooltip from "../Tooltip/Tooltip.vue";
import JoInput from "../Input/Input.vue";
import JoIcon from "../Icon/Icon.vue";
import { debugWarn, RenderVnode } from "@jonny-element/utils";

const COMPONENT_NAME = "JoSelect";

defineOptions({ name: COMPONENT_NAME });

const props = withDefaults(defineProps<SelectProps>(), {
  options: () => [],
});
const emits = defineEmits<SelectEmits>();
const slots = defineSlots();

const selectRef = ref<HTMLElement>();
const tooltipRef = ref<TooltipInstance>();
const inputRef = ref<InputInstance>();

// 筛选后的子选项映射：key=VNode（选项虚拟节点），value=SelectOptionProps（选项属性）
// 用于存储插槽选项筛选后的结果，支持快速查找
const filteredChilds = ref<Map<VNode, SelectOptionProps>>(new Map());
// 筛选后的props.options数组
// 用于存储props.options筛选后的结果
const filteredOptions = ref(props.options ?? []);

// 下拉框是否可见
const isDropdownVisible = ref(false);

// 根据模型值查找初始选项
const initialOption = findOption(props.modelValue);

const selectStates = reactive<SelectStates>({
  inputValue: initialOption?.label ?? "",
  selectedOption: initialOption,
  mouseHover: false,
  loading: false,
  highlightedIndex: -1,
});

const isDisabled = computed(() => props.disabled);
// 计算子选项（仅筛选出JoOption类型的子元素）
const children = computed(() =>
  filter(slots?.default?.(), (child) => eq(child.type, JoOption))
);
// 计算是否有子选项
const hasChildren = computed(() => size(children.value) > 0);
// 计算是否显示清除按钮
const showClear = computed(
  () =>
    props.clearable && selectStates.mouseHover && selectStates.inputValue !== ""
);

const highlightedLine = computed(() => {
  let result: SelectOptionProps | void;
  if (hasChildren.value) {
    // 有子选项时从子元素中获取
    // const node = children.value[selectStates.highlightedIndex];
    // result = node?.props?.value;

    // 有子选项时：从筛选后的子选项映射中取对应索引的选项
    const node = [...filteredChilds.value][selectStates.highlightedIndex]?.[0];
    result = filteredChilds.value.get(node);
  } else {
    // 无子选项时从options中获取
    // result = props.options[selectStates.highlightedIndex];

    // 无子选项时：从筛选后的options数组中取对应索引的选项
    result = filteredOptions.value[selectStates.highlightedIndex];
  }

  return result;
});

// 处理插槽子选项：格式化为统一结构（包含VNode和处理后的props）
const childrenOptions = computed(() => {
  if (!hasChildren.value) return [];

  return map(children.value, (item) => ({
    vNode: h(item), // 创建选项的虚拟节点
    props: assign(item.props, {
      // 标准化disabled属性：
      // 1. 显式为true，禁用
      // 2. disabled存在且非布尔值，禁用（容错处理）
      disabled:
        item.props?.disabled === true ||
        (!isNil(item.props?.disabled) && !isBoolean(item.props?.disabled)),
    }),
  }));
});

// 计算是否显示“无数据”提示
const isNoData = computed(() => {
  if (!props.filterable) return false; // 未开启筛选，不显示无数据
  if (!hasData.value) return true; // 无筛选结果，显示无数据

  return false; // 有筛选结果，不显示无数据
});

// 计算是否有筛选结果
// 有子选项时：筛选后的子选项映射大小>0
// 无子选项时：筛选后的options数组长度>0
const hasData = computed(
  () =>
    (hasChildren.value && filteredChilds.value.size > 0) ||
    (!hasChildren.value && size(filteredOptions.value) > 0)
);

// 计算最后一个选项的索引（键盘导航循环用）
// 有子选项时：筛选后的子选项映射大小-1
// 无子选项时：筛选后的options数组长度-1
const lastIndex = computed(() =>
  hasChildren.value
    ? filteredChilds.value.size - 1
    : size(filteredOptions.value) - 1
);

// 计算输入框占位符
// 开启筛选且下拉框展开、有选中项，显示选中项的label
// 其他情况，显示默认placeholder
const filterPlaceholder = computed(() =>
  props.filterable && selectStates.selectedOption && isDropdownVisible.value
    ? selectStates.selectedOption.label
    : props.placeholder
);

// 计算筛选防抖延迟
// 远程筛选，300ms（减少请求次数）
// 本地筛选，100ms（更快的响应）
const timeout = computed(() => (props.remote ? 300 : 100));

const handleFilterDebounce = debounce(handleFilter, timeout.value);

const inputId = useId().value;

// 使用焦点控制器钩子：管理输入框焦点状态
const {
  wrapperRef: inputWrapperRef,
  isFocused,
  handleBlur,
  handleFocus,
} = useFocusController(inputRef);

// 创建键盘事件映射表：处理Enter/ArrowUp/ArrowDown/Escape等按键
const keyMap = useKeyMap({
  isDropdownVisible,
  controlVisible,
  selectStates,
  highlightedLine,
  handleSelect,
  hasData,
  lastIndex,
});

useClickOutside(selectRef, (e) => handleClickOutside(e));

const focus: SelectInstance["focus"] = function () {
  inputRef.value?.focus();
};

const blur: SelectInstance["blur"] = function () {
  handleClickOutside();
};

function handleClickOutside(e?: Event) {
  if (isFocused.value) {
    nextTick(() => handleBlur(new FocusEvent("focus", e)));
  }
}

// 控制下拉框显示/隐藏
function controlVisible(visible: boolean) {
  if (!tooltipRef.value) return;
  // 调用tooltip的显示/隐藏方法
  get(tooltipRef, ["value", visible ? "show" : "hide"])?.();
  // 开启筛选时，同步控制输入框值（展开清空/收起恢复）
  props.filterable && controlInputVal(visible);
  isDropdownVisible.value = visible;
  emits("visible-change", visible); // 触发可见性变化事件

  selectStates.highlightedIndex = -1;
}

/**
 * 控制输入框值（下拉框显隐时的逻辑）
 * @param visible 下拉框是否可见
 */
function controlInputVal(visible: boolean) {
  if (!props.filterable) return; // 未开启筛选，不处理
  if (visible) {
    // 下拉框展开：清空输入框（有选中项时）+ 触发筛选
    if (selectStates.selectedOption) selectStates.inputValue = "";
    handleFilterDebounce();
    return;
  }
  // 下拉框收起：恢复为选中项的label（无选中项则为空）
  selectStates.inputValue = selectStates.selectedOption?.label || "";
}

// 切换下拉框显示状态
function toggleVisible() {
  if (isDisabled.value) return;
  console.log("toggleVisible");
  controlVisible(!isDropdownVisible.value);
}

// 处理清除
function handleClear() {
  inputRef.value?.clear();
  selectStates.inputValue = "";
  selectStates.selectedOption = null;

  emits("clear");
  // 触发change和更新模型值事件
  each(["change", "update:modelValue"], (k) => emits(k as any, ""));
}

// 根据值查找选项
function findOption(value: string) {
  return find(props.options, (opt) => opt.value === value);
}

// 处理选择选项
function handleSelect(opt: SelectOptionProps) {
  if (opt.disabled) return;

  selectStates.inputValue = opt.label;
  selectStates.selectedOption = opt;
  each(["change", "update:modelValue"], (k) => emits(k as any, opt.value));
  controlVisible(false);
  inputRef.value?.focus();
}

/**
 * 设置筛选后的子选项映射（更新filteredChilds）
 * @param opts 格式化后的子选项数组（VNode+props）
 */
function setFilteredChilds(opts: typeof childrenOptions.value) {
  filteredChilds.value.clear(); // 清空原有映射
  // 遍历选项，填充Map（VNode -> 选项属性）
  each(opts, (item) => {
    filteredChilds.value.set(item.vNode, item.props as SelectOptionProps);
  });
}

/**
 * 处理筛选逻辑（统一入口）
 * 区分自定义子选项/options数组，调用对应筛选方法
 */
function handleFilter() {
  const searcKey = selectStates.inputValue; // 获取输入框筛选关键词
  selectStates.highlightedIndex = -1; // 筛选时重置高亮索引

  if (hasChildren.value) {
    genFilterChilds(searcKey); // 筛选自定义子选项
    return;
  }
  genFilterOptions(searcKey); // 筛选props.options数组
}

// 处理键盘按下事件：匹配键盘映射表执行对应逻辑
function handleKeyDown(e: KeyboardEvent) {
  keyMap.has(e.key) && keyMap.get(e.key)?.(e);
}

// 生成筛选后的自定义子选项（插槽<jo-option>）
async function genFilterChilds(search: string) {
  if (!props.filterable) return;

  // 远程筛选逻辑
  if (props.remote && props.remoteMethod && isFunction(props.remoteMethod)) {
    await callRemoteMethod(props.remoteMethod, search); // 调用远程方法
    setFilteredChilds(childrenOptions.value); // 更新筛选后的子选项映射
    return;
  }

  // 自定义本地筛选逻辑
  if (props.filterMethod && isFunction(props.filterMethod)) {
    // 调用自定义筛选方法，获取匹配的value数组
    const opts = map(props.filterMethod(search), "value");
    // 筛选出匹配的子选项并更新映射
    setFilteredChilds(
      filter(childrenOptions.value, (item) =>
        includes(opts, get(item, ["props", "value"]))
      )
    );
    return;
  }

  // 默认本地筛选：根据label包含关键词筛选
  setFilteredChilds(
    filter(childrenOptions.value, (item) =>
      includes(get(item, ["props", "label"]), search)
    )
  );
}

// 生成筛选后的options数组
async function genFilterOptions(search: string) {
  if (!props.filterable) return;

  // 远程筛选逻辑
  if (props.remote && props.remoteMethod && isFunction(props.remoteMethod)) {
    // 调用远程方法，更新筛选后的options数组
    filteredOptions.value = await callRemoteMethod(props.remoteMethod, search);
    return;
  }

  // 自定义本地筛选逻辑
  if (props.filterMethod && isFunction(props.filterMethod)) {
    // 调用自定义筛选方法，直接更新数组
    filteredOptions.value = props.filterMethod(search);
    return;
  }

  // 默认本地筛选：根据label包含关键词筛选
  filteredOptions.value = filter(props.options, (opt) =>
    includes(opt.label, search)
  );
}

/**
 * 调用远程筛选方法（封装加载状态+错误处理）
 * @param method 远程筛选方法
 * @param search 筛选关键词
 * @returns 远程返回的选项数组（Promise）
 */
async function callRemoteMethod(method: Function, search: string) {
  if (!method || !isFunction(method)) return;

  selectStates.loading = true; // 开启加载状态
  let result;
  try {
    // 执行远程筛选方法
    result = await method(search);
  } catch (error) {
    // 错误处理：打印调试警告
    debugWarn(error as Error);
    debugWarn(COMPONENT_NAME, "callRemoteMethod error");
    result = []; // 错误时返回空数组（兜底）
    return Promise.reject(error); // 抛出错误供外部捕获
  }

  return result;
}

// 渲染标签
function renderLabel(opt: SelectOptionProps): VNode | string {
  if (isFunction(props.renderLabel)) {
    return props.renderLabel(opt);
  }
  return opt.label;
}

// 设置选中项
function setSelected() {
  const opt = findOption(props.modelValue);
  if (!opt) return;
  selectStates.inputValue = opt.label;
  selectStates.selectedOption = opt;
}

// 监听props.options变化：同步更新筛选后的options数组
watch(
  () => props.options,
  (newVal) => {
    filteredOptions.value = newVal ?? [];
  }
);

// 监听自定义子选项变化：同步更新筛选后的子选项映射
watch(
  () => childrenOptions.value,
  (newVal) => setFilteredChilds(newVal),
  { immediate: true }
);

// 监听模型值变化，更新选中状态
watch(
  () => props.modelValue,
  () => {
    // 表单校验 逻辑 change
    setSelected();
  }
);

// 组件挂载时：初始化选中项
onMounted(() => {
  setSelected();
});

// 提供选择器上下文
provide<SelectContext>(SELECT_CTX_KEY, {
  handleSelect,
  selectStates,
  renderLabel,
  highlightedLine,
});

defineExpose<SelectInstance>({
  focus,
  blur,
});
</script>

<template>
  <div
    ref="selectRef"
    class="jo-select"
    :class="{
      'is-disabled': isDisabled,
    }"
    @click.stop="toggleVisible"
    @mouseenter="selectStates.mouseHover = true"
    @mouseleave="selectStates.mouseHover = false"
  >
    <jo-tooltip
      ref="tooltipRef"
      placement="bottom-start"
      :poppjo-options="POPPER_OPTIONS"
      @click-outside="controlVisible(false)"
      manual
    >
      <template #default> <!-- 触发元素 -->
        <div ref="inputWrapperRef">
          <jo-input
            ref="inputRef"
            v-model="selectStates.inputValue"
            :id="inputId"
            :disabled="isDisabled"
            :placeholder="filterable ? filterPlaceholder : placeholder"
            :readonly="!filterable || !isDropdownVisible"
            @focus="handleFocus"
            @blur="handleBlur"
            @input="handleFilterDebounce"
            @keydown="handleKeyDown"
          >
            <template #suffix> <!-- 后缀图标 -->
              <jo-icon
                v-if="showClear"
                icon="circle-xmark"
                class="jo-input__clear"
                @click.stop="handleClear"
                @mousedown.prevent="noop"
              />
              <jo-icon
                v-else
                class="header-angle"
                icon="angle-down"
                :class="{ 'is-active': isDropdownVisible }"
              />
            </template>
          </jo-input>
        </div>
      </template>
      <template #content> <!-- 下拉内容 -->
        <!-- 加载状态：远程筛选时显示 -->
        <div class="jo-select__loading" v-if="selectStates.loading">
          <jo-icon icon="spinner" spin />
        </div>
        <!-- 无数据提示：开启筛选且无结果时显示 -->
        <div class="jo-select__nodata" v-else-if="filterable && isNoData">
          No data
        </div>
        <ul class="jo-select__menu">
          <template v-if="!hasChildren"> <!-- 无自定义子选项时渲染options -->
            <jo-option
              v-for="item in filteredOptions"
              :key="item.value"
              v-bind="item"
            />
          </template>
          <template v-else> <!-- 有自定义子选项：渲染筛选后的插槽选项 -->
            <template
              v-for="[vNode, _props] in filteredChilds"
              :key="_props.value"
            >
              <!-- 渲染虚拟节点（自定义选项） -->
              <render-vnode :vNode="vNode" />
            </template>
          </template>
        </ul>
      </template>
    </jo-tooltip>
  </div>
</template>

<style scoped>
@import './style.css';
</style>