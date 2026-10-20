import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { StorageService } from '@/services/storageService'
import { EXERCISE_CATALOG } from '@/data/exercises'
import { PROGRESSION_RULES } from '@/constants/domain'
import type {
  Session,
  Workout,
  MeasurementType,
} from '@/types/domain'

export interface ProgressionSuggestion {
  exerciseId: string
  exerciseName: string
  measurementType: MeasurementType
  currentTarget: number
  suggestedTarget: number
  reason: string
}

/**
 * Retorna a data da segunda-feira da semana de uma data de referência (horário local)
 */
export function getMondayOfDate(d: Date): Date {
  const date = new Date(d)
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  date.setDate(diff)
  date.setHours(0, 0, 0, 0)
  return date
}

export const useSessionsStore = defineStore('sessions', () => {
  const sessions = ref<Session[]>([])
  const activeSession = ref<Session | null>(null)
  const isLoaded = ref(false)

  function load() {
    sessions.value = StorageService.getSessions()
    activeSession.value = StorageService.getActiveSession()
    isLoaded.value = true
  }

  function persistSessions() {
    StorageService.saveSessions(sessions.value)
  }

  function persistActiveSession() {
    StorageService.saveActiveSession(activeSession.value)
  }

  /**
   * Inicia uma nova sessão gerando um snapshot imutável do treino
   */
  function startSession(workout: Workout): Session {
    const now = new Date().toISOString()
    const session: Session = {
      id: `session-${Date.now()}`,
      workoutId: workout.id,
      workoutName: workout.name,
      status: 'in_progress',
      startedAt: now,
      current: {
        exerciseIndex: 0,
        setIndex: 0,
        restEndsAt: null,
        exerciseEndsAt: null,
      },
      exercises: workout.items.map((item) => {
        const catalogItem = EXERCISE_CATALOG.find((e) => e.id === item.exerciseId)
        const name = catalogItem ? catalogItem.name : 'Exercício'
        const measurementType: MeasurementType = catalogItem ? catalogItem.measurementType : 'reps'
        return {
          exerciseId: item.exerciseId,
          name,
          measurementType,
          restSeconds: item.restSeconds,
          plannedSets: item.sets,
          target: item.target,
          sets: Array.from({ length: item.sets }, (_, i) => ({
            number: i + 1,
            plannedValue: item.target,
            actualValue: null,
            recordedAt: null,
          })),
        }
      }),
    }

    activeSession.value = session
    persistActiveSession()
    return session
  }

  /**
   * Registra a série atual com o valor realizado
   */
  function recordCurrentSet(actualValue: number) {
    if (!activeSession.value || !activeSession.value.current) return
    const cur = activeSession.value.current
    const exercise = activeSession.value.exercises[cur.exerciseIndex]
    if (!exercise) return
    const currentSet = exercise.sets[cur.setIndex]
    if (!currentSet) return

    currentSet.actualValue = actualValue
    currentSet.recordedAt = new Date().toISOString()

    // Se o exercício tem descanso configurado (> 0), ativa o timer de descanso baseado em timestamp absoluto
    if (exercise.restSeconds > 0) {
      cur.restEndsAt = Date.now() + exercise.restSeconds * 1000
    } else {
      cur.restEndsAt = null
    }
    cur.exerciseEndsAt = null

    persistActiveSession()
  }

  /**
   * Avança para a próxima série ou exercício
   * Retorna true se todo o treino foi concluído
   */
  function advanceToNextSet(): boolean {
    if (!activeSession.value || !activeSession.value.current) return false
    const cur = activeSession.value.current
    const exercise = activeSession.value.exercises[cur.exerciseIndex]
    if (!exercise) return false

    cur.restEndsAt = null
    cur.exerciseEndsAt = null

    if (cur.setIndex + 1 < exercise.sets.length) {
      cur.setIndex += 1
      persistActiveSession()
      return false
    } else if (cur.exerciseIndex + 1 < activeSession.value.exercises.length) {
      cur.exerciseIndex += 1
      cur.setIndex = 0
      persistActiveSession()
      return false
    }

    // Treino completo (todas as séries e exercícios concluídos)
    persistActiveSession()
    return true
  }

  /**
   * Pula a série atual sem registrar valor realizado
   */
  function skipCurrentSet(): boolean {
    return advanceToNextSet()
  }

  /**
   * Adiciona tempo ao cronômetro de descanso
   */
  function addRestSeconds(seconds = 30) {
    if (!activeSession.value || !activeSession.value.current) return
    const cur = activeSession.value.current
    const baseTime = cur.restEndsAt && cur.restEndsAt > Date.now() ? cur.restEndsAt : Date.now()
    cur.restEndsAt = baseTime + seconds * 1000
    persistActiveSession()
  }

  /**
   * Pula o cronômetro de descanso
   */
  function skipRest() {
    if (!activeSession.value || !activeSession.value.current) return
    activeSession.value.current.restEndsAt = null
    advanceToNextSet()
  }

  /**
   * Inicia cronômetro para exercício por duração
   */
  function startExerciseTimer(durationSeconds: number) {
    if (!activeSession.value || !activeSession.value.current) return
    activeSession.value.current.exerciseEndsAt = Date.now() + durationSeconds * 1000
    persistActiveSession()
  }

  /**
   * Para cronômetro de exercício
   */
  function stopExerciseTimer() {
    if (!activeSession.value || !activeSession.value.current) return
    activeSession.value.current.exerciseEndsAt = null
    persistActiveSession()
  }

  /**
   * Navega para um exercício específico
   */
  function selectExercise(index: number) {
    if (!activeSession.value || !activeSession.value.current) return
    if (index >= 0 && index < activeSession.value.exercises.length) {
      activeSession.value.current.exerciseIndex = index
      activeSession.value.current.setIndex = 0
      activeSession.value.current.restEndsAt = null
      activeSession.value.current.exerciseEndsAt = null
      persistActiveSession()
    }
  }

  /**
   * Finaliza sessão como concluída
   */
  function finishSession(note?: string): Session | null {
    if (!activeSession.value) return null
    const finished: Session = {
      ...activeSession.value,
      status: 'completed',
      endedAt: new Date().toISOString(),
      note: note || activeSession.value.note,
      current: undefined,
    }

    sessions.value.unshift(finished)
    persistSessions()

    activeSession.value = null
    persistActiveSession()
    return finished
  }

  /**
   * Finaliza sessão como parcial (se houver pelo menos 1 série registrada)
   */
  function savePartialSession(note?: string): Session | null {
    if (!activeSession.value) return null

    // Verifica se há pelo menos 1 série com actualValue
    const hasAnyRecordedSet = activeSession.value.exercises.some((ex) =>
      ex.sets.some((s) => s.actualValue !== null)
    )
    if (!hasAnyRecordedSet) return null

    const partial: Session = {
      ...activeSession.value,
      status: 'partial',
      endedAt: new Date().toISOString(),
      note: note || activeSession.value.note,
      current: undefined,
    }

    sessions.value.unshift(partial)
    persistSessions()

    activeSession.value = null
    persistActiveSession()
    return partial
  }

  /**
   * Descarta a sessão ativa sem salvar no histórico
   */
  function discardActiveSession() {
    activeSession.value = null
    persistActiveSession()
  }

  /**
   * Exclui uma sessão finalizada do histórico
   */
  function deleteSession(sessionId: string): boolean {
    const prev = sessions.value.length
    sessions.value = sessions.value.filter((s) => s.id !== sessionId)
    if (sessions.value.length !== prev) {
      persistSessions()
      return true
    }
    return false
  }

  /**
   * Recorde pessoal (PR) calculado dinamicamente a partir do histórico:
   * maior valor realizado em uma única série de um exercício
   */
  function getPersonalRecord(exerciseId: string): number | null {
    let max: number | null = null
    for (const session of sessions.value) {
      for (const ex of session.exercises) {
        if (ex.exerciseId === exerciseId) {
          for (const s of ex.sets) {
            if (s.actualValue !== null) {
              if (max === null || s.actualValue > max) {
                max = s.actualValue
              }
            }
          }
        }
      }
    }
    return max
  }

  /**
   * Mapeamento reativo de todos os PRs existentes
   */
  const personalRecordsMap = computed<Record<string, number>>(() => {
    const map: Record<string, number> = {}
    for (const session of sessions.value) {
      for (const ex of session.exercises) {
        for (const s of ex.sets) {
          if (s.actualValue !== null) {
            const current = map[ex.exerciseId]
            if (current === undefined || s.actualValue > current) {
              map[ex.exerciseId] = s.actualValue
            }
          }
        }
      }
    }
    return map
  })

  /**
   * Quantidade de treinos concluídos na semana corrente (Segunda a Domingo)
   */
  const completedThisWeek = computed<number>(() => {
    const monday = getMondayOfDate(new Date())
    const sundayEnd = new Date(monday)
    sundayEnd.setDate(monday.getDate() + 7)
    sundayEnd.setMilliseconds(-1)

    return sessions.value.filter((s) => {
      if (s.status !== 'completed') return false
      const sDate = new Date(s.startedAt)
      return sDate >= monday && sDate <= sundayEnd
    }).length
  })

  /**
   * Quantidade de sessões concluídas por semana nas últimas 8 semanas
   */
  const frequencyLast8Weeks = computed<{ label: string; count: number; isCurrentWeek: boolean }[]>(() => {
    const weeks: { label: string; count: number; isCurrentWeek: boolean }[] = []
    const currentMonday = getMondayOfDate(new Date())

    for (let i = 7; i >= 0; i--) {
      const weekMonday = new Date(currentMonday)
      weekMonday.setDate(currentMonday.getDate() - i * 7)

      const weekSunday = new Date(weekMonday)
      weekSunday.setDate(weekMonday.getDate() + 7)
      weekSunday.setMilliseconds(-1)

      const count = sessions.value.filter((s) => {
        if (s.status !== 'completed') return false
        const sDate = new Date(s.startedAt)
        return sDate >= weekMonday && sDate <= weekSunday
      }).length

      const startDay = weekMonday.getDate().toString().padStart(2, '0')
      const startMonth = (weekMonday.getMonth() + 1).toString().padStart(2, '0')
      weeks.push({
        label: `${startDay}/${startMonth}`,
        count,
        isCurrentWeek: i === 0,
      })
    }

    return weeks
  })

  /**
   * Regra Única de Progressão (Seção 8 da especificação):
   * Se nas 2 últimas sessões onde o exercício apareceu no treino,
   * todas as séries previstas foram registradas com valor realizado >= meta:
   * Sugerir +1 repetição ou +5 segundos.
   */
  function getProgressionSuggestion(workout: Workout, exerciseId: string): ProgressionSuggestion | null {
    const item = workout.items.find((it) => it.exerciseId === exerciseId)
    if (!item) return null

    const dismissedAt = item.suggestionDismissedAt ? new Date(item.suggestionDismissedAt) : null

    // Filtra sessões finalizadas desse treino (ou que continham o exercício) após o descarte da sugestão
    const relevantSessions = sessions.value
      .filter((s) => {
        if (s.status !== 'completed' && s.status !== 'partial') return false
        if (dismissedAt && new Date(s.startedAt) <= dismissedAt) return false
        return s.exercises.some((e) => e.exerciseId === exerciseId)
      })
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())

    if (relevantSessions.length < PROGRESSION_RULES.REQUIRED_SESSIONS) {
      return null
    }

    const lastTwoSessions = relevantSessions.slice(0, PROGRESSION_RULES.REQUIRED_SESSIONS)

    // Verifica se em ambas as sessões todas as séries previstas foram concluídas e atingiram a meta
    const satisfied = lastTwoSessions.every((session) => {
      const sessionExercise = session.exercises.find((e) => e.exerciseId === exerciseId)
      if (!sessionExercise) return false
      // Todas as séries previstas precisam ter sido registradas com valor >= meta
      if (sessionExercise.sets.length < sessionExercise.plannedSets) return false
      return sessionExercise.sets.every(
        (s) => s.actualValue !== null && s.actualValue >= s.plannedValue
      )
    })

    if (!satisfied) return null

    const catalog = EXERCISE_CATALOG.find((e) => e.id === exerciseId)
    const measurementType: MeasurementType = catalog ? catalog.measurementType : 'reps'
    const increment =
      measurementType === 'reps'
        ? PROGRESSION_RULES.REP_INCREMENT
        : PROGRESSION_RULES.DURATION_INCREMENT_SECONDS

    return {
      exerciseId,
      exerciseName: catalog?.name || 'Exercício',
      measurementType,
      currentTarget: item.target,
      suggestedTarget: item.target + increment,
      reason: `Você completou todas as séries com sucesso nas 2 últimas sessões!`,
    }
  }

  /**
   * Obtém todas as sugestões de progressão para um treino
   */
  function getWorkoutSuggestions(workout: Workout): ProgressionSuggestion[] {
    const suggestions: ProgressionSuggestion[] = []
    for (const item of workout.items) {
      const suggestion = getProgressionSuggestion(workout, item.exerciseId)
      if (suggestion) {
        suggestions.push(suggestion)
      }
    }
    return suggestions
  }

  return {
    sessions,
    activeSession,
    isLoaded,
    load,
    startSession,
    recordCurrentSet,
    advanceToNextSet,
    skipCurrentSet,
    addRestSeconds,
    skipRest,
    startExerciseTimer,
    stopExerciseTimer,
    selectExercise,
    finishSession,
    savePartialSession,
    discardActiveSession,
    deleteSession,
    getPersonalRecord,
    personalRecordsMap,
    completedThisWeek,
    frequencyLast8Weeks,
    getProgressionSuggestion,
    getWorkoutSuggestions,
  }
})
