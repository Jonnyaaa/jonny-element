import Icon from "./Icon.vue";
import { withInstall } from "@jonny-element/utils";
// withInstall让单个Vue组件既能独立使用，也能在整个库里被app.use()批量安装

export const ErIcon = withInstall(Icon);// 导出，并且改名成ErIcon

export * from "./types"// 导出types.ts里的IconProps类型