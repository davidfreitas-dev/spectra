import { ref } from 'vue'
import { StorageService } from './storageService'
import { FirestoreService } from './firestoreService'
import type { Preferences, Workout, Session } from '@/types/domain'

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'offline' | 'error'

export const syncStatus = ref<SyncStatus>('idle')
export const lastSyncedAt = ref<string | null>(null)
export const syncErrorMessage = ref<string | null>(null)
export const isOnline = ref<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true)

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    isOnline.value = true
    if (syncStatus.value === 'offline') {
      syncStatus.value = 'idle'
    }
  })

  window.addEventListener('offline', () => {
    isOnline.value = false
    syncStatus.value = 'offline'
  })
}

export class SyncService {
  /**
   * Sincronização e merge inteligente ao autenticar usuário
   */
  static async syncOnLogin(
    userId: string,
    onStoreReload?: () => void
  ): Promise<boolean> {
    if (!isOnline.value) {
      syncStatus.value = 'offline'
      return false
    }

    syncStatus.value = 'syncing'
    syncErrorMessage.value = null

    try {
      // 1. Carrega dados locais
      const localPrefs = StorageService.getPreferences()
      const localWorkouts = StorageService.getWorkouts()
      const localSessions = StorageService.getSessions()

      // 2. Busca dados da nuvem
      const [cloudPrefs, cloudWorkouts, cloudSessions] = await Promise.all([
        FirestoreService.fetchPreferences(userId),
        FirestoreService.fetchWorkouts(userId),
        FirestoreService.fetchSessions(userId),
      ])

      // 3. Merge de Preferências
      let mergedPrefs: Preferences
      if (!cloudPrefs && localPrefs) {
        mergedPrefs = localPrefs
        await FirestoreService.savePreferences(userId, mergedPrefs)
      } else if (cloudPrefs && !localPrefs) {
        mergedPrefs = cloudPrefs
      } else if (cloudPrefs && localPrefs) {
        // Preserva onboarding e unifica dados
        mergedPrefs = {
          ...cloudPrefs,
          onboardingDone: cloudPrefs.onboardingDone || localPrefs.onboardingDone,
          firstSessionTourDone: cloudPrefs.firstSessionTourDone || localPrefs.firstSessionTourDone,
        }
        await FirestoreService.savePreferences(userId, mergedPrefs)
      } else {
        // Ambos nulos (usuário novo sem dados locais)
        mergedPrefs = {
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
      }
      StorageService.savePreferences(mergedPrefs)

      // 4. Merge de Treinos (Last-Write-Wins por updatedAt)
      const workoutsMap = new Map<string, Workout>()
      // Adiciona treinos da nuvem primeiro
      cloudWorkouts.forEach((w) => workoutsMap.set(w.id, w))

      const workoutsToUpload: Workout[] = []

      localWorkouts.forEach((localW) => {
        const cloudW = workoutsMap.get(localW.id)
        if (!cloudW) {
          // Só existia localmente -> adiciona e prepara para upload
          workoutsMap.set(localW.id, localW)
          workoutsToUpload.push(localW)
        } else {
          // Existe em ambos: compara data de modificação
          const localTime = new Date(localW.updatedAt).getTime()
          const cloudTime = new Date(cloudW.updatedAt).getTime()
          if (localTime > cloudTime) {
            workoutsMap.set(localW.id, localW)
            workoutsToUpload.push(localW)
          }
        }
      })

      const mergedWorkouts = Array.from(workoutsMap.values())
      StorageService.saveWorkouts(mergedWorkouts)

      if (workoutsToUpload.length > 0) {
        await FirestoreService.batchSaveWorkouts(userId, workoutsToUpload)
      }

      // 5. Merge de Sessões (Imutáveis: união por ID)
      const sessionsMap = new Map<string, Session>()
      cloudSessions.forEach((s) => sessionsMap.set(s.id, s))

      const sessionsToUpload: Session[] = []
      localSessions.forEach((localS) => {
        if (!sessionsMap.has(localS.id)) {
          sessionsMap.set(localS.id, localS)
          sessionsToUpload.push(localS)
        }
      })

      const mergedSessions = Array.from(sessionsMap.values())
      StorageService.saveSessions(mergedSessions)

      if (sessionsToUpload.length > 0) {
        await FirestoreService.batchSaveSessions(userId, sessionsToUpload)
      }

      // 6. Notifica as stores para recarregar memória
      if (onStoreReload) {
        onStoreReload()
      }

      syncStatus.value = 'synced'
      lastSyncedAt.value = new Date().toISOString()
      return true
    } catch (err) {
      console.error('Falha na sincronização ao fazer login:', err)
      syncStatus.value = 'error'
      syncErrorMessage.value = 'Não foi possível sincronizar os dados com a nuvem.'
      return false
    }
  }

  /**
   * Sincroniza treino isolado após persistência local
   */
  static async syncWorkout(userId: string, workout: Workout): Promise<void> {
    if (!isOnline.value) return
    try {
      syncStatus.value = 'syncing'
      await FirestoreService.saveWorkout(userId, workout)
      syncStatus.value = 'synced'
      lastSyncedAt.value = new Date().toISOString()
    } catch {
      syncStatus.value = 'error'
    }
  }

  /**
   * Remove treino da nuvem após exclusão local
   */
  static async deleteCloudWorkout(userId: string, workoutId: string): Promise<void> {
    if (!isOnline.value) return
    try {
      await FirestoreService.deleteWorkout(userId, workoutId)
    } catch (err) {
      console.error(`Falha ao excluir treino ${workoutId} da nuvem:`, err)
    }
  }

  /**
   * Sincroniza sessão concluída no Firestore
   */
  static async syncSession(userId: string, session: Session): Promise<void> {
    if (!isOnline.value) return
    try {
      syncStatus.value = 'syncing'
      await FirestoreService.saveSession(userId, session)
      syncStatus.value = 'synced'
      lastSyncedAt.value = new Date().toISOString()
    } catch {
      syncStatus.value = 'error'
    }
  }

  /**
   * Remove sessão da nuvem após exclusão local
   */
  static async deleteCloudSession(userId: string, sessionId: string): Promise<void> {
    if (!isOnline.value) return
    try {
      await FirestoreService.deleteSession(userId, sessionId)
    } catch (err) {
      console.error(`Falha ao excluir sessão ${sessionId} da nuvem:`, err)
    }
  }

  /**
   * Sincroniza preferências no Firestore
   */
  static async syncPreferences(userId: string, preferences: Preferences): Promise<void> {
    if (!isOnline.value) return
    try {
      syncStatus.value = 'syncing'
      await FirestoreService.savePreferences(userId, preferences)
      syncStatus.value = 'synced'
      lastSyncedAt.value = new Date().toISOString()
    } catch {
      syncStatus.value = 'error'
    }
  }
}
