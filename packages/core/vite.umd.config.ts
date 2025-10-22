import { defineConfig } from "vite";
import { readFileSync } from "fs";
import { resolve } from "path";
import { delay } from "lodash-es";
import { compression } from "vite-plugin-compression2";

import shell from "shelljs";
import vue from "@vitejs/plugin-vue"
import hooks from "./hooksPlugin";
import terser from "@rollup/plugin-terser"

const TRY_MOVE_STYLES_DELAY = 800 as const;

// 定义环境变量标识（区分开发/生产/测试环境）
const isProd = process.env.NODE_ENV === "production";
const isDev = process.env.NODE_ENV === "development";
const isTest = process.env.NODE_ENV === "test";

function moveStyles() {
  try {
    // 检查压缩后的 CSS 文件是否存在（标志 CSS 构建完成）
    readFileSync("./dist/umd/index.css.gz");
    // 将 UMD 目录下的 index.css 复制到 dist 根目录
    shell.cp("./dist/umd/index.css", "./dist/index.css");
  } catch (_) {
    // 如果文件不存在（构建未完成），延迟后重试，避免因异步操作导致的文件未就绪问题
    delay(moveStyles, TRY_MOVE_STYLES_DELAY);
  }
}

export default defineConfig({
  // 配置Vite插件
  plugins: [
    vue(),
    // 注册Vue插件，必须配置，否则无法解析.vue文件中的template/script/style
    compression({ // 注册压缩插件，对指定资源进行压缩
      include: /.(cjs|css)$/i, // 仅压缩以 .cjs 结尾的 CommonJS 模块文件和以 .css 结尾的样式文件
    }),
    terser({
      compress: {
        drop_console: ["log"], // 移除 console.log（保留其他 console 方法如 warn/error）
        drop_debugger: true, // 移除 debugger 语句（无论环境）
        passes: 3, // 压缩轮次（3次深度压缩，优化更彻底）
        global_defs: { // 注入全局变量（编译时替换）
          "@DEV": JSON.stringify(isDev),
          "@PROD": JSON.stringify(isProd),
          "@TEST": JSON.stringify(isTest),
        },
      },
    }),
    hooks({
      rmFiles: ['./dist/umd', './dist/index.css'], // 构建前清理旧文件
      afterBuild: moveStyles, // 构建完成后执行 moveStyles 函数
    })
  ],

  // 构建相关配置（打包时生效）
  build: {
    // 指定打包输出目录
    outDir: "dist/umd",

    // 库模式配置（核心！用于组件库打包，而非普通应用打包）
    lib: {
      // 组件库入口文件路径：__dirname是当前文件所在目录，resolve拼接为绝对路径
      entry: resolve(__dirname, "./index.ts"),

      // 全局变量名称：当用户通过<script>标签直接引入时，会在window上挂载该变量
      name: "JonnyElement",

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