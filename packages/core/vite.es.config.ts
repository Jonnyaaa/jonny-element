import { defineConfig } from "vite";
// 导入Node.js的path模块，用于处理文件路径（解决不同系统路径格式差异）
import { resolve } from "path"
import { readdirSync } from "fs";// Node.js文件系统模块，用于读取目录
import { filter, map } from "lodash-es";
import vue from "@vitejs/plugin-vue"
// 导入vite-plugin-dts插件，用于在打包时自动生成TypeScript类型声明文件（.d.ts）
import dts from "vite-plugin-dts"

function getDirectoriesSync(basePath: string) {
  // 读取指定路径下的所有条目（文件/目录），并获取详细信息（是否为目录）
  const entries = readdirSync(basePath, { withFileTypes: true });

  // 筛选出目录条目，然后提取目录名称并返回数组
  return map(
    filter(entries, (entry) => entry.isDirectory()),
    (entry) => entry.name
  );
}

export default defineConfig({
  // 配置Vite插件
  plugins: [
    vue(),
    // 配置dts插件，用于生成类型声明文件
    dts({
      tsconfigPath: "../../tsconfig.build.json",// 指定TS配置文件路径，插件会根据该配置生成类型
      outDir: "dist/types",// 类型声明文件的输出目录，最终会在dist/types下生成.d.ts文件
    })
  ],// 注册Vue插件，必须配置，否则无法解析.vue文件中的template/script/style

  // 构建相关配置（打包时生效）
  build: {
    // 指定打包输出目录
    outDir: "dist/es",

    // 库模式配置（核心！用于组件库打包，而非普通应用打包）
    lib: {
      // 组件库入口文件路径：__dirname是当前文件所在目录，resolve拼接为绝对路径
      entry: resolve(__dirname, "./index.ts"),

      // 全局变量名称：当用户通过<script>标签直接引入时，会在window上挂载该变量
      name: "JonnyElement",

      // 输出的文件名前缀
      fileName: "index",

      // 打包格式：仅输出es格式
      formats: ["es"],
    },

    // 底层Rollup打包工具的配置
    rollupOptions: {
      // 所有第三方库（如vue、字体图标库等）都不打包，避免重复打包和体积膨胀
      external: [
        "vue",
        "@fortawesome/fontawesome-svg-core",// 字体图标核心库
        "@fortawesome/free-solid-svg-icons",// 免费-solid图标库
        "@fortawesome/vue-fontawesome",// Vue字体图标组件
        "@popperjs/core",// 可能用于弹窗定位的库
        "async-validator",// 可能用于表单验证的库
      ],

      // 输出配置
      output: {
        assetFileNames: (assetInfo) => {
          // 把打包生成的 style.css 重命名为 index.css
          if (assetInfo.name === "style.css") return "index.css"
          return assetInfo.name as string
        },

        // 手动拆分代码块,作用：将不同类型的代码拆分成独立的chunk文件，优化按需加载性能
        manualChunks(id) {
          // 1. 第三方依赖单独拆分为 vendor chunk（如node_modules中的库）
          if (id.includes("node_modules")) {
            return "vendor";// 输出为 vendor.js
          }

          // 2. hooks相关代码拆分为单独的 hooks chunk
          if (id.includes("/packages/hooks")) {
            return "hooks";
          }

          // 3. 工具函数相关代码拆分为单独的 utils chunk
          if (id.includes("/packages/utils")) {
            return "utils";
          }

          // 4. 每个组件单独拆分为独立的 chunk（按组件名）
          // 遍历组件名称列表，匹配对应组件的文件路径
          for (const dirName of getDirectoriesSync("../components")) {
            // 若文件路径包含某个组件的目录（如/packages/components/Button）
            if (id.includes(`/packages/components/${dirName}`)) {
              return dirName;// 输出为 组件名.js（如 Button.js）
            }
          }
        }
      }
    }
  }
})