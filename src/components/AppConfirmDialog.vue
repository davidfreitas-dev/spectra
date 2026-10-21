<script setup lang="ts">
import { AppButton } from '@/components'
import AppIcon from './AppIcon.vue'

interface Props {
  isOpen: boolean
  title?: string
  eyebrow?: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'primary'
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  title: 'Confirmar Ação',
  eyebrow: 'Atenção',
  description: 'Tem certeza de que deseja prosseguir com esta ação?',
  confirmText: 'Confirmar',
  cancelText: 'Cancelar',
  variant: 'danger',
  loading: false,
})

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'confirm'): void
}>()
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in duration-150 select-none"
    @click.self="emit('close')"
  >
    <div
      class="bg-surface border-2 border-border-primary rounded-2xl w-full max-w-md flex flex-col shadow-[0_8px_0_0_#111111] overflow-hidden"
    >
      <!-- Header -->
      <div class="p-4 sm:p-5 border-b border-border-grid flex items-center justify-between bg-bg-alternate">
        <div>
          <span
            class="font-eyebrow text-[10px] font-bold uppercase tracking-wider block"
            :class="variant === 'danger' ? 'text-error' : 'text-primary-container'"
          >
            {{ eyebrow }}
          </span>
          <h2 class="font-display text-lg sm:text-xl font-bold text-ink">
            {{ title }}
          </h2>
        </div>
        <button
          type="button"
          class="w-9 h-9 flex items-center justify-center rounded-lg border border-border-grid bg-surface hover:bg-bg-alternate text-ink font-bold cursor-pointer transition-colors"
          @click="emit('close')"
        >
          <AppIcon name="close" :size="18" />
        </button>
      </div>

      <!-- Content -->
      <div class="p-5 space-y-4">
        <slot>
          <div
            v-if="variant === 'danger'"
            class="p-3.5 rounded-xl text-xs font-bold bg-error-container/20 border border-border-error text-error flex items-start gap-2.5"
          >
            <AppIcon name="warning" :size="18" class="shrink-0 mt-0.5" />
            <div class="leading-relaxed">
              {{ description }}
            </div>
          </div>
          <p v-else class="text-xs text-ink-muted leading-relaxed">
            {{ description }}
          </p>
        </slot>
      </div>

      <!-- Actions -->
      <div class="p-4 sm:p-5 border-t border-border-grid bg-bg-alternate flex items-center justify-end gap-3">
        <AppButton
          variant="outline"
          size="sm"
          :disabled="loading"
          @click="emit('close')"
        >
          {{ cancelText }}
        </AppButton>
        <AppButton
          :variant="variant === 'danger' ? 'danger' : 'fill'"
          size="sm"
          :loading="loading"
          @click="emit('confirm')"
        >
          {{ confirmText }}
        </AppButton>
      </div>
    </div>
  </div>
</template>
