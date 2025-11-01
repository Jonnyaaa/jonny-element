import Dropdown from "./Dropdown.vue";
import DropdownItem from "./DropdownItem.vue";
import { withInstall } from '@jonny-element/utils'

export const JoDropdown = withInstall(Dropdown)
export const JoDropdownItem = withInstall(DropdownItem)

export * from "./types"