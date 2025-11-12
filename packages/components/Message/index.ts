import message from "./methods";
import { withInstallFunction } from "@jonny-element/utils";

export const JoMessage = withInstallFunction(message, "$message");

export * from './types'