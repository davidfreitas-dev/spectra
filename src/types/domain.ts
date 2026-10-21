import { z } from 'zod'
import { DOMAIN_LIMITS } from '@/constants/domain'

export type UserLevel = 'beginner' | 'intermediate' | 'advanced'
export type Equipment = 'none' | 'band' | 'rope' | 'bar'
export type MeasurementType = 'reps' | 'duration'
export type SessionStatus = 'in_progress' | 'completed' | 'partial'

// Schemas Zod

export const PreferencesSchema = z.object({
  schemaVersion: z.number().int().default(1),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  equipment: z.array(z.enum(['none', 'band', 'rope', 'bar'])),
  schedule: z.record(z.string(), z.string().nullable().optional()),
  soundEnabled: z.boolean().default(true),
  vibrationEnabled: z.boolean().default(true),
  onboardingDone: z.boolean().default(false),
  firstSessionTourDone: z.boolean().default(false),
})

export type Preferences = z.infer<typeof PreferencesSchema>

export const WorkoutItemSchema = z.object({
  id: z.string(),
  exerciseId: z.string(),
  sets: z.number().int().min(DOMAIN_LIMITS.SETS.MIN).max(DOMAIN_LIMITS.SETS.MAX),
  target: z.number().int().min(1).max(DOMAIN_LIMITS.DURATION_SECONDS.MAX),
  restSeconds: z.number().int().min(DOMAIN_LIMITS.REST_SECONDS.MIN).max(DOMAIN_LIMITS.REST_SECONDS.MAX),
  suggestionDismissedAt: z.string().optional(),
})

export type WorkoutItem = z.infer<typeof WorkoutItemSchema>

export const WorkoutSchema = z.object({
  id: z.string(),
  name: z.string().min(DOMAIN_LIMITS.WORKOUT_NAME.MIN_LENGTH).max(DOMAIN_LIMITS.WORKOUT_NAME.MAX_LENGTH),
  items: z.array(WorkoutItemSchema).min(DOMAIN_LIMITS.EXERCISES_PER_WORKOUT.MIN).max(DOMAIN_LIMITS.EXERCISES_PER_WORKOUT.MAX),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type Workout = z.infer<typeof WorkoutSchema>

export const SessionSetSchema = z.object({
  number: z.number().int().min(1),
  plannedValue: z.number().int(),
  actualValue: z.number().int().nullable(),
  recordedAt: z.string().nullable(),
})

export type SessionSet = z.infer<typeof SessionSetSchema>

export const SessionExerciseSchema = z.object({
  exerciseId: z.string(),
  name: z.string(),
  measurementType: z.enum(['reps', 'duration']),
  restSeconds: z.number().int(),
  plannedSets: z.number().int(),
  target: z.number().int(),
  sets: z.array(SessionSetSchema),
})

export type SessionExercise = z.infer<typeof SessionExerciseSchema>

export const ActiveSessionCurrentStateSchema = z.object({
  exerciseIndex: z.number().int(),
  setIndex: z.number().int(),
  restEndsAt: z.number().nullable().optional(),
  exerciseEndsAt: z.number().nullable().optional(),
})

export type ActiveSessionCurrentState = z.infer<typeof ActiveSessionCurrentStateSchema>

export const SessionSchema = z.object({
  id: z.string(),
  workoutId: z.string().optional(),
  workoutName: z.string(),
  status: z.enum(['in_progress', 'completed', 'partial']),
  startedAt: z.string(),
  endedAt: z.string().optional(),
  note: z.string().optional(),
  current: ActiveSessionCurrentStateSchema.optional(),
  exercises: z.array(SessionExerciseSchema),
})

export type Session = z.infer<typeof SessionSchema>

export const ExerciseCatalogItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  measurementType: z.enum(['reps', 'duration']),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  muscleGroups: z.array(z.string()),
  equipment: z.array(z.enum(['none', 'band', 'rope', 'bar'])),
  instructions: z.array(z.string()),
  safetyNote: z.string().optional(),
  easierId: z.string().optional(),
  harderId: z.string().optional(),
  deprecated: z.boolean().default(false).optional(),
})

export type ExerciseCatalogItem = z.infer<typeof ExerciseCatalogItemSchema>
