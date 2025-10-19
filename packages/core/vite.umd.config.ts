import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue"
// 导入Node.js的path模块，用于处理文件路径（解决不同系统路径格式差异）
import { resolve } from "path"

export default defineConfig({
  // 配置Vite插件
  plugins: [vue()],// 注册Vue插件，必须配置，否则无法解析.vue文件中的template/script/style

  // 构建相关配置（打包时生效）
  build: {
    // 指定打包输出目录
    outDir: "dist/umd",

    // 库模式配置（核心！用于组件库打包，而非普通应用打包）
    lib: {
      // 组件库入口文件路径：__dirname是当前文件所在目录，resolve拼接为绝对路径
      entry: resolve(__dirname, "./index.ts"),

      // 全局变量名称：当用户通过<script>标签直接引入时，会在window上挂载该变量
      name: "ToyElement",

      // 输出的文件名前缀
      fileName: "index",

      // 打包格式：仅输出UMD格式
      formats: ["umd"],
    },

    // 底层Rollup打包工具的配置
    rollupOptions: {
      // 声明外部依赖（不把 vue 打包进组件库）
      external: ["vue"],

      // 输出配置
      output: {
        // 导出模式：使用命名导出（如export { Button }），而非默认导出
        exports: "named",

        // 告诉 Rollup：在 UMD 格式中，`vue` 对应全局变量 `Vue`
        globals: {
          vue: "Vue",
        },
        assetFileNames: (assetInfo) => {
          // 把打包生成的 style.css 重命名为 index.css
          if (assetInfo.name === "style.css") return "index.css"
          return assetInfo.name as string
        }
      }
    }
  }
})