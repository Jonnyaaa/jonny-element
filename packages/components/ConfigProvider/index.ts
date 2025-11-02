import ConfigProvider from "./ConfigProvider.vue";
import { withInstall } from '@jonny-element/utils'

export const JoConfigProvider = withInstall(ConfigProvider)

export * from './types'
export * from './hooks'