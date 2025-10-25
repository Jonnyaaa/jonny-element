import { each, isFunction } from 'lodash-es' // 工具函数：遍历数组、判断是否为函数
import shell from 'shelljs'

export default function hooksPlugin ({
  rmFiles = [], // 需要删除的文件/目录路径数组（默认空数组）
  beforeBuild, // 构建开始前执行的钩子函数
  afterBuild, // 构建成功结束后执行的钩子函数
}: {
  rmFiles?: string[];
  beforeBuild?: Function;
  afterBuild?: Function;
}) {
  return {
    name: "hooks-plugin", // 插件名称，用于构建工具识别插件，调试时也会显示该名称
    buildStart() {
      // 遍历 rmFiles 数组，删除每个文件/目录
      each(rmFiles, (fName) => shell.rm("-rf", fName));
      // 逻辑与（&&）短路求值
      // 如果 beforeBuild 是函数，则执行它
      isFunction(beforeBuild) && beforeBuild();
    },
    buildEnd(err?: Error) {
      // 只有当构建无错误（err 不存在），且 afterBuild 是函数时，才执行 afterBuil
      !err && isFunction(afterBuild) && afterBuild();
    },
  };
} 