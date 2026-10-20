<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  value: string | number
  label: string
  subtext?: string
  highlight?: boolean
  delta?: string
  deltaType?: 'positive' | 'negative' | 'neutral'
}

const props = withDefaults(defineProps<Props>(), {
  subtext: undefined,
  highlight: false,
  delta: undefined,
  deltaType: 'neutral',
})

const valueColorClass = computed(() => {
  if (props.highlight) return 'text-primary-container'
  return 'text-ink'
})

const deltaColorClass = computed(() => {
  switch (props.deltaType) {
    case 'positive':
      return 'text-success'
    case 'negative':
      return 'text-error'
    case 'neutral':
    default:
      return 'text-ink-muted'
  }
})
</script>

<template>
  <div class="bg-surface p-4 rounded-xl border border-border-primary shadow-[0_3px_0_0_#111111] flex flex-col justify-between transition-transform select-none">
    <div class="flex items-start justify-between gap-2">
      <div class="font-metric-number text-2xl sm:text-[28px] font-bold leading-none" :class="valueColorClass">
        {{ value }}
      </div>
      <span
        v-if="delta"
        class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold font-eyebrow uppercase"
        :class="deltaColorClass"
      >
        {{ delta }}
      </span>
    </div>

    <div class="mt-2">
      <div class="font-eyebrow text-eyebrow text-ink-muted uppercase tracking-wider font-medium">
        {{ label }}
      </div>
      <div v-if="subtext" class="font-body-sm text-[11px] text-ink-subtle mt-0.5">
        {{ subtext }}
      </div>
    </div>
  </div>
</template>
