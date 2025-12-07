import Form from "./Form.vue";
import FormItem from "./FormItem.vue";

import { withInstall } from "@jonny-element/utils";

export const JoForm = withInstall(Form);
export const JoFormItem = withInstall(FormItem);

export * from "./types";
export * from "./hooks";