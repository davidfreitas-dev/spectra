<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useWorkoutsStore } from '@/stores/workoutsStore'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { useSessionsStore, type ProgressionSuggestion } from '@/stores/sessionsStore'
import { EXERCISE_CATALOG } from '@/data/exercises'
import { DAYS_OF_WEEK } from '@/constants/domain'
import {
  AppButton,
  AppCard,
  AppIcon,
  AppSegmentedControl,
  WorkoutEditorModal,
  WorkoutPreSummaryModal,
  WorkoutScheduleModal,
} from '@/components'
import type { Workout, WorkoutItem } from '@/types/domain'
import type { SegmentedOption } from '@/types'

const router = useRouter()
const route = useRoute()
const workoutsStore = useWorkoutsStore()
const preferencesStore = usePreferencesStore()
const sessionsStore = useSessionsStore()

const activeTab = ref<'user' | 'presets'>('user')

const tabOptions = computed<SegmentedOption[]>(() => [
  { value: 'user', label: `Meus Treinos (${workoutsStore.workouts.length})` },
  { value: 'presets', label: `Modelos Prontos (${workoutsStore.presets.length})` },
])

// Modais
const showEditorModal = ref(false)
const workoutToEdit = ref<Workout | null>(null)

const showPreSummaryModal = ref(false)
const workoutForSummary = ref<Workout | null>(null)

const showScheduleModal = ref(false)
const workoutToSchedule = ref<Workout | null>(null)

// Exclusão com confirmação
const workoutToDelete = ref<Workout | null>(null)
const showDeleteConfirm = ref(false)

onMounted(() => {
  workoutsStore.load()
  preferencesStore.load()
  sessionsStore.load()
  if (route.query.create === 'true') {
    handleNewWorkout()
  }
})

watch(
  () => route.query.create,
  (val) => {
    if (val === 'true') {
      handleNewWorkout()
    }
  }
)

function getExerciseDetails(item: WorkoutItem) {
  const catalog = EXERCISE_CATALOG.find((e) => e.id === item.exerciseId)
  return {
    name: catalog?.name || 'Exercício',
    measurementType: catalog?.measurementType || 'reps',
  }
}

function calculateEstimatedMinutes(workout: Workout): number {
  let totalSeconds = 0
  for (const item of workout.items) {
    const isDuration = getExerciseDetails(item).measurementType === 'duration'
    const execSeconds = isDuration ? item.target : item.target * 3
    totalSeconds += (execSeconds + item.restSeconds) * item.sets
  }
  return Math.max(5, Math.round(totalSeconds / 60))
}

function getScheduledDays(workoutId: string): string[] {
  const schedule = preferencesStore.preferences.schedule || {}
  const days: string[] = []
  for (const [dayKey, id] of Object.entries(schedule)) {
    if (id === workoutId) {
      const match = DAYS_OF_WEEK.find((d) => d.key === dayKey)
      if (match) days.push(match.shortLabel)
    }
  }
  return days
}

// Sugestões de progressão para o treino selecionado
const currentSuggestions = computed<ProgressionSuggestion[]>(() => {
  if (!workoutForSummary.value) return []
  return sessionsStore.getWorkoutSuggestions(workoutForSummary.value)
})

// Handlers de Treino
function handleNewWorkout() {
  workoutToEdit.value = null
  showEditorModal.value = true
}

function handleEditWorkout(workout: Workout) {
  workoutToEdit.value = workout
  showEditorModal.value = true
}

function handleSaveWorkout(data: { id?: string; name: string; items: WorkoutItem[] }) {
  workoutsStore.saveWorkout(data)
}

function handleDuplicateWorkout(id: string) {
  workoutsStore.duplicateWorkout(id)
}

function confirmDeleteWorkout(workout: Workout) {
  workoutToDelete.value = workout
  showDeleteConfirm.value = true
}

function executeDeleteWorkout() {
  if (workoutToDelete.value) {
    workoutsStore.deleteWorkout(workoutToDelete.value.id)
    workoutToDelete.value = null
    showDeleteConfirm.value = false
  }
}

function handleCopyPreset(presetId: string) {
  const copied = workoutsStore.copyPreset(presetId)
  if (copied) {
    activeTab.value = 'user'
  }
}

function handleStartWorkout(workout: Workout) {
  workoutForSummary.value = workout
  showPreSummaryModal.value = true
}

function handleConfirmStartWorkout() {
  if (!workoutForSummary.value) return
  sessionsStore.startSession(workoutForSummary.value)
  showPreSummaryModal.value = false
  router.push('/session')
}

function handleAcceptSuggestion(suggestion: ProgressionSuggestion) {
  if (workoutForSummary.value) {
    workoutsStore.updateExerciseTarget(
      workoutForSummary.value.id,
      suggestion.exerciseId,
      suggestion.suggestedTarget
    )
  }
}

