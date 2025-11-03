import { defineComponent } from 'vue';
import { isFunction } from 'lodash-es';

// 类型与图标名称的映射表（用 Map 存储，查询高效）
export const typeIconMap = new Map([
  ["info", "circle-info"],
  ["success", "check-circle"],
  ["warning", "circle-exclamation"],
  ["danger", "circle-xmark"],
  ["error", "circle-xmark"],
]);

export const RenderVnode = defineComponent({
  props: {
    vNode: {
      type: [String, Object, Function],
      required: true
    }
  },
  setup(props) {
    return () => (isFunction(props.vNode) ? props.vNode() : props.vNode)
  }
})

export * from './install';
export * from './error'
export * from './style'