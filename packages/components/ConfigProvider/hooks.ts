import { ref, getCurrentInstance, inject, computed, provide, unref } from "vue";
import type { MaybeRef, Ref, App } from "vue";
import {
  type ConfigProviderContext,
  configProviderContextKey,
} from "./constants";
import { createI18n, i18nSymbol } from "vue3-i18n";
import type { TranslatePair } from "@jonny-element/locale";
import English from "@jonny-element/locale/lang/en";
import { merge } from "lodash-es";
import { debugWarn } from "@jonny-element/utils";

const globalConfig = ref<ConfigProviderContext>();

// 按key获取配置，返回对应值的Ref（带默认值）
export function useGlobalConfig<
  K extends keyof ConfigProviderContext,
  D extends ConfigProviderContext[K],
>(key: K, defaultVal?: D): Ref<Exclude<ConfigProviderContext[K], void>>;
// 不传入key，返回完整配置的Ref
export function useGlobalConfig(): Ref<ConfigProviderContext>;
export function useGlobalConfig(
  key?: keyof ConfigProviderContext,
  defaultVal = void 0 // undefined
) {
  // 获取配置：优先从当前组件层级的注入中获取，否则用全局默认配置
  const config = getCurrentInstance()
    ? inject(configProviderContextKey, globalConfig) // 组件内：从注入获取，降级到globalConfig
    : globalConfig; // 非组件环境：直接用全局配置

  // 按key返回对应值（带默认值），或返回完整配置
  return key ? computed(() => config.value?.[key] ?? defaultVal) : config;
}

const _createI18n = (opts?: ConfigProviderContext) => {
  // 合并消息：将用户扩展的语言包与默认包合并（用户配置优先级更高）
  const mergeMsg = (msg: TranslatePair) =>
    merge(msg, opts?.extendsI18nMsg ?? {}); // extendsI18nMsg：用户扩展的翻译

  if (!opts?.locale) {
    return createI18n({
      locale: "en",
      messages: mergeMsg({
        en: English.el,
      }),
    });
  }

  return createI18n({
    locale: opts.locale?.name || "en",
    messages: mergeMsg({
      en: English.el,
      [opts.locale?.name]: opts.locale?.el ?? {},
    }),
  });
};

// 用于注入全局配置和国际化实例
export function provideGlobalConfig(
  config: MaybeRef<ConfigProviderContext> = { locale: English },
  app?: App,
  global = false
) {
  // 获取当前组件实例和已有的配置（用于合并）
  const instance = getCurrentInstance();
  const oldCfg = instance ? useGlobalConfig() : void 0;
  // 确定provide函数：优先用app的provide，其次用组件的provide
  const provideFn = app?.provide ?? (instance ? provide : void 0);

  // 错误处理：若无法获取provide函数（非setup或app环境）
  if (!provideFn) {
    debugWarn(
      "provideGlobalConfig",
      "provideGlobalConfig() can only be used inside setup()"
    );
    return;
  }

  // 合并配置：将新配置与已有配置合并（新配置优先级更高）
  const context = computed(() => {
    const cfg = unref(config);
    if (!oldCfg?.value) return cfg;
    return merge(oldCfg.value, cfg);
  });

  // 基于合并后的配置创建i18n实例（响应式）
  const i18n = computed(() => _createI18n(context.value));

  provideFn(configProviderContextKey, context); // 注入配置
  provideFn(i18nSymbol, i18n.value); // 注入i18n实例

  // 全局注册：若传入app，将i18n实例注册到应用
  if (app) app.use(i18n.value);
  if (global || !globalConfig.value) globalConfig.value = context.value;

  return context;
}