import type { SelectOptionProps, SelectStates } from "jonny-element";
import type { Ref, ComputedRef } from "vue";

// 键盘事件映射参数接口
interface KeyMapParams {
  isDropdownVisible: Ref<boolean>;
  highlightedLine: ComputedRef<SelectOptionProps | void>;
  hasData: ComputedRef<boolean>;
  lastIndex: ComputedRef<number>;
  selectStates: SelectStates;
  controlVisible(visible: boolean): void;
  handleSelect(option: SelectOptionProps): void;
}

/**
 * 键盘事件处理钩子函数
 * 封装了选择器组件的键盘交互逻辑，返回按键与处理函数的映射关系
 * @param params 包含组件状态和方法的参数对象
 * @returns 按键映射表（键名 -> 处理函数）
 */
export default function useKeyMap({
  isDropdownVisible,
  controlVisible,
  selectStates,
  highlightedLine,
  handleSelect,
  hasData,
  lastIndex,
}: KeyMapParams) {
  const keyMap: Map<string, Function> = new Map();

  // Enter键处理逻辑
  // 当下拉框可见且有高亮选项时，选中当前高亮选项
  // 切换下拉框显示状态（如果没有选中操作则单纯切换）
  keyMap.set("Enter", () => {
    if (
      isDropdownVisible.value &&
      selectStates.highlightedIndex >= 0 &&
      highlightedLine.value
    ) {
      // 选中当前高亮的选项
      handleSelect(highlightedLine.value as SelectOptionProps);
    }

    // 切换下拉框可见性
    controlVisible(!isDropdownVisible.value);
  });

  // Escape键处理逻辑
  // 当下拉框可见时，关闭下拉框
  keyMap.set(
    "Escape",
    () => isDropdownVisible.value && controlVisible(!isDropdownVisible.value)
  );

  // 上箭头(ArrowUp)键处理逻辑
  keyMap.set("ArrowUp", (e: KeyboardEvent) => {
    e.preventDefault(); // 阻止默认滚动行为
    if (!hasData.value) return; // 无数据时直接返回

    // 若当前无高亮项或已在第一个选项，高亮最后一个选项
    if (
      selectStates.highlightedIndex === -1 ||
      selectStates.highlightedIndex === 0
    ) {
      selectStates.highlightedIndex = lastIndex.value;
      return;
    }

    // 否则高亮上一个选项
    selectStates.highlightedIndex--;
  });

  // 下箭头(ArrowDown)键处理逻辑
  keyMap.set("ArrowDown", (e: KeyboardEvent) => {
    e.preventDefault(); // 阻止默认滚动行为
    if (!hasData.value) return; // 无数据时直接返回

    // 若当前无高亮项或已在最后一个选项，高亮第一个选项
    if (
      selectStates.highlightedIndex === -1 ||
      selectStates.highlightedIndex === lastIndex.value
    ) {
      selectStates.highlightedIndex = 0;
      return;
    }

    // 否则高亮下一个选项
    selectStates.highlightedIndex++;
  });

  return keyMap
}