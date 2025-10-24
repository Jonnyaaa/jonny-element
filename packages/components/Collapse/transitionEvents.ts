// 将元素的 height 样式设为 0px（折叠状态的初始高度）
const _setHeightZero = (el: HTMLElement) => (el.style.height = "0px");
// 将元素的 height 样式设为其内容实际高度（scrollHeight 是元素内容的总高度，包括溢出部分），用于展开时的目标高度
const _setHeightScroll = (el: HTMLElement) => (el.style.height = `${el.scrollHeight}px`);
// 清空元素的 height 样式（恢复为默认的 auto），避免固定高度影响后续内容变化（如内容动态更新时）
const _setHeightEmpty = (el: HTMLElement) => (el.style.height = "");
// 将元素的 overflow 设为 hidden，避免展开 / 折叠过程中内容溢出（如滚动条闪烁）
const _setOverflowHidden = (el: HTMLElement) => (el.style.overflow = "hidden");
// 清空元素的 overflow 样式（恢复默认），确保动画结束后内容可正常滚动（如果需要）
const _setOverflowEmpty = (el: HTMLElement) => (el.style.overflow = "");


// 过渡钩子配置
const transitionEvents: Record<string, (el: HTMLElement) => void> = {
  // 进入动画前（元素插入DOM前）
  beforeEnter(el) {
    _setHeightZero(el); // 初始高度设为0
    _setOverflowHidden(el); // 隐藏溢出内容
  },
  // 进入动画中（元素插入DOM后）
  enter: (el) => _setHeightScroll(el), // 高度设为内容实际高度（触发展开动画）
  // 进入动画结束后
  afterEnter(el) {
    _setHeightEmpty(el); // 清空高度（恢复auto，避免固定高度限制）
    _setOverflowEmpty(el); // 恢复overflow默认值
  },
  // 离开动画前（触发离开动画时）
  beforeLeave(el) {
    _setHeightScroll(el); // 先将高度设为内容实际高度（确保从当前高度开始折叠）
    _setOverflowHidden(el); // 隐藏溢出内容
  },
  // 离开动画中
  leave: (el) => _setHeightZero(el), // 高度设为0（触发折叠动画）
  // 离开动画结束后（元素从DOM移除后）
  afterLeave(el) {
    _setHeightEmpty(el);
    _setOverflowEmpty(el);
  },
};

export default transitionEvents;