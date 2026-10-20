<script setup lang="ts">
import { computed } from 'vue'
import { EXERCISE_CATALOG } from '@/data/exercises'
import { AppButton } from '@/components'
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
  <div
    v-if="isOpen && workout"
    class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in duration-150"
    @click.self="emit('close')"
  >
    <div
      class="bg-surface border-t-2 sm:border-2 border-border-primary rounded-t-3xl sm:rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-[0_8px_0_0_#111111] overflow-hidden"
    >
      <!-- Header -->
      <div class="p-4 sm:p-5 border-b border-border-grid flex items-center justify-between bg-bg-alternate">
        <div>
          <span class="font-eyebrow text-[10px] text-primary-container font-bold uppercase tracking-wider block">
            Resumo Pré-Treino
          </span>
          <h2 class="font-display text-xl font-bold text-ink">
            {{ workout.name }}
          </h2>
        </div>
        <button
          type="button"
          class="w-9 h-9 flex items-center justify-center rounded-lg border border-border-grid bg-surface hover:bg-bg-alternate text-ink font-bold cursor-pointer transition-colors"
          @click="emit('close')"
        >
          <span class="material-symbols-outlined !text-lg">close</span>
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
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
            <span class="material-symbols-outlined text-primary-container !text-lg">trending_up</span>
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
                <span class="material-symbols-outlined !text-xs text-primary-container">arrow_forward</span>
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
      <div class="p-4 border-t border-border-grid bg-bg-alternate flex items-center justify-between gap-3">
        <AppButton variant="outline" @click="emit('close')">
          Voltar
        </AppButton>
        <AppButton
          variant="fill"
          size="lg"
          class="flex-1"
          @click="emit('start')"
        >
          <template #icon>
            <span class="material-symbols-outlined !text-xl">play_arrow</span>
          </template>
          Começar Treino
        </AppButton>
      </div>
    </div>
  </div>
</template>
