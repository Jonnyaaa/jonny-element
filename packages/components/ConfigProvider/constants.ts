import type { ConfigProviderProps } from './types'
import type { InjectionKey, Ref } from 'vue'

// ConfigProviderProps 所有属性变为可选
export type ConfigProviderContext = Partial<ConfigProviderProps>

export const configProviderContextKey: InjectionKey<
  Ref<ConfigProviderContext>
> = Symbol()