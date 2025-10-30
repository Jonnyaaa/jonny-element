<script setup lang="ts">
import { ref, computed } from "vue";
import { addUnit } from "@jonny-element/utils";
import type { TooltipInstance } from "../Tooltip";
import type { PopconfirmProps, PopconfirmEmits } from "./types";

import JoTooltip from "../Tooltip/Tooltip.vue";
import JoButton from "../Button/Button.vue";
import JoIcon from "../Icon/Icon.vue";

defineOptions({
  name: "JoPopconfirm",
});

const props = withDefaults(defineProps<PopconfirmProps>(), {
  title: "",
  confirmButtonType: "primary",
  confirmButtonText: "Yes",
  cancelButtonText: "No",
  icon: "question-circle",
  iconColor: "#f90",
  hideAfter: 200,
  width: 150,
});

const emits = defineEmits<PopconfirmEmits>();
const tooltipRef = ref<TooltipInstance>();
const style = computed(() => ({ width: addUnit(props.width) }));

function hidePopper() {
  tooltipRef.value?.hide();
}

function confrim(e: MouseEvent) {
  emits("confirm", e);
  hidePopper();
}

function cancel(e: MouseEvent) {
  emits("cancel", e);
  hidePopper();
}
</script>

<template>
  <jo-tooltip ref="tooltipRef" trigger="click" :hide-timeout="hideAfter">
    <template #content>
      <div class="jo-popconfirm" :style="style">
        <div class="jo-popconfirm__main">
          <jo-icon v-if="!hideIcon && icon" :icon="icon" :color="iconColor" />
          {{ title }}
        </div>
        <div class="jo-popconfirm__action">
          <jo-button size="small" :type="cancelButtonType" @click="cancel">
            {{ cancelButtonText }}
          </jo-button>
          <jo-button size="small" :type="confirmButtonType" @click="confrim">
            {{ confirmButtonText }}
          </jo-button>
        </div>
      </div>
    </template>

    <template v-if="$slots.default" #default>
      <slot name="default"></slot>
    </template>

    <template v-if="$slots.reference" #default>
      <slot name="reference"></slot>
    </template>
  </jo-tooltip>
</template>

<style scoped>
@import "./style.css";
</style>