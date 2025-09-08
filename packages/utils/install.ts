// 这段代码主要是为了解决在开发 Vue 组件库时，如何更方便地批量注册和安装组件的问题
import type { App,Plugin} from 'vue';
import { each } from 'lodash-es';

type SFCWithInstall<T> = T & Plugin;
// 定义了一个泛型类型，表示一个带有 install 方法的 Vue 单文件组件(SFC)


export function makeInstaller(component:Plugin[]) {
  const installer = (app:App) => each(component, (c) => app.use(c));
  return installer as Plugin;
}
// 作用：批量注册多个插件/组件

// 参数：接收一个插件数组

// 返回值：返回一个安装函数（本身也是一个插件）

// 内部使用 lodash 的 each 遍历数组，为每个组件调用 app.use()


export const withInstall = <T>(component: T) => {
  (component as SFCWithInstall<T>).install = (app: App) => {
    const name = (component as any).name;
    app.component(name, component as Plugin);
  };
  return component as SFCWithInstall<T>;
}
//withInstall 函数是为了让你的 单个 Vue 组件 能够像一个 Vue 插件 一样被使用，从而支持 app.use() 的调用方式。

// 作用：为单个组件添加 install 方法，使其可以作为插件使用

// 参数：接收一个组件

// 过程：给组件添加 install 方法, 在 install 方法中，获取组件名并通过 app.component() 注册

// 返回值：返回带有 install 方法的组件