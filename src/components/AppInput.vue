<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue?: string | number
  label?: string
  placeholder?: string
  type?: string
  error?: string
  hint?: string
  disabled?: boolean
  readonly?: boolean
  id?: string
  required?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  label: undefined,
  placeholder: '',
  type: 'text',
  error: undefined,
  hint: undefined,
  disabled: false,
  readonly: false,
  id: undefined,
  required: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
}>()

const inputId = computed(() => props.id || (props.label ? `input-${props.label.toLowerCase().replace(/\s+/g, '-')}` : undefined))

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

const inputClasses = computed(() => {
  if (props.disabled) {
    return 'bg-surface-container text-ink-subtle border border-border-grid cursor-not-allowed select-none shadow-none'
  }
  if (props.error) {
    return 'bg-surface border-2 border-error text-error shadow-[0_2px_0_0_#93000a] focus:ring-0'
  }
  return 'bg-surface border border-border-primary text-ink shadow-[0_2px_0_0_#111111] focus:shadow-[0_2px_0_0_#a33e00] focus:border-primary-container'
})
</script>

<template>
  <div class="w-full" :class="{ 'opacity-75': disabled }">
    <label
      v-if="label"
      :for="inputId"
      class="block font-headline-md text-[13px] font-bold mb-1.5 transition-colors select-none"
      :class="error ? 'text-error' : disabled ? 'text-ink-subtle' : 'text-ink'"
    >
      {{ label }}
      <span v-if="required" class="text-primary-container">*</span>
    </label>

    <div class="relative flex items-center">
      <div v-if="$slots.left" class="absolute left-3 flex items-center pointer-events-none text-ink-muted">
        <slot name="left" />
      </div>

      <input
        :id="inputId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        class="w-full h-11 rounded-lg font-body-md transition-all outline-none"
        :class="[
          inputClasses,
          $slots.left ? 'pl-9' : 'pl-3',
          $slots.right || error || disabled ? 'pr-9' : 'pr-3',
        ]"
        @input="handleInput"
        @focus="emit('focus', $event)"
        @blur="emit('blur', $event)"
      />

      <div v-if="error" class="absolute right-2.5 flex items-center pointer-events-none text-error">
        <slot name="error-icon">
          <span class="material-symbols-outlined text-lg">error</span>
        </slot>
      </div>
      <div v-else-if="disabled" class="absolute right-2.5 flex items-center pointer-events-none text-ink-subtle">
        <slot name="disabled-icon">
          <span class="material-symbols-outlined text-base">lock</span>
        </slot>
      </div>
      <div v-else-if="$slots.right" class="absolute right-2.5 flex items-center text-ink-muted">
        <slot name="right" />
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
