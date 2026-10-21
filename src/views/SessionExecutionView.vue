<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionsStore } from '@/stores/sessionsStore'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { EXERCISE_CATALOG } from '@/data/exercises'
import { useWakeLock } from '@/composables/useWakeLock'
import { useSound } from '@/composables/useSound'
import { useBodyScrollLock } from '@/composables/useBodyScrollLock'
import {
  AppButton,
  AppStepper,
  AppProgressBar,
  AppIcon,
  ExerciseDetailModal,
} from '@/components'
import type { SessionExercise, ExerciseCatalogItem } from '@/types/domain'

const router = useRouter()
const sessionsStore = useSessionsStore()
const preferencesStore = usePreferencesStore()
const { requestWakeLock, releaseWakeLock } = useWakeLock()
const { playTimerComplete, playSetComplete } = useSound()

// Modais locais
const showQuitModal = ref(false)
const showSummaryModal = ref(false)
const showDetailModal = ref(false)
const selectedExerciseDetail = ref<ExerciseCatalogItem | null>(null)
const sessionNote = ref('')

useBodyScrollLock(showQuitModal)
useBodyScrollLock(showSummaryModal)

// Stepper input para a série atual (pré-preenchido com a meta)
const currentActualInput = ref<number>(10)

// Timestamp atual para atualização dos timers de descanso e duração
const now = ref(Date.now())
let clockInterval: ReturnType<typeof setInterval> | null = null

onMounted(async () => {
  sessionsStore.load()
  if (!sessionsStore.activeSession) {
    router.replace('/')
    return
  }

  // Ativa Wake Lock para manter a tela do celular ligada durante o treino
  await requestWakeLock()

  clockInterval = setInterval(() => {
    now.value = Date.now()
  }, 250)

  // Inicializa stepper com a meta atual
  syncInputWithCurrentSet()
})

onUnmounted(() => {
  if (clockInterval) clearInterval(clockInterval)
  releaseWakeLock()
})

// Sessão e exercício atuais
const session = computed(() => sessionsStore.activeSession)
const currentExerciseIndex = computed(() => session.value?.current?.exerciseIndex ?? 0)
const currentSetIndex = computed(() => session.value?.current?.setIndex ?? 0)

const currentExercise = computed<SessionExercise | null>(() => {
  if (!session.value) return null
  return session.value.exercises[currentExerciseIndex.value] || null
})

const currentCatalogItem = computed<ExerciseCatalogItem | null>(() => {
  if (!currentExercise.value) return null
  return EXERCISE_CATALOG.find((e) => e.id === currentExercise.value?.exerciseId) || null
})

const currentSet = computed(() => {
  if (!currentExercise.value) return null
  return currentExercise.value.sets[currentSetIndex.value] || null
})

function syncInputWithCurrentSet() {
  if (currentSet.value) {
    currentActualInput.value = currentSet.value.actualValue ?? currentSet.value.plannedValue
  }
}

// Sincroniza sempre que a série ou exercício mudar
watch([currentExerciseIndex, currentSetIndex], () => {
  syncInputWithCurrentSet()
})

// Estado do cronômetro de descanso (calculado via timestamp absoluto restEndsAt)
const restEndsAt = computed(() => session.value?.current?.restEndsAt ?? null)

const restRemainingSeconds = computed(() => {
  if (!restEndsAt.value) return 0
  const diff = restEndsAt.value - now.value
  return Math.max(0, Math.ceil(diff / 1000))
})

const isRestActive = computed(() => {
  return restEndsAt.value !== null && restRemainingSeconds.value > 0
})

// Estado do cronômetro de exercício por duração (calculado via timestamp absoluto exerciseEndsAt)
const exerciseEndsAt = computed(() => session.value?.current?.exerciseEndsAt ?? null)

const exerciseRemainingSeconds = computed(() => {
  if (!exerciseEndsAt.value) return 0
  const diff = exerciseEndsAt.value - now.value
  return Math.max(0, Math.ceil(diff / 1000))
})

