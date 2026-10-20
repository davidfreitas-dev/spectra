<script setup lang="ts">
import { computed } from 'vue'
import type { CheckboxSize, CheckboxColor } from '@/types'

interface Props {
  modelValue?: boolean
  label?: string
  description?: string
  size?: CheckboxSize
  color?: CheckboxColor
  disabled?: boolean
  indeterminate?: boolean
  name?: string
  value?: string
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  label: undefined,
  description: undefined,
  size: 'md',
  color: 'primary',
  disabled: false,
  indeterminate: false,
  name: undefined,
  value: undefined,
  id: undefined,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'change', value: boolean): void
}>()

function handleChange(event: Event) {
  if (props.disabled) return
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.checked)
  emit('change', target.checked)
}

const boxSizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'w-4 h-4 rounded-md border-2'
    case 'lg':
      return 'w-6 h-6 rounded-lg border-2'
    case 'md':
    default:
      return 'w-5 h-5 rounded-md border-2'
  }
})

const iconSizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'w-2.5 h-2.5 stroke-[2.5]'
    case 'lg':
      return 'w-4 h-4 stroke-[3]'
    case 'md':
    default:
      return 'w-3.5 h-3.5 stroke-[3]'
  }
})

const boxStateClasses = computed(() => {
  if (props.disabled) {
    return 'bg-surface-container border-border-grid text-ink-subtle opacity-50 shadow-none cursor-not-allowed'
  }

  const isChecked = props.modelValue || props.indeterminate

  if (isChecked) {
    if (props.color === 'ink') {
      return 'bg-ink text-surface border-border-primary shadow-[0_1.5px_0_0_#111111] active:translate-y-px active:shadow-none cursor-pointer'
    }
    return 'bg-primary-container text-on-primary border-border-primary shadow-[0_1.5px_0_0_#111111] active:translate-y-px active:shadow-none cursor-pointer'
  }

  return 'bg-surface text-transparent border-border-primary shadow-[0_1.5px_0_0_#111111] active:translate-y-px active:shadow-none cursor-pointer'
})

const labelSizeClass = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'text-xs'
    case 'lg':
      return 'text-base'
    case 'md':
    default:
      return 'text-sm'
  }
})
</script>

<template>
  <label
    class="inline-flex gap-2 select-none transition-opacity"
    :class="[
      description ? 'items-start' : 'items-center',
      disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer group',
    ]"
  >
    <div :class="['relative flex items-center justify-center shrink-0', description ? 'mt-0.5' : '']">
      <input
        :id="id"
        type="checkbox"
        :checked="modelValue"
        :disabled="disabled"
        :name="name"
        :value="value"
        class="sr-only peer"
        @change="handleChange"
      />
      <div
        :class="[
          boxSizeClasses,
          boxStateClasses,
          'flex items-center justify-center transition-all peer-focus-visible:ring-2 peer-focus-visible:ring-primary-container peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background',
        ]"
      >
        <!-- Checkmark SVG -->
        <svg
          v-if="modelValue && !indeterminate"
          :class="iconSizeClasses"
          class="fill-none stroke-current"
          viewBox="0 0 16 16"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <polyline points="3.5 8.5 6.5 11.5 12.5 4.5" />
        </svg>

        <!-- Indeterminate Dash SVG -->
        <svg
          v-else-if="indeterminate"
          :class="iconSizeClasses"
          class="fill-none stroke-current"
          viewBox="0 0 16 16"
          stroke-linecap="round"
          aria-hidden="true"
        >
          <line x1="3.5" y1="8" x2="12.5" y2="8" />
        </svg>
      </div>
    </div>

    <div v-if="label || description || $slots.default" class="flex flex-col">
      <span
        v-if="label || $slots.default"
        class="font-button-text font-bold text-ink leading-tight group-hover:text-ink transition-colors"
        :class="labelSizeClass"
      >
        <slot>{{ label }}</slot>
      </span>
      <p
        v-if="description"
        class="text-xs text-ink-muted leading-relaxed mt-0.5"
      >
        {{ description }}
      </p>
    </div>
  </label>
</template>
