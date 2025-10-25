import { isFunction, each } from "lodash-es";
import shell from "shelljs";
function hooksPlugin({
  rmFiles = [],
  // 需要删除的文件/目录路径数组（默认空数组）
  beforeBuild,
  // 构建开始前执行的钩子函数
  afterBuild
  // 构建成功结束后执行的钩子函数
}) {
  return {
    name: "hooks-plugin",
    // 插件名称，用于构建工具识别插件，调试时也会显示该名称
    buildStart() {
      each(rmFiles, (fName) => shell.rm("-rf", fName));
      isFunction(beforeBuild) && beforeBuild();
    },
    buildEnd(err) {
      !err && isFunction(afterBuild) && afterBuild();
    }
  };
}
export {
  hooksPlugin
};
