<script setup lang="ts">
import { computed } from 'vue'
import AppIcon from './AppIcon.vue'
import type { SelectOption } from '@/types'

interface Props {
  modelValue: string | number
  options: SelectOption[]
  label?: string
  error?: string
  hint?: string
  disabled?: boolean
  placeholder?: string
  required?: boolean
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: undefined,
  error: undefined,
  hint: undefined,
  disabled: false,
  placeholder: undefined,
  required: false,
  id: undefined,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string): void
}>()

const selectId = computed(() => props.id || (props.label ? `select-${props.label.toLowerCase().replace(/\s+/g, '-')}` : undefined))

function handleChange(event: Event) {
  const target = event.target as HTMLSelectElement
  emit('update:modelValue', target.value)
  emit('change', target.value)
}

const selectClasses = computed(() => {
  if (props.disabled) {
    return 'bg-surface-container text-ink-subtle border border-border-grid cursor-not-allowed select-none shadow-none'
  }
  if (props.error) {
    return 'bg-surface border-2 border-error text-error shadow-[0_2px_0_0_#93000a]'
  }
  return 'bg-surface border border-border-primary text-ink shadow-[0_2px_0_0_#111111] cursor-pointer focus:shadow-[0_2px_0_0_#a33e00] focus:border-primary-container'
})
</script>

<template>
  <div class="w-full" :class="{ 'opacity-75': disabled }">
    <label
      v-if="label"
      :for="selectId"
      class="block font-headline-md text-[13px] font-bold mb-1.5 transition-colors select-none"
      :class="error ? 'text-error' : disabled ? 'text-ink-subtle' : 'text-ink'"
    >
      {{ label }}
      <span v-if="required" class="text-primary-container">*</span>
    </label>

    <div class="relative flex items-center">
      <select
        :id="selectId"
        :value="modelValue"
        :disabled="disabled"
        :required="required"
        class="w-full h-11 px-3 pr-9 rounded-lg font-body-md appearance-none outline-none transition-all"
        :class="selectClasses"
        @change="handleChange"
      >
        <option v-if="placeholder" value="" disabled :selected="!modelValue">
          {{ placeholder }}
        </option>
        <option
          v-for="opt in options"
          :key="opt.value"
          :value="opt.value"
          :disabled="opt.disabled"
        >
          {{ opt.label }}
        </option>
      </select>

      <div class="absolute right-2.5 flex items-center pointer-events-none" :class="disabled ? 'text-ink-subtle' : error ? 'text-error' : 'text-ink'">
        <slot name="icon">
          <AppIcon v-if="disabled" name="lock" :size="18" />
          <AppIcon v-else-if="error" name="error" :size="18" />
          <AppIcon v-else name="chevron_down" :size="18" />
        </slot>
      </div>
    </div>

    <p v-if="error" class="mt-1.5 font-body-sm text-[11px] text-error font-medium flex items-center gap-1 select-none">
      <span>{{ error }}</span>
    </p>
    <p v-else-if="hint" class="mt-1.5 font-body-sm text-[11px] text-ink-muted select-none">
      {{ hint }}
    </p>
  </div>
</template>
