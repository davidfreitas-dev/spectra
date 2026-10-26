<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  AppCard,
  AppPageHeader,
  AppProgressBar,
  AppStatusBadge,
  AppButton,
  AppIcon,
  SessionDetailModal,
} from '@/components'
import { useSessionsStore } from '@/stores/sessionsStore'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { useConfetti } from '@/composables/useConfetti'
import { useSound } from '@/composables/useSound'
import { EXERCISE_CATALOG } from '@/data/exercises'
import type { Session, ExerciseCatalogItem } from '@/types/domain'

const router = useRouter()
const sessionsStore = useSessionsStore()
const preferencesStore = usePreferencesStore()
const { fireCelebrationBurst } = useConfetti()
const { playCelebration } = useSound()

function handleCelebrateWeeklyGoal() {
  fireCelebrationBurst()
  if (preferencesStore.preferences.soundEnabled) {
    playCelebration()
  }
}

// Modal de detalhe da sessão
const selectedSession = ref<Session | null>(null)
const showDetailModal = ref(false)

// Exercício selecionado para evolução
const selectedEvolutionExerciseId = ref<string>('pushup-standard')

onMounted(() => {
  sessionsStore.load()
  preferencesStore.load()
})

const sessions = computed(() => sessionsStore.sessions)
const weeklyGoal = computed(() => preferencesStore.weeklyGoal)
const completedThisWeek = computed(() => sessionsStore.completedThisWeek)

// 8 semanas de frequência
const frequencyWeeks = computed(() => sessionsStore.frequencyLast8Weeks)
const maxFrequencyInAWeek = computed(() => {
  const max = Math.max(...frequencyWeeks.value.map((w) => w.count))
  return max > 0 ? max : 1
})

// Lista de exercícios que já foram realizados ao menos uma vez no histórico
const performedExercises = computed<ExerciseCatalogItem[]>(() => {
  const ids = new Set<string>()
  for (const session of sessions.value) {
    for (const ex of session.exercises) {
      if (ex.sets.some((s) => s.actualValue !== null)) {
        ids.add(ex.exerciseId)
      }
    }
  }

  // Se nenhum foi realizado ainda, exibe os principais do catálogo
  if (ids.size === 0) {
    return EXERCISE_CATALOG.slice(0, 4)
  }

  return EXERCISE_CATALOG.filter((ex) => ids.has(ex.id))
})

