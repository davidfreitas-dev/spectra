import { EXERCISE_CATALOG } from '@/data/exercises'
import type { Workout, WorkoutItem, MeasurementType } from '@/types/domain'

export interface ExerciseDetailsSummary {
  name: string
  measurementType: MeasurementType
  unit: string
}

/**
 * Retorna os detalhes de um exercício a partir do catálogo estático.
 * Aceita o ID do exercício (string) ou o próprio item do treino ({ exerciseId: string }).
 */
export function getExerciseDetails(exerciseIdOrItem: string | { exerciseId: string }): ExerciseDetailsSummary {
  const id = typeof exerciseIdOrItem === 'string' ? exerciseIdOrItem : exerciseIdOrItem.exerciseId
  const catalog = EXERCISE_CATALOG.find((e) => e.id === id)
  const isDuration = catalog?.measurementType === 'duration'
  return {
    name: catalog?.name || 'Exercício',
    measurementType: catalog?.measurementType || 'reps',
    unit: isDuration ? 's' : 'reps',
  }
}

/**
 * Calcula a estimativa aproximada de duração do treino em minutos (~X min).
 * Considera tempo de execução (~3s por repetição ou valor exato de segundos em isometria) + tempo de descanso.
 */
export function calculateWorkoutEstimatedMinutes(workoutOrItems: Workout | WorkoutItem[]): number {
  const items = Array.isArray(workoutOrItems) ? workoutOrItems : workoutOrItems.items
  if (!items || items.length === 0) return 0

  let totalSeconds = 0
  for (const item of items) {
    const details = getExerciseDetails(item.exerciseId)
    const setExecSeconds = details.measurementType === 'duration' ? item.target : item.target * 3
    const totalSetTime = (setExecSeconds + item.restSeconds) * item.sets
    totalSeconds += totalSetTime
  }

  return Math.max(5, Math.round(totalSeconds / 60))
}

/**
 * Formata o valor alvo e unidade do exercício (ex: "10 reps" ou "30 s").
 */
export function formatWorkoutItemTarget(exerciseId: string, target: number): string {
  const details = getExerciseDetails(exerciseId)
  return `${target} ${details.unit}`
}
