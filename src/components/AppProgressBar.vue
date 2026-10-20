<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  value: number
  max?: number
  label?: string
  statusText?: string
  variant?: 'primary' | 'success' | 'info' | 'neutral'
}

const props = withDefaults(defineProps<Props>(), {
  max: 100,
  label: undefined,
  statusText: undefined,
  variant: 'primary',
})

const percentage = computed(() => {
  if (props.max <= 0) return 0
  const ratio = (props.value / props.max) * 100
  return Math.min(100, Math.max(0, Math.round(ratio)))
})

const fillVariantClasses = computed(() => {
  switch (props.variant) {
    case 'success':
      return 'bg-success'
    case 'info':
      return 'bg-info'
    case 'neutral':
      return 'bg-ink'
    case 'primary':
    default:
      return 'bg-primary-container'
  }
})

const statusColorClasses = computed(() => {
  switch (props.variant) {
    case 'success':
      return 'text-success'
    case 'info':
      return 'text-info'
    case 'neutral':
      return 'text-ink'
    case 'primary':
    default:
      return 'text-primary-container'
  }
})
</script>

<template>
  <div class="w-full select-none">
    <div v-if="label || statusText" class="flex items-center justify-between mb-2">
      <span v-if="label" class="font-headline-md text-[13px] sm:text-sm font-bold text-ink">
        {{ label }}
      </span>
      <span v-if="statusText" class="font-button-text text-xs font-bold" :class="statusColorClasses">
        {{ statusText }}
      </span>
    </div>

    <!-- Outer Track -->
    <div
      class="w-full h-3.5 bg-bg-alternate rounded-full border border-border-primary p-[1.5px] overflow-hidden"
      role="progressbar"
      :aria-valuenow="value"
      :aria-valuemin="0"
      :aria-valuemax="max"
    >
      <div
        class="h-full rounded-full transition-all duration-300 ease-out"
        :class="fillVariantClasses"
        :style="{ width: `${percentage}%` }"
      />
    </div>
  </div>
</template>
