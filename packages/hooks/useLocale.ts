import { inject, type Ref } from "vue";
import { omit } from "lodash-es";
import { createI18n, i18nSymbol, type I18nInstance } from "vue3-i18n";
import type { Language } from "@jonny-element/locale";
import English from "@jonny-element/locale/lang/en";

// 与 usei18n 不一样的地方：可以传入一个非顶层注入的语言，然后去把 t 函数给取出来
export function useLocale(localeOverrides?: Ref<Language>) {
  // 未传入局部语言配置 → 使用全局注入的i18n实例
  if (!localeOverrides) {
    return omit(
      // 尝试从全局注入中获取i18n实例（通过i18nSymbol标识）
      // 若全局未注入，则创建默认英文实例作为降级方案
      <I18nInstance>(
        inject(
          i18nSymbol,
          createI18n({
            locale: English.name, // 默认语言标识（如"en"）
            messages: { en: English.el } // 默认英文翻译内容
          })
        )
      ),
      "install" // 移除实例中的 install 方法（避免暴露不必要的属性）
    );
  }

  // 传入了局部语言配置 → 创建基于局部语言的i18n实例
  return omit(
    createI18n({
      locale: localeOverrides.value.name, // 局部语言标识（如"zh-CN"）
      messages: {
        en: English.el, // 保留英文作为基础语言（避免翻译缺失时无 fallback）
        // 注册局部语言的翻译内容（键为语言标识，值为翻译对象）
        [localeOverrides.value.name]: localeOverrides.value.el,
      },
    }),
    "install"
  );
}

export default useLocale