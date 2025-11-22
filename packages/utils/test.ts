// 等待浏览器两次重绘的工具函数（确保 DOM 渲染完成）
import { nextTick } from "vue";

export const rAF = async () => {
  // 嵌套两个 requestAnimationFrame：等待浏览器两次重绘
  return new Promise((res) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(async () => {
        res(null) // 完成 Promise
        await nextTick() // 等待 Vue 的 DOM 更新完成
      })
    })
  })
}