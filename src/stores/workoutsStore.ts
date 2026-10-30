import { defineStore } from 'pinia'
import { ref } from 'vue'
import { StorageService } from '@/services/storageService'
import { auth } from '@/services/firebase'
import { SyncService } from '@/services/syncService'
import { PRESET_WORKOUTS } from '@/data/presetWorkouts'
import type { Workout, WorkoutItem } from '@/types/domain'

export const useWorkoutsStore = defineStore('workouts', () => {
  const workouts = ref<Workout[]>([])
  const isLoaded = ref(false)

  function load() {
    const saved = StorageService.getWorkouts()
    if (saved.length > 0) {
      workouts.value = saved
    } else {
      workouts.value = []
    }
    isLoaded.value = true
  }

  function persist() {
    StorageService.saveWorkouts(workouts.value)
  }

  function getWorkoutById(id: string): Workout | undefined {
    return workouts.value.find((w) => w.id === id) || PRESET_WORKOUTS.find((w) => w.id === id)
  }

  function saveWorkout(workout: { id?: string; name: string; items: WorkoutItem[] }): Workout {
    const now = new Date().toISOString()
    let saved: Workout

    if (workout.id) {
      const index = workouts.value.findIndex((w) => w.id === workout.id)
      if (index > -1) {
        workouts.value[index] = {
          ...workouts.value[index],
          name: workout.name,
          items: workout.items,
          updatedAt: now,
        }
        saved = workouts.value[index]
        persist()
        if (auth?.currentUser?.uid) {
          SyncService.syncWorkout(auth.currentUser.uid, saved)
        }
        return saved
      }
    }

    const created: Workout = {
      id: `workout-${Date.now()}`,
      name: workout.name,
      items: workout.items,
      createdAt: now,
      updatedAt: now,
    }
    workouts.value.push(created)
    persist()
    if (auth?.currentUser?.uid) {
      SyncService.syncWorkout(auth.currentUser.uid, created)
    }
    return created
  }

  function deleteWorkout(id: string): boolean {
    const prevLen = workouts.value.length
    workouts.value = workouts.value.filter((w) => w.id !== id)
    if (workouts.value.length !== prevLen) {
      persist()
      if (auth?.currentUser?.uid) {
        SyncService.deleteCloudWorkout(auth.currentUser.uid, id)
      }
      return true
    }
    return false
  }

  function duplicateWorkout(id: string): Workout | null {
    const original = getWorkoutById(id)
    if (!original) return null

    const duplicate: Workout = {
      ...original,
      id: `workout-${Date.now()}`,
      name: `${original.name} (Cópia)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: original.items.map((it) => ({
        ...it,
        id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      })),
    }

    workouts.value.push(duplicate)
    persist()
    if (auth?.currentUser?.uid) {
      SyncService.syncWorkout(auth.currentUser.uid, duplicate)
    }
    return duplicate
  }

  function copyPreset(presetId: string): Workout | null {
    const preset = PRESET_WORKOUTS.find((p) => p.id === presetId)
    if (!preset) return null

    const copy: Workout = {
      ...preset,
      id: `workout-${Date.now()}`,
      name: `${preset.name} (Meu Treino)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: preset.items.map((it) => ({
        ...it,
        id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      })),
    }

    workouts.value.push(copy)
    persist()
    if (auth?.currentUser?.uid) {
      SyncService.syncWorkout(auth.currentUser.uid, copy)
    }
    return copy
  }

  function updateExerciseTarget(workoutId: string, exerciseId: string, newTarget: number) {
    const workout = workouts.value.find((w) => w.id === workoutId)
    if (!workout) return
    const item = workout.items.find((i) => i.exerciseId === exerciseId)
    if (item) {
      item.target = newTarget
      workout.updatedAt = new Date().toISOString()
      persist()
      if (auth?.currentUser?.uid) {
        SyncService.syncWorkout(auth.currentUser.uid, workout)
      }
    }
  }

  function dismissSuggestion(workoutId: string, exerciseId: string) {
    const workout = workouts.value.find((w) => w.id === workoutId)
    if (!workout) return
    const item = workout.items.find((i) => i.exerciseId === exerciseId)
    if (item) {
      item.suggestionDismissedAt = new Date().toISOString()
      workout.updatedAt = new Date().toISOString()
      persist()
      if (auth?.currentUser?.uid) {
        SyncService.syncWorkout(auth.currentUser.uid, workout)
      }
    }
  }

  return {
    workouts,
    presets: PRESET_WORKOUTS,
    isLoaded,
    load,
    getWorkoutById,
    saveWorkout,
    deleteWorkout,
    duplicateWorkout,
    copyPreset,
    updateExerciseTarget,
    dismissSuggestion,
  }
})
