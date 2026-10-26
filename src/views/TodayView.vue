<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { useWorkoutsStore } from '@/stores/workoutsStore'
import { useSessionsStore, type ProgressionSuggestion } from '@/stores/sessionsStore'
import { useTourStore } from '@/stores/tourStore'
import { DAYS_OF_WEEK } from '@/constants/domain'
import { EXERCISE_CATALOG } from '@/data/exercises'
import { getExerciseDetails, getRecommendedPreset } from '@/utils/workoutMetrics'
import {
  AppButton,
  AppCard,
  AppPageHeader,
  WeeklyGoalCard,
  ProgressionSuggestionCard,
  AppStatusBadge,
  AppIcon,
  ScheduleDayModal,
  OnboardingModal,
  WorkoutEditorModal,
  AppSpotlightOverlay,
} from '@/components'
import type { OnboardingCompleteEvent } from '@/components/OnboardingModal.vue'
import type { Workout, WorkoutItem } from '@/types/domain'

const route = useRoute()
const router = useRouter()
const preferencesStore = usePreferencesStore()
const workoutsStore = useWorkoutsStore()
const sessionsStore = useSessionsStore()
const tourStore = useTourStore()

// Modais
const showScheduleModal = ref(false)
const selectedDayKey = ref<string | null>(null)
const showWelcomeBanner = ref(false)
const showWorkoutEditor = ref(false)

onMounted(() => {
  preferencesStore.load()
  workoutsStore.load()
  sessionsStore.load()
  checkStartQuery()
})

// Chave do dia de hoje (monday, tuesday, etc.)
const todayKey = computed(() => {
  const dayIndex = new Date().getDay() // 0 = Dom, 1 = Seg...
  const match = DAYS_OF_WEEK.find((d) => d.index === dayIndex)
  return match ? match.key : 'monday'
})

// Treino agendado para hoje
const todayWorkout = computed<Workout | null>(() => {
  const workoutId = preferencesStore.preferences.schedule?.[todayKey.value]
  if (!workoutId) return null
  return workoutsStore.getWorkoutById(workoutId) || null
})

// Sugestões de progressão para o treino de hoje
const todaySuggestions = computed<ProgressionSuggestion[]>(() => {
  if (!todayWorkout.value) return []
  return sessionsStore.getWorkoutSuggestions(todayWorkout.value)
})

// Meta semanal e treinos concluídos
const weeklyGoal = computed(() => preferencesStore.weeklyGoal)
const completedCount = computed(() => sessionsStore.completedThisWeek)

// Última sessão realizada no histórico
const lastSession = computed(() => {
  return sessionsStore.sessions.length > 0 ? sessionsStore.sessions[0] : null
})

function getExerciseName(exerciseId: string): string {
  const ex = EXERCISE_CATALOG.find((e) => e.id === exerciseId)
  return ex ? ex.name : exerciseId
}

function openScheduleForDay(dayKey: string) {
  selectedDayKey.value = dayKey
  showScheduleModal.value = true
}

function handleAssignDayWorkout(workoutId: string | null) {
  if (selectedDayKey.value) {
    preferencesStore.setDayWorkout(selectedDayKey.value, workoutId)
  }
}

function handleStartTodayWorkout() {
  if (tourStore.isTourActive && ['today-schedule', 'today-weekly-goal', 'today-start'].includes(tourStore.currentStepKey)) {
    tourStore.finishTour()
  }

  if (sessionsStore.activeSession) {
    router.push('/session')
  } else if (todayWorkout.value) {
    sessionsStore.startSession(todayWorkout.value)
    router.push('/session')
  } else {
    if (workoutsStore.workouts.length > 0) {
      openScheduleForDay(todayKey.value)
    } else {
      router.push('/workouts')
    }
  }
}

function checkStartQuery() {
  if (route.query.start === 'true') {
    handleStartTodayWorkout()
    router.replace({ path: '/', query: {} })
  }
}

