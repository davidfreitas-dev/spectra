<script setup lang="ts">
import { computed } from 'vue'
import AppIcon from './AppIcon.vue'

interface Props {
  modelValue: number
  min?: number
  max?: number
  step?: number
  unit?: string
  disabled?: boolean
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  min: 0,
  max: 999,
  step: 1,
  unit: '',
  disabled: false,
  label: undefined,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
}>()

const canDecrement = computed(() => !props.disabled && props.modelValue > props.min)
const canIncrement = computed(() => !props.disabled && props.modelValue < props.max)

function decrement() {
  if (!canDecrement.value) return
  const next = Math.max(props.min, props.modelValue - props.step)
  emit('update:modelValue', next)
}

function increment() {
  if (!canIncrement.value) return
  const next = Math.min(props.max, props.modelValue + props.step)
  emit('update:modelValue', next)
}
</script>

<template>
  <div class="w-full select-none" :class="{ 'opacity-60': disabled }">
    <div v-if="label" class="font-eyebrow text-[10px] text-ink-subtle uppercase mb-1 font-bold tracking-wider">
      {{ label }}
    </div>

    <div
      class="flex items-center h-11 w-full rounded-xl p-1 gap-1 transition-all"
      :class="disabled
        ? 'bg-surface-container border border-border-grid'
        : 'bg-surface border border-border-primary shadow-[0_2px_0_0_#111111]'"
    >
      <!-- Decrement Button -->
      <button
        type="button"
        :disabled="!canDecrement"
        class="w-9 h-full rounded-lg flex items-center justify-center font-bold transition-all outline-none"
        :class="disabled || !canDecrement
          ? 'bg-surface-container text-ink-subtle border border-border-grid cursor-not-allowed select-none opacity-50'
          : 'bg-bg-alternate hover:bg-surface-container-low active:bg-surface-container text-ink border border-border-grid active:translate-y-px'"
        aria-label="Diminuir valor"
        @click="decrement"
      >
        <slot name="minus-icon">
          <AppIcon name="minus" :size="16" />
        </slot>
      </button>

      <!-- Value Display -->
      <div
        class="flex-1 h-full flex items-center justify-center gap-1 font-metric-number text-metric-number font-bold px-2"
        :class="disabled ? 'bg-surface-container text-ink-subtle' : 'bg-surface text-ink'"
      >
        <span>{{ modelValue }}</span>
        <span v-if="unit" class="text-xs font-eyebrow text-ink-muted uppercase tracking-wider font-normal">
          {{ unit }}
        </span>
      </div>

      <!-- Increment Button -->
      <button
        type="button"
        :disabled="!canIncrement"
        class="w-9 h-full rounded-lg flex items-center justify-center font-bold transition-all outline-none"
        :class="disabled || !canIncrement
          ? 'bg-surface-container text-ink-subtle border border-border-grid cursor-not-allowed select-none opacity-50'
          : 'bg-primary-container hover:bg-primary-hover active:bg-[#d9591a] text-on-primary shadow-[0_1px_0_0_#a33e00] active:translate-y-px active:shadow-none'"
        aria-label="Aumentar valor"
        @click="increment"
      >
        <slot name="plus-icon">
          <AppIcon name="plus" :size="16" />
        </slot>
      </button>
    </div>
  </div>
</template>