const isExerciseTimerRunning = computed(() => {
  return exerciseEndsAt.value !== null && exerciseRemainingSeconds.value > 0
})

// Dispara som ao zerar o descanso
watch(restRemainingSeconds, (sec, oldSec) => {
  if (oldSec > 0 && sec === 0 && preferencesStore.preferences.soundEnabled) {
    playTimerComplete()
  }
})

// Dispara som ao zerar o cronômetro do exercício por tempo
watch(exerciseRemainingSeconds, (sec, oldSec) => {
  if (oldSec > 0 && sec === 0) {
    if (preferencesStore.preferences.soundEnabled) {
      playTimerComplete()
    }
    // Para o timer e atualiza o stepper com a duração cumprida
    sessionsStore.stopExerciseTimer()
    if (currentExercise.value) {
      currentActualInput.value = currentExercise.value.target
    }
  }
})

// Formata segundos em MM:SS
function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

// Total de séries do treino e concluídas para a barra de progresso
const totalSetsInWorkout = computed(() => {
  if (!session.value) return 0
  return session.value.exercises.reduce((acc, ex) => acc + ex.sets.length, 0)
})

const completedSetsCount = computed(() => {
  if (!session.value) return 0
  return session.value.exercises.reduce((acc, ex) => {
    return acc + ex.sets.filter((s) => s.actualValue !== null).length
  }, 0)
})

const sessionProgressPercent = computed(() => {
  if (totalSetsInWorkout.value === 0) return 0
  return Math.round((completedSetsCount.value / totalSetsInWorkout.value) * 100)
})

// Ações de execução
function handleCompleteSet() {
  if (preferencesStore.preferences.soundEnabled) {
    playSetComplete()
  }

  sessionsStore.recordCurrentSet(currentActualInput.value)

  // Se o descanso não for disparado (restSeconds == 0), avança para a próxima série
  if (!currentExercise.value || currentExercise.value.restSeconds === 0) {
    const isFinished = sessionsStore.advanceToNextSet()
    if (isFinished) {
      showSummaryModal.value = true
    }
  }
}

function handleSkipSet() {
  const isFinished = sessionsStore.skipCurrentSet()
  if (isFinished) {
    showSummaryModal.value = true
  }
}

function handleAddRestTime() {
  sessionsStore.addRestSeconds(30)
}

function handleSkipRest() {
  const isFinished = sessionsStore.advanceToNextSet()
  if (isFinished) {
    showSummaryModal.value = true
  }
}

function handleStartExerciseTimer() {
  if (currentExercise.value) {
    sessionsStore.startExerciseTimer(currentExercise.value.target)
  }
}

function handleStopExerciseTimer() {
  sessionsStore.stopExerciseTimer()
}

// Finalização da sessão
const hasAtLeastOneSetRecorded = computed(() => {
  if (!session.value) return false
  return session.value.exercises.some((ex) => ex.sets.some((s) => s.actualValue !== null))
})

function handleQuitPartial() {
  sessionsStore.savePartialSession(sessionNote.value)
  showQuitModal.value = false
  router.push('/progress')
}

function handleQuitDiscard() {
  sessionsStore.discardActiveSession()
  showQuitModal.value = false
  router.push('/')
}

function handleFinishComplete() {
  sessionsStore.finishSession(sessionNote.value)
  showSummaryModal.value = false
  router.push('/progress')
}

// Duração total da sessão (fim - início)
const sessionDurationFormatted = computed(() => {
  if (!session.value) return '0 min'
  const start = new Date(session.value.startedAt).getTime()
  const end = Date.now()
  const diffSec = Math.max(0, Math.floor((end - start) / 1000))
  const mins = Math.floor(diffSec / 60)
  const secs = diffSec % 60
  return `${mins} min ${secs} s`
})