watch(
  () => [route.query.start, route.query._t],
  ([start]) => {
    if (start === 'true') {
      checkStartQuery()
    }
  }
)

function handleAcceptSuggestion(suggestion: ProgressionSuggestion) {
  if (todayWorkout.value) {
    workoutsStore.updateExerciseTarget(
      todayWorkout.value.id,
      suggestion.exerciseId,
      suggestion.suggestedTarget
    )
  }
}

function handleDismissSuggestion(suggestion: ProgressionSuggestion) {
  if (todayWorkout.value) {
    workoutsStore.dismissSuggestion(todayWorkout.value.id, suggestion.exerciseId)
  }
}

function handleOpenEditTodayWorkout() {
  if (todayWorkout.value) {
    showWorkoutEditor.value = true
  }
}

function handleSaveWorkout(data: { id?: string; name: string; items: WorkoutItem[] }) {
  workoutsStore.saveWorkout(data)
  showWorkoutEditor.value = false
}

function handleOnboardingComplete(data: OnboardingCompleteEvent) {
  // Prepara o treino recomendado baseado no nível se o usuário escolheu 'recommended'
  let targetWorkoutId: string | null = null

  if (data.startChoice === 'recommended') {
    const recommended = getRecommendedPreset(data.level, data.equipment)
    const presetId = recommended.id

    // Procura se já tem nos treinos salvos ou copia
    const existing = workoutsStore.workouts.find((w) => w.id === presetId || w.name.startsWith(recommended.name))
    if (existing) {
      targetWorkoutId = existing.id
    } else {
      const copied = workoutsStore.copyPreset(presetId)
      targetWorkoutId = copied ? copied.id : workoutsStore.workouts[0]?.id || presetId
    }
  }

  // Monta a agenda semanal baseada estritamente nos dias selecionados no onboarding
  const newSchedule: Record<string, string | null> = {}
  for (const day of DAYS_OF_WEEK) {
    if (data.selectedDays.includes(day.key)) {
      newSchedule[day.key] = targetWorkoutId
    } else {
      newSchedule[day.key] = null
    }
  }

  preferencesStore.completeOnboarding(data.level, data.equipment, newSchedule)

  if (data.startChoice === 'presets') {
    router.push('/workouts?tab=presets')
  } else if (data.startChoice === 'custom') {
    router.push('/workouts?create=true')
  } else {
    showWelcomeBanner.value = true
  }
}

function formatSessionDate(isoString: string): string {
  const d = new Date(isoString)
  return d.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  })
}
</script>

