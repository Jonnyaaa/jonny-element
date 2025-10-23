import { isString } from "lodash-es";

// 自定义错误类
class JoUIError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = "JoUIError";
  }
}

function createJoUIError(scope: string, msg: string) {
  return new JoUIError(`[${scope}]:${msg}`);
}

// scope：错误发生的范围（如组件名 JoCollapse、工具函数名等），用于定位错误来源
// msg：具体的错误描述
export function throwError(scope: string, msg: string) {
  throw createJoUIError(scope, msg);
}

// 函数重载声明：支持两种调用方式
export function debugWarn(error: Error): void;
export function debugWarn(scope: string, msg: string): void;
// 函数实现
export function debugWarn(scope: string | Error, msg?: string) {
  if (process.env.NODE_ENV !== "production") { // 仅在非生产环境执行
    // 若 scope 是字符串，生成新的 JoUIError,若 scope 是 Error 对象，直接使用
    const err = isString(scope) ? createJoUIError(scope, msg!) : scope;
    console.warn(err);
  }
}