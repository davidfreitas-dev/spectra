import { EXERCISE_CATALOG } from '@/data/exercises'
import { PRESET_WORKOUTS } from '@/data/presetWorkouts'
import type { Workout, WorkoutItem, MeasurementType, Equipment, UserLevel } from '@/types/domain'

export interface ExerciseDetailsSummary {
  name: string
  measurementType: MeasurementType
  unit: string
  equipment: Equipment[]
  level: UserLevel
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
    equipment: catalog?.equipment || ['none'],
    level: catalog?.level || 'beginner',
  }
}

/**
 * Verifica se um usuário com determinados equipamentos pode realizar o exercício.
 * Exercícios de peso corporal ('none') são acessíveis para qualquer usuário.
 */
export function canPerformExercise(exEquipment: Equipment[], userEquipment: Equipment[] = []): boolean {
  if (!exEquipment || exEquipment.length === 0) return true
  return exEquipment.every((eq) => eq === 'none' || userEquipment.includes(eq))
}

/**
 * Retorna os equipamentos necessários para um treino completo.
 * Se o treino exige apenas peso corporal, retorna ['none'].
 * Se exige itens como barra ou corda, retorna esses equipamentos.
 */
export function getWorkoutRequiredEquipment(workoutOrItems: Workout | WorkoutItem[]): Equipment[] {
  const items = Array.isArray(workoutOrItems) ? workoutOrItems : workoutOrItems.items
  if (!items || items.length === 0) return ['none']

  const equipments = new Set<Equipment>()
  for (const item of items) {
    const details = getExerciseDetails(item.exerciseId)
    for (const eq of details.equipment) {
      equipments.add(eq)
    }
  }

  // Se houver equipamentos específicos além de 'none', omite 'none' para evitar ruído visual
  if (equipments.size > 1 && equipments.has('none')) {
    equipments.delete('none')
  }

  return Array.from(equipments)
}

/**
 * Verifica se o usuário possui todos os equipamentos necessários para o treino.
 */
export function canUserPerformWorkout(workoutOrItems: Workout | WorkoutItem[], userEquipment: Equipment[] = []): boolean {
  const items = Array.isArray(workoutOrItems) ? workoutOrItems : workoutOrItems.items
  if (!items || items.length === 0) return true

  return items.every((item) => {
    const details = getExerciseDetails(item.exerciseId)
    return canPerformExercise(details.equipment, userEquipment)
  })
}

/**
 * Rótulo amigável em português para os equipamentos.
 */
export function formatEquipmentLabel(eq: Equipment): string {
  switch (eq) {
    case 'bar':
      return 'Barra Fixa'
    case 'band':
      return 'Elástico'
    case 'rope':
      return 'Corda'
    case 'none':
    default:
      return 'Peso Corporal'
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

/**
 * Seleciona o treino pronto recomendado levando em consideração o nível E os equipamentos reais do usuário.
 */
export function getRecommendedPreset(level: UserLevel, userEquipment: Equipment[] = []): Workout {
  const hasBar = userEquipment.includes('bar')
  const hasRope = userEquipment.includes('rope')
  const hasBand = userEquipment.includes('band')

  if (level === 'beginner') {
    if (hasBar) {
      return PRESET_WORKOUTS.find((p) => p.id === 'preset-fullbody-beginner') || PRESET_WORKOUTS[0]
    }
    if (hasRope && !hasBand) {
      return PRESET_WORKOUTS.find((p) => p.id === 'preset-cardio-rope') || PRESET_WORKOUTS[0]
    }
    if (hasBand && !hasRope) {
      return PRESET_WORKOUTS.find((p) => p.id === 'preset-band-functional') || PRESET_WORKOUTS[0]
    }
    // Zero equipamento
    return PRESET_WORKOUTS.find((p) => p.id === 'preset-beginner-zero-equipment') || PRESET_WORKOUTS[0]
  }

  if (level === 'intermediate') {
    if (hasBar) {
      return PRESET_WORKOUTS.find((p) => p.id === 'preset-push-intermediate') || PRESET_WORKOUTS[0]
    }
    if (hasBand) {
      return PRESET_WORKOUTS.find((p) => p.id === 'preset-band-functional') || PRESET_WORKOUTS[0]
    }
    if (hasRope) {
      return PRESET_WORKOUTS.find((p) => p.id === 'preset-cardio-rope') || PRESET_WORKOUTS[0]
    }
    return PRESET_WORKOUTS.find((p) => p.id === 'preset-beginner-zero-equipment') || PRESET_WORKOUTS[0]
  }

  // Avançado
  if (hasBar) {
    return PRESET_WORKOUTS.find((p) => p.id === 'preset-pull-intermediate') || PRESET_WORKOUTS[0]
  }
  return PRESET_WORKOUTS.find((p) => p.id === 'preset-legs-core') || PRESET_WORKOUTS[0]
}