<template>
  <div class="max-w-200 mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 select-none">
    <!-- View Header -->
    <AppPageHeader
      title="Hoje"
      eyebrow="Visão Geral do Dia"
    >
      <template #badge>
        <AppStatusBadge
          v-if="sessionsStore.activeSession"
          type="in_progress"
          label="Sessão em Andamento"
        />
        <AppStatusBadge
          v-else-if="todayWorkout"
          type="planned"
          label="Treino Agendado"
        />
        <AppStatusBadge
          v-else
          type="partial"
          label="Descanso"
        />
      </template>
    </AppPageHeader>

    <!-- Active Session Resume Banner (if any) -->
    <div
      v-if="sessionsStore.activeSession"
      class="p-4 sm:p-5 rounded-2xl border-2 border-primary-container bg-primary-container/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_3px_0_0_#f26a21]"
    >
      <div class="flex items-center gap-3">
        <span class="w-3 h-3 rounded-full bg-primary-container animate-pulse shrink-0" />
        <div>
          <span class="font-eyebrow text-[10px] uppercase font-bold text-primary-container tracking-wider block">
            Treino Não Finalizado
          </span>
          <h2 class="font-display text-lg font-bold text-ink">
            {{ sessionsStore.activeSession.workoutName }}
          </h2>
          <span class="text-xs text-ink-muted">
            Você tem uma sessão em execução salva no dispositivo.
          </span>
        </div>
      </div>

      <AppButton
        variant="fill"
        size="md"
        class="w-full sm:w-auto shrink-0"
        @click="router.push('/session')"
      >
        <AppIcon name="play" :size="20" />
        Retomar Treino
      </AppButton>
    </div>

    <!-- First Session Welcome Banner -->
    <div
      v-if="showWelcomeBanner && !sessionsStore.activeSession"
      class="p-5 rounded-2xl border-2 border-primary-container bg-primary-container/10 space-y-4 shadow-[0_3px_0_0_#f26a21] animate-in fade-in"
    >
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 rounded-xl bg-primary-container/20 border border-primary-container flex items-center justify-center text-primary-container shrink-0 mt-0.5">
            <AppIcon name="zap" :size="20" />
          </div>
          <div>
            <span class="font-eyebrow text-[10px] uppercase font-bold text-primary-container tracking-wider block">
              Bem-vindo ao Spectra
            </span>
            <h2 class="font-display text-base sm:text-lg font-bold text-ink">
              Sua rotina está configurada e você tem o controle total!
            </h2>
            <p class="text-xs text-ink-muted mt-0.5">
              Criamos o seu ponto de partida. Veja como aproveitar o app ao máximo:
            </p>
          </div>
        </div>

        <button
          type="button"
          class="text-ink-muted hover:text-ink p-1 rounded-lg transition-colors cursor-pointer shrink-0"
          title="Dispensar banner"
          @click="showWelcomeBanner = false"
        >
          <AppIcon name="close" :size="18" />
        </button>
      </div>

      <!-- 3 Pílulas de Recursos -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div class="p-3 rounded-xl bg-surface/90 border border-border-grid space-y-1">
          <div class="flex items-center gap-1.5 font-bold text-xs text-ink">
            <AppIcon name="edit" :size="14" class="text-primary-container" />
            <span>Personalize Tudo</span>
          </div>
          <p class="text-[11px] text-ink-muted leading-relaxed">
            Toque em "Personalizar" para alterar séries, repetições e tempos de descanso.
          </p>
        </div>

        <div class="p-3 rounded-xl bg-surface/90 border border-border-grid space-y-1">
          <div class="flex items-center gap-1.5 font-bold text-xs text-ink">
            <AppIcon name="body" :size="14" class="text-primary-container" />
            <span>+40 Exercícios</span>
          </div>
          <p class="text-[11px] text-ink-muted leading-relaxed">
            Consulte a biblioteca para aprender posturas corretas e variações de calistenia.
          </p>
        </div>

        <div class="p-3 rounded-xl bg-surface/90 border border-border-grid space-y-1">
          <div class="flex items-center gap-1.5 font-bold text-xs text-ink">
            <AppIcon name="trending_up" :size="14" class="text-primary-container" />
            <span>Evolução Real</span>
          </div>
          <p class="text-[11px] text-ink-muted leading-relaxed">
            O app calcula seus recordes (PRs) e sugere novas repetições automaticamente.
          </p>
        </div>
      </div>

      <div class="flex items-center justify-end gap-2 pt-1">
        <AppButton
          variant="outline"
          size="sm"
          @click="showWelcomeBanner = false"
        >
          Entendi
        </AppButton>
        <AppButton
          v-if="todayWorkout"
          variant="fill"
          size="sm"
          @click="handleStartTodayWorkout"
        >
          <AppIcon name="play" :size="16" />
          Iniciar Treino de Hoje
        </AppButton>
      </div>
    </div>

    <!-- Weekly Calendar Strip (Segunda a Domingo) -->
    <AppCard
      title="Agenda da Semana"
      eyebrow="Toque em um dia para agendar"
      data-tour="today-schedule"
    >
      <div class="grid grid-cols-7 gap-1.5 sm:gap-2">
        <button
          v-for="day in DAYS_OF_WEEK"
          :key="day.key"
          type="button"
          class="flex flex-col items-center justify-center py-2.5 px-1 rounded-xl border text-center transition-all cursor-pointer"
          :class="day.key === todayKey
            ? 'bg-primary-container text-on-primary border-border-primary shadow-[0_2px_0_0_#111111] font-bold'
            : preferencesStore.preferences.schedule?.[day.key]
              ? 'bg-surface text-ink border-border-primary hover:bg-bg-alternate font-bold'
              : 'bg-bg-alternate text-ink-muted border-border-grid hover:border-border-primary'"
          @click="openScheduleForDay(day.key)"
        >
          <span
            class="font-eyebrow text-[9px] uppercase tracking-wider block"
            :class="day.key === todayKey ? 'text-on-primary' : 'text-ink-muted'"
          >
            {{ day.shortLabel }}
          </span>

          <span class="font-metric-number text-xs sm:text-sm font-bold mt-1">
            <span
              v-if="preferencesStore.preferences.schedule?.[day.key]"
              class="w-2 h-2 rounded-full inline-block"
              :class="day.key === todayKey ? 'bg-on-primary' : 'bg-primary-container'"
            />
            <span v-else class="text-[10px]">—</span>
          </span>
        </button>
      </div>
    </AppCard>

    <!-- Weekly Target & Progress Card -->
    <WeeklyGoalCard
      :completed-count="completedCount"
      :weekly-goal="weeklyGoal"
      :sound-enabled="preferencesStore.preferences.soundEnabled"
      data-tour="today-weekly-goal"
    />

    <!-- Today's Prescribed Workout Card -->
    <AppCard
      v-if="todayWorkout"
      :title="todayWorkout.name"
      eyebrow="Rotina Prescrita para Hoje"
    >
      <div class="space-y-4">
        <!-- Progression Suggestions Card (if any) -->
        <ProgressionSuggestionCard
          :suggestions="todaySuggestions"
          @accept="handleAcceptSuggestion"
          @dismiss="handleDismissSuggestion"
        />

        <!-- Dica de Personalização -->
        <div class="px-3 py-2 rounded-lg bg-bg-alternate border border-border-grid flex items-center justify-between gap-2 text-xs text-ink-muted">
          <div class="flex items-center gap-2">
            <AppIcon name="edit" :size="14" class="text-primary-container shrink-0" />
            <span>Séries, repetições e tempos de descanso são 100% personalizáveis.</span>
          </div>
          <button
            type="button"
            class="text-xs font-bold text-primary-container hover:underline cursor-pointer shrink-0 hidden sm:inline"
            @click="handleOpenEditTodayWorkout"
          >
            Editar agora
          </button>
        </div>

        <div class="divide-y divide-border-grid">
          <div
            v-for="(item, idx) in todayWorkout.items"
            :key="item.id"
            class="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0"
          >
            <div class="flex items-center gap-3">
              <span class="w-6 h-6 rounded-lg bg-bg-alternate border border-border-grid flex items-center justify-center font-metric-number text-xs font-bold text-ink">
                {{ idx + 1 }}
              </span>
              <div>
                <div class="font-bold text-sm text-ink">
                  {{ getExerciseName(item.exerciseId) }}
                </div>
                <div class="text-xs text-ink-muted mt-0.5">
                  {{ item.sets }} séries × {{ item.target }} {{ getExerciseDetails(item.exerciseId).unit }} · {{ item.restSeconds }}s descanso
                </div>
              </div>
            </div>

            <span class="font-metric-number text-xs font-bold text-ink bg-bg-alternate px-2 py-1 rounded-md border border-border-grid">
              {{ item.sets }} Séries
            </span>
          </div>
        </div>

        <!-- Action Buttons: Personalizar e Iniciar -->
        <div class="pt-4 border-t border-border-grid grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <AppButton
            variant="outline"
            size="lg"
            class="w-full"
            title="Personalizar séries, repetições e descanso deste treino"
            @click="handleOpenEditTodayWorkout"
          >
            <AppIcon name="edit" :size="18" />
            <span>Personalizar Treino</span>
          </AppButton>

          <AppButton
            variant="fill"
            size="lg"
            class="w-full"
            data-tour="today-start-btn"
            @click="handleStartTodayWorkout"
          >
            <AppIcon
              :name="sessionsStore.activeSession ? 'replay' : 'play'"
              :size="20"
            />
            <span>{{ sessionsStore.activeSession ? 'Retomar Treino' : 'Iniciar Treino' }}</span>
          </AppButton>
        </div>
      </div>
    </AppCard>

    <!-- Rest Day Card (No workout scheduled today) -->
    <AppCard
      v-else
      title="Dia de Recuperação"
      eyebrow="Descanso Ativo"
    >
      <div class="space-y-4">
        <p class="text-sm text-ink-muted leading-relaxed">
          Nenhum treino agendado para hoje. Músculos se desenvolvem durante o descanso! Caso queira treinar mesmo assim, você pode agendar um treino para hoje ou escolher um treino avulso na biblioteca.
        </p>

        <div class="flex flex-col sm:flex-row items-center gap-2.5">
          <AppButton
            variant="fill"
            size="md"
            class="w-full sm:w-auto"
            @click="openScheduleForDay(todayKey)"
          >
            <AppIcon name="calendar" :size="16" />
            Agendar Treino para Hoje
          </AppButton>

          <AppButton
            variant="outline"
            size="md"
            class="w-full sm:w-auto"
            @click="router.push('/workouts')"
          >
            <AppIcon name="dumbbell" :size="16" />
            Escolher Treino Avulso
          </AppButton>
        </div>
      </div>
    </AppCard>

    <!-- Last Completed Session Card (if exists) -->
    <AppCard
      v-if="lastSession"
      title="Última Sessão Realizada"
      eyebrow="Histórico Recente"
    >
      <div class="flex items-center justify-between">
        <div>
          <span class="font-bold text-sm text-ink block">{{ lastSession.workoutName }}</span>
          <span class="text-xs text-ink-muted">
            {{ formatSessionDate(lastSession.startedAt) }} • {{ lastSession.status === 'completed' ? 'Concluída' : 'Parcial' }}
          </span>
        </div>

        <AppButton variant="ghost" size="sm" @click="router.push('/progress')">
          Ver Histórico
        </AppButton>
      </div>
    </AppCard>

    <!-- Schedule Day Modal -->
    <ScheduleDayModal
      :is-open="showScheduleModal"
      :day-key="selectedDayKey"
      :current-workout-id="selectedDayKey ? preferencesStore.preferences.schedule?.[selectedDayKey] || null : null"
      :workouts="workoutsStore.workouts"
      @close="showScheduleModal = false"
      @assign="handleAssignDayWorkout"
      @explore-workouts="router.push('/workouts')"
    />

    <!-- Workout Editor Modal (Direto da tela Hoje) -->
    <WorkoutEditorModal
      :is-open="showWorkoutEditor"
      :workout-to-edit="todayWorkout"
      :user-equipment="preferencesStore.preferences.equipment"
      @close="showWorkoutEditor = false"
      @save="handleSaveWorkout"
    />

    <!-- Onboarding Modal (Step 1 to 4 on first launch) -->
    <OnboardingModal
      :is-open="preferencesStore.isLoaded && !preferencesStore.preferences.onboardingDone"
      @complete="handleOnboardingComplete"
    />

    <!-- Interactive Spotlight Overlay (Initial Screen) -->
    <AppSpotlightOverlay step-key="today-schedule" />
    <AppSpotlightOverlay step-key="today-weekly-goal" />
    <AppSpotlightOverlay step-key="today-start" />
  </div>
</template>
