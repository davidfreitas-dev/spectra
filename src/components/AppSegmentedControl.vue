<script setup lang="ts">
import type { SegmentedOption } from '@/types'

interface Props {
  modelValue: string | number
  options: SegmentedOption[]
  label?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  label: undefined,
  disabled: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
  (e: 'change', value: string | number): void
}>()

function select(option: SegmentedOption) {
  if (props.disabled || option.disabled) return
  emit('update:modelValue', option.value)
  emit('change', option.value)
}
</script>

<template>
  <div class="w-full select-none" :class="{ 'opacity-60': disabled }">
    <div v-if="label" class="font-eyebrow text-[10px] text-ink-subtle uppercase mb-1.5 font-bold tracking-wider">
      {{ label }}
    </div>

    <div
      class="p-1 rounded-xl bg-bg-alternate border border-border-primary flex items-center gap-1"
      role="group"
    >
      <button
        v-for="opt in options"
        :key="opt.value"
        type="button"
        :disabled="disabled || opt.disabled"
        class="flex-1 py-2 px-3 rounded-lg font-button-text text-xs text-center transition-all outline-none"
        :class="opt.value === modelValue
          ? 'bg-surface border border-border-primary shadow-[0_2px_0_0_#111111] text-ink font-bold active:translate-y-px active:shadow-none'
          : 'text-ink-muted hover:text-ink font-medium border border-transparent'"
        @click="select(opt)"
      >
        {{ opt.label }}
      </button>
    </div>
  </div>
</template>
