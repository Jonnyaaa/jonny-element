import { inject, ref, unref, computed, type Ref } from "vue";
import { omit } from "lodash-es";
import { createI18n, i18nSymbol, type I18nInstance } from "vue3-i18n";
import type { Language } from "@jonny-element/locale";
import English from "@jonny-element/locale/lang/en";

const omitInstall = (obj: I18nInstance) => omit(obj, "install");
// 与 usei18n 不一样的地方：可以传入一个非顶层注入的语言，然后去把 t 函数给取出来
export function useLocale(localeOverrides?: Ref<Language>) {
  // 未传入局部语言配置 → 使用全局注入的i18n实例
  if (!localeOverrides) {
    const i18n: Ref<I18nInstance> =
      inject(i18nSymbol) ??
      ref(createI18n({ locale: English.name, messages: { en: English.el } }));

    return computed(() => omitInstall(unref(i18n)));
  }

  // 传入了局部语言配置 → 创建基于局部语言的i18n实例
  return computed(() =>
    omitInstall(
      createI18n({
        locale: localeOverrides.value.name,
        messages: {
          en: English.el,
          [localeOverrides.value.name]: localeOverrides.value.el,
        },
      })
    )
  );
}

export default useLocale