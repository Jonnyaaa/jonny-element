---
search: false
next:
  link: /components/button
  text: Button 按钮
---

# 最新 Vue3 + TS 高仿 ElementPlus 打造自己的组件库

## 安装

```bash
npm i @jonny-element --save
```

## 开始使用

**全局使用**

```js
// 引入所有组件
import JonnyElement from "jonny-element";
// 引入样式
import "jonny-element/dist/index.css";

import App from "./App.vue";
// 全局使用
createApp(App).use(ErElement).mount("#app");
```

```vue
<template>
  <jo-button>我是 Button</jo-button>
</template>
```

**单个导入**

Jonny-Element 提供了基于 ES Module 的开箱即用的 Tree Shaking 功能。

```vue
<template>
  <jo-button>我是 Button</jo-button>
</template>
<script>
import { JoButton } from " jonny-element";
export default {
  components: { JoButton },
};
</script>
```

## 亮点

::: details

- Vite + Vitest + Vitepress 工具链
- monorepo 分包管理
- github actions 实现 CI/CD 自动化部署
- 大模型辅助：使用大模型辅助完成需求分析，设计思路，快速实现组件，提升开发效率。
- 当然，也会展示 发布“开箱即用” 的 npm 包
  :::
