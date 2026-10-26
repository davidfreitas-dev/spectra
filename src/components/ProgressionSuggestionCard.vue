<script setup lang="ts">
import { AppButton, AppIcon } from '@/components'
import type { ProgressionSuggestion } from '@/stores/sessionsStore'

defineProps<{
  suggestions: ProgressionSuggestion[]
}>()

const emit = defineEmits<{
  (e: 'accept', suggestion: ProgressionSuggestion): void
  (e: 'dismiss', suggestion: ProgressionSuggestion): void
}>()
</script>

<template>
  <div
    v-if="suggestions && suggestions.length > 0"
    class="p-4 rounded-xl border-2 border-primary-container bg-primary-container/10 space-y-3"
  >
    <div class="flex items-center gap-2">
      <AppIcon name="trending_up" :size="18" class="text-primary-container" />
      <span class="font-bold text-xs uppercase text-primary-container tracking-wider">
        Sugestão de Progressão Disponível
      </span>
    </div>

    <div
      v-for="sug in suggestions"
      :key="sug.exerciseId"
      class="p-3 rounded-lg bg-surface border border-border-grid space-y-2"
    >
      <div class="flex items-center justify-between">
        <span class="font-bold text-sm text-ink">{{ sug.exerciseName }}</span>
        <div class="flex items-center gap-1.5 font-metric-number text-xs font-bold text-ink">
          <span class="text-ink-muted line-through">{{ sug.currentTarget }}</span>
          <AppIcon name="arrow_right" :size="12" class="text-primary-container" />
          <span class="text-primary-container bg-primary-container/15 px-1.5 py-0.5 rounded">
            {{ sug.suggestedTarget }} {{ sug.measurementType === 'reps' ? 'reps' : 's' }}
          </span>
        </div>
      </div>

      <p class="text-xs text-ink-muted">
        {{ sug.reason }}
      </p>

      <div class="flex items-center gap-2 pt-1">
        <AppButton
          variant="fill"
          size="sm"
          @click="emit('accept', sug)"
        >
          Aceitar
        </AppButton>
        <AppButton
          variant="ghost"
          size="sm"
          @click="emit('dismiss', sug)"
        >
          Ignorar
        </AppButton>
      </div>
    </div>
  </div>
</template>
