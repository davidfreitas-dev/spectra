<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title: string
  eyebrow?: string
  subtitle?: string
  dotColor?: 'primary' | 'ink' | 'success'
}

const props = withDefaults(defineProps<Props>(), {
  eyebrow: undefined,
  subtitle: undefined,
  dotColor: 'primary',
})

const dotColorClass = computed(() => {
  switch (props.dotColor) {
    case 'ink':
      return 'bg-ink'
    case 'success':
      return 'bg-success'
    case 'primary':
    default:
      return 'bg-primary-container'
  }
})
</script>

<template>
  <header class="flex flex-wrap items-center justify-between gap-y-3 gap-x-4 pb-4 border-b border-border-grid">
    <div class="order-1 sm:mr-auto min-w-0">
      <div
        v-if="eyebrow || $slots.eyebrow"
        class="inline-flex items-center gap-1.5 font-eyebrow text-[10px] text-primary-container font-bold uppercase tracking-wider mb-1"
      >
        <span class="w-2 h-2 rounded-xs inline-block shrink-0" :class="dotColorClass" />
        <slot name="eyebrow">
          <span>{{ eyebrow }}</span>
        </slot>
      </div>

      <h1 class="font-display text-2xl sm:text-3xl font-bold text-ink tracking-tight">
        <slot name="title">{{ title }}</slot>
      </h1>

      <p v-if="subtitle || $slots.subtitle" class="font-body text-xs text-ink-muted mt-1">
        <slot name="subtitle">{{ subtitle }}</slot>
      </p>
    </div>

    <div
      v-if="$slots.badge || $slots.actions || $slots.default"
      class="order-2 flex flex-wrap items-center gap-2 sm:gap-3 shrink-0"
    >
      <slot name="badge" />
      <slot name="actions" />
      <slot />
    </div>
  </header>
</template>
