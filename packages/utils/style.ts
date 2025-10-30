import { isNumber, isString } from "lodash-es";
import { debugWarn } from "./error";

const SCOPE = "utils/style" as const;

// 判断一个字符串是否能被转换为有效的数字
const isStringNumber = (val: string): boolean => {
  if (!isString(val)) {
    return false;
  }
  // 将字符串转为数字，若结果不是 NaN，则是有效的数字字符串
  return !Number.isNaN(Number(val));
};

// 给数值添加单位（默认 px），处理数字、数字字符串、带单位字符串的转换
export function addUnit(val?: string | number, defaultUnit = "px") {
  if (!val) return "";
  if (isNumber(val) || isStringNumber(val)) {
    return `${val}${defaultUnit}`;
  }
  // 若输入是字符串（且不是数字字符串，如 "200px"、"auto"），直接返回原字符串
  if (isString(val)) {
    return val;
  }
  debugWarn(SCOPE, "binding value must be a string or number");
}