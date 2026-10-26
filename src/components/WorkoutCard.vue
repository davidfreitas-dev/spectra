<script setup lang="ts">
import { computed } from 'vue'
import { AppCard, AppIcon } from '@/components'
import {
  calculateWorkoutEstimatedMinutes,
  getExerciseDetails,
  getWorkoutRequiredEquipment,
  formatEquipmentLabel,
} from '@/utils/workoutMetrics'
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

const requiredEquipment = computed(() => {
  return getWorkoutRequiredEquipment(props.workout)
})
</script>

<template>
  <AppCard
    :title="workout.name"
    :eyebrow="eyebrow"
    :dot-color="dotColor"
  >
    <div class="space-y-3.5">
      <!-- Equipamentos Exigidos & Quantidade de Exercícios -->
      <div class="flex items-center justify-between gap-2 flex-wrap text-xs">
        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-[10px] font-eyebrow font-bold uppercase text-ink-muted">
            Equipamentos:
          </span>
          <span
            v-for="eq in requiredEquipment"
            :key="eq"
            class="px-2 py-0.5 rounded text-[10px] font-bold font-eyebrow uppercase bg-bg-alternate border border-border-grid text-ink"
          >
            {{ formatEquipmentLabel(eq) }}
          </span>
        </div>

        <div class="sm:hidden flex items-center gap-2 text-ink-muted font-medium text-xs">
          <span>{{ workout.items.length }} exercícios</span>
          <span>•</span>
          <span>~{{ estimatedMinutes }} min</span>
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
