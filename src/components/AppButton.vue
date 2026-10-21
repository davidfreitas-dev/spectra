<script setup lang="ts">
import { computed } from 'vue'
import type { ButtonVariant, ButtonShape, ButtonSize } from '@/types'
import AppSpinner from './AppSpinner.vue'

interface Props {
  variant?: ButtonVariant
  shape?: ButtonShape
  size?: ButtonSize
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
  title?: string
  iconOnly?: boolean
  pressed?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'fill',
  shape: 'rounded',
  size: 'md',
  disabled: false,
  loading: false,
  type: 'button',
  title: undefined,
  iconOnly: false,
  pressed: false,
})

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

function handleClick(event: MouseEvent) {
  if (props.disabled || props.loading) return
  emit('click', event)
}

const spinnerSize = computed(() => {
  if (props.size === 'sm') return 'xs'
  if (props.size === 'lg') return 'md'
  return 'sm'
})

const spinnerVariant = computed(() => {
  if (props.variant === 'fill') return 'surface'
  if (props.variant === 'danger') return 'error'
  return 'ink'
})

const sizeClasses = computed(() => {
  if (props.iconOnly) {
    switch (props.size) {
      case 'sm':
        return 'w-9 h-9 text-sm'
      case 'lg':
        return 'w-12 h-12 text-base'
      case 'md':
      default:
        return 'w-11 h-11 text-base'
    }
  }

  switch (props.size) {
    case 'sm':
      return 'h-9 px-3 text-xs gap-1.5'
    case 'lg':
      return 'h-12 px-6 text-sm gap-2.5'
    case 'md':
    default:
      return 'h-11 px-4 text-xs sm:text-sm gap-2'
  }
})

const shapeClasses = computed(() => {
  if (props.shape === 'circle') return 'rounded-full'
  if (props.shape === 'pill') return 'rounded-full'
  return 'rounded-xl'
})

const variantClasses = computed(() => {
  if (props.disabled) {
    return 'bg-surface-container text-ink-subtle border border-border-grid cursor-not-allowed opacity-60 shadow-none pointer-events-none select-none'
  }

  if (props.variant === 'fill') {
    if (props.pressed) {
      return 'bg-primary-hover text-on-primary shadow-[0_1px_0_0_#a33e00] translate-y-0.5'
    }
    const shadow = props.shape === 'pill' ? 'shadow-[0_2px_0_0_#a33e00]' : 'shadow-[0_3px_0_0_#a33e00]'
    return `bg-primary-container text-on-primary ${shadow} hover:bg-primary-hover active:translate-y-0.5 active:shadow-none`
  }

  if (props.variant === 'ghost') {
    return 'bg-transparent text-ink hover:bg-bg-alternate active:bg-surface-container-low border border-transparent'
  }

  if (props.variant === 'danger') {
    if (props.pressed) {
      return 'bg-error-container/30 text-error border border-error shadow-[0_1px_0_0_#ba1a1a] translate-y-0.5'
    }
    const shadow = props.shape === 'pill' ? 'shadow-[0_2px_0_0_#ba1a1a]' : 'shadow-[0_3px_0_0_#ba1a1a]'
    return `bg-error-container/20 text-error border border-error ${shadow} hover:bg-error-container/35 active:translate-y-0.5 active:shadow-[0_1px_0_0_#ba1a1a]`
  }

  // Outline
  if (props.pressed) {
    return 'bg-surface text-ink border border-border-primary shadow-[0_1px_0_0_#111111] translate-y-0.5'
  }
  const shadow = props.shape === 'pill' ? 'shadow-[0_2px_0_0_#111111]' : 'shadow-[0_3px_0_0_#111111]'
  return `bg-surface text-ink border border-border-primary ${shadow} hover:bg-surface-container-low active:translate-y-0.5 active:shadow-[0_1px_0_0_#111111]`
})
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :title="title"
    :aria-busy="loading"
    class="inline-flex items-center justify-center font-button-text font-bold tracking-tight select-none transition-all outline-none"
    :class="[sizeClasses, shapeClasses, variantClasses, loading ? 'cursor-wait opacity-85' : '']"
    @click="handleClick"
  >
    <template v-if="loading">
      <AppSpinner :size="spinnerSize" :variant="spinnerVariant" />
      <span v-if="!iconOnly">Aguarde...</span>
    </template>
    <slot v-else />
  </button>
</template>
