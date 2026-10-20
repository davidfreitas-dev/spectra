<script setup lang="ts">
import { computed } from 'vue'
import type { ChipVariant } from '@/types'

interface Props {
  label?: string
  selected?: boolean
  shape?: ChipVariant
  color?: 'primary' | 'dark'
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  label: undefined,
  selected: false,
  shape: 'rounded',
  color: 'primary',
  disabled: false,
})

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

function handleClick(event: MouseEvent) {
  if (props.disabled) return
  emit('click', event)
}

const shapeClasses = computed(() => {
  switch (props.shape) {
    case 'pill':
      return 'rounded-full px-2.5 py-1 text-[11px]'
    case 'tag':
      return 'rounded px-2 py-0.5 text-[10px] font-eyebrow uppercase font-bold tracking-wider'
    case 'rounded':
    default:
      return 'rounded-lg px-2.5 py-1 text-[11px]'
  }
})

const stateClasses = computed(() => {
  if (props.disabled) {
    return 'bg-surface-container text-ink-subtle border border-border-grid cursor-not-allowed opacity-60 shadow-none pointer-events-none'
  }

  if (props.selected) {
    if (props.color === 'dark') {
      return 'bg-ink text-surface border border-border-primary shadow-[0_2px_0_0_#111111]'
    }
    return 'bg-primary-container text-on-primary border border-border-primary shadow-[0_2px_0_0_#111111]'
  }

  // Unselected
  if (props.shape === 'tag') {
    return 'bg-bg-alternate text-ink border border-border-primary shadow-[0_1px_0_0_#111111] hover:bg-surface'
  }
  return 'bg-surface text-ink border border-border-primary shadow-[0_2px_0_0_#111111] hover:bg-surface-container-low active:translate-y-px active:shadow-none'
})
</script>

<template>
  <button
    type="button"
    :disabled="disabled"
    class="inline-flex items-center gap-1 font-button-text font-bold select-none leading-none transition-all outline-none shrink-0 whitespace-nowrap cursor-pointer"
    :class="[shapeClasses, stateClasses]"
    @click="handleClick"
  >
    <slot name="icon">
      <span
        v-if="selected"
        class="material-symbols-outlined !text-[13px] !leading-none w-3.5 h-3.5 flex items-center justify-center shrink-0"
      >
        {{ shape === 'tag' ? 'done' : 'check' }}
      </span>
    </slot>
    <span><slot>{{ label }}</slot></span>
  </button>
</template>
