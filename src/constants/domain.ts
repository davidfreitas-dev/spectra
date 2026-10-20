/**
 * Constantes de domínio centralizadas do Spectra.
 * Conforme especificação técnica e regras de arquitetura.
 */

export const DOMAIN_LIMITS = {
  SETS: {
    MIN: 1,
    MAX: 10,
    DEFAULT: 3,
  },
  REPS: {
    MIN: 1,
    MAX: 100,
    DEFAULT: 10,
  },
  DURATION_SECONDS: {
    MIN: 5,
    MAX: 600,
    DEFAULT: 30,
  },
  REST_SECONDS: {
    MIN: 0,
    MAX: 600,
    DEFAULT: 60,
    STEP_INCREMENT: 30,
  },
  WORKOUT_NAME: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 60,
  },
  EXERCISES_PER_WORKOUT: {
    MIN: 1,
    MAX: 30,
  },
} as const

export const STORAGE_KEYS = {
  SCHEMA_VERSION: 'calistenia:schemaVersion',
  PREFERENCES: 'calistenia:preferences',
  WORKOUTS: 'calistenia:workouts',
  SESSIONS: 'calistenia:sessions',
  ACTIVE_SESSION: 'calistenia:activeSession',
} as const

export const CURRENT_SCHEMA_VERSION = 1

export const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Segunda', shortLabel: 'Seg', index: 1 },
  { key: 'tuesday', label: 'Terça', shortLabel: 'Ter', index: 2 },
  { key: 'wednesday', label: 'Quarta', shortLabel: 'Qua', index: 3 },
  { key: 'thursday', label: 'Quinta', shortLabel: 'Qui', index: 4 },
  { key: 'friday', label: 'Sexta', shortLabel: 'Sex', index: 5 },
  { key: 'saturday', label: 'Sábado', shortLabel: 'Sáb', index: 6 },
  { key: 'sunday', label: 'Domingo', shortLabel: 'Dom', index: 0 },
] as const

export const PROGRESSION_RULES = {
  REQUIRED_SESSIONS: 2,
  REP_INCREMENT: 1,
  DURATION_INCREMENT_SECONDS: 5,
} as const
