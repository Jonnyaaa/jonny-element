import Select from "./Select.vue";
import Option from "./Option.vue";

import { withInstall } from "@jonny-element/utils";

export const JoSelect = withInstall(Select);
export const JoOption = withInstall(Option);

console.log("Select", Select, "Option", Option);

export * from "./types";