function handleDismissSuggestion(suggestion: ProgressionSuggestion) {
  if (workoutForSummary.value) {
    workoutsStore.dismissSuggestion(workoutForSummary.value.id, suggestion.exerciseId)
  }
}

function openSchedulePicker(workout: Workout) {
  workoutToSchedule.value = workout
  showScheduleModal.value = true
}

function handleSaveSchedule(selectedDayKeys: string[]) {
  if (!workoutToSchedule.value) return
  const targetId = workoutToSchedule.value.id
  const currentSchedule = preferencesStore.preferences.schedule || {}

  DAYS_OF_WEEK.forEach((d) => {
    const isSelected = selectedDayKeys.includes(d.key)
    const isCurrent = currentSchedule[d.key] === targetId

    if (isSelected && !isCurrent) {
      preferencesStore.setDayWorkout(d.key, targetId)
    } else if (!isSelected && isCurrent) {
      preferencesStore.setDayWorkout(d.key, null)
    }
  })

  showScheduleModal.value = false
  workoutToSchedule.value = null
}
</script>

<template>
  <div class="max-w-225 mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 select-none">
    <!-- View Header -->
    <div class="flex flex-wrap items-center justify-between gap-y-3 gap-x-4 pb-4 border-b border-border-grid">
      <div class="order-1 sm:mr-auto min-w-0">
        <div class="inline-flex items-center gap-1.5 font-eyebrow text-[10px] text-primary-container font-bold uppercase tracking-wider mb-1">
          <span class="w-2 h-2 rounded-xs bg-primary-container inline-block" />
          <span>Biblioteca de Rotinas</span>
        </div>
        <h1 class="font-display text-2xl sm:text-3xl font-bold text-ink tracking-tight">
          Treinos
        </h1>
      </div>

      <AppButton
        v-if="activeTab === 'user'"
        variant="fill"
        size="sm"
        class="order-2 sm:order-3 shrink-0"
        @click="handleNewWorkout"
      >
        <AppIcon name="plus" :size="16" />
        Novo Treino
      </AppButton>

      <!-- Segmented Tab Toggle -->
      <AppSegmentedControl
        :model-value="activeTab"
        :options="tabOptions"
        class="order-3 sm:order-2 w-full sm:w-auto"
        @update:model-value="(val) => (activeTab = val as 'user' | 'presets')"
      />
    </div>

    <!-- User Workouts Tab -->
    <div v-if="activeTab === 'user'" class="space-y-4">
      <div v-if="workoutsStore.workouts.length === 0" class="py-12 text-center text-ink-muted text-sm space-y-3">
        <p>Você ainda não tem treinos criados.</p>
        <AppButton variant="fill" size="md" @click="handleNewWorkout">
          Criar Primeiro Treino
        </AppButton>
      </div>

      <div
        v-for="workout in workoutsStore.workouts"
        :key="workout.id"
      >
        <AppCard
          :title="workout.name"
          :eyebrow="getScheduledDays(workout.id).length > 0 ? `Agendado: ${getScheduledDays(workout.id).join(', ')}` : 'Não agendado'"
          dot-color="primary"
        >
          <div class="space-y-4">
            <!-- Exercícios do treino em grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div
                v-for="item in workout.items"
                :key="item.id"
                class="p-2.5 rounded-lg bg-bg-alternate border border-border-grid flex items-center justify-between"
              >
                <div>
                  <div class="font-bold text-xs text-ink">
                    {{ getExerciseDetails(item).name }}
                  </div>
                  <div class="text-[11px] text-ink-muted">
                    {{ item.sets }} séries × {{ item.target }} {{ getExerciseDetails(item).measurementType === 'reps' ? 'reps' : 's' }}
                  </div>
                </div>
                <span class="font-metric-number text-[10px] text-primary-container font-bold">
                  {{ item.restSeconds }}s desc.
                </span>
              </div>
            </div>

            <!-- Card Actions -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border-grid">
              <span class="font-eyebrow text-xs text-ink-muted">
                {{ workout.items.length }} exercícios • ~{{ calculateEstimatedMinutes(workout) }} min
              </span>

              <div class="flex items-center gap-1.5 flex-wrap">
                <AppButton
                  variant="outline"
                  size="sm"
                  :icon-only="true"
                  title="Agendar na semana"
                  @click="openSchedulePicker(workout)"
                >
                  <AppIcon name="calendar" :size="16" />
                </AppButton>

                <AppButton
                  variant="outline"
                  size="sm"
                  :icon-only="true"
                  title="Duplicar treino"
                  @click="handleDuplicateWorkout(workout.id)"
                >
                  <AppIcon name="copy" :size="16" />
                </AppButton>

                <AppButton
                  variant="outline"
                  size="sm"
                  :icon-only="true"
                  title="Editar treino"
                  @click="handleEditWorkout(workout)"
                >
                  <AppIcon name="edit" :size="16" />
                </AppButton>

                <AppButton
                  variant="danger"
                  size="sm"
                  :icon-only="true"
                  title="Excluir treino"
                  @click="confirmDeleteWorkout(workout)"
                >
                  <AppIcon name="trash" :size="16" />
                </AppButton>

                <AppButton
                  variant="fill"
                  size="sm"
                  class="ml-1"
                  @click="handleStartWorkout(workout)"
                >
                  <AppIcon name="play" :size="16" />
                  Iniciar
                </AppButton>
              </div>
            </div>
          </div>
        </AppCard>
      </div>
    </div>

    <!-- Preset Workouts Tab -->
    <div v-else class="space-y-4">
      <div
        v-for="preset in workoutsStore.presets"
        :key="preset.id"
      >
        <AppCard
          :title="preset.name"
          eyebrow="Modelo Pronto (Estático)"
          dot-color="ink"
        >
          <div class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div
                v-for="item in preset.items"
                :key="item.id"
                class="p-2.5 rounded-lg bg-bg-alternate border border-border-grid flex items-center justify-between"
              >
                <div>
                  <div class="font-bold text-xs text-ink">
                    {{ getExerciseDetails(item).name }}
                  </div>
                  <div class="text-[11px] text-ink-muted">
                    {{ item.sets }} séries × {{ item.target }} {{ getExerciseDetails(item).measurementType === 'reps' ? 'reps' : 's' }}
                  </div>
                </div>
                <span class="font-metric-number text-[10px] text-ink-muted font-bold">
                  {{ item.restSeconds }}s desc.
                </span>
              </div>
            </div>

            <div class="flex items-center justify-between pt-3 border-t border-border-grid">
              <span class="font-eyebrow text-xs text-ink-muted">
                {{ preset.items.length }} exercícios • ~{{ calculateEstimatedMinutes(preset) }} min
              </span>

              <div class="flex items-center gap-2">
                <AppButton
                  variant="outline"
                  size="sm"
                  @click="handleCopyPreset(preset.id)"
                >
                  <AppIcon name="copy" :size="16" />
                  Copiar para Meus Treinos
                </AppButton>

                <AppButton
                  variant="fill"
                  size="sm"
                  @click="handleStartWorkout(preset)"
                >
                  <AppIcon name="play" :size="16" />
                  Iniciar
                </AppButton>
              </div>
            </div>
          </div>
        </AppCard>
      </div>
    </div>

    <!-- Workout Editor Modal -->
    <WorkoutEditorModal
      :is-open="showEditorModal"
      :workout-to-edit="workoutToEdit"
      :user-equipment="preferencesStore.preferences.equipment"
      @close="showEditorModal = false"
      @save="handleSaveWorkout"
    />

    <!-- Pre-Workout Summary Modal -->
    <WorkoutPreSummaryModal
      :is-open="showPreSummaryModal"
      :workout="workoutForSummary"
      :suggestions="currentSuggestions"
      @close="showPreSummaryModal = false"
      @start="handleConfirmStartWorkout"
      @accept-suggestion="handleAcceptSuggestion"
      @dismiss-suggestion="handleDismissSuggestion"
    />

    <!-- Workout Schedule Modal (Assign workout to days of week) -->
    <WorkoutScheduleModal
      :is-open="showScheduleModal"
      :workout="workoutToSchedule"
      :schedule="preferencesStore.preferences.schedule || {}"
      :all-workouts="workoutsStore.workouts"
      @close="showScheduleModal = false"
      @save="handleSaveSchedule"
    />

    <!-- Delete Confirmation Modal -->
    <div
      v-if="showDeleteConfirm && workoutToDelete"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in duration-150"
      @click.self="showDeleteConfirm = false"
    >
      <div
        class="bg-surface border-2 border-border-primary rounded-2xl w-full max-w-sm p-5 shadow-[0_8px_0_0_#111111] space-y-4"
      >
        <div class="space-y-1">
          <h3 class="font-display text-lg font-bold text-ink">
            Excluir Treino?
          </h3>
          <p class="text-xs text-ink-muted leading-relaxed">
            Tem certeza de que deseja excluir "{{ workoutToDelete.name }}"? As sessões passadas permanecerão intactas no histórico.
          </p>
        </div>

        <div class="flex items-center justify-end gap-2 pt-2">
          <AppButton variant="outline" size="sm" @click="showDeleteConfirm = false">
            Cancelar
          </AppButton>
          <AppButton variant="danger" size="sm" @click="executeDeleteWorkout">
            Sim, Excluir
          </AppButton>
        </div>
      </div>
    </div>
  </div>
</template>