// Dados de evolução para o exercício selecionado
const exerciseEvolutionHistory = computed(() => {
  const exId = selectedEvolutionExerciseId.value
  const points: { date: string; bestValue: number; unit: string }[] = []

  // Itera em ordem cronológica reversa (mais antiga para mais recente)
  const sortedSessions = [...sessions.value].sort(
    (a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime()
  )

  for (const session of sortedSessions) {
    const exercise = session.exercises.find((e) => e.exerciseId === exId)
    if (exercise) {
      let best = 0
      for (const s of exercise.sets) {
        if (s.actualValue !== null && s.actualValue > best) {
          best = s.actualValue
        }
      }
      if (best > 0) {
        const d = new Date(session.startedAt)
        points.push({
          date: `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`,
          bestValue: best,
          unit: exercise.measurementType === 'reps' ? 'reps' : 's',
        })
      }
    }
  }

  return points
})

const selectedExercisePR = computed(() => {
  return sessionsStore.getPersonalRecord(selectedEvolutionExerciseId.value)
})

const selectedExerciseCatalogItem = computed(() => {
  return EXERCISE_CATALOG.find((e) => e.id === selectedEvolutionExerciseId.value)
})

function openSessionDetail(session: Session) {
  selectedSession.value = session
  showDetailModal.value = true
}

function handleDeleteSession(sessionId: string) {
  if (confirm('Tem certeza de que deseja excluir este registro do histórico?')) {
    sessionsStore.deleteSession(sessionId)
    showDetailModal.value = false
    selectedSession.value = null
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

function calculateSessionDuration(session: Session): string {
  if (!session.endedAt) return '—'
  const start = new Date(session.startedAt).getTime()
  const end = new Date(session.endedAt).getTime()
  const diffSec = Math.max(0, Math.floor((end - start) / 1000))
  const mins = Math.floor(diffSec / 60)
  return `${mins} min`
}
</script>

<template>
  <div class="max-w-225 mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 select-none">
    <!-- View Header -->
    <AppPageHeader
      title="Progresso"
      eyebrow="Evolução &amp; Consistência"
      subtitle="Acompanhe seus recordes pessoais, frequência semanal e evolução histórica sem estimativas fictícias."
    />

    <!-- Empty State if NO sessions exist yet -->
    <div
      v-if="sessions.length === 0"
      class="p-8 sm:p-12 rounded-2xl border-2 border-border-primary bg-surface text-center space-y-4 shadow-[0_4px_0_0_#111111]"
    >
      <div class="w-14 h-14 rounded-2xl bg-bg-alternate border border-border-grid flex items-center justify-center mx-auto text-primary-container">
        <AppIcon name="trending_up" :size="30" />
      </div>
      <div class="space-y-1">
        <h2 class="font-display text-xl font-bold text-ink">
          Seu Progresso Começa no Primeiro Treino
        </h2>
        <p class="text-xs text-ink-muted max-w-md mx-auto leading-relaxed">
          O Spectra não exibe estatísticas fictícias nem gráficos sem dados. Complete sua primeira sessão guiada para ativar o histórico, recordes pessoais e métricas de consistência.
        </p>
      </div>

      <div class="pt-2">
        <AppButton variant="fill" size="md" @click="router.push('/')">
          <AppIcon name="play" :size="20" />
          Iniciar Meu Primeiro Treino
        </AppButton>
      </div>
    </div>

    <!-- Main Content when sessions exist -->
    <template v-else>
      <!-- BLOCO 1: Meta da Semana -->
      <AppCard title="Meta Semanal de Treinos" eyebrow="Frequência Baseada na Agenda">
        <div class="space-y-4">
          <AppProgressBar
            v-if="weeklyGoal > 0"
            :value="completedThisWeek"
            :max="weeklyGoal"
            :label="`Meta da Semana: ${completedThisWeek} de ${weeklyGoal} treinos concluídos`"
            :status-text="`${Math.min(100, Math.round((completedThisWeek / weeklyGoal) * 100))}% atingido`"
            variant="success"
          />

          <!-- Banner comemorativo de meta semanal batida -->
          <div
            v-if="weeklyGoal > 0 && completedThisWeek >= weeklyGoal"
            class="p-3.5 rounded-xl border-2 border-border-primary bg-primary-container/10 flex items-center justify-between gap-3 shadow-[0_2px_0_0_#111111]"
          >
            <div class="flex items-center gap-2.5">
              <span class="text-xl">🏆</span>
              <div>
                <span class="font-bold text-xs text-ink block">
                  Meta Semanal Conquistada!
                </span>
                <span class="text-[11px] text-ink-muted font-medium block">
                  Você completou todos os treinos desta semana.
                </span>
              </div>
            </div>
            <AppButton
              variant="outline"
              size="sm"
              class="shrink-0"
              @click="handleCelebrateWeeklyGoal"
            >
              Comemorar 🎉
            </AppButton>
          </div>
          <div v-else class="text-xs text-ink-muted">
            Sem meta definida. Defina os dias de treino na sua agenda na aba Hoje para ativar a meta semanal.
          </div>
        </div>
      </AppCard>

      <!-- BLOCO 2: Frequência nas últimas 8 semanas -->
      <AppCard title="Frequência de Treinos" eyebrow="Últimas 8 Semanas">
        <div class="space-y-4">
          <!-- Frequency Bar Chart -->
          <div class="flex items-end justify-between gap-2 h-32 pt-4 px-2">
            <div
              v-for="w in frequencyWeeks"
              :key="w.label"
              class="flex-1 flex flex-col items-center gap-1.5! h-full justify-end"
            >
              <span class="font-metric-number text-[11px] font-bold text-ink">
                {{ w.count > 0 ? w.count : '' }}
              </span>

              <div
                class="w-full rounded-t-md transition-all border border-border-primary"
                :class="w.isCurrentWeek ? 'bg-primary-container' : 'bg-ink'"
                :style="{
                  height: `${Math.max(8, (w.count / maxFrequencyInAWeek) * 75)}%`,
                  opacity: w.count === 0 ? 0.15 : 1,
                }"
              />

              <span
                class="font-eyebrow text-[9px] uppercase tracking-wider block text-center"
                :class="w.isCurrentWeek ? 'text-primary-container font-bold' : 'text-ink-muted'"
              >
                {{ w.label }}
              </span>
            </div>
          </div>
          <span class="font-eyebrow text-[10px] text-ink-muted block text-right">
            Sessões concluídas por semana
          </span>
        </div>
      </AppCard>

      <!-- BLOCO 3: Evolução por Exercício e PR -->
      <AppCard title="Evolução por Exercício" eyebrow="Melhor Marca em Cada Sessão" dot-color="primary">
        <div class="space-y-4">
          <!-- Exercise Selector Chips -->
          <div class="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              v-for="ex in performedExercises"
              :key="ex.id"
              type="button"
              class="px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
              :class="selectedEvolutionExerciseId === ex.id
                ? 'bg-primary-container text-on-primary border-border-primary shadow-[0_2px_0_0_#111111]'
                : 'bg-surface text-ink border-border-grid hover:bg-bg-alternate'"
              @click="selectedEvolutionExerciseId = ex.id"
            >
              {{ ex.name }}
            </button>
          </div>

          <!-- PR Highlight -->
          <div class="p-4 rounded-xl border border-border-grid bg-bg-alternate flex items-center justify-between">
            <div>
              <span class="font-eyebrow text-[10px] uppercase text-ink-muted block">Recorde Pessoal (PR)</span>
              <span class="font-display text-base font-bold text-ink">
                {{ selectedExerciseCatalogItem?.name }}
              </span>
            </div>

            <div class="text-right">
              <span
                v-if="selectedExercisePR !== null"
                class="font-metric-number text-2xl font-black text-primary-container"
              >
                {{ selectedExercisePR }} {{ selectedExerciseCatalogItem?.measurementType === 'reps' ? 'reps' : 's' }}
              </span>
              <span v-else class="text-xs text-ink-muted font-bold">
                Sem registro
              </span>
            </div>
          </div>

          <!-- History of sessions for this exercise -->
          <div v-if="exerciseEvolutionHistory.length > 0" class="space-y-2">
            <span class="font-eyebrow text-[10px] font-bold uppercase text-ink-muted tracking-wider block">
              Histórico de Séries Máximas
            </span>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div
                v-for="(point, idx) in exerciseEvolutionHistory"
                :key="idx"
                class="p-2.5 rounded-lg border border-border-grid bg-surface text-center"
              >
                <span class="font-eyebrow text-[9px] uppercase text-ink-muted block">{{ point.date }}</span>
                <span class="font-metric-number text-sm font-bold text-ink block mt-0.5">
                  {{ point.bestValue }} {{ point.unit }}
                </span>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-4 text-xs text-ink-muted">
            Nenhum registro para este exercício ainda.
          </div>
        </div>
      </AppCard>

      <!-- BLOCO 4: Histórico Completo de Sessões -->
      <AppCard title="Histórico de Treinos" eyebrow="Toque para ver detalhes ou excluir" dot-color="ink">
        <div class="divide-y divide-border-grid">
          <button
            v-for="s in sessions"
            :key="s.id"
            type="button"
            class="w-full text-left py-3.5 flex items-center justify-between gap-3 hover:bg-bg-alternate/50 transition-colors cursor-pointer px-1 rounded-lg"
            @click="openSessionDetail(s)"
          >
            <div>
              <div class="font-bold text-sm text-ink">
                {{ s.workoutName }}
              </div>
              <div class="text-xs text-ink-muted mt-0.5">
                {{ formatSessionDate(s.startedAt) }} • {{ calculateSessionDuration(s) }} • {{ s.exercises.length }} exercícios
              </div>
            </div>

            <AppStatusBadge
              :type="s.status === 'completed' ? 'completed' : 'partial'"
              :label="s.status === 'completed' ? 'Concluída' : 'Parcial'"
            />
          </button>
        </div>
      </AppCard>
    </template>

    <!-- Session Detail Modal -->
    <SessionDetailModal
      :is-open="showDetailModal"
      :session="selectedSession"
      @close="showDetailModal = false"
      @delete="handleDeleteSession"
    />
  </div>
</template>
