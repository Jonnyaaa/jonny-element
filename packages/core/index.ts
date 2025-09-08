import { makeInstaller } from "@toy-element/utils";//工具函数，用于批量注册组件
import components from "./components";// 从当前目录下的 ./components 导入组件集合（通常是一个数组，包含所有需要全局注册的组件）
import '@toy-element/theme/index.css';// 导入主题样式

const installer = makeInstaller(components);// 使用工具函数将组件集合转换为安装器

export * from "@toy-element/components";// 导出所有组件，供外部使用
export default installer;// 默认导出安装器，供 Vue 应用使用