<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title?: string
  eyebrow?: string
  badge?: string
  dotColor?: 'primary' | 'ink' | 'error' | 'none'
  variant?: 'surface' | 'alternate'
  noPadding?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: undefined,
  eyebrow: undefined,
  badge: undefined,
  dotColor: 'none',
  variant: 'surface',
  noPadding: false,
})

const bgClass = computed(() => (props.variant === 'alternate' ? 'bg-bg-alternate' : 'bg-surface'))

const dotClass = computed(() => {
  if (props.dotColor === 'primary') return 'w-2.5 h-2.5 rounded-full bg-primary-container'
  if (props.dotColor === 'ink') return 'w-2.5 h-2.5 rounded-full bg-ink'
  if (props.dotColor === 'error') return 'w-2.5 h-2.5 rounded-full bg-error'
  return ''
})
</script>

<template>
  <div
    class="rounded-2xl border border-border-primary shadow-[0_4px_0_0_#111111] transition-all overflow-hidden flex flex-col"
    :class="[bgClass, noPadding ? '' : 'p-5 sm:p-6']"
  >
    <!-- Header -->
    <div
      v-if="title || eyebrow || badge || $slots.header"
      class="flex items-center justify-between pb-3 border-b border-border-grid mb-4"
    >
      <div class="flex items-center gap-2">
        <span v-if="dotColor !== 'none'" :class="dotClass" />
        <div>
          <div v-if="eyebrow" class="font-eyebrow text-[10px] text-primary-container uppercase font-bold tracking-wider">
            {{ eyebrow }}
          </div>
          <h3 v-if="title" class="font-headline-md text-base sm:text-lg text-ink font-bold">
            {{ title }}
          </h3>
        </div>
      </div>

      <slot name="header-right">
        <span
          v-if="badge"
          class="font-eyebrow text-[9px] px-2 py-0.5 rounded bg-bg-alternate border border-border-grid text-ink font-bold uppercase tracking-wider"
        >
          {{ badge }}
        </span>
      </slot>
    </div>

    <!-- Content -->
    <div class="flex-1 flex flex-col">
      <slot />
    </div>

    <!-- Footer -->
    <div v-if="$slots.footer" class="mt-4 pt-3 border-t border-border-grid">
      <slot name="footer" />
    </div>
  </div>
</template>
