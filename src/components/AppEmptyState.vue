<script setup lang="ts">
import { computed } from 'vue'
import AppIcon from './AppIcon.vue'
import type { AppIconName } from './icons'

interface Props {
  title: string
  description?: string
  icon?: AppIconName
  variant?: 'card' | 'dashed'
}

const props = withDefaults(defineProps<Props>(), {
  icon: 'dumbbell',
  variant: 'card',
})

const isDashed = computed(() => props.variant === 'dashed')
</script>

<template>
  <div
    class="text-center select-none"
    :class="[
      isDashed
        ? 'p-6 sm:p-8 border-2 border-dashed border-border-grid rounded-2xl bg-bg-alternate/50 space-y-3'
        : 'p-8 sm:p-12 rounded-2xl border-2 border-border-primary bg-surface space-y-4 shadow-[0_4px_0_0_#111111]'
    ]"
  >
    <!-- Icon Container -->
    <div
      class="flex items-center justify-center mx-auto transition-transform"
      :class="[
        isDashed
          ? 'w-10 h-10 rounded-full bg-surface border border-border-grid text-ink-muted'
          : 'w-14 h-14 rounded-2xl bg-bg-alternate border border-border-grid text-primary-container'
      ]"
    >
      <slot name="icon">
        <AppIcon :name="icon" :size="isDashed ? 20 : 28" />
      </slot>
    </div>

    <!-- Title and Description -->
    <div :class="isDashed ? '' : 'space-y-1'">
      <component
        :is="isDashed ? 'h4' : 'h3'"
        class="font-bold text-ink"
        :class="isDashed ? 'text-sm block' : 'font-display text-xl'"
      >
        {{ title }}
      </component>

      <slot>
        <p
          v-if="description"
          class="text-xs text-ink-muted max-w-md mx-auto leading-relaxed"
          :class="isDashed ? 'mt-0.5' : ''"
        >
          {{ description }}
        </p>
      </slot>
    </div>

    <!-- Actions slot -->
    <div
      v-if="$slots.actions"
      class="flex flex-wrap items-center justify-center gap-3"
      :class="isDashed ? 'pt-1' : 'pt-2'"
    >
      <slot name="actions" />
    </div>
  </div>
</template>
