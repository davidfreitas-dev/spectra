<script setup lang="ts">
import { computed, toRef } from 'vue'
import { useBodyScrollLock } from '@/composables/useBodyScrollLock'
import AppIcon from './AppIcon.vue'

interface Props {
  isOpen: boolean
  title?: string
  eyebrow?: string
  subtitle?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  animation?: 'modal-sheet' | 'modal-pop'
  showCloseButton?: boolean
  closeOnBackdrop?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: undefined,
  eyebrow: undefined,
  subtitle: undefined,
  maxWidth: 'md',
  animation: 'modal-sheet',
  showCloseButton: true,
  closeOnBackdrop: true,
})

const emit = defineEmits<{
  (e: 'close'): void
}>()

useBodyScrollLock(toRef(props, 'isOpen'))

const maxWidthClass = computed(() => {
  switch (props.maxWidth) {
    case 'sm':
      return 'max-w-sm'
    case 'lg':
      return 'max-w-lg'
    case 'xl':
      return 'max-w-xl'
    case '2xl':
      return 'max-w-2xl'
    case 'md':
    default:
      return 'max-w-md'
  }
})

function handleBackdropClick() {
  if (props.closeOnBackdrop) {
    emit('close')
  }
}
</script>

<template>
  <Transition :name="animation">
    <div
      v-if="isOpen"
      class="modal-backdrop fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-ink/50 backdrop-blur-xs select-none"
      @click.self="handleBackdropClick"
      @touchmove.self.prevent
    >
      <div
        class="modal-card bg-surface border-t-2 sm:border-2 border-border-primary rounded-t-3xl sm:rounded-2xl w-full max-h-[88vh] sm:max-h-[85vh] flex flex-col shadow-[0_8px_0_0_#111111] overflow-hidden"
        :class="maxWidthClass"
      >
        <!-- Header -->
        <slot name="header">
          <div
            v-if="title || eyebrow || $slots.title || $slots.eyebrow || showCloseButton"
            class="p-4 sm:p-5 border-b border-border-grid flex items-center justify-between bg-bg-alternate shrink-0"
          >
            <div class="min-w-0 pr-2">
              <span
                v-if="eyebrow || $slots.eyebrow"
                class="font-eyebrow text-[10px] text-primary-container font-bold uppercase tracking-wider block"
              >
                <slot name="eyebrow">{{ eyebrow }}</slot>
              </span>

              <h2
                v-if="title || $slots.title"
                class="font-display text-lg sm:text-xl font-bold text-ink truncate"
              >
                <slot name="title">{{ title }}</slot>
              </h2>

              <span
                v-if="subtitle || $slots.subtitle"
                class="text-xs text-ink-muted block mt-0.5"
              >
                <slot name="subtitle">{{ subtitle }}</slot>
              </span>
            </div>

            <button
              v-if="showCloseButton"
              type="button"
              class="w-9 h-9 flex items-center justify-center rounded-lg border border-border-grid bg-surface hover:bg-bg-alternate text-ink font-bold cursor-pointer transition-colors shrink-0"
              title="Fechar"
              aria-label="Fechar"
              @click="emit('close')"
            >
              <AppIcon name="close" :size="18" />
            </button>
          </div>
        </slot>

        <!-- Body / Content -->
        <div class="flex-1 overflow-y-auto">
          <slot />
        </div>

        <!-- Footer -->
        <div
          v-if="$slots.footer"
          class="p-4 border-t border-border-grid bg-bg-alternate shrink-0"
        >
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Transition>
</template>
