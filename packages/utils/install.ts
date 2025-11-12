// 这段代码主要是为了解决在开发 Vue 组件库时，如何更方便地批量注册和安装组件的问题
import type { App, Plugin} from 'vue';
import { each } from 'lodash-es';

// 泛型类型：表示一个"可安装的单文件组件"
// 继承原组件类型 T 的同时，附加 Vue 插件的 install 方法，使其支持 app.use() 注册
type SFCWithInstall<T> = T & Plugin;

// 创建一个批量安装插件/组件的工具函数
// 解决多组件注册时重复调用 app.use() 的问题，简化批量注册流程
export function makeInstaller(component: Plugin[]) {
  // 定义安装函数：接收 Vue 应用实例 app，遍历组件数组并逐个注册
  const installer = (app: App) => each(component, (c) => app.use(c));
  return installer as Plugin;
}

// 为单个 Vue 组件添加 install 方法，使其支持 app.use() 注册（同时保留组件本身的注册能力）
// 适用于组件库中需要同时支持 "全局注册" 和 "局部导入" 的组件
export const withInstall = <T>(component: T) => {
  // 为组件添加 install 方法
  (component as SFCWithInstall<T>).install = (app: App) => {
    // 获取组件的 name 属性（通常在组件定义时声明，作为全局注册的标签名）
    const name = (component as any).name;
    // 调用 app.component() 全局注册组件：标签名为 componentName，组件为当前组件
    app.component(name, component as Plugin);
  };
  return component as SFCWithInstall<T>;
}

/**
 * 为普通函数添加 install 方法，使其支持 app.use() 注册，并挂载到 Vue 全局属性
 * 适用于组件库中的工具函数（如 message、notification 等），方便全局调用
 * @param fn 待处理的普通函数（如创建消息的 message 函数）
 * @param name 全局属性名（如 '$message'，用于在组件内通过 this.$message 调用）
 * @returns 增强后的函数：包含 install 方法，可通过 app.use() 全局注册
 */
export const withInstallFunction = <T>(fn: T, name: string) => {
  (fn as SFCWithInstall<T>).install = (app: App) => {
    // 将函数挂载到 Vue 应用的全局属性上，使其在所有组件中可访问
    app.config.globalProperties[name] = fn
  }
  return fn as SFCWithInstall<T>
}