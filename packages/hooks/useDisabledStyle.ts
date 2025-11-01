// 自动为组件默认插槽内的所有子元素添加 / 移除禁用样式
import { each, isFunction, cloneDeep, assign } from "lodash-es";
import { watchEffect, useSlots, getCurrentInstance, type VNode } from "vue";

// 深度遍历 VNode 数组，对每个节点执行回调函数
const _dfs = (nodes: VNode[], cb: (node: VNode) => void) =>
  each(nodes, (node) => {
    isFunction(cb) && cb(node); // 执行回调处理当前节点
    node.children && _dfs(node.children as VNode[], cb); // 递归处理子节点
  });

export function useDisabledStyle() {
  // 存储子元素原始 props 的 Map
  const nodePropsMap = new Map();

  // 获取当前组件实例（用于读取 disabled 属性）
  const instance = getCurrentInstance();
  // 获取默认插槽的子元素（VNode 数组）
  const children = useSlots()?.default?.();

  // 监听 disabled 状态变化
  watchEffect(() => {
    // 组件未禁用
    if (!instance?.props.disabled) {
      _dfs(children ?? [], (node) => {
        if (!nodePropsMap.has(node)) return; // 若未缓存原始 props，直接跳过
        node.props = nodePropsMap.get(node); // 恢复子元素的原始 props（清除禁用样式）
      });
      return;
    }

    // 组件禁用
    _dfs(children ?? [], (node) => {
      if (!node?.props) return; // 若节点没有 props，跳过（避免报错）

      // 缓存原始 props（深拷贝，防止修改源数据）
      nodePropsMap.set(node, cloneDeep(node.props));
      // 合并禁用样式到节点 props
      node.props = assign(node?.props, {
        style: {
          cursor: "not-allowed", // 鼠标指针变为“禁止”样式
          color: "var(--jo-text-color-placeholder)", // 文字颜色改为占位色（灰色）
        },
      });
    });
  });
}

export default useDisabledStyle;