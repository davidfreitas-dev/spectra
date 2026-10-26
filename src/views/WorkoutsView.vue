<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useWorkoutsStore } from '@/stores/workoutsStore'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { useSessionsStore, type ProgressionSuggestion } from '@/stores/sessionsStore'
import { DAYS_OF_WEEK } from '@/constants/domain'
import { useBodyScrollLock } from '@/composables/useBodyScrollLock'
import {
  AppButton,
  AppChip,
  AppEmptyState,
  AppIcon,
  AppPageHeader,
  AppSegmentedControl,
  WorkoutCard,
  WorkoutEditorModal,
  WorkoutPreSummaryModal,
  WorkoutScheduleModal,
} from '@/components'
import { canUserPerformWorkout, getWorkoutRequiredEquipment } from '@/utils/workoutMetrics'
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

const selectedPresetFilter = ref<string>('all')

const presetFilters = computed(() => [
  { id: 'all', label: `Todos (${workoutsStore.presets.length})` },
  { id: 'compatible', label: 'Compatíveis Comigo' },
  { id: 'none', label: 'Peso Corporal' },
  { id: 'bar', label: 'Barra' },
  { id: 'rope', label: 'Corda' },
  { id: 'band', label: 'Elástico' },
])

const filteredPresets = computed(() => {
  return workoutsStore.presets.filter((preset) => {
    if (selectedPresetFilter.value === 'all') return true
    if (selectedPresetFilter.value === 'compatible') {
      return canUserPerformWorkout(preset, preferencesStore.preferences.equipment)
    }
    const required = getWorkoutRequiredEquipment(preset)
    return required.includes(selectedPresetFilter.value as any)
  })
})

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

useBodyScrollLock(showDeleteConfirm)

onMounted(() => {
  workoutsStore.load()
  preferencesStore.load()
  sessionsStore.load()
  if (route.query.tab === 'presets') {
    activeTab.value = 'presets'
  }
  if (route.query.create === 'true') {
    handleNewWorkout()
  }
})

watch(
  () => [route.query.create, route.query.tab],
  ([createVal, tabVal]) => {
    if (tabVal === 'presets') {
      activeTab.value = 'presets'
    } else if (tabVal === 'user') {
      activeTab.value = 'user'
    }
    if (createVal === 'true') {
      handleNewWorkout()
    }
  }
)

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
    <AppPageHeader
      title="Treinos"
      eyebrow="Biblioteca de Rotinas"
    >
      <template #actions>
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
      </template>
    </AppPageHeader>

    <!-- User Workouts Tab -->
    <div v-if="activeTab === 'user'" class="space-y-4">
      <AppEmptyState
        v-if="workoutsStore.workouts.length === 0"
        title="Você ainda não tem treinos criados"
        description="Crie uma rotina personalizada com seus exercícios favoritos ou copie um dos modelos prontos na aba ao lado."
        icon="dumbbell"
      >
        <template #actions>
          <AppButton variant="fill" size="md" @click="handleNewWorkout">
            <AppIcon name="plus" :size="18" />
            <span>Criar Primeiro Treino</span>
          </AppButton>
        </template>
      </AppEmptyState>

      <div
        v-for="workout in workoutsStore.workouts"
        :key="workout.id"
      >
        <WorkoutCard
          :workout="workout"
          :eyebrow="getScheduledDays(workout.id).length > 0 ? `Agendado: ${getScheduledDays(workout.id).join(', ')}` : 'Não agendado'"
          dot-color="primary"
        >
          <template #actions>
            <div class="flex items-center justify-end gap-1.5 flex-wrap ml-auto">
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
                title="Iniciar Treino"
                @click="handleStartWorkout(workout)"
              >
                <AppIcon name="play" :size="16" />
                Iniciar
              </AppButton>
            </div>
          </template>
        </WorkoutCard>
      </div>
    </div>

    <!-- Preset Workouts Tab -->
    <div v-else class="space-y-4">
      <div class="p-3.5 rounded-xl border border-border-grid bg-bg-alternate flex items-start gap-3">
        <AppIcon name="copy" :size="18" class="text-primary-container shrink-0 mt-0.5" />
        <div class="text-xs text-ink-muted leading-relaxed">
          <strong class="text-ink font-bold">Modelos testados para evolução consistente.</strong>
          Toque em <span class="font-bold text-ink">"Copiar Treino"</span> para personalizar séries, repetições, tempos de descanso e agendar na sua semana.
        </div>
      </div>

      <!-- Filter chips for presets -->
      <div class="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <AppChip
          v-for="filter in presetFilters"
          :key="filter.id"
          :label="filter.label"
          :selected="selectedPresetFilter === filter.id"
          class="shrink-0"
          @click="selectedPresetFilter = filter.id"
        />
      </div>

      <AppEmptyState
        v-if="filteredPresets.length === 0"
        variant="dashed"
        title="Nenhum modelo encontrado"
        description="Tente selecionar outro filtro de equipamento."
        icon="search"
      />

      <div
        v-for="preset in filteredPresets"
        :key="preset.id"
      >
        <WorkoutCard
          :workout="preset"
          eyebrow="Modelo Pronto"
          dot-color="ink"
        >
          <template #actions>
            <div class="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
              <AppButton
                variant="outline"
                size="sm"
                class="w-full sm:w-auto"
                title="Copiar para Meus Treinos"
                @click="handleCopyPreset(preset.id)"
              >
                <AppIcon name="copy" :size="16" />
                <span class="sm:hidden truncate">Copiar Treino</span>
                <span class="hidden sm:inline">Copiar para Meus Treinos</span>
              </AppButton>

              <AppButton
                variant="fill"
                size="sm"
                class="w-full sm:w-auto"
                title="Iniciar Treino"
                @click="handleStartWorkout(preset)"
              >
                <AppIcon name="play" :size="16" />
                <span>Iniciar</span>
              </AppButton>
            </div>
          </template>
        </WorkoutCard>
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
    <Transition name="modal-pop">
      <div
        v-if="showDeleteConfirm && workoutToDelete"
        class="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs select-none"
        @click.self="showDeleteConfirm = false"
        @touchmove.self.prevent
      >
        <div
          class="modal-card bg-surface border-2 border-border-primary rounded-2xl w-full max-w-sm p-5 shadow-[0_8px_0_0_#111111] space-y-4"
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
    </Transition>
  </div>
</template>
