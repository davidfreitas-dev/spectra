<script setup lang="ts">
import { computed } from 'vue'
import type { AlertVariant } from '@/types/components'
import type { AppIconName } from './icons'
import AppIcon from './AppIcon.vue'

interface Props {
  variant?: AlertVariant
  title?: string
  message?: string
  icon?: AppIconName
  dismissible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  title: undefined,
  message: undefined,
  icon: undefined,
  dismissible: false,
})

const emit = defineEmits<{
  (e: 'dismiss'): void
}>()

interface VariantConfig {
  containerClasses: string
  defaultIcon: AppIconName
  iconColorClass: string
  titleColorClass: string
}

const config = computed<VariantConfig>(() => {
  switch (props.variant) {
    case 'success':
      return {
        containerClasses: 'bg-success-container/30 border-border-primary',
        defaultIcon: 'check',
        iconColorClass: 'text-success',
        titleColorClass: 'text-success',
      }
    case 'info':
      return {
        containerClasses: 'bg-info-container/30 border-border-primary',
        defaultIcon: 'info',
        iconColorClass: 'text-info',
        titleColorClass: 'text-info',
      }
    case 'danger':
      return {
        containerClasses: 'bg-error-container/30 border-border-primary',
        defaultIcon: 'error',
        iconColorClass: 'text-error',
        titleColorClass: 'text-error',
      }
    case 'primary':
    default:
      return {
        containerClasses: 'bg-primary-container/10 border-border-primary',
        defaultIcon: 'zap',
        iconColorClass: 'text-primary-container',
        titleColorClass: 'text-primary-container',
      }
  }
})

const resolvedIcon = computed<AppIconName>(() => props.icon ?? config.value.defaultIcon)
</script>

<template>
  <div
    class="p-3 rounded-xl border flex items-start gap-2.5 transition-all text-ink"
    :class="config.containerClasses"
    role="alert"
  >
    <div
      class="shrink-0 mt-0.5"
      :class="config.iconColorClass"
    >
      <slot name="icon">
        <AppIcon :name="resolvedIcon" :size="18" />
      </slot>
    </div>

    <div class="flex-1 min-w-0">
      <h4
        v-if="title"
        class="font-bold text-xs leading-snug mb-0.5"
        :class="config.titleColorClass"
      >
        <slot name="title">{{ title }}</slot>
      </h4>
      <div class="text-xs text-ink leading-relaxed font-normal">
        <slot>{{ message }}</slot>
      </div>
    </div>

    <button
      v-if="dismissible"
      type="button"
      class="shrink-0 text-ink-muted hover:text-ink p-0.5 rounded cursor-pointer transition-colors"
      aria-label="Fechar alerta"
      @click="emit('dismiss')"
    >
      <AppIcon name="close" :size="14" />
    </button>
  </div>
</template>