// Recordes batidos na sessão atual
const beatenRecords = computed(() => {
  if (!session.value) return []
  const list: { exerciseName: string; value: number; unit: string }[] = []

  for (const ex of session.value.exercises) {
    const previousPR = sessionsStore.getPersonalRecord(ex.exerciseId)
    // Encontra a melhor série realizada nesta sessão
    let bestInSession = 0
    for (const s of ex.sets) {
      if (s.actualValue !== null && s.actualValue > bestInSession) {
        bestInSession = s.actualValue
      }
    }
    // Se superou o PR anterior (ou se não existia PR anterior e fez >= 1)
    if (bestInSession > (previousPR || 0)) {
      list.push({
        exerciseName: ex.name,
        value: bestInSession,
        unit: ex.measurementType === 'reps' ? 'reps' : 's',
      })
    }
  }

  return list
})

function openExerciseDetail() {
  if (currentCatalogItem.value) {
    selectedExerciseDetail.value = currentCatalogItem.value
    showDetailModal.value = true
  }
}
</script>

<template>
  <div v-if="session" class="max-w-175 mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-5 select-none">
    <!-- Top Execution Bar -->
    <div class="flex items-center justify-between pb-3 border-b border-border-grid">
      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-primary-container animate-pulse" />
        <div>
          <span class="font-eyebrow text-[10px] text-primary-container font-bold uppercase tracking-wider block">
            Em Andamento
          </span>
          <h1 class="font-display text-lg sm:text-xl font-bold text-ink truncate max-w-55 sm:max-w-md">
            {{ session.workoutName }}
          </h1>
        </div>
      </div>

      <AppButton
        variant="outline"
        size="sm"
        @click="showQuitModal = true"
      >
        Encerrar
      </AppButton>
    </div>

    <!-- Progress Indicator -->
    <div class="space-y-1.5">
      <div class="flex items-center justify-between text-xs font-bold text-ink-muted">
        <span>Exercício {{ currentExerciseIndex + 1 }} de {{ session.exercises.length }}</span>
        <span>{{ completedSetsCount }} / {{ totalSetsInWorkout }} séries concluídas</span>
      </div>
      <AppProgressBar :value="sessionProgressPercent" />
    </div>

    <!-- REST OVERLAY / STATE -->
    <div
      v-if="isRestActive"
      class="p-6 sm:p-10 rounded-2xl border-2 border-primary-container bg-surface shadow-[0_8px_0_0_#111111] text-center space-y-6 animate-in fade-in zoom-in-95 duration-150"
    >
      <div class="space-y-1">
        <span class="font-eyebrow text-xs uppercase font-bold text-primary-container tracking-wider block">
          Intervalo de Descanso
        </span>
        <h2 class="font-display text-xl sm:text-2xl font-bold text-ink">
          Respire fundo e recupere o fôlego
        </h2>
      </div>

      <!-- Giant Countdown Display -->
      <div class="py-4">
        <div class="font-metric-number text-6xl sm:text-7xl font-black text-ink tracking-tight">
          {{ formatTime(restRemainingSeconds) }}
        </div>
        <span class="text-xs text-ink-muted font-bold mt-2 block">
          Próximo: {{ currentExercise?.name }} (Série {{ currentSetIndex + 1 }} de {{ currentExercise?.plannedSets }})
        </span>
      </div>

      <!-- Rest Controls -->
      <div class="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <AppButton
          variant="outline"
          size="lg"
          class="w-full sm:w-auto"
          @click="handleAddRestTime"
        >
          <AppIcon name="timer" :size="20" />
          +30 Segundos
        </AppButton>

        <AppButton
          variant="fill"
          size="lg"
          class="w-full sm:w-auto"
          @click="handleSkipRest"
        >
          <AppIcon name="skip" :size="20" />
          Pular Descanso
        </AppButton>
      </div>
    </div>

    <!-- ACTIVE SET EXECUTION CARD -->
    <div
      v-else-if="currentExercise"
      class="p-5 sm:p-8 rounded-2xl border-2 border-border-primary bg-surface shadow-[0_6px_0_0_#111111] space-y-6"
    >
      <!-- Exercise Title & Instructions link -->
      <div class="flex items-start justify-between gap-3">
        <div>
          <span class="font-eyebrow text-[10px] uppercase font-bold text-primary-container tracking-wider block mb-0.5">
            Exercício {{ currentExerciseIndex + 1 }} de {{ session.exercises.length }}
          </span>
          <h2 class="font-display text-2xl sm:text-3xl font-black text-ink tracking-tight">
            {{ currentExercise.name }}
          </h2>
          <span class="text-xs text-ink-muted font-medium mt-0.5 block">
            Descanso programado: {{ currentExercise.restSeconds }}s
          </span>
        </div>

        <button
          type="button"
          class="p-2 rounded-xl border border-border-grid bg-bg-alternate hover:border-border-primary text-ink transition-colors cursor-pointer"
          title="Ver instruções do exercício"
          @click="openExerciseDetail"
        >
          <AppIcon name="info" :size="20" />
        </button>
      </div>

      <!-- Current Set Badge / Progress -->
      <div class="flex items-center gap-2">
        <div
          v-for="s in currentExercise.sets"
          :key="s.number"
          class="flex-1 py-1.5 px-2 rounded-lg border text-center font-metric-number text-xs font-bold transition-all"
          :class="s.number === (currentSetIndex + 1)
            ? 'bg-primary-container text-on-primary border-border-primary shadow-[0_2px_0_0_#111111]'
            : s.actualValue !== null
              ? 'bg-success/20 text-success border-border-success'
              : 'bg-bg-alternate text-ink-muted border-border-grid'"
        >
          Série {{ s.number }}
        </div>
      </div>

      <!-- DURATION EXERCISE: TIMER MODE -->
      <div
        v-if="currentExercise.measurementType === 'duration'"
        class="py-6 px-4 rounded-xl border border-border-grid bg-bg-alternate text-center space-y-4"
      >
        <span class="font-eyebrow text-xs uppercase font-bold text-ink-muted block">
          Meta: {{ currentExercise.target }} Segundos
        </span>

        <div class="font-metric-number text-5xl sm:text-6xl font-black text-ink">
          {{ isExerciseTimerRunning ? formatTime(exerciseRemainingSeconds) : formatTime(currentActualInput) }}
        </div>

        <div class="flex items-center justify-center gap-3">
          <AppButton
            v-if="!isExerciseTimerRunning"
            variant="fill"
            size="lg"
            @click="handleStartExerciseTimer"
          >
            <AppIcon name="play" :size="20" />
            Iniciar Cronômetro
          </AppButton>
          <AppButton
            v-else
            variant="outline"
            size="lg"
            @click="handleStopExerciseTimer"
          >
            <AppIcon name="pause" :size="20" />
            Pausar
          </AppButton>
        </div>
      </div>

      <!-- REPS EXERCISE / RESULT STEPPER -->
      <div class="space-y-3 pt-2">
        <div class="flex items-center justify-between">
          <span class="font-eyebrow text-xs uppercase font-bold text-ink-muted">
            Meta Planejada:
            <span class="text-ink font-bold">{{ currentExercise.target }} {{ currentExercise.measurementType === 'reps' ? 'repetições' : 'segundos' }}</span>
          </span>
          <span class="text-xs text-ink-muted">
            Ajuste se realizou valor diferente
          </span>
        </div>

        <!-- Generous tactile stepper for floor operation -->
        <AppStepper
          v-model="currentActualInput"
          :min="1"
          :max="currentExercise.measurementType === 'reps' ? 100 : 600"
          :step="currentExercise.measurementType === 'reps' ? 1 : 5"
          :unit="currentExercise.measurementType === 'reps' ? 'reps' : 's'"
        />
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row items-center gap-3 pt-3">
        <AppButton
          variant="outline"
          size="lg"
          class="w-full sm:w-1/3"
          @click="handleSkipSet"
        >
          Pular Série
        </AppButton>

        <AppButton
          variant="fill"
          size="lg"
          class="w-full sm:flex-1"
          @click="handleCompleteSet"
        >
          <AppIcon name="check" :size="20" />
          Concluir Série
        </AppButton>
      </div>
    </div>

    <!-- QUIT / TERMINATE MODAL -->
    <Transition name="modal-pop">
      <div
        v-if="showQuitModal"
        class="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs select-none"
        @click.self="showQuitModal = false"
        @touchmove.self.prevent
      >
        <div
          class="modal-card bg-surface border-2 border-border-primary rounded-2xl w-full max-w-md shadow-[0_8px_0_0_#111111] overflow-hidden"
        >
          <div class="p-5 border-b border-border-grid bg-bg-alternate">
            <h2 class="font-display text-lg font-bold text-ink">
              Encerrar Treino
            </h2>
            <p class="text-xs text-ink-muted mt-1">
              Escolha como deseja finalizar esta sessão.
            </p>
          </div>

          <div class="p-5 space-y-3">
            <!-- Save Partial -->
            <button
              type="button"
              :disabled="!hasAtLeastOneSetRecorded"
              class="w-full text-left p-3.5 rounded-xl border border-border-grid transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:border-border-primary"
              @click="handleQuitPartial"
            >
              <div class="flex items-center gap-2.5">
                <AppIcon name="save" :size="20" class="text-primary-container" />
                <div>
                  <span class="font-bold text-sm text-ink block">Salvar como Parcial</span>
                  <span class="text-xs text-ink-muted">
                    {{ hasAtLeastOneSetRecorded ? 'Registra as séries já realizadas no seu histórico.' : 'Requer ao menos 1 série registrada.' }}
                  </span>
                </div>
              </div>
            </button>

            <!-- Discard Button using variant="danger" -->
            <div class="pt-1">
              <AppButton
                variant="danger"
                size="md"
                class="w-full"
                @click="handleQuitDiscard"
              >
                <AppIcon name="trash" :size="16" />
                Descartar Treino
              </AppButton>
            </div>
          </div>

          <div class="p-4 border-t border-border-grid bg-bg-alternate flex justify-end">
            <AppButton variant="outline" size="sm" @click="showQuitModal = false">
              Continuar Treinando
            </AppButton>
          </div>
        </div>
      </div>
    </Transition>

    <!-- FINAL SUMMARY MODAL / SCREEN -->
    <Transition name="modal-sheet">
      <div
        v-if="showSummaryModal"
        class="modal-backdrop fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-ink/60 backdrop-blur-sm select-none"
        @touchmove.self.prevent
      >
        <div
          class="modal-card bg-surface border-t-2 sm:border-2 border-border-primary rounded-t-3xl sm:rounded-2xl w-full max-w-lg max-h-[92vh] sm:max-h-[90vh] flex flex-col shadow-[0_8px_0_0_#111111] overflow-hidden"
        >
          <!-- Summary Header -->
          <div class="p-5 border-b border-border-grid bg-bg-alternate text-center">
            <div class="w-12 h-12 rounded-2xl bg-primary-container text-on-primary flex items-center justify-center mx-auto mb-2 shadow-[0_2px_0_0_#111111]">
              <AppIcon name="trophy" :size="24" />
            </div>
            <span class="font-eyebrow text-[10px] uppercase font-bold text-primary-container tracking-wider block">
              Treino Concluído
            </span>
            <h2 class="font-display text-2xl font-black text-ink">
              Excelente trabalho!
            </h2>
            <span class="text-xs text-ink-muted font-medium">
              {{ session.workoutName }}
            </span>
          </div>

          <!-- Summary Body -->
          <div class="flex-1 overflow-y-auto p-5 space-y-4">
          <!-- Metrics Cards -->
          <div class="grid grid-cols-2 gap-3">
            <div class="p-3 rounded-xl border border-border-grid bg-surface text-center">
              <span class="font-eyebrow text-[10px] uppercase text-ink-muted block">Duração Total</span>
              <span class="font-metric-number text-lg font-bold text-ink">
                {{ sessionDurationFormatted }}
              </span>
            </div>
            <div class="p-3 rounded-xl border border-border-grid bg-surface text-center">
              <span class="font-eyebrow text-[10px] uppercase text-ink-muted block">Séries Feitas</span>
              <span class="font-metric-number text-lg font-bold text-ink">
                {{ completedSetsCount }} / {{ totalSetsInWorkout }}
              </span>
            </div>
          </div>

          <!-- Beaten Records Badges (if any) -->
          <div
            v-if="beatenRecords.length > 0"
            class="p-4 rounded-xl border-2 border-primary-container bg-primary-container/10 space-y-2"
          >
            <div class="flex items-center gap-2">
              <AppIcon name="medal" :size="16" class="text-primary-container" />
              <span class="font-bold text-xs uppercase text-primary-container tracking-wider">
                Novo Recorde Pessoal Batido!
              </span>
            </div>
            <div class="space-y-1">
              <div
                v-for="(rec, idx) in beatenRecords"
                :key="idx"
                class="flex items-center justify-between text-xs font-bold text-ink"
              >
                <span>{{ rec.exerciseName }}</span>
                <span class="text-primary-container font-metric-number">
                  {{ rec.value }} {{ rec.unit }}
                </span>
              </div>
            </div>
          </div>

          <!-- Planned vs Actual List -->
          <div class="space-y-2">
            <h4 class="font-eyebrow text-[10px] font-bold uppercase text-ink-muted tracking-wider">
              Resumo por Exercício
            </h4>

            <div
              v-for="ex in session.exercises"
              :key="ex.exerciseId"
              class="p-3 rounded-xl border border-border-grid bg-surface space-y-1.5"
            >
              <div class="flex items-center justify-between">
                <span class="font-bold text-xs text-ink">{{ ex.name }}</span>
                <span class="font-metric-number text-xs font-bold text-ink-muted">
                  Meta: {{ ex.plannedSets }} × {{ ex.target }}
                </span>
              </div>

              <!-- Sets small chips -->
              <div class="flex items-center gap-1.5 flex-wrap">
                <div
                  v-for="s in ex.sets"
                  :key="s.number"
                  class="px-2 py-0.5 rounded text-[11px] font-metric-number font-bold border"
                  :class="s.actualValue !== null
                    ? (s.actualValue >= s.plannedValue ? 'bg-success/15 border-border-success text-success' : 'bg-warning-container/15 border-border-warning text-warning')
                    : 'bg-bg-alternate border-border-grid text-ink-muted line-through'"
                >
                  {{ s.actualValue !== null ? s.actualValue : 'pulou' }}
                </div>
              </div>
            </div>
          </div>

          <!-- Notes Textarea -->
          <div class="space-y-1.5 pt-1">
            <label class="block font-eyebrow text-[10px] font-bold uppercase text-ink-muted">
              Anotações da Sessão (Opcional)
            </label>
            <textarea
              v-model="sessionNote"
              rows="2"
              placeholder="Como se sentiu hoje? Dificuldades ou facilidades..."
              class="w-full p-3 rounded-xl border border-border-grid bg-surface text-ink text-xs focus:outline-none focus:border-border-primary resize-none"
            />
          </div>
        </div>

        <!-- Summary Footer -->
        <div class="p-4 border-t border-border-grid bg-bg-alternate flex justify-end">
          <AppButton
            variant="fill"
            size="lg"
            class="w-full"
            @click="handleFinishComplete"
          >
            Salvar e Concluir
          </AppButton>
        </div>
      </div>
    </div>
  </Transition>

    <!-- Exercise Detail Modal -->
    <ExerciseDetailModal
      :is-open="showDetailModal"
      :exercise="selectedExerciseDetail"
      :personal-record="selectedExerciseDetail ? sessionsStore.getPersonalRecord(selectedExerciseDetail.id) : null"
      @close="showDetailModal = false"
    />
  </div>
</template>
