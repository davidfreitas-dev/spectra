<script setup lang="ts">
import { computed } from 'vue'
import { AppCard, AppIcon } from '@/components'
import { calculateWorkoutEstimatedMinutes, getExerciseDetails } from '@/utils/workoutMetrics'
import type { Workout } from '@/types/domain'

interface Props {
  workout: Workout
  eyebrow?: string
  dotColor?: 'primary' | 'ink'
}

const props = withDefaults(defineProps<Props>(), {
  eyebrow: undefined,
  dotColor: 'primary',
})

const estimatedMinutes = computed(() => {
  return calculateWorkoutEstimatedMinutes(props.workout)
})
</script>

<template>
  <AppCard
    :title="workout.name"
    :eyebrow="eyebrow"
    :dot-color="dotColor"
  >
    <div class="space-y-4">
      <!-- Informações de quantidade de exercícios e tempo estimado (apenas mobile) -->
      <div class="sm:hidden flex items-center justify-between px-3 py-2 rounded-xl bg-bg-alternate border border-border-grid text-xs text-ink-muted">
        <div class="flex items-center gap-1.5 font-medium">
          <AppIcon name="dumbbell" :size="14" class="text-primary-container" />
          <span><strong class="text-ink font-bold">{{ workout.items.length }}</strong> exercícios</span>
        </div>
        <div class="h-3.5 w-px bg-border-grid" />
        <div class="flex items-center gap-1.5 font-medium">
          <AppIcon name="clock" :size="14" class="text-primary-container" />
          <span>Estimado: <strong class="text-ink font-bold">~{{ estimatedMinutes }} min</strong></span>
        </div>
      </div>

      <!-- Exercícios do treino em grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div
          v-for="item in workout.items"
          :key="item.id"
          class="py-2.5 px-3 rounded-lg bg-bg-alternate border border-border-grid flex items-center justify-between"
        >
          <div>
            <div class="font-bold text-xs text-ink">
              {{ getExerciseDetails(item.exerciseId).name }}
            </div>
            <div class="text-[11px] text-ink-muted">
              {{ item.sets }} séries × {{ item.target }} {{ getExerciseDetails(item.exerciseId).unit }}
            </div>
          </div>
          <span
            class="font-metric-number text-[10px] font-bold"
            :class="dotColor === 'ink' ? 'text-ink-muted' : 'text-primary-container'"
          >
            {{ item.restSeconds }}s desc.
          </span>
        </div>
      </div>
    </div>

    <!-- Rodapé: Métricas no desktop e Slot para Botões de Ação -->
    <template #footer>
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full">
        <!-- Info de exercícios e tempo (tablet e desktop) -->
        <div class="hidden sm:inline-flex sm:items-center gap-2 font-eyebrow text-xs text-ink-muted shrink-0">
          <span class="inline-flex items-center gap-1.5">
            <AppIcon name="dumbbell" :size="14" class="text-primary-container" />
            <span>{{ workout.items.length }} exercícios</span>
          </span>
          <span class="text-border-primary">•</span>
          <span class="inline-flex items-center gap-1.5">
            <AppIcon name="clock" :size="14" class="text-primary-container" />
            <span>~{{ estimatedMinutes }} min</span>
          </span>
        </div>

        <!-- Slot de Ações -->
        <div
          v-if="$slots.actions"
          class="w-full sm:w-auto ml-auto"
        >
          <slot name="actions" :workout="workout" />
        </div>
      </div>
    </template>
  </AppCard>
</template>
