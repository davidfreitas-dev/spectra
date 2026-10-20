<script setup lang="ts">
import { computed } from 'vue'
import type { SpinnerSize, SpinnerVariant } from '@/types'

interface Props {
  size?: SpinnerSize
  variant?: SpinnerVariant
  label?: string
  labelPosition?: 'right' | 'bottom'
  overlay?: boolean
  fullscreen?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  variant: 'primary',
  label: undefined,
  labelPosition: undefined,
  overlay: false,
  fullscreen: false,
})

const sizeDimensions = computed(() => {
  switch (props.size) {
    case 'xs':
      return { class: 'w-3.5 h-3.5', stroke: 3, dot: 1.5 }
    case 'sm':
      return { class: 'w-4 h-4', stroke: 3, dot: 1.6 }
    case 'lg':
      return { class: 'w-10 h-10', stroke: 3.2, dot: 2.2 }
    case 'xl':
      return { class: 'w-14 h-14', stroke: 3.5, dot: 2.6 }
    case 'md':
    default:
      return { class: 'w-6 h-6', stroke: 3, dot: 1.8 }
  }
})

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'ink':
      return {
        track: 'text-ink/15',
        spinner: 'text-ink',
        label: 'text-ink',
      }
    case 'surface':
      return {
        track: 'text-surface/25',
        spinner: 'text-surface',
        label: 'text-surface',
      }
    case 'muted':
      return {
        track: 'text-ink-subtle/20',
        spinner: 'text-ink-subtle',
        label: 'text-ink-muted',
      }
    case 'error':
      return {
        track: 'text-error/20',
        spinner: 'text-error',
        label: 'text-error',
      }
    case 'primary':
    default:
      return {
        track: 'text-primary-container/20',
        spinner: 'text-primary-container',
        label: 'text-ink',
      }
  }
})

const resolvedLabelPosition = computed(() => {
  if (props.labelPosition) return props.labelPosition
  return props.size === 'lg' || props.size === 'xl' || props.fullscreen || props.overlay ? 'bottom' : 'right'
})

const labelSizeClass = computed(() => {
  switch (props.size) {
    case 'xs':
    case 'sm':
      return 'text-xs font-medium'
    case 'lg':
    case 'xl':
      return 'text-sm font-bold tracking-wide'
    case 'md':
    default:
      return 'text-xs font-bold'
  }
})
</script>

<template>
  <!-- Fullscreen Modal Mode -->
  <div
    v-if="fullscreen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs animate-in fade-in duration-150"
    role="status"
    aria-live="polite"
  >
    <div
      class="bg-surface border-2 border-border-primary rounded-2xl px-6 py-5 flex flex-col items-center gap-3.5 shadow-[0_6px_0_0_#111111]"
    >
      <div :class="['relative inline-flex items-center justify-center', sizeDimensions.class]">
        <svg
          class="animate-spin w-full h-full"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="16"
            cy="16"
            r="12"
            stroke="currentColor"
            :stroke-width="sizeDimensions.stroke"
            :class="variantClasses.track"
          />
          <path
            d="M 16 4 A 12 12 0 1 1 4 16"
            stroke="currentColor"
            :stroke-width="sizeDimensions.stroke"
            stroke-linecap="round"
            :class="variantClasses.spinner"
          />
          <circle
            cx="4"
            cy="16"
            :r="sizeDimensions.dot"
            fill="currentColor"
            :class="variantClasses.spinner"
          />
        </svg>
      </div>

      <div v-if="label" :class="['font-eyebrow uppercase tracking-wider', labelSizeClass, variantClasses.label]">
        {{ label }}
      </div>
      <span class="sr-only">{{ label || 'Carregando dados...' }}</span>
    </div>
  </div>

  <!-- In-Card/In-Container Overlay Mode -->
  <div
    v-else-if="overlay"
    class="absolute inset-0 z-20 flex flex-col items-center justify-center p-4 bg-surface/85 backdrop-blur-xs rounded-inherit animate-in fade-in duration-150"
    role="status"
    aria-live="polite"
  >
    <div :class="['relative inline-flex items-center justify-center', sizeDimensions.class]">
      <svg
        class="animate-spin w-full h-full"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="16"
          cy="16"
          r="12"
          stroke="currentColor"
          :stroke-width="sizeDimensions.stroke"
          :class="variantClasses.track"
        />
        <path
          d="M 16 4 A 12 12 0 1 1 4 16"
          stroke="currentColor"
          :stroke-width="sizeDimensions.stroke"
          stroke-linecap="round"
          :class="variantClasses.spinner"
        />
        <circle
          cx="4"
          cy="16"
          :r="sizeDimensions.dot"
          fill="currentColor"
          :class="variantClasses.spinner"
        />
      </svg>
    </div>

    <div
      v-if="label"
      :class="['mt-2 font-eyebrow uppercase tracking-wider', labelSizeClass, variantClasses.label]"
    >
      {{ label }}
    </div>
    <span class="sr-only">{{ label || 'Carregando...' }}</span>
  </div>

  <!-- Standard Inline Spinner -->
  <div
    v-else
    class="inline-flex items-center"
    :class="[
      resolvedLabelPosition === 'bottom' ? 'flex-col gap-2' : 'flex-row gap-2.5',
    ]"
    role="status"
    aria-live="polite"
  >
    <div :class="['relative inline-flex items-center justify-center shrink-0', sizeDimensions.class]">
      <svg
        class="animate-spin w-full h-full"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="16"
          cy="16"
          r="12"
          stroke="currentColor"
          :stroke-width="sizeDimensions.stroke"
          :class="variantClasses.track"
        />
        <path
          d="M 16 4 A 12 12 0 1 1 4 16"
          stroke="currentColor"
          :stroke-width="sizeDimensions.stroke"
          stroke-linecap="round"
          :class="variantClasses.spinner"
        />
        <circle
          cx="4"
          cy="16"
          :r="sizeDimensions.dot"
          fill="currentColor"
          :class="variantClasses.spinner"
        />
      </svg>
    </div>

    <span
      v-if="label"
      :class="['font-eyebrow uppercase tracking-wider select-none', labelSizeClass, variantClasses.label]"
    >
      {{ label }}
    </span>
    <span class="sr-only">{{ label || 'Carregando...' }}</span>
  </div>
</template>
