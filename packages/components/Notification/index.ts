import Notification from "./methods";
import { withInstallFunction } from '@jonny-element/utils'

export const JoNotification = withInstallFunction(Notification, '$notify')

export * from './types'