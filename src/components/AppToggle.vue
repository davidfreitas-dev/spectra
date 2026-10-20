<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue: boolean
  label?: string
  description?: string
  disabled?: boolean
  standalone?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  label: undefined,
  description: undefined,
  disabled: false,
  standalone: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'change', value: boolean): void
}>()

function toggle() {
  if (props.disabled) return
  const next = !props.modelValue
  emit('update:modelValue', next)
  emit('change', next)
}

const trackClasses = computed(() => {
  if (props.disabled) {
    return 'bg-surface-container border-border-grid cursor-not-allowed opacity-60'
  }
  if (props.modelValue) {
    return 'bg-primary-container border-border-primary shadow-[0_1px_0_0_#111111] cursor-pointer'
  }
  return 'bg-surface-container border-border-primary shadow-[0_1px_0_0_#111111] cursor-pointer'
})

const knobClasses = computed(() => {
  if (props.disabled) {
    return 'bg-ink-subtle/40 translate-x-0'
  }
  if (props.modelValue) {
    return 'bg-surface border border-border-primary shadow-sm translate-x-6'
  }
  return 'bg-surface border border-border-primary shadow-sm translate-x-0'
})
</script>

<template>
  <div
    v-if="!standalone && (label || description)"
    class="flex items-center justify-between p-3 rounded-xl transition-colors select-none"
    :class="disabled
      ? 'bg-surface-container-low border border-border-grid opacity-60'
      : 'bg-bg-alternate border border-border-grid'"
    @click="toggle"
  >
    <div class="pr-3">
      <div
        v-if="label"
        class="font-headline-md text-[13px] font-bold"
        :class="disabled ? 'text-ink-subtle' : 'text-ink'"
      >
        {{ label }}
      </div>
      <div
        v-if="description"
        class="font-body-sm text-[11px]"
        :class="disabled ? 'text-ink-subtle' : 'text-ink-muted'"
      >
        {{ description }}
      </div>
    </div>

    <!-- Switch Track -->
    <button
      type="button"
      role="switch"
      :aria-checked="modelValue"
      :disabled="disabled"
      class="w-12 h-6 rounded-full border p-0.5 flex items-center transition-colors outline-none shrink-0"
      :class="trackClasses"
    >
      <span
        class="w-5 h-5 rounded-full transition-transform duration-200 inline-block pointer-events-none"
        :class="knobClasses"
      />
    </button>
  </div>

  <!-- Standalone Switch (without wrapper) -->
  <button
    v-else
    type="button"
    role="switch"
    :aria-checked="modelValue"
    :disabled="disabled"
    class="w-12 h-6 rounded-full border p-0.5 flex items-center transition-colors outline-none shrink-0 select-none"
    :class="trackClasses"
    @click="toggle"
  >
    <span
      class="w-5 h-5 rounded-full transition-transform duration-200 inline-block pointer-events-none"
      :class="knobClasses"
    />
  </button>
</template>
