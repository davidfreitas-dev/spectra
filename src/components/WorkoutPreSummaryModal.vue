<script setup lang="ts">
import { computed } from 'vue'
import { AppButton, AppModal, ProgressionSuggestionCard } from '@/components'
import { calculateWorkoutEstimatedMinutes, getExerciseDetails } from '@/utils/workoutMetrics'
import AppIcon from './AppIcon.vue'
import type { Workout } from '@/types/domain'
import type { ProgressionSuggestion } from '@/stores/sessionsStore'

const props = defineProps<{
  isOpen: boolean
  workout: Workout | null
  suggestions?: ProgressionSuggestion[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'start'): void
  (e: 'accept-suggestion', suggestion: ProgressionSuggestion): void
  (e: 'dismiss-suggestion', suggestion: ProgressionSuggestion): void
}>()

// Cálculo de estimativa aproximada de tempo (~X min)
const estimatedDurationMinutes = computed(() => {
  if (!props.workout) return 0
  return calculateWorkoutEstimatedMinutes(props.workout)
})
</script>

<template>
  <AppModal
    :is-open="isOpen && !!workout"
    eyebrow="Resumo Pré-Treino"
    :title="workout?.name"
    max-width="lg"
    @close="emit('close')"
  >
    <!-- Content -->
    <div v-if="workout" class="p-4 sm:p-6 space-y-4">
      <!-- Quick stats -->
      <div class="flex items-center gap-3">
        <div class="flex-1 p-3 rounded-xl border border-border-grid bg-surface">
          <span class="font-eyebrow text-[10px] uppercase text-ink-muted block">Exercícios</span>
          <span class="font-metric-number text-lg font-bold text-ink">
            {{ workout.items.length }}
          </span>
        </div>
        <div class="flex-1 p-3 rounded-xl border border-border-grid bg-surface">
          <span class="font-eyebrow text-[10px] uppercase text-ink-muted block">Tempo Estimado</span>
          <span class="font-metric-number text-lg font-bold text-ink">
            ~{{ estimatedDurationMinutes }} min
          </span>
        </div>
      </div>

      <!-- Progression Suggestions Card (if any) -->
      <ProgressionSuggestionCard
        v-if="suggestions && suggestions.length > 0"
        :suggestions="suggestions"
        @accept="(sug) => emit('accept-suggestion', sug)"
        @dismiss="(sug) => emit('dismiss-suggestion', sug)"
      />

      <!-- Exercise preview list -->
      <div class="space-y-2">
        <h4 class="font-eyebrow text-[11px] font-bold uppercase text-ink-muted tracking-wider">
          Sequência de Movimentos
        </h4>

        <div
          v-for="(item, idx) in workout.items"
          :key="item.id"
          class="flex items-center justify-between p-3 rounded-xl border border-border-grid bg-surface hover:bg-bg-alternate transition-colors"
        >
          <div class="flex items-center gap-3">
            <span class="w-6 h-6 rounded-md bg-bg-alternate border border-border-grid flex items-center justify-center font-metric-number text-xs font-bold text-ink">
              {{ idx + 1 }}
            </span>
            <div>
              <span class="font-bold text-sm text-ink block">
                {{ getExerciseDetails(item).name }}
              </span>
              <span class="text-xs text-ink-muted">
                Descanso: {{ item.restSeconds }}s
              </span>
            </div>
          </div>

          <div class="text-right">
            <span class="font-metric-number font-bold text-sm text-ink">
              {{ item.sets }} × {{ item.target }}
            </span>
            <span class="text-[11px] text-ink-muted block">
              {{ getExerciseDetails(item).measurementType === 'reps' ? 'repetições' : 'segundos' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Footer -->
    <template #footer>
      <div class="flex items-center justify-between gap-3">
        <AppButton variant="outline" @click="emit('close')">
          Voltar
        </AppButton>
        <AppButton
          variant="fill"
          size="lg"
          class="flex-1"
          data-tour="pre-summary-start-btn"
          @click="emit('start')"
        >
          <AppIcon name="play" :size="20" />
          Iniciar Treino
        </AppButton>
      </div>
    </template>
  </AppModal>
</template>
