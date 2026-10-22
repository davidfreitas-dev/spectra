import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { StorageService } from '@/services/storageService'
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
  }
})
