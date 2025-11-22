import { vLoading } from "./directive";
import { Loading } from "./service";
import type { App } from "vue";

export const JoLoading = {
  name: "JoLoading",
  install(app: App) {
    app.directive("loading", vLoading); // 注册v-loading指令
    app.config.globalProperties.$loading = Loading; // 全局注册$loading方法（可通过this.$loading调用）
  },
  directive: vLoading, // 暴露指令
  service: Loading, // 暴露服务
};

export default JoLoading;

export {
  vLoading,
  vLoading as JoLoadingDirective,
  Loading as JoLoadingService,
};

export * from "./types";