<script setup lang="ts">
import type { MessageBoxProps, MessageBoxAction } from "./types";
import type { InputInstance } from "../Input/types";
import { useZIndex, useId } from "@jonny-element/hooks";
import { typeIconMap } from "@jonny-element/utils";
import { reactive, computed, ref, watch, nextTick, type Ref } from "vue";

import JoOverlay from "../Overlay/Overlay.vue";
import JoIcon from "../Icon/Icon.vue";
import JoButton from "../Button/Button.vue";
import JoInput from "../Input/Input.vue";
import { isFunction, isNil } from "lodash-es";

defineOptions({
  name: "JoMessageBox",
  inheritAttrs: false,
});

const props = withDefaults(defineProps<MessageBoxProps>(), {
  lockScroll: true,
  showClose: true,
  closeOnClickModal: true,
  confirmButtonType: "primary",
  roundButton: false,
  boxType: "",
  inputValue: "",
  inputPlaceholder: "Please input...",
  confirmButtonText: "Ok",
  cancelButtonText: "Cancel",
  showConfirmButton: true,
});

const { doAction } = props;
const { nextZIndex } = useZIndex();

const headerRef = ref<HTMLElement>();
const inputRef = ref<InputInstance>();
const inputId = useId();

const state = reactive({
  ...props,
  zIndex: nextZIndex(),
});

const hasMessage = computed(() => !!state.message);
const iconComponent = computed(
  () => state.icon ?? typeIconMap.get(state.type ?? "")
);

watch(
  () => props.visible?.value,
  val => {
    if(val) state.zIndex = nextZIndex();
    if(props.boxType !== 'prompt') return

    if(!val) return

    nextTick(() => {
      inputRef.value && inputRef.value.focus()
    })
  }
)

function handleWrapperClick() {
  props.closeOnClickModal && handleAction("close");
}

function handleInputEnter(e: KeyboardEvent) {
  if (state.inputType === "textarea") return;
  e.preventDefault();
  return handleAction("confirm");
}

function handleAction(action: MessageBoxAction) {
  isFunction(props.beforeClose)
    ? props.beforeClose(action, state, () => doAction(action, state.inputValue))
    : doAction(action, state.inputValue);
}

function handleClose() {
  handleAction("close");
}
</script>

<template>
  <transition name="fade-in-linear" @after-leave="destroy">
    <jo-overlay v-show="(visible as Ref).value" :z-index="state.zIndex" mask>
      <div
        role="dialog"
        class="jo-overlay-message-box"
        @click="handleWrapperClick"
      >
        <div
          ref="rootRef"
          :class="[
            'jo-message-box',
            {
              'is-center': state.center,
            },
          ]"
          @click.stop
        >
          <div
            v-if="!isNil(state.title)"
            ref="headerRef"
            class="jo-message-box__header"
            :class="{ 'show-close': state.showClose }"
          >
            <div class="jo-message-box__title">
              <jo-icon
                v-if="iconComponent && state.center"
                :class="{
                  [`jo-icon-${state.type}`]: state.type,
                }"
                :icon="iconComponent"
              />
              {{ state.title }}
            </div>
            <button
              v-if="showClose"
              class="jo-message-box__header-btn"
              @click.stop="handleClose"
            >
              <jo-icon icon="xmark" />
            </button>
          </div>
          <div class="jo-message-box__content">
            <jo-icon
              v-if="iconComponent && !state.center && hasMessage"
              :class="{
                [`jo-icon-${state.type}`]: state.type,
              }"
              :icon="iconComponent"
            />
            <div v-if="hasMessage" class="jo-message-box__message">
              <slot>
                <component
                  :is="state.showInput ? 'label' : 'p'"
                  :for="state.showInput ? inputId : void 0"
                >
                  {{ state.message }}
                </component>
              </slot>
            </div>
          </div>
          <div v-show="state.showInput" class="jo-message-box__input">
            <jo-input
              v-model="state.inputValue"
              ref="inputRef"
              :placeholder="state.inputPlaceholder"
              :type="state.inputType"
              @keyup.enter="handleInputEnter"
            />
          </div>
          <div class="jo-message-box__footer">
            <jo-button
              v-if="state.showCancelButton"
              class="jo-message-box__footer-btn jo-message-box__cancel-btn"
              :type="state.cancelButtonType"
              :round="state.roundButton"
              :loading="state.cancelButtonLoading"
              @click="handleAction('cancel')"
              @keydown.prevent.enter="handleAction('cancel')"
              >{{ state.cancelButtonText }}</jo-button
            >
            <jo-button
              v-show="state.showConfirmButton"
              class="jo-message-box__footer-btn jo-message-box__confirm-btn"
              :type="state.confirmButtonType ?? 'primary'"
              :round="state.roundButton"
              :loading="state.confirmButtonLoading"
              @click="handleAction('confirm')"
              @keydown.prevent.enter="handleAction('confirm')"
              >{{ state.confirmButtonText }}</jo-button
            >
          </div>
        </div>
      </div>
    </jo-overlay>
  </transition>
</template>

<style>
@import './style.css';
</style>