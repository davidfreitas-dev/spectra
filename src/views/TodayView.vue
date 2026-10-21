<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { useWorkoutsStore } from '@/stores/workoutsStore'
import { useSessionsStore, type ProgressionSuggestion } from '@/stores/sessionsStore'
import { DAYS_OF_WEEK } from '@/constants/domain'
import { EXERCISE_CATALOG } from '@/data/exercises'
import {
  AppButton,
  AppCard,
  AppProgressBar,
  AppStatusBadge,
  AppIcon,
  ScheduleDayModal,
  WorkoutPreSummaryModal,
  OnboardingModal,
} from '@/components'
import type { Workout, UserLevel, Equipment } from '@/types/domain'

const route = useRoute()
const router = useRouter()
const preferencesStore = usePreferencesStore()
const workoutsStore = useWorkoutsStore()
const sessionsStore = useSessionsStore()

// Modais
const showScheduleModal = ref(false)
const selectedDayKey = ref<string | null>(null)
const showPreSummaryModal = ref(false)
const workoutForSummary = ref<Workout | null>(null)

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
  if (sessionsStore.activeSession) {
    router.push('/session')
  } else if (todayWorkout.value) {
    workoutForSummary.value = todayWorkout.value
    showPreSummaryModal.value = true
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

function handleOnboardingComplete(data: { level: UserLevel; equipment: Equipment[] }) {
  preferencesStore.completeOnboarding(data.level, data.equipment)
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
    <div class="flex items-center justify-between pb-4 border-b border-border-grid">
      <div>
        <div class="inline-flex items-center gap-1.5 font-eyebrow text-[10px] text-primary-container font-bold uppercase tracking-wider mb-1">
          <span class="w-2 h-2 rounded-xs bg-primary-container inline-block" />
          <span>Visão Geral do Dia</span>
        </div>
        <h1 class="font-display text-2xl sm:text-3xl font-bold text-ink tracking-tight">
          Hoje
        </h1>
      </div>

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
    </div>

    <!-- Active Session Resume Banner (if any) -->
    <div
      v-if="sessionsStore.activeSession"
      class="p-4 sm:p-5 rounded-2xl border-2 border-primary-container bg-primary-container/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_4px_0_0_#111111]"
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

    <!-- Weekly Calendar Strip (Segunda a Domingo) -->
    <AppCard title="Agenda da Semana" eyebrow="Toque em um dia para agendar">
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
    <AppCard title="Meta Semanal" eyebrow="Derivada dos dias agendados">
      <div v-if="weeklyGoal > 0" class="space-y-4">
        <AppProgressBar
          :value="completedCount"
          :max="weeklyGoal"
          :label="`Meta da Semana: ${completedCount} de ${weeklyGoal} treinos`"
          :status-text="`${Math.min(100, Math.round((completedCount / weeklyGoal) * 100))}% concluído`"
          variant="success"
        />
        <p class="font-body text-xs text-ink-muted leading-relaxed">
          Sua meta é calculada automaticamente a partir da sua agenda. Sessões concluídas contam para a semana atual (segunda a domingo).
        </p>
      </div>

      <div v-else class="text-center py-4 space-y-2">
        <p class="text-xs text-ink-muted">
          Nenhum treino agendado para esta semana. Toque em qualquer dia acima para definir sua rotina semanal.
        </p>
      </div>
    </AppCard>

    <!-- Today's Prescribed Workout Card -->
    <AppCard
      v-if="todayWorkout"
      :title="todayWorkout.name"
      eyebrow="Rotina Prescrita para Hoje"
    >
      <div class="space-y-4">
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
                  {{ item.sets }} séries × {{ item.target }} {{ getExerciseName(item.exerciseId).includes('Prancha') ? 's' : 'reps' }} · {{ item.restSeconds }}s descanso
                </div>
              </div>
            </div>

            <span class="font-metric-number text-xs font-bold text-ink bg-bg-alternate px-2 py-1 rounded-md border border-border-grid">
              {{ item.sets }} Séries
            </span>
          </div>
        </div>

        <!-- Action Button -->
        <div class="pt-4 border-t border-border-grid">
          <AppButton
            variant="fill"
            size="lg"
            class="w-full"
            @click="handleStartTodayWorkout"
          >
            <AppIcon
              :name="sessionsStore.activeSession ? 'replay' : 'play'"
              :size="20"
            />
            <span>{{ sessionsStore.activeSession ? 'Retomar Treino em Andamento' : 'Iniciar Treino de Hoje' }}</span>
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
          Nenhum treino agendado para hoje. Músculos se desenvolvem durante o descanso! Caso queira treinar mesmo assim, escolha um treino avulso na biblioteca de treinos.
        </p>
        <AppButton variant="outline" size="md" @click="router.push('/workouts')">
          Escolher Treino Avulso
        </AppButton>
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

    <!-- Pre-Workout Summary Modal -->
    <WorkoutPreSummaryModal
      :is-open="showPreSummaryModal"
      :workout="workoutForSummary"
      :suggestions="todaySuggestions"
      @close="showPreSummaryModal = false"
      @start="handleConfirmStartWorkout"
      @accept-suggestion="handleAcceptSuggestion"
      @dismiss-suggestion="handleDismissSuggestion"
    />

    <!-- Onboarding Modal (Step 1 & 2 on first launch) -->
    <OnboardingModal
      :is-open="preferencesStore.isLoaded && !preferencesStore.preferences.onboardingDone"
      @complete="handleOnboardingComplete"
    />
  </div>
</template>
