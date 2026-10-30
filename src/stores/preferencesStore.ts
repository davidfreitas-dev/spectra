import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { StorageService } from '@/services/storageService'
import { auth } from '@/services/firebase'
import { SyncService } from '@/services/syncService'
import type { Preferences, UserLevel, Equipment } from '@/types/domain'

const DEFAULT_PREFERENCES: Preferences = {
  schemaVersion: 1,
  level: 'beginner',
  equipment: ['none'],
  schedule: {
    monday: 'preset-fullbody-beginner',
    wednesday: 'preset-fullbody-beginner',
    friday: 'preset-fullbody-beginner',
  },
  soundEnabled: true,
  vibrationEnabled: true,
  onboardingDone: false,
  firstSessionTourDone: false,
}

export const usePreferencesStore = defineStore('preferences', () => {
  const preferences = ref<Preferences>({ ...DEFAULT_PREFERENCES })
  const isLoaded = ref(false)

  function load() {
    const saved = StorageService.getPreferences()
    if (saved) {
      preferences.value = saved
    } else {
      preferences.value = { ...DEFAULT_PREFERENCES }
    }
    isLoaded.value = true
  }

  function persist() {
    StorageService.savePreferences(preferences.value)
    if (auth?.currentUser?.uid) {
      SyncService.syncPreferences(auth.currentUser.uid, preferences.value)
    }
  }

  function setLevel(level: UserLevel) {
    preferences.value.level = level
    persist()
  }

  function setEquipment(equipment: Equipment[]) {
    preferences.value.equipment = equipment
    persist()
  }

  function setDayWorkout(dayKey: string, workoutId: string | null) {
    if (!preferences.value.schedule) {
      preferences.value.schedule = {}
    }
    preferences.value.schedule[dayKey] = workoutId
    persist()
  }

  function setSchedule(schedule: Record<string, string | null>) {
    preferences.value.schedule = { ...schedule }
    persist()
  }

  function setToggles(soundEnabled: boolean, vibrationEnabled: boolean) {
    preferences.value.soundEnabled = soundEnabled
    preferences.value.vibrationEnabled = vibrationEnabled
    persist()
  }

  function completeOnboarding(
    level: UserLevel,
    equipment: Equipment[],
    schedule?: Record<string, string | null>
  ) {
    preferences.value.level = level
    preferences.value.equipment = equipment
    if (schedule) {
      preferences.value.schedule = { ...schedule }
    }
    preferences.value.onboardingDone = true
    persist()
  }

  function completeFirstSessionTour() {
    preferences.value.firstSessionTourDone = true
    persist()
  }

  function resetOnboarding() {
    preferences.value.onboardingDone = false
    preferences.value.firstSessionTourDone = false
    persist()
  }

  function resetSessionTour() {
    preferences.value.firstSessionTourDone = false
    persist()
  }

  /**
   * Registra a dispensa de um lembrete contextual de conexão com a nuvem
   */
  function dismissCloudPrompt(contextKey: string) {
    if (!preferences.value.cloudPromptsDismissedAt) {
      preferences.value.cloudPromptsDismissedAt = {}
    }
    preferences.value.cloudPromptsDismissedAt[contextKey] = new Date().toISOString()
    persist()
  }

  /**
   * Verifica se o lembrete contextual ainda está em período de cooldown (padrão: 7 dias)
   */
  function isCloudPromptDismissed(contextKey: string, cooldownDays = 7): boolean {
    const timestamp = preferences.value.cloudPromptsDismissedAt?.[contextKey]
    if (!timestamp) return false
    const dismissedTime = new Date(timestamp).getTime()
    const now = Date.now()
    const diffDays = (now - dismissedTime) / (1000 * 60 * 60 * 24)
    return diffDays < cooldownDays
  }

  // Meta semanal é estritamente a quantidade de dias com treino atribuído na agenda
  const weeklyGoal = computed(() => {
    if (!preferences.value.schedule) return 0
    return Object.values(preferences.value.schedule).filter((v) => !!v).length
  })

  return {
    preferences,
    isLoaded,
    weeklyGoal,
    load,
    setLevel,
    setEquipment,
    setDayWorkout,
    setSchedule,
    setToggles,
    completeOnboarding,
    completeFirstSessionTour,
    resetOnboarding,
    resetSessionTour,
    dismissCloudPrompt,
    isCloudPromptDismissed,
  }
})
