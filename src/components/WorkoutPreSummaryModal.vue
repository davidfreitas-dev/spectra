<script setup lang="ts">
import { computed } from 'vue'
import { EXERCISE_CATALOG } from '@/data/exercises'
import { AppButton, AppModal } from '@/components'
import AppIcon from './AppIcon.vue'
import type { Workout, WorkoutItem } from '@/types/domain'
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

function getExerciseDetails(item: WorkoutItem) {
  const catalog = EXERCISE_CATALOG.find((e) => e.id === item.exerciseId)
  return {
    name: catalog?.name || 'Exercício',
    measurementType: catalog?.measurementType || 'reps',
  }
}

// Cálculo de estimativa aproximada de tempo (~X min)
const estimatedDurationMinutes = computed(() => {
  if (!props.workout) return 0
  let totalSeconds = 0
  for (const item of props.workout.items) {
    const isDuration = getExerciseDetails(item).measurementType === 'duration'
    // Tempo estimado da série de execução: se reps ~ 3s por rep, se duração = target
    const setExecSeconds = isDuration ? item.target : item.target * 3
    const totalSetTime = (setExecSeconds + item.restSeconds) * item.sets
    totalSeconds += totalSetTime
  }
  return Math.max(5, Math.round(totalSeconds / 60))
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
              @click="emit('accept-suggestion', sug)"
            >
              Aceitar
            </AppButton>
            <AppButton
              variant="ghost"
              size="sm"
              @click="emit('dismiss-suggestion', sug)"
            >
              Ignorar
            </AppButton>
          </div>
        </div>
      </div>

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
